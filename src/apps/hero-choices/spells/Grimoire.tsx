import { appLang } from "../../../utils/lang"
import { buttonAnimation } from "../../../view/component/Button"
import { SkillCard } from "../../../view/component/SkillCard"
import { HeroCreationLabel, HeroCreationSubtext } from "../../hero-creator/component/HeroCreationTypography"

export const Grimoire = ({ spellGrants, spellSlots, spellsList }) => {
    const strings = appLang.HeroCreation

    return (
        <div className="space-y-1 mt-2">
            <div className="flex justify-between">
                <HeroCreationLabel text={strings.grimoire} />
                {/* SPELLS COMPENDIUM LINK */}
                <button onClick={() => game.packs?.get("vagabond-app.spells")?.render(true)} className={`hover-glow cursor-pointer ${buttonAnimation}`}>
                    <HeroCreationSubtext text={"Browse Compendium"} />
                </button>
            </div>

            {/* GRANTED SPELLS */}
            {spellGrants.map(g => {
                const sp = spellsList.find(sp => sp.value === g.uuid)
                if (sp) {
                    return (
                        <SkillCard
                            key={g.uuid}
                            img={sp.img}
                            dmgType={sp.dmgType}
                            title={sp.label}
                            subtitles={[{ label: appLang.HeroSheet.Magic.labelDmgBase, value: appLang.DamageTypes[sp.dmgType] }]}
                            description={sp.description}
                        />
                    )
                }
                else {
                    return null
                }
            })}

            {/* CHOSEN SPELLS */}
            {spellSlots.filter(slot => slot.value.length > 0).map(slot => {
                const sp = spellsList.find(sp => sp.value === slot.value)
                if (sp) {
                    return (
                        <SkillCard
                            key={sp.value}
                            img={sp.img}
                            dmgType={sp.dmgType}
                            title={sp.label}
                            subtitles={[{ label: appLang.HeroSheet.Magic.labelDmgBase, value: appLang.DamageTypes[sp.dmgType] }]}
                            description={sp.description}
                        />
                    )
                }
                else {
                    return null
                }
            })}
        </div>
    )
}