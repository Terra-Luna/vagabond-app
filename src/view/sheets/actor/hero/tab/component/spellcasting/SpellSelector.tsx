import { vgLiteLang } from "../../../../../../../utils/lang"
import { DamageTypeIcon } from "../../../../../../component/DamageTypeIcon"
import { DropDown } from "../../../../../../component/Dropdown"

export const SpellSelector = ({ spell, spells, setSpellSelection }) => {
    return (
        <div className="flex gap-x-1 items-end text-text-header-tertiary">
            <DropDown
                label={vgLiteLang.HeroSheet.Magic.labelSelectSpell}
                value={spell?.parent?.id}
                options={spellDropdownOptons(spells)}
                updateMechanism={{ onChange: setSpellSelection }}
            />
            {
                spell?.damageType !== 'none' ?
                    <div className="mb-1">
                        <DamageTypeIcon dmgType={spell?.damageType ?? ''} size={24} />
                    </div> : <></>
            }
        </div>
    )
}

const spellDropdownOptons = (spells) => {
    return spells?.map(sp => (
        { value: sp.parent.id, label: sp.parent.name }
    )) ?? []
}