import HeroDataModel from "../../../model/actor/HeroDataModel";
import { localizeString } from "../../../utils/localeUtils";
import lang from "../../../../public/lang/en.json" // todo correct language import
const locale = lang.VGLITE.HeroSheet;

export const CharacterSheetHeader = ({ hero }: { hero: HeroDataModel }) => {
    return <div className="vglite-char-sheet-header">
        {hero.parent.name}
        <div className="container">
        <div className="level">
            <span>{localizeString(locale.Level, { level: hero.level.current?.toString() ?? "0" })}</span>
            <span className="vglite-dot">•</span>
                <span>{localizeString(locale.AncestryAndClass, { ancestry: hero.ancestry.description || lang.VGLITE.AncestryTypes.human, class: hero.class.description || "Vagabond" })}</span>
        </div>
        <div className="xp">
            <span>{localizeString(locale.xp, { xp: hero.level.xp?.toString() || '0', nextLevel: hero.level.xpToLevel?.toString() || '0' })}</span>
            </div>
        </div>
    </div>
}