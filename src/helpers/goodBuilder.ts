import {IGoodForExport} from "../models/interfaces/goodForExport";
import {IItem} from "../models/interfaces/item";
import {Paths} from "../configs/paths.config"


export function buildGood(categories: string[], item: IItem): IGoodForExport {
    let goodCategory = ''
    categories.forEach((c)=>{
        goodCategory = `${goodCategory}, ${c}`
    })
    let goodPics = ''
    item.images?.imgOriginalPaths.forEach((img) => {
        goodPics =`${Paths.importedImgFolder}${img}, `
    })
    const goodToReturn: IGoodForExport = {
        name: item.name,
        shortDescription: item.description,
        description: item.description,
        categories: goodCategory,
        price: Number(item.price?.value),
        images: goodPics
    }
    return goodToReturn
}

export default buildGood