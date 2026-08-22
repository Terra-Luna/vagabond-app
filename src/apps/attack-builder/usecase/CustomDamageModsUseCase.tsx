import { SectionLabel } from "../component/Labels"
import { useArmorPiercingInput } from "./damage/ArmorPiercingInputUseCase"
import { useFlatModifierInput } from "./damage/FlatModifierInputUseCase"
import { usePerDieBonusInput } from "./damage/PerDieBonusInputUseCase"

export const useCustomDamageModifiersBuilder = () => {
    const { FlatModifierInput, flatModifier, setFlatModifier } = useFlatModifierInput()
    const { PerDieBonusInput, perDieBonus, setPerDieBonus } = usePerDieBonusInput()
    const { ArmorPiercingInput, armorPiercing, setArmorPiercing } = useArmorPiercingInput()

    const CustomDamageModifiersBuilder =
        <div className="flex flex-col border border-solid border-table-border bg-context-menu-fill/40 rounded-sm p-1">
            <SectionLabel text={"Bonuses"} />
            <div className="flex gap-x-4 items-end">
                {FlatModifierInput}
                {PerDieBonusInput}
                {ArmorPiercingInput}
            </div>
        </div>

    return {
        CustomDamageModifiersBuilder, flatModifier, perDieBonus, armorPiercing,
        setFlatModifier, setPerDieBonus, setArmorPiercing
    }
}