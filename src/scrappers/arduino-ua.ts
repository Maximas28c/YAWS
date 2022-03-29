import Axios from 'Axios';
import Cheerio from 'cheerio';
import * as fs from 'fs';
import path from 'path';

import ArduinoUaConfig from "../configs/arduino-ua.config";
import {csvExportConfig} from "../configs/csvExport.config";

import {IItem} from "../models/interfaces/item";
import {IPrice} from "../models/interfaces/price";
import {IItemImages} from "../models/interfaces/itemImages";
import {ICategoriesCast} from "../models/interfaces/categoriesCast";
import {ICategoryDir} from "../models/interfaces/category.dir";
import {ICategory} from "../models/interfaces/category";
import {IGoodForExport} from "../models/interfaces/goodForExport";

import {iCategoriesCastModel} from "../models/CategoriesCast.model";
import {iCategoryDirModel} from "../models/Category.model";
import {iFullCategoryWithItemsModel} from "../models/FullCategoryWithItems.model";
import {iFullItemModel} from "../models/FullItem.model";

import textCleanUpHelper from "../helpers/textCleanUp.helper";
import buildUrl from "../helpers/urlBuilder.helper";
import extractCategoryId from "../helpers/extractCategoryId.helper";
import extractSubCategoriesUrls from "../helpers/extractSubCategories";
import buildSrcPath from "../helpers/srcPathBuilder";
import buildGood from "../helpers/goodBuilder";
import collectionCleaner from "../helpers/collectionCleaner";
import CreateProgressBar from "../helpers/cli-progress";
import CreateProgressBars from "../helpers/cli-progress";

const download = require('image-downloader');
const { Parser, transforms: { unwind, flatten } } = require('json2csv');

const axios = Axios
const cheerio = Cheerio
const Config = ArduinoUaConfig



export async function scrapArduinoUa(collectionsCleanUpNeeded?: boolean): Promise<void>{
    collectionsCleanUpNeeded === undefined
        ? collectionsCleanUpNeeded = true
        : collectionsCleanUpNeeded
    let initialCatList: ICategory[] = [];
    let buildData: ICategory[] = [];
    let goodsForExport: IGoodForExport[] = [];
    if(collectionsCleanUpNeeded){
        await collectionCleaner()
            .then(()=>console.log('Collections cleaned up'));
    }
    try {
        const categoryProgressBars = CreateProgressBars();
        await buildStructuredCategoriesList()
            .then(async (catList) => {
                initialCatList = (catList as ICategory[])
                buildData = initialCatList
                const catPB = categoryProgressBars.create(catList.length,0)
                for (const cat of initialCatList) {
                    catPB.increment()
                    const catIdx = initialCatList.indexOf(cat);
                    let childCatNames: string[] = []
                    const subCatPB = categoryProgressBars.create(cat.childCategories.length, 0)
                    for (const subCat of cat.childCategories) {
                        subCatPB.increment()
                        const subCatIdx = cat.childCategories.indexOf(subCat);
                        childCatNames.push(subCat.name)
                        const IChildCategoryDir: ICategoryDir = {
                            name: cat.name,
                        }
                        const SubCatModel = new iCategoryDirModel(IChildCategoryDir)
                        await SubCatModel.save();
                        let checkedUrl: string = ''
                        await listOfItemsExceedsPage(subCat.url)
                            .then((flag)=>{
                                flag
                                    ? checkedUrl = buildUrl(subCat.url, flag, extractCategoryId(subCat.url))
                                    : checkedUrl = subCat.url
                            }).finally(()=>{
                                    buildData[catIdx].childCategories[subCatIdx].url = checkedUrl
                                }
                            )
                        await getItemsLinksByCategory(checkedUrl).then(async (urls)=>{
                            let items: IItem[] = []
                            const itemsPB = categoryProgressBars.create(urls.length,0,)

                            for (const url of urls){
                                itemsPB.increment(1,{item: url});
                                await getItemData(url).then(async (item)=>{
                                    await downloadImagesOfItemIfNeeded(item)
                                    items.push(item)

                                    const itemModel = new iFullItemModel(item)
                                    await itemModel.save()

                                    const goodItem = buildGood([cat.name,subCat.name], item)
                                    goodsForExport.push(goodItem)
                                })
                            }
                            categoryProgressBars.remove(itemsPB);
                            buildData[catIdx].childCategories[subCatIdx].items = items
                        })
                    }
                    categoryProgressBars.remove(subCatPB)
                    const ICategoryDir: ICategoryDir = {
                        name: cat.name,
                        childCategories: childCatNames
                    }
                    const categoryDirModel = new iCategoryDirModel(ICategoryDir)
                    await categoryDirModel.save();

                    const ICategory: ICategory = buildData[catIdx]
                    const categoryModel = new iFullCategoryWithItemsModel(ICategory)
                    await categoryModel.save();
                }
                catPB.stop()
                saveScrapedGoodsToCsv(goodsForExport);
            })
        categoryProgressBars.stop()
    }
    catch (e) {
        console.log(e)
    } finally {
        const ICast: ICategoriesCast = {
            date: new Date(),
            source: Config.arduinoUa.name,
            categories: buildData
        }
        const castModel = new iCategoriesCastModel(ICast)
        await castModel.save()
    }
}

export async function getCategoriesData(): Promise<string[]> {
    let urlToParse:string[] = []
    await buildStructuredCategoriesList().then( async (catList) => {
        for (const url of extractSubCategoriesUrls(catList)) {
            await listOfItemsExceedsPage(url).then((flag)=>{
                let checkedUrl
                flag ? checkedUrl = buildUrl(url, flag, extractCategoryId(url)) : checkedUrl = url
                urlToParse.push(checkedUrl)
            })
        }
    })
    return urlToParse
}

async function buildStructuredCategoriesList(): Promise<any> {
    const catList: ICategory[] = []
    try {
        await axios(Config.arduinoUa.categoriesListUrl)
            .then(response => {
                const categoriesListPage = response.data
                const $ = cheerio.load(categoriesListPage)
                $(Config.arduinoUa.selectors.category.list)
                    .children(Config.arduinoUa.selectors.category.singleCat)
                    .each(( async(i, el) => {
                            let baseUrl = Config.arduinoUa.baseUrl+$(el).attr('href')
                            if ($(el).attr('class') === undefined) {
                                catList.push({
                                    name: $(el).text(),
                                    url: baseUrl,
                                    childCategories: []
                                })
                            } else {
                                catList[catList.length-1].childCategories.push({
                                    name: $(el).text(),
                                    url: baseUrl,
                                    items: []
                                })
                            }
                        })
                    )
            })
    } catch (e) {
        console.log(e)
    }
    return catList
}


async function listOfItemsExceedsPage(urlToCheck: string): Promise<any> {
    let flag: boolean = false
    try {
        await axios(urlToCheck)
            .then((response) =>{
                const itemsPage = response.data
                const $ = cheerio.load(itemsPage)
                $(Config.arduinoUa.selectors.item.itemsContainer)
                    .children(Config.arduinoUa.selectors.paging.showAllSelector)
                    .each((idx,e)=>{
                        $(e).children().each((i, el)=>{
                            flag = $(el).text('показати всі').text() !== undefined
                        })
                    })
                return flag
            })
    } catch (e) {
        console.log(e)
    }
}

export async function getItemsLinksByCategory(itemsListUrl: string): Promise<any[]> {
    const itemsList: any[] = [];
    try {
        await axios(itemsListUrl)
            .then(
                (response)=>{
                    const $ = cheerio.load(response.data)
                    $('.Categories')
                        .children('li')
                        .children('div')
                        .children('a')
                        .each((id,el)=>{
                            itemsList.push(buildUrl($(el).attr('href')))
                        })

                }
            )
            .catch()
    } catch (e){
        console.log(e);
    }
    finally {
        return itemsList;
    }
}

export async function getItemData(itemUrl: string): Promise<IItem>{
    let item: IItem = {}
    let price: IPrice = {};
    let images: IItemImages = {alt: undefined, imgUrls: [],imgSrc: [], imgOriginalPaths: []};

    try {
        await axios(itemUrl)
            .then(
                (response)=>{
                    let imgUrls: string[] = []
                    let imgSrcs: string[] = []
                    let imgPaths: string[] = []

                    const $ = cheerio.load(response.data)
                    item.url = itemUrl
                    item.name = $(Config.arduinoUa.selectors.item.itemName).text().trim()
                    item.description = textCleanUpHelper($(Config.arduinoUa.selectors.item.description).text()).trim()
                    item.availability = $(Config.arduinoUa.selectors.item.availability).text().trim() === 'в наявності'
                    price.value = $(Config.arduinoUa.selectors.item.priceValue).text().trim()
                    price.currency = $(Config.arduinoUa.selectors.item.priceCurrency).contents().last().text().trim()
                    item.price = price
                    images.alt = $(Config.arduinoUa.selectors.item.mainPic).attr('alt')

                    imgPaths.push(path.basename($(Config.arduinoUa.selectors.item.mainPic).attr('src') as string))
                    imgSrcs.push(buildSrcPath($(Config.arduinoUa.selectors.item.mainPic).attr('src') as string))
                    imgUrls.push(buildUrl($(Config.arduinoUa.selectors.item.mainPic).attr('src') as string))
                    $(Config.arduinoUa.selectors.item.pics).each((i,el)=>{
                        imgUrls.push(buildUrl($(el).attr('src') as string))
                        imgSrcs.push(buildSrcPath($(el).attr('src') as string))
                        imgPaths.push(path.basename($(el).attr('src') as string))
                    })

                    images.imgUrls = imgUrls
                    images.imgSrc = imgSrcs
                    images.imgOriginalPaths = imgPaths

                    item.images = images
                }
            )
            .catch()
    }
    catch (e) {
        console.log(e);
    }
    finally {
        return item;
    }

}

async function downloadImage(url: string, filepath: string) {
    return await download.image({
        url,
        dest: filepath
    });
}

function saveScrapedGoodsToCsv(goodsCollection: any[]){
    const json2csvParser = new Parser(csvExportConfig);
    const csv = json2csvParser.parse(goodsCollection);
    const fileName = (new Date).getDate().toString() + (new Date).getMonth().toString() + (new Date).getFullYear().toString();
    fs.writeFile(`${Config.arduinoUa.saveDir}/sheets/${fileName}.csv`,csv,()=>{
        console.log(`Exported goods saved into ${Config.arduinoUa.saveDir}/sheets/${fileName}.csv`);
    })
}

async function downloadImagesOfItemIfNeeded(item: IItem) {
    if (item.images){
        for(const src of item.images.imgOriginalPaths){
            const imgIdx = item.images.imgOriginalPaths.indexOf(src)
            if(!fs.existsSync(buildSrcPath(src))){
                await downloadImage(item.images.imgUrls[imgIdx], buildSrcPath(src))
            }
        }
    }
}

export default scrapArduinoUa