import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { ManaHUD } from "./component/spellcasting/ManaHUD"
import { SpellsList } from "./component/SpellsList"

export const MagicTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div>
            <ManaHUD hero={hero} />
            <SpellsList hero={hero} />
        </div>
    )
}