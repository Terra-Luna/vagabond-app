import { describe, expect, test } from "@jest/globals"

import { getBonusSelections } from "../../../src/apps/level-up/LevelUpApp"
import { areLevelUpSelectionsComplete } from "../../../src/apps/level-up/util/levelUpSelectionUtils"

describe("level up selections", () => {
    test("keeps nested bonus selections by id", () => {
        const args = {
            advancement: { ruleId: "advancement-rule", value: "stats.might", selectionId: "perk-1" },
            perkTraining: { ruleId: "training-rule", value: "skills.athletics.isTrained", selectionId: "perk-2" },
            spell: { ruleId: "spell-rule", value: "spell-uuid", selectionId: "perk-3" },
            reasonTraining: { ruleId: "reason-rule", value: "skills.history.isTrained", selectionId: "perk-4" },
            isComplete: true
        }

        expect(getBonusSelections(args as any)).toEqual([
            { ruleId: "advancement-rule", value: "stats.might", selectionId: "perk-1" },
            { ruleId: "training-rule", value: "skills.athletics.isTrained", selectionId: "perk-2" },
            { ruleId: "spell-rule", value: "spell-uuid", selectionId: "perk-3" },
            { ruleId: "reason-rule", value: "skills.history.isTrained", selectionId: "perk-4" }
        ])
    })

    test("allows finish when all required perk bonus selections are made", () => {
        const perk = {
            system: {
                rules: [
                    { key: "ChoiceSet" },
                    { key: "ChoiceSet" }
                ]
            }
        }

        expect(areLevelUpSelectionsComplete({
            isStatLevel: false,
            isStatSelected: true,
            showBonusSelections: true,
            selectedPerks: [perk, perk],
            advancements: [{ ruleId: "a", value: "stats.might", selectionId: "1" }],
            perkTrainings: [{ ruleId: "b", value: "skills.athletics.isTrained", selectionId: "2" }],
            reasonTrainings: [],
            spells: [{ ruleId: "c", value: "spell-uuid", selectionId: "3" }]
        })).toBe(true)
    })
})
