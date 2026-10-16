import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { ManaHUD } from "./component/spellcasting/ManaHUD"
import { SpellcastingMenuContextProvider } from "./component/spellcasting/SpellcastingMenuContextProvider"
import { SpellsList } from "./component/SpellsList"

export const MagicTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <SpellcastingMenuContextProvider actor={hero.parent}>
            <div className="w-full mb-4">
                <ManaHUD hero={hero} />
                <SpellsList hero={hero} />
            </div>
        </SpellcastingMenuContextProvider>
    )
}