import HeroDataModel from "../../../../model/actor/HeroDataModel"
import { FoundryActor, updateActor, VgLiteActorSheet } from "../VgLiteActorSheet"
import { localizeString } from "../../../../utils/localeUtils"
import { Heart, LucideBookMarked, LucideClover, LucideHeartOff, Menu, Shield } from "lucide-react"
import lang from "../../../../../public/lang/en.json"
import { IconButton } from "../../../component/IconButton"
import { ReactNode, useCallback, useRef, useState } from "react"
import { SpellDelivery, Sphere } from "../../../../combat/spellcasting/SpellDelivery"
import { GridItem, GridRow } from "../../../component/Grid"
import { Header } from "../../../component/Header"

const locale = lang.VGLITE.HeroSheet

export default class HeroSheet extends VgLiteActorSheet {
    Component = HeroSheetReactComponent
}

const HeroSheetReactComponent = ({ actor }: { actor: FoundryActor<HeroDataModel> }) => {
    const hero = actor.system;
    return (
        <div id="hero-sheet-div">
            <HeroSheetHeader hero={hero} />
            <HeroSheetUpperSection hero={hero} />
            <HeroSheetTabbedSection hero={hero} />

            <button onClick={async () => {
                updateActor(actor, { health: { current: actor.system.health.current! += 1 } })
                updateActor(actor, { class: { spellcasting: { castSkill: 'mysticism' } } })
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
    const numberOfTimesClickedRef = useRef(0)
    const deliveryRef = useRef<SpellDelivery>(null)

    const [_, forceUpdate] = useState(false)

    const openMenu = useCallback((event) => {
        const didShift = event.shiftKey
        numberOfTimesClickedRef.current += 1
        alert(`you did${didShift ? '' : ' not'} hold shift! Number of times clicked: ${numberOfTimesClickedRef.current}`)
        deliveryRef.current = new Sphere()
        console.log({ deliveryRef: deliveryRef.current })
        forceUpdate(!_)
    }, [numberOfTimesClickedRef, _])

    const toggleTheme = useCallback(() => {
        const curUiConfig = (game.settings as any).get("core", "uiConfig")
        const curColorScheme = curUiConfig.colorScheme
        const curTheme = curColorScheme.applications; // this semicolon is needed
        (game.settings as any).set("core", "uiConfig", {
            ...curUiConfig,
            colorScheme: {
                ...curColorScheme,
                applications: curTheme === "dark" ? "light" : "dark"
            }
        })
    }, [])

    return (
        <div className="vglite-hero-sheet-header">
            {/* <div>{numberOfTimesClickedRef.current}</div> */}
            <div className="name">
                {hero.parent.name}
                <IconButton Icon={Menu} size={24} className="float-right vglite-menu" onClick={openMenu} onAuxClick={toggleTheme} /></div>
            <div className="descriptor">
                <span>{localizeString(locale.Level, { level: hero.level.current?.toString() ?? "0" })}</span>
                <span className="vglite-dot"> • </span>
                <span>{localizeString(locale.AncestryAndClass, { ancestry: hero.ancestry.description || lang.VGLITE.AncestryTypes.human, class: hero.class.description || "Vagabond" })}</span>
            </div>
            <div className="xp float-right">
                <span>{localizeString(locale.xp, { xp: hero.level.xp?.toString() || '0', nextLevel: hero.level.xpToLevel?.toString() || '0' })}</span>
            </div>
        </div>
    )
}

const HeroSheetUpperSection = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className="hero-sheet-upper-section">
            <GridRow>
                <GridItem lg={6} sm={6}>
                    <Avatar hero={hero} />
                    <HPAndArmorDisplay health={hero.health} armor={hero.armor} />
                </GridItem>
                <GridItem lg={6} sm={6}>
                    <Stats hero={hero} />
                    <Trackers hero={hero} />
                </GridItem>
            </GridRow>
        </div>
    )
}

const HeroSheetTabbedSection = ({ hero }: { hero: HeroDataModel }) => {
    return <div className="hero-sheet-tabbed-section" />
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
interface Armor {
    rating: number
}
const HPAndArmorDisplay = ({ health, armor }: { health: Health, armor: Armor }) => {
    return (
        <div className="hero-hp">
            <Heart className="vglite-heart-icon" size={20} />
            <span className="current">{health.current}</span>
            <span className="slash"> / </span>
            <span className="max">{health.max}</span>
            <Shield className="vglite-shield-icon" size={20} />
            <div className="hero-armor">
                <span className="rating">{armor.rating}</span>
            </div>
        </div>
    )
}

const Stats = ({ hero }: { hero: HeroDataModel }) => {
    const stats = ['might', 'dexterity', 'awareness', 'reason', 'presence', 'luck']

    return <div className="vglite-stats-container">{
        stats.map(stat => (
            <Stat name={lang.VGLITE.Stat[stat].abbr} value={hero.stats[stat]} />
        ))}</div>
}

const Stat = ({ name, value }: { name: string, value: number }) => {
    return (
        <div className="vglite-stat">
            {name}
            <div className="vglite-stat-value">{value}</div>
        </div>
    )
}

const Trackers = ({ hero }: { hero: HeroDataModel }) => {
    const { studied, fatigue } = hero;
    const currentLuck = hero.stats.currentLuck;

    return (
        <div className="vglite-trackers">
            <Header title={lang.VGLITE.HeroSheet.trackers} />
            <div className="trackers-container">
                <Tracker name={lang.VGLITE.HeroSheet.studied} content={<div className="vglite-studied"><LucideBookMarked size={20} /> {studied}</div>}></Tracker>
                <Tracker name={lang.VGLITE.HeroSheet.fatigue} content={<div className="vglite-fatigue"><LucideHeartOff size={20} /> {fatigue}</div>}></Tracker>
                <Tracker name={lang.VGLITE.HeroSheet.luck} content={<div className="vglite-luck"><LucideClover size={20} /> {fatigue} </div>}></Tracker>
            </div>
        </div>
    )
}

const Tracker = ({ name, content }: { name: string, content: ReactNode }) => (
    <div className="vglite-tracker">
        {name}
        {content}
    </div>
)