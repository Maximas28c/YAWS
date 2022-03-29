import express from 'express';
import CategoryRoute from "./routes/category.route";
import helmet from "helmet";
import mongoose from 'mongoose';
import {Paths} from "./configs/paths.config";
import schedule from "node-schedule";
import scrapData from "./services/scrappers.service";
import ArduinoUaConfig from "./configs/arduino-ua.config";


const keys = require('./configs/keys.config')

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())

mongoose.connect(Paths.db)
    .then(() => console.log('mongoDB Connected'))
    .catch(Error => console.log(Error))

CategoryRoute(app)

app.listen(9876, ()=>{
    console.log('server running at port 9876')
})

const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(4, 6)];
rule.hour = new schedule.Range(0,7);
rule.minute = new schedule.Range(1,58);

schedule.scheduleJob(rule, async function(){
    console.log('Scrapping started @', (new Date).getHours().toString() +'-'+ (new Date).getMinutes().toString() +'-'+ (new Date).getSeconds().toString());
    await scrapData(ArduinoUaConfig.arduinoUa.name)
    console.log('Scrapping ended @', (new Date).getHours().toString() +'-'+ (new Date).getMinutes().toString() +'-'+ (new Date).getSeconds().toString());
});