import { describe, expect, test } from "@jest/globals"

import { localizeString } from "../../src/utils/localeUtils"

describe('localizeString', () => {
    test('replaces 1 {{varName}} with the supplied value', () => {
        const localeString = "{{userName}} is level 2"

        const localizedString = localizeString(localeString, { userName: 'ada' })

        expect(localizedString).toEqual('ada is level 2')
    })
    test('replaces 1 {{varName}} with the supplied value', () => {
        const localeString = "{{userName}} is level {{level}}"

        const localizedString = localizeString(localeString, { userName: 'ada', level: '2' })

        expect(localizedString).toEqual('ada is level 2')
    })
    test('throws an error if a value is not given for an argument', () => {
        const localeString = "{{userName}} is level {{level}}"

        expect(() => localizeString(localeString, { userName: 'ada' })).toThrowErrorMatchingInlineSnapshot('"No argument supplied for {{level}}"')
    })
})