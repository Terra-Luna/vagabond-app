import { coinsAsString } from "../../../model/common/CoinValue"
import { appLang } from "../../../utils/lang"
import { buttonAnimation } from "../../../view/component/Button"
import { SkillCardAction } from "../../../view/component/Header"
import { CardSubHeaderValues, SkillCard } from "../../../view/component/SkillCard"
import { HeroCreationLabel, HeroCreationSubtext } from "../../hero-creator/component/HeroCreationTypography"

export const Recipes = ({ alchemySlots, alchemyItems, hideCompendiumLink, actions = [] }: {
    alchemySlots: any[],
    alchemyItems: any[],
    hideCompendiumLink?: boolean,
    actions?: SkillCardAction[]
}) => {
    return (
        <div className="flex flex-col gap-1 mt-2 bg-sheet-main-fill rounded-md p-1">
            <div className="flex justify-between">
                <HeroCreationLabel text={appLang.HeroSheet.Alchemy.recipes} />
                {/* ALCHEMY COMPENDIUM LINK */}
                {!hideCompendiumLink &&
                    <button
                        onClick={() => game.packs?.get("vagabond-app.alchemical")?.render(true)}
                        className={`hover-glow cursor-pointer ${buttonAnimation}`}
                    >
                        <HeroCreationSubtext text={"Browse Compendium"} />
                    </button>
                }
            </div>

            {/* ALCHEMY RECIPIES */}
            {alchemySlots.filter(slot => slot.value.length > 0).map(slot => {
                const item = alchemyItems.find(it => it.value === slot.value)
                const subtitles: CardSubHeaderValues[] = [{ label: appLang.HeroSheet.Alchemy.category, value: appLang.AlchemyCategories[item.category].name }]
                const itemActions = actions.map(ska => ({ ...ska, item: item }))
                
                /* if (item.dmgType !== "none") {
                    subtitles.push({ label: appLang.HeroSheet.Alchemy.damage, value: appLang.DamageTypes[item.dmgType] })
                } */

                subtitles.push({ label: "Value", value: coinsAsString(item.coinValue) })

                if (item) {
                    return (
                        <SkillCard
                            key={item.value}
                            img={item.img}
                            title={item.label}
                            subtitles={subtitles}
                            description={item.description}
                            actions={itemActions}
                        />
                    )
                }
            })}
        </div>
    )

}