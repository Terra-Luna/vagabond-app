import { SectionLabel } from "../component/Labels"
import { useFlatModifierInput } from "./damage/FlatModifierInputUseCase"
import { usePerDieBonusInput } from "./damage/PerDieBonusInputUseCase"
import { useArmorPiercingInput } from "./damage/ArmorPiercingInputUseCase"

export const useCustomDamageModifiersBuilder = () => {
    const { FlatModifierInput, flatModifier } = useFlatModifierInput()
    const { PerDieBonusInput, perDieBonus } = usePerDieBonusInput()
    const { ArmorPiercingInput, armorPiercing } = useArmorPiercingInput()

    const CustomDamageModifiersBuilder =
        <div className="flex flex-col gap-y-2 border border-solid border-table-border bg-context-menu-fill/40 rounded-sm p-1">
            <SectionLabel text={"Bonuses"} />
            <div className="flex gap-x-4 items-end">
                {FlatModifierInput}
                {PerDieBonusInput}
                {ArmorPiercingInput}
            </div>
        </div>

    return { CustomDamageModifiersBuilder, flatModifier, perDieBonus, armorPiercing }
}