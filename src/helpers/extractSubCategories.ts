import {ICategory} from "../models/interfaces/category";


export function extractSubCategoriesUrls(categories: ICategory[]): string[] {
    const urlList: string[] = []
    categories.forEach((c)=>{
        if(c.childCategories){
            c.childCategories.forEach((subCat)=>{
                if (subCat.url !== undefined){
                    urlList.push(subCat.url)
                }
            })
        }
    })
    return urlList
}

export default extractSubCategoriesUrls