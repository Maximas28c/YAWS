import {Express} from "express";
import categoryController from "../controllers/category.controller";

async function categoryRoute (app: Express) {
    app
        .route('/getRawData')
        .get(await categoryController)
}

export default categoryRoute