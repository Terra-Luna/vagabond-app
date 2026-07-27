import { describe, expect, test } from "@jest/globals"
import { getCombatantStatuses } from "../../src/combat/status"

// statuses are kinda strange, combatants currenty have system.statuses.statuses which is an object of [statusKey: string]: false
// and then for each key in statuses.statuses, they MAY have a key in just system.statuses which is [statusKey: string]: true
// I think this is bugged and system.statuses.statuses is supposed to be able to be either true or false, but who's to say
describe('get combatant statuses', () => {
    const createCombatantWithStatuses = (activeStatuses: string[]) => {
        const activeStatusesObj = activeStatuses.reduce((acc, statusKey) => {
            acc[statusKey] = true
            return acc
        }, {} as { [key: string]: boolean })

        const statusPlaceholderObj = activeStatuses.reduce((acc, statusKey) => {
            acc[statusKey] = false
            return acc
        }, { fakeStatus1: false, fakeStatus2: false } as { [key: string]: boolean })

        return {
            actor: {
                system: {
                    statuses: {
                        ...activeStatusesObj,
                        statuses: statusPlaceholderObj
                    }
                }
            }
        }
    }
    test('functions correctly when one status is true and the rest are false', () => {
        const comb = createCombatantWithStatuses(['poisoned'])

        expect(getCombatantStatuses(comb)).toEqual(['poisoned'])
    })
})