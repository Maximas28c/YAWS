import {iCategoryDirModel} from "../models/Category.model";
import {iFullCategoryWithItemsModel} from "../models/FullCategoryWithItems.model";
import {iFullItemModel} from "../models/FullItem.model";

export async function collectionCleaner(){
    const itemsRef = iFullItemModel
    const categoryWithItemsRsf = iFullCategoryWithItemsModel
    const categoryDirRef = iCategoryDirModel
    await itemsRef.collection.deleteMany({})
    await categoryWithItemsRsf.collection.deleteMany({})
    await categoryDirRef.collection.deleteMany({})
}

export default collectionCleaner