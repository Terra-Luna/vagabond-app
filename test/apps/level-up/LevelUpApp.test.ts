import { describe, expect, test } from "@jest/globals"

import { getBonusSelections } from "../../../src/apps/level-up/LevelUpApp"

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
})
