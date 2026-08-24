import { describe, expect, test } from "@jest/globals"

import { getCombatantStatuses } from "../../src/combat/engine/util/status"

describe('get combatant statuses', () => {
    const createCombatantWithStatuses = (activeStatuses: string[]) => {
        const activeStatusesObj = activeStatuses.reduce((acc, statusKey) => {
            acc[statusKey] = true
            return acc
        }, { fakeStatus1: false, fakeStatus2: false } as { [key: string]: boolean })

        return {
            actor: {
                system: {
                    statuses: {
                        statuses: activeStatusesObj
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