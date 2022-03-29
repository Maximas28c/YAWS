import * as mongoose from "mongoose";
import {IItem} from "./interfaces/item";

const FullItemModel = new mongoose.Schema({
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
},{collection: 'items'})

export const iFullItemModel = mongoose.model<IItem>('Full Item', FullItemModel);