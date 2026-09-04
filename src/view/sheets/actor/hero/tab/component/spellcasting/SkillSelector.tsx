import { appLang } from "../../../../../../../utils/lang"
import { createDropdownEntriesFromObj } from "../../../../../../../utils/localeUtils"
import { DropDown } from "../../../../../../component/Dropdown"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const SkillSelector = ({ skill, onSelectSkill }: { skill: string, onSelectSkill: any }) => {
    return (
        <div className="flex gap-x-2">
            <div>
                <SpellcastingLabel text={appLang.HeroSheet.Magic.labelSkill} />
                <DropDown
                    value={skill}
                    options={createDropdownEntriesFromObj(appLang.Skills)}
                    updateMechanism={{ onChange: onSelectSkill }}
                />
            </div>
        </div>
    )
}