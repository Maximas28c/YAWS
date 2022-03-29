import {Response} from "express";

export async function errorHandlerHelper( res: Response, error: any){
    console.log('Error: \n', error)
    res.status(400).send(error)
}

export default errorHandlerHelper