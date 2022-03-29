import ArduinoUaConfig from "../configs/arduino-ua.config";
import scrapArduinoUa from "../scrappers/arduino-ua";

export async function scrapData (source: string) {
    if (source == ArduinoUaConfig.arduinoUa.name){
        await scrapArduinoUa();
    }
}

export default scrapData