import {Request, Response} from "express";
import errorHandlerHelper from "../helpers/errorHandler.helper";
import scrapData from "../services/scrappers.service";
import ArduinoUaConfig from "../configs/arduino-ua.config";

async function categoryController  (req: Request, res: Response)  {
    let data: any
    await scrapData(ArduinoUaConfig.arduinoUa.name)
        .then(
            () => {done: true}
        ).catch(
            (e)=>{ errorHandlerHelper(res,e) }
        ).finally(
            ()=>res.send( data ).status(200)
        )
}

export default categoryController
