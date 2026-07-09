import { vgLiteLang } from "../../../../../../../utils/lang"
import { createDropdownEntriesFromObj } from "../../../../../../../utils/localeUtils"
import { DropDown } from "../../../../../../component/Dropdown"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const SkillSelector = ({ skill, onSelectSkill }: { skill: string, onSelectSkill: any }) => {
    return (
        <div className="flex gap-x-2">
            <div>
                <SpellcastingLabel text={vgLiteLang.HeroSheet.Magic.labelSkill} />
                <DropDown
                    value={skill}
                    options={createDropdownEntriesFromObj(vgLiteLang.Skills)}
                    updateMechanism={{ onChange: onSelectSkill }}
                />
            </div>
        </div>
    )
}