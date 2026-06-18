import VgLiteError from "../model/common/VgLiteError"
import lang from "../../public/lang/en.json"

export const localizeString = (localeString: string, args: Record<string, string>) => {
    // find all {{var}} instances
    const processRegexp = localeString.matchAll(/{{(.*?)}}/g)
    const varsFound = new Set<string>()
    for (const match of processRegexp) {
        const [_, capture] = match // "capture" like regex capture group
        varsFound.add(capture)
    }

    let localizedString = localeString

    varsFound.forEach(variable => {
        const arg = args[variable]
        if (arg !== undefined && arg !== null) {
            localizedString = localizedString.replace(`{{${variable}}}`, arg)
        }
        else {
            // error checking: each var found should have a matching argument given
            throw new VgLiteError({ name: 'NO_MATCHING_ARGUMENT_ERROR', message: 'No argument supplied for {{' + variable + '}}' })
        }
    })

    return localizedString
}

export const createDropdownEntries = (localeObj) => Object.entries(localeObj).map(([value, label]) => ({ label, value } as { label: string, value: any }))
export const createStatDropdownEntries = () => Object.entries(lang.VGLITE.Stat).map(([value, inner]) => ({ value, label: inner.abbr }))