import { describe, expect, jest, test } from "@jest/globals"

import { getBonusSelections, saveElectiveTraining } from "../../../src/apps/level-up/LevelUpApp"

describe("level up selections", () => {
    test("keeps nested bonus selections by id", () => {
        const args = {
            advancement: { ruleId: "advancement-rule", value: "stats.might", selectionId: "perk-1" },
            perkTraining: { ruleId: "training-rule", value: "skills.athletics.trained", selectionId: "perk-2" },
            spell: { ruleId: "spell-rule", value: "spell-uuid", selectionId: "perk-3" },
            reasonTraining: { ruleId: "reason-rule", value: "skills.history.trained", selectionId: "perk-4" },
            isComplete: true
        }

        expect(getBonusSelections(args as any)).toEqual([
            { ruleId: "advancement-rule", value: "stats.might", selectionId: "perk-1" },
            { ruleId: "training-rule", value: "skills.athletics.trained", selectionId: "perk-2" },
            { ruleId: "spell-rule", value: "spell-uuid", selectionId: "perk-3" },
            { ruleId: "reason-rule", value: "skills.history.trained", selectionId: "perk-4" }
        ])
    })

    test("slots new elective training selection into class elective training rule", async () => {
        const updateMock = jest.fn()
        const classItem = {
            type: "class",
            system: {
                rules: [
                    {
                        id: "elective-rule-id",
                        key: "ChoiceSet",
                        label: "Elective Trainings",
                        channel: "path",
                        sourceMode: "static",
                        selections: [
                            { id: "sel-1", value: "skills.arcana.trained", subselect: "" }
                        ]
                    }
                ]
            },
            update: updateMock
        }

        const actor = {
            items: [classItem],
            system: {
                stats: { reason: 4 }
            }
        }

        await saveElectiveTraining(actor as any, "detect")

        expect(updateMock).toHaveBeenCalledTimes(1)
        const updatedRules = updateMock.mock.calls[0][0]["system.rules"]
        expect(updatedRules[0].selections).toHaveLength(2)
        expect(updatedRules[0].selections[1].value).toBe("skills.detect.trained")
    })

    test("does not duplicate selection if already selected", async () => {
        const updateMock = jest.fn()
        const classItem = {
            type: "class",
            system: {
                rules: [
                    {
                        id: "elective-rule-id",
                        key: "ChoiceSet",
                        label: "Elective Trainings",
                        channel: "path",
                        sourceMode: "static",
                        selections: [
                            { id: "sel-1", value: "skills.detect.trained", subselect: "" }
                        ]
                    }
                ]
            },
            update: updateMock
        }

        const actor = {
            items: [classItem],
            system: {
                stats: { reason: 4 }
            }
        }

        await saveElectiveTraining(actor as any, "detect")
        expect(updateMock).not.toHaveBeenCalled()
    })
})
