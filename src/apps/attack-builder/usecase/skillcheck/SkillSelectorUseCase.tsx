import { useEffect,useState } from "react"

import { HeroAttack } from "../../../../combat/engine/HeroAttack"
import { appLang } from "../../../../utils/lang"
import { createDropdownEntriesFromObj } from "../../../../utils/localeUtils"
import { CustomDropDown } from "../../../../view/component/Dropdown"
import { SectionLabel } from "../../component/Labels"

export const useSkillSelector = (actor, weapon) => {
    const [skill, setSkill] = useState<string>('')

    useEffect(() => {
        if (!actor || !weapon) return
        setSkill(HeroAttack.getHighestDefaultWeaponSkill(actor.system, weapon.system)?.skill ?? 'melee')
    }, [weapon])

    const SkillSelector = <div>
        <SectionLabel text={"Skill Check"} />
        <div className="flex gap-x-0.5 items-end">
            <CustomDropDown
                value={skill}
                options={[
                    { value: null, label: "-" },
                    ...createDropdownEntriesFromObj(appLang.Skills),
                    ...createDropdownEntriesFromObj(appLang.Saves)
                ]}
                onChange={(e) => setSkill(e.target.value)}
                className="text-sm"
            />
            {(actor.system.skills[skill] || actor.system.saves[skill]) && <p className="text-sm italic">{`
                [${actor.system.skills[skill]?.value ?? actor.system.saves[skill] ?? 20}]
            `}</p>}
        </div>
    </div>
    return { SkillSelector, skill, setSkill }
}