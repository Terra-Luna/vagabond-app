import { describe, expect, test } from "@jest/globals"

import { FeatureDataModel } from "../../../../src/model/item/character/FeatureDataModel"

const createFeature = (description: string, level: number, scale: number, maxLevel = 0) =>
    Object.assign(new FeatureDataModel(), { description, level, scale, maxLevel })

describe("FeatureDataModel.dynamicDescription", () => {
    test("returns an empty description unchanged", () => {
        const feature = createFeature("", 1, 1)

        expect(feature.dynamicDescription(5)).toBe("")
    })

    test("returns descriptions without feature value tokens unchanged", () => {
        const description = "Deal damage equal to your level."
        const feature = createFeature(description, 1, 1)

        expect(feature.dynamicDescription(5)).toBe(description)
    })

    test("returns tokenized descriptions unchanged when scaling is disabled", () => {
        const description = "Deal {{feature-value:1:2}} damage."
        const feature = createFeature(description, 1, 0)

        expect(feature.dynamicDescription(5)).toBe(description)
    })

    test("replaces every token using the number of completed scale increases", () => {
        const feature = createFeature(
            "Deal {{feature-value:1:2}} damage, then {{feature-value:1:1}} more.",
            2,
            3
        )

        expect(feature.dynamicDescription(8)).toBe("Deal 5 damage, then 3 more.")
    })

    test("does not increase the value before the feature level", () => {
        const feature = createFeature("Deal {{feature-value:4:2}} damage.", 5, 2)

        expect(feature.dynamicDescription(4)).toBe("Deal 4 damage.")
    })

    test("clamps the hero level to maxLevel before calculating increases", () => {
        const feature = createFeature("Deal {{feature-value:2:1}} damage.", 2, 2, 6)

        expect(feature.dynamicDescription(20)).toBe("Deal 4 damage.")
    })

    test("defaults an omitted hero level to level one", () => {
        const feature = createFeature("Deal {{feature-value:3:2}} damage.", 1, 1)

        expect(feature.dynamicDescription()).toBe("Deal 3 damage.")
    })

    test("supports signed and decimal token values", () => {
        const feature = createFeature("Values: {{feature-value:-1.5:0.5}} and {{feature-value:+2:-1}}.", 1, 2)

        expect(feature.dynamicDescription(5)).toBe("Values: -0.5 and 0.")
    })
})