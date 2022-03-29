export function extractCategoryId (urlToExtract?: string): string {
    let regExp = /[a-z-/:.]+/g
    return urlToExtract
        ? urlToExtract
            .split('-', urlToExtract.length-1)[0]
            .replace(regExp, '')
        : ''
}

export default extractCategoryId