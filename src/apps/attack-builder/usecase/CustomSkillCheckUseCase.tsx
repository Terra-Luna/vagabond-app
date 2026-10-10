import { useState } from "react"

import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { WeaponDataModel } from "../../../model/item/equip/WeaponDataModel"
import { appLang } from "../../../utils/lang"
import { tableBorderRounded } from "../../../view/common/border-styles"
import { Checkbox } from "../../../view/component/Checkbox"
import { useSkillCheckCritThresholdInput } from "./skillcheck/CritThresholdInputUseCase"
import { useD20CountSelector } from "./skillcheck/D20CountSelectorUseCase"
import { useFavorHinderSelector } from "./skillcheck/FavorSelectorUseCase"
import { useSkillCheckModifierInput } from "./skillcheck/ModifierInputUseCase"
import { useSkillSelector } from "./skillcheck/SkillSelectorUseCase"

export const useCustomSkillCheckBuilder = (
    actor?: Actor & { system: HeroDataModel },
    d20s?: number,
    bonusDice?: number[],
    initialCritSum?: boolean,
    initialExplodeFavor?: boolean,
    weapon?: Item & { system: WeaponDataModel },
    label?: string,
    lockSkill?: boolean
) => {
    const { SkillSelector, skill, setSkill } = useSkillSelector(actor, weapon, label, lockSkill)
    const { D20CountSelector, d20Count, setD20Count } = useD20CountSelector({ initialD20Count: d20s })
    const { FavorHinderSelector, favorHinder, setFavorHinder } = useFavorHinderSelector()
    const { SkillCheckModifierInput, skillCheckMod, setSkillCheckMod } = useSkillCheckModifierInput()
    const { SkillCheckCritThresholdInput, critThreshold, setCritThreshold } = useSkillCheckCritThresholdInput()
    const [critSum, setCritSum] = useState<boolean>(initialCritSum ?? false)
    const [explodeFavor, setExplodeFavor] = useState<boolean>(initialExplodeFavor ?? false)

    const CustomSkillCheckBuilder = <div className={`flex flex-col gap-1 p-1 ${tableBorderRounded} bg-context-menu-fill/40`}>
        <div className={`flex flex-wrap gap-x-0.5 items-end`}>
            {SkillSelector}
            {D20CountSelector}
            {FavorHinderSelector}
            {SkillCheckModifierInput}
            {SkillCheckCritThresholdInput}
            {bonusDice && bonusDice.map((die, index) => (
                <div key={index} className="flex flex-col items-center">
                    <span>+d{die}</span>
                </div>
            ))}
            <div title={appLang.AttackBuilder.favorResultsCountTowardCrit}>
                <Checkbox
                    label={appLang.AttackBuilder.critSum}
                    color="text-text-primary mt-1"
                    checked={critSum}
                    onCheckedChanged={(checked) => setCritSum(checked)}
                />
            </div>
            <div className="mr-1" />
            {favorHinder === 'favor' && <div title={appLang.AttackBuilder.favorDiceCanExplode}><Checkbox
                label={appLang.AttackBuilder.explodingFavor}
                color="text-text-primary"
                checked={explodeFavor}
                onCheckedChanged={(checked) => setExplodeFavor(checked)}
            /></div>}
        </div>
    </div>

    return {
        CustomSkillCheckBuilder,
        skill, d20Count, favorHinder, skillCheckMod, critThreshold, critSum, explodeFavor,
        setSkill, setD20Count, setFavorHinder, setSkillCheckMod, setCritThreshold, setCritSum, setExplodeFavor
    }
}