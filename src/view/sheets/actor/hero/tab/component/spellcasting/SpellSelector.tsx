import { SpellSnapshot } from "../../../../../../../combat/spellcasting/SpellDelivery"
import { appLang } from "../../../../../../../utils/lang"
import { DropDown } from "../../../../../../component/Dropdown"

export const SpellSelector = ({ spell, spells, onSelect }: {
    spell: SpellSnapshot, spells: SpellSnapshot[], onSelect: (uuid: string) => void
}) => {
    return (
        <div className="flex gap-x-1 items-end text-text-header-tertiary">
            <DropDown
                label={appLang.HeroSheet.Magic.labelSelectSpell}
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