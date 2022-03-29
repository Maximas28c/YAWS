import Config from '../configs/arduino-ua.config'
const TextCleaner = require('text-cleaner');

export function cleanText(text: string): string {
    const regExp: RegExp = /[[\]\\]+[[A-z]|[0-9]]]/g
    const textToReturn = TextCleaner(text).stripHtml().condense();
    return textToReturn
}

export default cleanText