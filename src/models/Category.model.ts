import * as mongoose from "mongoose";
import {ICategoryDir} from "./interfaces/category.dir";

const CategoryDirModel = new mongoose.Schema({
    name: String,
    childCategories: {type: [String], required: false},
},{collection: 'categories-list'})

export const iCategoryDirModel = mongoose.model<ICategoryDir>('Category Directories', CategoryDirModel);