import {ISubCategory} from "./subCategory";

export interface ICategory {
    name: string,
    url?: string,
    childCategories: ISubCategory[]
}