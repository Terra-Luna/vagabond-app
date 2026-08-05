import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { WeaponDataModel } from "../../../model/item/equip/WeaponDataModel"
import { useSkillCheckCritThresholdInput } from "./skillcheck/CritThresholdInputUseCase"
import { useD20CountSelector } from "./skillcheck/D20CountSelectorUseCase"
import { useFavorHinderSelector } from "./skillcheck/FavorSelectorUseCase"
import { useSkillCheckModifierInput } from "./skillcheck/ModifierInputUseCase"
import { useSkillSelector } from "./skillcheck/SkillSelectorUseCase"

export const useCustomSkillCheckBuilder = (
    actor?: Actor & { system: HeroDataModel },
    weapon?: Item & { system: WeaponDataModel }
) => {
    const { SkillSelector, skill } = useSkillSelector(actor, weapon)
    const { D20CountSelector, d20Count } = useD20CountSelector()
    const { FavorHinderSelector, favorHinder } = useFavorHinderSelector()
    const { SkillCheckModifierInput, skillCheckMod } = useSkillCheckModifierInput()
    const { SkillCheckCritThresholdInput, critThreshold } = useSkillCheckCritThresholdInput()

    const CustomSkillCheckBuilder =
        <div className="flex flex-wrap gap-x-1 items-end justify-between border border-solid border-table-border bg-context-menu-fill/40 rounded-sm p-1">
            {SkillSelector}
            {D20CountSelector}
            {FavorHinderSelector}
            {SkillCheckModifierInput}
            {SkillCheckCritThresholdInput}
        </div>

    return { CustomSkillCheckBuilder, skill, d20Count, favorHinder, skillCheckMod, critThreshold }
}