import { SpellSelectionApp } from "../../../../../apps/hero-choices/SpellSelectionApp"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { PrimaryButton } from "../../../../component/Button"
import { ManaHUD } from "./component/spellcasting/ManaHUD"
import { SpellcastingMenuContextProvider } from "./component/spellcasting/SpellcastingMenuContextProvider"
import { SpellsList } from "./component/SpellsList"

export const MagicTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <SpellcastingMenuContextProvider actor={hero.parent}>
            <div className="w-full">
                <ManaHUD hero={hero} />
                <SpellsList hero={hero} />
                <div className="w-full mt-1">
                    <div className="flex mt-1 w-full justify-end mb-12">
                        <PrimaryButton onClick={() => new SpellSelectionApp(hero.parent).render({ force: true })}>
                            {'Select Spells'}
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </SpellcastingMenuContextProvider>
    )
}