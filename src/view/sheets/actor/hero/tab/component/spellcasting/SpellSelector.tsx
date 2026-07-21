import { vgLiteLang } from "../../../../../../../utils/lang"
import { DropDown } from "../../../../../../component/Dropdown"

export const SpellSelector = ({ spell, spells, setSpellSelection }) => {
    return (
        <div className="flex gap-x-1 items-end text-text-header-tertiary">
            <DropDown
                label={vgLiteLang.HeroSheet.Magic.labelSelectSpell}
                value={spell?.id}
                options={spellDropdownOptons(spells)}
                updateMechanism={{ onChange: setSpellSelection }}
            />
        </div>
    )
}

const spellDropdownOptons = (spells) => {
    return spells?.map(sp => (
        { value: sp.id, label: sp.name }
    )) ?? []
}