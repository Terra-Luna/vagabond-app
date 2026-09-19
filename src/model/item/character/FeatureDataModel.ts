import { getOrdinalSuffix } from "../../../utils/stringUtil"
import { CardSubHeaderValues } from "../../../view/component/SkillCard"
import { fields, requiredInteger } from "../../common/sharedSchemas"
import { BaseItemSchema, ItemDataModel } from "../ItemDataModel"

const featureSchema = () => {
    return {
        level: new fields.NumberField({ ...requiredInteger, initial: 1 }),
        scale: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        maxLevel: new fields.NumberField({ ...requiredInteger, initial: 0 })
    }
}

export type FeatureSchema = ReturnType<typeof featureSchema> & BaseItemSchema

export class FeatureDataModel extends ItemDataModel<FeatureSchema> {
    static override defineSchema() {
        return {
            ...super.defineSchema(),
            ...featureSchema()
        }
    }

    subheader = (className?: string): CardSubHeaderValues[] => {
        if (this.level === 0) return []

        const levels: number[] = []
        if (this.scale > 0) {
            for (let i = 0; i < 3; i++) {
                if (this.maxLevel === 0) {
                    levels.push(this.level + (i * this.scale))
                }
                else if (this.maxLevel > 0 && (this.level + (i * this.scale)) <= this.maxLevel) {
                    levels.push(this.level + (i * this.scale))
                }
            }
        }
        else {
            levels.push(this.level)
        }

        return [{
            label: className ?? "",
            value: levels.map(it =>
                getOrdinalSuffix(it)).join(", ") +
                ` Level${levels.length > 1 && this.maxLevel === 0 ? "..." : ""}`
        }]
    }

    /**
     * Example usage of this featureValuePattern to generate a scaling roll:
     *      [[/r {{feature-value:1:1}}d4#Sneak Attack]]
     * @param heroLevel
     * @returns
     */
    dynamicDescription = (heroLevel?: number): string => {
        if (!this.description) return ""
        if (!this.description.includes("{{feature-value:") || this.scale <= 0) return this.description

        const level = this.maxLevel > 0 ? Math.min(heroLevel ?? 1, this.maxLevel) : (heroLevel ?? 1)

        const increases = this.scale > 0 && level >= this.level
            ? Math.floor((level - this.level) / this.scale)
            : 0

        const featureValuePattern = /\{\{feature-value:([-+]?\d+(?:\.\d+)?):([-+]?\d+(?:\.\d+)?)\}\}/g

        return this.description.replace(featureValuePattern, (_token, base, step) =>
            String(Number(base) + (Number(step) * increases))
        )
    }

}