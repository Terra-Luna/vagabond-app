import { SpellSelectionApp } from "../../../../../apps/hero-choices/spells/SpellSelectionApp"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { PrimaryButton } from "../../../../component/Button"
import { ManaHUD } from "./component/spellcasting/ManaHUD"
import { SpellcastingMenuContextProvider } from "./component/spellcasting/SpellcastingMenuContextProvider"
import { SpellsList } from "./component/SpellsList"

export const MagicTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <SpellcastingMenuContextProvider actor={hero.parent}>
            <div className="w-full mb-4">
                <ManaHUD hero={hero} />
                <SpellsList hero={hero} />
                <div className="w-full">
                    <div className="flex w-full justify-end mt-2">
                        <PrimaryButton onClick={() => new SpellSelectionApp(hero.parent).render({ force: true })}>
                            {'Select Spells'}
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </SpellcastingMenuContextProvider>
    )
}