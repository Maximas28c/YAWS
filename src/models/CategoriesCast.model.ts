import Mongoose from "mongoose";
import {ICategoriesCast} from "./interfaces/categoriesCast";

const CategoriesCastModel = new Mongoose.Schema({
    date: Date,
    source: String,
    categories: [{
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
    }]
},{collection: 'categories-snapshots'})

export const iCategoriesCastModel = Mongoose.model<ICategoriesCast>('Categories Cast', CategoriesCastModel);