import Config from '../configs/arduino-ua.config'

export function buildSrcPath(partialUrl?: string): string {
    return `${Config.arduinoUa.saveDir}/img/${partialUrl}`
}

export default buildSrcPath