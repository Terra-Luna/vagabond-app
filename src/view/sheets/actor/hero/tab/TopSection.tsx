import { Heart, Shield, LucideBookMarked, LucideHeartOff, LucideClover, Star } from "lucide-react"
import HeroDataModel from "../../../../../model/actor/HeroDataModel"
import { ReactNode, useCallback } from "react"
import lang from "../../../../../../public/lang/en.json"
import { Header } from "../../../../component/Header"
import { localizeString } from "../../../../../utils/localeUtils"
import { rollSkillCheck } from "../../../../../combat/dice-rolls"
import { EditableTextField } from "../../../../component/EditableTextField"
import { updateDocument } from "../../../../../utils/documentUtils"
import { importHero } from "../../../../../api/tagalong/TagalongImporter"
import { glowOnHover } from "../../../VgLiteSheet"

const borderClasses = "border border-solid border-sheet-header-fill"

export const Avatar = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <img
            className={`${borderClasses} bg-sheet-header-fill/10 rounded-lg object-contain h-[200px] w-full`}
            src={hero.parent.img}
            alt={hero.parent.name}
            onClick={async (event) => {
                if (hero.tagalongId == undefined) {
                    const tagalongLink = prompt('Enter character link from Vagabond Tagalong App')
                    if (tagalongLink != null) {
                        importHero(hero, tagalongLink)
                    }
                }
            }}
        />
    )
}

interface Health {
    current: number | null
    max: number | null
}
interface Armor {
    rating: number | null
}
export const HPAndArmorDisplay = ({ health, armor, hero }: { health: Health, armor: Armor, hero: HeroDataModel }) => {
    const hp = hero.health.current
    const updateHp = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { health: { current: (hp??0) + (auxClick ? 1 : -1) }})
    }, [hp])
    return (
        <div className="flex text-3xl font-eskapade font-bold mt-1 mb-1 ml-4 mr-4 justify-evenly">
            <div className="flex items-center">
                <Heart
                    className={`text-ic-hp fill-ic-hp ${glowOnHover} cursor-pointer`}
                    size={24}
                    onClick={() => updateHp(false)}
                    onAuxClick={() => updateHp(true)}
                />
                &nbsp;
                <span className={`text-text-hp-current ${glowOnHover} cursor-pointer`}>
                    <EditableTextField initialValue={health.current?.toString() ?? ""} updateProps={{ actor: hero.parent, propertyPath: ['health', 'current'] }} />
                </span>
                <span className="slash">&nbsp;/&nbsp;</span>
                <span className="text-text-hp-max">{health.max}</span>
            </div>
            <div className="flex items-center ml-2">
                <Shield className="text-ic-armor-border fill-ic-armor-fill" size={24} />
                &nbsp;
                <span className="rating">{armor.rating}</span>
            </div>
        </div>
    )
}

export const Trackers = ({ hero }: { hero: HeroDataModel }) => {
    const { studied, fatigue } = hero
    const currentLuck = hero.stats.currentLuck

    const updateLuck = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { stats: { currentLuck: (currentLuck ?? 0) + (auxClick ? 1 : -1) } })
    }, [currentLuck])

    const updateStudied = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { studied: (studied ?? 0) + (auxClick ? 1 : -1) })
    }, [studied])

    const updateFatigue = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { fatigue: (fatigue ?? 0) + (auxClick ? 1 : -1) })
    }, [fatigue])

    const trackerClasses = `flex gap-1 items-center`

    return (
        <div className="w-full flex flex-col justify-between mt-0.5">
            <Header title={lang.VGLITE.HeroSheet.trackers} />
            <div className="flex gap-2">
                <Tracker
                    name={lang.VGLITE.HeroSheet.fatigue}
                    onClick={updateFatigue}
                    content={<div className={trackerClasses + " text-text-fatigue-current"}><LucideHeartOff size={20} />{fatigue}</div>}></Tracker>
                <Tracker
                    name={lang.VGLITE.HeroSheet.studied}
                    onClick={updateStudied}
                    content={<div className={trackerClasses + " text-text-studied-current"}><LucideBookMarked size={20} />{studied}</div>}></Tracker>
                <Tracker
                    name={lang.VGLITE.HeroSheet.luck}
                    onClick={updateLuck}
                    content={<div className={trackerClasses + " text-text-luck-current"}><LucideClover size={20} />{currentLuck}</div>}></Tracker>
            </div>
        </div>
    )
}
const Tracker = ({ name, content, onClick }: { name: string, content: ReactNode, onClick: (auxClick: boolean) => void }) => (
    <div className={`flex items-center flex-col text-text-primary w-1/3 border-2 ${glowOnHover} cursor-pointer`}
        onClick={() => onClick(false)}
        onAuxClick={() => onClick(true)}
    >
        {name}
        <span className="font-eskapade font-bold text-2xl -mt-1 mb-1 shadow-xl">{content}</span>
    </div>
)

export const Speeds = ({ hero }: { hero: HeroDataModel }) => {
    const { crawl, travel, turn } = hero.speed
    if (crawl == null || travel == null || turn == null) return

    const localizeSpeed = (type: (keyof typeof lang.VGLITE.Speeds), speed: number) => localizeString(lang.VGLITE.Speeds[type], { speed: speed.toString() })

    return (
        <div className="mt-0.5">
            <Header title={lang.VGLITE.HeroSheet.speeds} />
            <div className="flex items-center justify-around">
                <Speed name={lang.VGLITE.Speeds.turn} value={localizeSpeed('turnSpeed', turn)} />
                <Speed name={lang.VGLITE.Speeds.crawl} value={localizeSpeed('crawlSpeed', crawl)} />
                <Speed name={lang.VGLITE.Speeds.travel} value={localizeSpeed('travelSpeed', travel)} />
            </div>
        </div>
    )
}
const Speed = ({ name, value }: { name: string, value: string }) => (
    <div className="flex flex-col items-center">
        <div className="font-eskapade text-2xl font-bold text-text-primary">{value}</div>
        <div className="text-text-aux font-bold -mt-1">{name}</div>
    </div>
)

export const Stats = ({ hero }: { hero: HeroDataModel }) => {
    const stats = ['might', 'dexterity', 'awareness', 'reason', 'presence', 'luck']
    return (
        <div className="flex flex-wrap gap-y-2">{
            stats.map(stat => (
                <Stat key={stat} name={lang.VGLITE.Stat[stat].abbr} value={hero.stats[stat]} />
            ))
        }</div>
    )
}
const Stat = ({ name, value }: { name: string, value: number }) => {
    return (
        <div className="text-text-special basis-[32%] font-bold text-center mx-[1px] mt-1 mb-1">
            {name}
            <div className="flex items-center justify-center text-text-section-header font-eskapade text-4xl">
                <span className="bg-stat-block-fill min-w-[42px] pb-1">{value}</span>
            </div>
        </div>
    )
}

export const Actions = ({ hero, actions }: { hero: HeroDataModel, actions: {name: string, value: number}[] }) => {
    return (
        <div className="w-full flex flex-col gap-y-0.5">
            <Header title="ACTIONS" />            
            <div className="flex items-center justify-between gap-1 mt-0.5">{
                actions.map(act => (
                    <Action key={act.name} hero={hero} name={act.name} value={act.value} />
                ))
            }</div>
        </div>        
    )
}
const Action = ({ hero, name, value}: { hero: HeroDataModel, name: string, value: number }) => {
    return (
        <div className="flex w-full justify-between items-center border border-solid border-section-header-fill">
            <div className={`flex items-center justify-between w-full font-eskapade font-bold ${glowOnHover} cursor-pointer`} onClick={
                async (e: React.MouseEvent<HTMLDivElement>) => { rollSkillCheck(hero.parent, name, value, e) }}>
                <div className="text-lg text-left ml-1 mr-1">{name}</div>
                <div className="bg-section-header-fill font-bold text-2xl text-text-section-header w-1/4 text-center flex items-center justify-center">{value}</div>
            </div>
        </div>
    )
}

export const Saves = ({ hero }: { hero: HeroDataModel }) => {
    const { reflex, endure, will } = hero.saves
    return (
        <div className="w-full flex flex-col gap-y-0.5">
            <Header title={lang.VGLITE.HeroSheet.saves} />
            <Save hero={hero} name={lang.VGLITE.Saves.reflex} value={reflex!} formula="DEX + AWR" />
            <Save hero={hero} name={lang.VGLITE.Saves.endure} value={endure!} formula="MIT + MIT" />
            <Save hero={hero} name={lang.VGLITE.Saves.will} value={will!} formula="RSN + PRS" />
        </div>
    )
}
const Save = ({ hero, name, value, formula }: { hero: HeroDataModel, name: string, value: number, formula: string }) => {
    return (
        <div className={`font-eskapade text-lg flex ${glowOnHover} cursor-pointer ${borderClasses}`} onClick={
            async (e: React.MouseEvent<HTMLDivElement>) => { rollSkillCheck(hero.parent, name, value, e) }
        }>
            <div className="bg-section-header-fill font-bold text-text-section-header w-1/5 text-center text-2xl flex items-center justify-center">
                <span>{value}</span>
            </div>
            <div className="ml-1 flex flex-col">
                <span className="font-bold">{name}</span>
                <span className="text-text-aux font-paradigm text-xs -mt-1 mb-0.5">[{formula}]</span>
            </div>
        </div>
    )
}