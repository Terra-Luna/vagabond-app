import HeroDataModel from "../../../../model/actor/HeroDataModel"
import { FoundryActor, updateActor, VgLiteActorSheet } from "../VgLiteActorSheet"
import { localizeString } from "../../../../utils/localeUtils"
import lang from "../../../../../public/lang/en.json"

const locale = lang.VGLITE.HeroSheet

export default class HeroSheet extends VgLiteActorSheet {
    Component = HeroSheetReactComponent
}

const HeroSheetReactComponent = ({ actor }: { actor: FoundryActor<HeroDataModel> }) => {
    const hero = actor.system;
    return (
        <div id="hero-sheet-div" className="theme-dark">
            <HeroSheetHeader hero={hero} />
            <HeroSheetUpperSection hero={hero} />
            <HeroSheetTabbedSection hero={hero} />

            <button onClick={async () => {
                updateActor(actor, { health: { current: actor.system.health.current! += 1 }})
                updateActor(actor, { class: { spellcasting: { castSkill: 'mysticism'}}})
                let roll = await new Roll('2d12').evaluate()
                let results = (roll.terms[0] as any).results
                console.log(results)
                ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({}),
                    content: `<h3>Rolling: 2d12</h3><br><p>${results[0].result} + ${results[1].result} = ${roll._total}`,
                    rolls: [roll]
                })
            }}>Click me!</button>
        </div>
    )
}

const HeroSheetHeader = ({ hero }: { hero: HeroDataModel }) => {
    return <div className="vglite-hero-sheet-header">
        <div className="name">{hero.parent.name}</div>
        <div className="menu-button">
        <div className="descriptor">
            <span>{localizeString(locale.Level, { level: hero.level.current?.toString() ?? "0" })}</span>
                <span className="vglite-dot"> • </span>
                <span>{localizeString(locale.AncestryAndClass, { ancestry: hero.ancestry.description || lang.VGLITE.AncestryTypes.human, class: hero.class.description || "Vagabond" })}</span>
        </div>
        <div className="xp">
            <span>{localizeString(locale.xp, { xp: hero.level.xp?.toString() || '0', nextLevel: hero.level.xpToLevel?.toString() || '0' })}</span>
            </div>
        </div>
    </div>
}

const HeroSheetUpperSection = ({ hero }: { hero: HeroDataModel }) => {
    return <div className="hero-sheet-upper-section">
        <Avatar hero={hero} />
        <HPDisplay health={hero.health} />
        <ArmorDisplay armor={hero.armor} />
    </div>
}

const HeroSheetTabbedSection = ({ hero }: { hero: HeroDataModel }) => {
    return <div className="hero-sheet-tabbed-section">

    </div>
}

const Avatar = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <img className="vglite-thumbnail" src="icons/svg/mystery-man.svg" alt={hero.parent.name} />
    );
}

interface Health {
    current: number;
    max: number;
    bonus: number;
}
const HPDisplay = ({ health }: { health: Health }) => {
    return (
        <div className="hero-hp">
            <span className="current">{health.current}</span>
            <span className="slash"> / </span>
            <span className="max">{health.max}</span>
        </div>
    )
}

interface Armor {
    rating: number
}
const ArmorDisplay = ({ armor }: { armor: Armor }) => {
    return (
        <div className="hero-armor">
            <span className="rating">{armor.rating}</span>
        </div>
    )
}