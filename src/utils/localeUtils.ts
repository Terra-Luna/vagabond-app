import lang from "../../public/lang/en.json"
import VgLiteError from "../model/common/VgLiteError"

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

export const createDropdownEntries = (localeObj) => {
    return Object.entries(localeObj).map(([value, label]) => (
        { value, label } as { value: any, label: string }
    ))
}

export const createDropdownEntriesFromObj = (localObj) => {
    const options = {}
    Object.keys(localObj).forEach(key => {
        options[key] = localObj[key].name
    })
    return createDropdownEntries(options)
}