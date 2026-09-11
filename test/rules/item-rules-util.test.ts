import { describe, expect, jest, test } from "@jest/globals"

import { savePerkSelections } from "../../src/rules/util/item-rules-util"

describe("savePerkSelections", () => {
    test("correctly updates subselects for multiple perk selections without overwriting", async () => {
        const classRules = [
            {
                id: "class-perk-rule",
                key: "ChoiceSet",
                channel: "item",
                pack: "perk",
                selections: [
                    {
                        id: "3HIcTiNkyIB99Uee",
                        value: "Compendium.vagabond-app.perks.Item.PoN6ANaHqgaTZDIi",
                        subselect: ""
                    },
                    {
                        id: "0ktdgRAT2FYGXZf3",
                        value: "Compendium.vagabond-app.perks.Item.PoN6ANaHqgaTZDIi",
                        subselect: ""
                    }
                ]
            }
        ]

        const updateMock = jest.fn(async (data: any) => {
            classRules[0].selections = data["system.rules"][0].selections
        })

        const classItem = {
            type: "class",
            system: {
                rules: classRules
            },
            update: updateMock
        }

        const actor = {
            items: [classItem],
            system: {
                perks: [
                    {
                        _sourceId: "Compendium.vagabond-app.perks.Item.PoN6ANaHqgaTZDIi",
                        rules: [{ id: "magic-secret-rule" }]
                    },
                    {
                        _sourceId: "Compendium.vagabond-app.perks.Item.PoN6ANaHqgaTZDIi",
                        rules: [{ id: "magic-secret-rule" }]
                    }
                ],
                forceUpdate: jest.fn(async () => {})
            }
        }

        const slots = [
            {
                ruleId: "magic-secret-rule",
                value: "Compendium.vagabond-app.spells.Item.aR85nxMCKoeGVlI8",
                selectionId: "3HIcTiNkyIB99Uee"
            },
            {
                ruleId: "magic-secret-rule",
                value: "Compendium.vagabond-app.spells.Item.qhc33POiILdRpUAN",
                selectionId: "0ktdgRAT2FYGXZf3"
            }
        ]

        await savePerkSelections(actor as any, slots)

        expect(updateMock).toHaveBeenCalled()
        expect(classRules[0].selections).toEqual([
            {
                id: "3HIcTiNkyIB99Uee",
                value: "Compendium.vagabond-app.perks.Item.PoN6ANaHqgaTZDIi",
                subselect: "Compendium.vagabond-app.spells.Item.aR85nxMCKoeGVlI8"
            },
            {
                id: "0ktdgRAT2FYGXZf3",
                value: "Compendium.vagabond-app.perks.Item.PoN6ANaHqgaTZDIi",
                subselect: "Compendium.vagabond-app.spells.Item.qhc33POiILdRpUAN"
            }
        ])
    })

    test("does not update if values have not changed", async () => {
        const classRules = [
            {
                id: "class-perk-rule",
                key: "ChoiceSet",
                channel: "item",
                pack: "perk",
                selections: [
                    {
                        id: "3HIcTiNkyIB99Uee",
                        value: "Compendium.vagabond-app.perks.Item.PoN6ANaHqgaTZDIi",
                        subselect: "Compendium.vagabond-app.spells.Item.aR85nxMCKoeGVlI8"
                    }
                ]
            }
        ]

        const updateMock = jest.fn()

        const classItem = {
            type: "class",
            system: {
                rules: classRules
            },
            update: updateMock
        }

        const actor = {
            items: [classItem],
            system: {
                perks: [
                    {
                        _sourceId: "Compendium.vagabond-app.perks.Item.PoN6ANaHqgaTZDIi",
                        rules: [{ id: "magic-secret-rule" }]
                    }
                ],
                forceUpdate: jest.fn()
            }
        }

        const slots = [
            {
                ruleId: "magic-secret-rule",
                value: "Compendium.vagabond-app.spells.Item.aR85nxMCKoeGVlI8",
                selectionId: "3HIcTiNkyIB99Uee"
            }
        ]

        await savePerkSelections(actor as any, slots)

        expect(updateMock).not.toHaveBeenCalled()
        expect(actor.system.forceUpdate).not.toHaveBeenCalled()
    })
})
