import { describe, expect, jest, test } from "@jest/globals"

import { createElectiveTrainingsRule, findElectiveTrainingsRule, findOrCreateElectiveTrainingsRule, getItemRules, getPerkSkillSubselections, savePerkSelections } from "../../src/rules/util/item-rules-util"
import { ItemsCache } from "../../src/rules/util/ItemsCache"

describe("getItemRules", () => {
    test("includes rules from referenced Feature Items", () => {
        ItemsCache.items.clear()
        ItemsCache.items.set("feature-uuid", {
            type: "feature",
            system: { rules: [{ id: "feature-rule", key: "FlatModifier" }] }
        })

        expect(getItemRules({
            system: {
                rules: [{ id: "class-rule", key: "ChoiceSet" }],
                featureIds: ["feature-uuid"]
            }
        })).toEqual([
            { id: "class-rule", key: "ChoiceSet" },
            { id: "feature-rule", key: "FlatModifier" }
        ])
    })

    test("overlays class flag selections onto Feature Item rules", () => {
        ItemsCache.items.set("feature-with-selection", {
            type: "feature",
            system: { rules: [{ id: "shared-rule", key: "ChoiceSet", selections: [] }] }
        })

        expect(getItemRules({
            flags: {
                "vagabond-app": {
                    ruleSelections: {
                        "shared-rule": [{ id: "selection", value: "hero-choice", subselect: "" }]
                    }
                }
            },
            system: { rules: [], featureIds: ["feature-with-selection"] }
        })[0].selections).toEqual([{ id: "selection", value: "hero-choice", subselect: "" }])
    })
})

describe("savePerkSelections", () => {
    test("saves selections for feature rules to the Class Item flags", async () => {
        const featureRules = [{
            id: "feature-perk-rule",
            key: "ChoiceSet",
            selections: []
        }]
        const feature = {
            uuid: "feature-uuid",
            type: "feature",
            system: { rules: featureRules }
        }
        ItemsCache.items.set(feature.uuid, feature)

        const classUpdate = jest.fn(async (...args: any[]) => { void args })
        const actor = {
            items: [{
                type: "class",
                system: { rules: [], featureIds: [feature.uuid] },
                flags: { "vagabond-app": { ruleSelections: {} } },
                update: classUpdate
            }],
            system: { perks: [], forceUpdate: jest.fn() }
        }

        await savePerkSelections(actor as any, [{
            ruleId: "feature-perk-rule",
            value: "perk-uuid"
        }])

        expect(featureRules[0].selections).toEqual([])
        expect(classUpdate).toHaveBeenCalledWith({
            "flags.vagabond-app.ruleSelections": {
                "feature-perk-rule": [{ id: "test-id", value: "perk-uuid", subselect: "" }]
            }
        })
    })

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
            classRules[0].selections = data["flags.vagabond-app.ruleSelections"]["class-perk-rule"]
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

describe("getPerkSkillSubselections", () => {
    test("extracts skill subselections from perk choice rules", () => {
        const classItem = {
            type: "class",
            system: {
                rules: [
                    {
                        id: "class-perks",
                        key: "ChoiceSet",
                        pack: "perk",
                        selections: [
                            {
                                id: "hKFpH0BXzaH2Wd7G",
                                value: "Compendium.vagabond-app.perks.Item.eRKvvm7zmttXM5qY",
                                subselect: "skills.craft.trained"
                            },
                            {
                                id: "other-perk",
                                value: "some-other-perk-uuid",
                                subselect: ""
                            }
                        ]
                    }
                ]
            }
        }

        const ancestryItem = {
            type: "ancestry",
            system: {
                rules: [
                    {
                        id: "ancestry-perk",
                        key: "ChoiceSet",
                        pack: "perk",
                        selections: [
                            {
                                id: "human-perk-1",
                                value: "Compendium.vagabond-app.perks.Item.eRKvvm7zmttXM5qY",
                                subselect: "skills.survival.trained"
                            }
                        ]
                    }
                ]
            }
        }

        const skills = getPerkSkillSubselections([classItem as any, ancestryItem as any])
        expect(skills).toEqual(["craft", "survival"])
    })

    test("returns empty array when no perk skill subselections are present", () => {
        const classItem = {
            type: "class",
            system: {
                rules: [
                    {
                        id: "class-perks",
                        key: "ChoiceSet",
                        pack: "perk",
                        selections: [
                            {
                                id: "perk-1",
                                value: "Compendium.vagabond-app.perks.Item.Advancement",
                                subselect: "stats.might"
                            }
                        ]
                    }
                ]
            }
        }

        const skills = getPerkSkillSubselections([classItem as any])
        expect(skills).toEqual([])
    })
})

describe("elective trainings rule helpers", () => {
    test("createElectiveTrainingsRule generates standard ChoiceSet rule with calculated maxChoices", () => {
        const rule = createElectiveTrainingsRule({ id: "custom-id", reasonValue: 4 })
        expect(rule).toEqual({
            id: "custom-id",
            key: "ChoiceSet",
            label: "Elective Trainings",
            level: 1,
            scale: 0,
            channel: "path",
            sourceMode: "static",
            maxChoices: 2,
            choices: [{ value: "skills.*.trained", label: "Skills" }],
            selections: []
        })
    })

    test("findElectiveTrainingsRule finds rule by id or by label/choices", () => {
        const rule1 = { id: "rule-1", key: "ChoiceSet", label: "Elective Trainings" }
        const rule2 = { id: "rule-2", key: "ChoiceSet", channel: "path", choices: [{ value: "skills.*.trained" }] }
        const rule3 = { id: "rule-3", key: "GrantItem" }

        expect(findElectiveTrainingsRule([rule1, rule2, rule3], "rule-2")).toBe(rule2)
        expect(findElectiveTrainingsRule([rule2, rule3])).toBe(rule2)
        expect(findElectiveTrainingsRule([rule3])).toBeUndefined()
    })

    test("findOrCreateElectiveTrainingsRule finds existing rule or creates a new one", () => {
        const classItem = {
            system: {
                rules: [
                    { id: "existing-rule", key: "ChoiceSet", label: "Elective Trainings", selections: [] }
                ]
            }
        }

        const existingResult = findOrCreateElectiveTrainingsRule(classItem as any)
        expect(existingResult.electiveRule.id).toBe("existing-rule")
        expect(existingResult.rules).toHaveLength(1)

        const emptyItem = {
            system: {
                rules: []
            }
        }

        const createdResult = findOrCreateElectiveTrainingsRule(emptyItem as any, { ruleId: "new-id", reasonValue: 3 })
        expect(createdResult.electiveRule.id).toBe("new-id")
        expect(createdResult.electiveRule.maxChoices).toBe(2)
        expect(createdResult.rules).toHaveLength(1)
    })
})
