import { appLang } from "../../../utils/lang"
import { buttonAnimation } from "../../../view/component/Button"
import { CardSubHeaderValues, SkillCard } from "../../../view/component/SkillCard"
import { HeroCreationLabel, HeroCreationSubtext } from "../../hero-creator/component/HeroCreationTypography"

export const Recipes = ({ alchemySlots, alchemyItems }) => {

    return (
        <div className="flex flex-col gap-1 mt-4">
            <div className="flex justify-between">
                <HeroCreationLabel text={appLang.HeroSheet.Alchemy.recipes} />
                {/* ALCHEMY COMPENDIUM LINK */}
                <button onClick={() => game.packs?.get("vagabond-app.alchemical")?.render(true)} className={`hover-glow cursor-pointer ${buttonAnimation}`}>
                    <HeroCreationSubtext text={"Browse Compendium"} />
                </button>
            </div>

            {/* ALCHEMY RECIPIES */}
            {alchemySlots.filter(slot => slot.value.length > 0).map(slot => {
                const item = alchemyItems.find(it => it.value === slot.value)
                const subtitles: CardSubHeaderValues[] = [{ label: appLang.HeroSheet.Alchemy.category, value: appLang.AlchemyCategories[item.category].name }]
                
                if (item.dmgType !== "none") {
                    subtitles.push({ label: appLang.HeroSheet.Alchemy.damage, value: appLang.DamageTypes[item.dmgType] })
                }

                if (item) {
                    return (
                        <SkillCard
                            key={item.value}
                            img={item.img}
                            title={item.label}
                            subtitles={subtitles}
                            description={item.description}
                        />
                    )
                }
            })}
        </div>
    )

}