import * as mongoose from "mongoose";
import {ICategory} from "./interfaces/category";

const FullCategoryWithItemsModel = new mongoose.Schema({
    name: String,
    url: String,
    childCategories: [{
        name: String,
        url: String,
        items: [{
            url: String,
            name: String,
            description: String,
            availability: Boolean,
            price: {
                value: String,
                currency: String
            },
            images: {
                alt: String,
                imgUrls: [String],
                imgSrc: [String]
            }
        }]
    }]
},{collection: 'categories-with-items'})

export const iFullCategoryWithItemsModel = mongoose.model<ICategory>('Full Category With Items', FullCategoryWithItemsModel);