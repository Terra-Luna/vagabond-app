import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { WeaponDataModel } from "../../../model/item/equip/WeaponDataModel"
import { tableBorderRounded } from "../../../view/common/border-styles"
import { useSkillCheckCritThresholdInput } from "./skillcheck/CritThresholdInputUseCase"
import { useD20CountSelector } from "./skillcheck/D20CountSelectorUseCase"
import { useFavorHinderSelector } from "./skillcheck/FavorSelectorUseCase"
import { useSkillCheckModifierInput } from "./skillcheck/ModifierInputUseCase"
import { useSkillSelector } from "./skillcheck/SkillSelectorUseCase"

export const useCustomSkillCheckBuilder = (
    actor?: Actor & { system: HeroDataModel },
    weapon?: Item & { system: WeaponDataModel }
) => {
    const { SkillSelector, skill, setSkill } = useSkillSelector(actor, weapon)
    const { D20CountSelector, d20Count, setD20Count } = useD20CountSelector()
    const { FavorHinderSelector, favorHinder, setFavorHinder } = useFavorHinderSelector()
    const { SkillCheckModifierInput, skillCheckMod, setSkillCheckMod } = useSkillCheckModifierInput()
    const { SkillCheckCritThresholdInput, critThreshold, setCritThreshold } = useSkillCheckCritThresholdInput()

    const CustomSkillCheckBuilder =
        <div className={`flex flex-wrap gap-x-1 items-end justify-between bg-context-menu-fill/40 p-1 ${tableBorderRounded}`}>
            {SkillSelector}
            {D20CountSelector}
            {FavorHinderSelector}
            {SkillCheckModifierInput}
            {SkillCheckCritThresholdInput}
        </div>

    return {
        CustomSkillCheckBuilder,
        skill, d20Count, favorHinder, skillCheckMod, critThreshold,
        setSkill, setD20Count, setFavorHinder, setSkillCheckMod, setCritThreshold
    }
}