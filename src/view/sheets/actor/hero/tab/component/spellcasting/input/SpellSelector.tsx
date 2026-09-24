import { SpellSnapshot } from "../../../../../../../../combat/spellcasting/SpellDelivery"
import { appLang } from "../../../../../../../../utils/lang"
import { DropDown } from "../../../../../../../component/Dropdown"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const SpellSelector = ({ spell, spells, onSelect }: {
    spell: SpellSnapshot, spells: SpellSnapshot[], onSelect: (uuid: string) => void
}) => {
    return (
        <div>
            <SpellcastingLabel text={appLang.HeroSheet.Magic.labelSelectSpell} />
            <DropDown
                value={spell?.uuid}
                options={spellDropdownOptons(spells)}
                updateMechanism={{ onChange: onSelect }}
            />
        </div>
    )
}

const spellDropdownOptons = (spells: SpellSnapshot[]) => {
    return spells?.map(sp => (
        { value: sp.uuid, label: sp.name }
    )) ?? []
}