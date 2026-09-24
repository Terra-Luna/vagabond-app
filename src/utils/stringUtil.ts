export function toPascalCase(s: string): string {
    return s
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Splits camelCase words into separate words
        .replace(/[-_]+|[^\p{L}\p{N}]/gu, ' ') // Replaces dashes, underscores, and special characters with spaces
        .toLowerCase() // Converts the entire string to lowercase
        .replace(/(?:^|\s)(\p{L})/gu, (_, letter) => letter.toUpperCase()) // Capitalizes the first letter of each word
        .replace(/\s+/g, '') // Removes all spaces
}

export function stripHtml(html) {
    const tmp = document.createElement("DIV")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
}

export function removeWhitespace(s?: string): string {
    return s?.replace(/\s/g, "") ?? ""
}

export function andOrToSymbol(andOr: string): string {
    const val = andOr?.toLowerCase()
    if (val !== 'and' && val !== 'or') return andOr
    return andOr === 'and' ? '&' : andOr
}

export function removeLastComma(text: string, andOr: string): string {
    if (text && andOr) {
        if (!text.includes(',')) return text
        if ((text.match(/,/g) || []).length === 1) {
            return text.replace(/,/, ` ${andOr}`)
        }
        return text.replace(/,(?=[^,]*$)/, ` ${andOr}`)
    }
    else {
        return ''
    }
}

export function getOrdinalSuffix(num: number): string {
    if (!Number.isInteger(num) || num < 0 || num > 100) {
        throw new Error("Input must be an integer between 0 and 100.")
    }

    const remainder10 = num % 10
    const remainder100 = num % 100

    if (remainder100 >= 11 && remainder100 <= 13) {
        return `${num}th`
    }

    switch (remainder10) {
        case 1: return `${num}st`
        case 2: return `${num}nd`
        case 3: return `${num}rd`
        default: return `${num}th`
    }
}