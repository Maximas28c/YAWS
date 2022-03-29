import {IPrice} from "./price";
import {IItemImages} from "./itemImages";

export interface IItem {
    url?: string,
    name?: string,
    description?: string,
    availability?: boolean,
    price?: IPrice,
    images?: IItemImages
}