import Config from '../configs/arduino-ua.config'

export function buildUrl(partialUrl?: string, fullUrlNeeded: boolean = false, categoryId?: string): string {
    if (fullUrlNeeded) {
        return `${Config.arduinoUa.requestUrl}${Config.arduinoUa.selectors.paging.categoryId}${categoryId}${Config.arduinoUa.selectors.paging.showAllUrl}`
    } else {
        return `${Config.arduinoUa.baseUrl}${partialUrl}`
    }

}

export default buildUrl