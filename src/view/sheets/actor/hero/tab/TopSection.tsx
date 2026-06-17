import { Heart, Shield, LucideBookMarked, LucideHeartOff, LucideClover, Star, ChevronUp, ChevronDown } from "lucide-react"
import HeroDataModel from "../../../../../model/actor/HeroDataModel"
import { createContext, ReactNode, useCallback, useContext, useState } from "react"
import lang from "../../../../../../public/lang/en.json"
import { Divider, Header, ItemDivider } from "../../../../component/Header"
import { localizeString } from "../../../../../utils/localeUtils"
import { rollSkillCheck } from "../../../../../combat/dice-rolls"
import { EditableTextField } from "../../../../component/EditableTextField"
import { updateDocument } from "../../../../../utils/documentUtils"
import { glowOnHover } from "../../../VgLiteSheet"

interface Health {
    current: number | null
    max: number | null
}
interface Armor {
    rating: number | null
}
export const HPArmorFatigueHUD = ({ health, armor, hero }: { health: Health, armor: Armor, hero: HeroDataModel }) => {
    const hp = hero.health.current
    const updateHp = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { health: { current: (hp??0) + (auxClick ? 1 : -1) }})
    }, [hp])
    const { isStatsDrawerOpen, toggleStatsDrawer } = useStatsDrawerStatus()

    return (
        <div className="flex">
            { /* STATS DRAWER TOGGLE CHEVRON */}
            {!isStatsDrawerOpen ?                
                <div
                    className="text-text-primary w-[54px] h-[54px] -ml-3 -mt-1 pl-3 pr-2 bg-sheet-header-fill/10 border-4 border-double border-section-header-fill border-t-transparent border-l-transparent rounded-br-lg"
                    onClick={toggleStatsDrawer}
                >
                    <span>Stats</span>
                    <ChevronDown size={28} />
                </div> : <></>
            }
            <div className="flex grow items-center justify-between mt-1 mx-4">
                {/* HP CURRENT / MAX */}
                <div className="relative items-center justify-center w-[96px] h-[96px]">
                    <span className="absolute -top-0.5 w-full text-center text-text-primary pb-1">HIT POINTS</span>
                    <Heart className="w-full h-full text-text-primary fill-sheet-header-fill/10" strokeWidth={0.5} />
                    <div className="absolute inset-0 flex items-center justify-center font-eskapade font-bold">
                        <span className={`text-5xl text-text-hp-current ${glowOnHover} cursor-pointer`}>
                            <EditableTextField initialValue={health.current?.toString() ?? ""} updateProps={{ actor: hero.parent, propertyPath: ['health', 'current'] }} />
                        </span>
                    </div>
                    <div className="absolute right-0 bottom-2 flex items-center justify-center border-2 border-solid border-text-primary rounded-full bg-sheet-main-fill font-eskapade font-bold" onClick={() => updateHp(false)} onAuxClick={() => updateHp(true)}>
                        <span className={`text-2xl text-text-hp-max px-1 ${glowOnHover} cursor-pointer`}>{health.max}</span>
                    </div>
                </div>
                <Divider />
                {/* ARMOR RATING */}
                <div className="relative items-center justify-center w-[76px] h-[76px]">
                    <span className="absolute -top-3 w-full text-center text-text-primary">ARMOR</span>
                    <Shield className="w-full h-full text-ic-armor-border fill-ic-armor-fill" strokeWidth={1} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-5xl text-text-armor font-eskapade font-bold`}>
                            {armor.rating}
                        </span>
                    </div>
                </div>
                <Divider />
                {/* FATIGUE TRACKER */}
                <div className="ml-6">
                    <Fatigue hero={hero} />
                </div>
            </div>
        </div>
    )
}

export const Fatigue = ({ hero }: { hero: HeroDataModel }) => {
    const fatigue = hero.fatigue
    const updateFatigue = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { fatigue: (fatigue ?? 0) + (auxClick ? 1 : -1) })
    }, [fatigue])
    return (
        <div className={`flex items-center flex-col pb-4 text-text-primary font-paradigm w-1/3 ${glowOnHover} cursor-pointer`}
            onClick={() => updateFatigue(false)}
            onAuxClick={() => updateFatigue(true)}
        >
            <span>{lang.VGLITE.HeroSheet.fatigue}</span>
            <span className="font-eskapade font-bold text-5xl">{
                <div className={trackerLayout + " text-text-fatigue-current"}>
                    <LucideHeartOff size={28} />{fatigue}
                </div>
            }</span>
        </div>
    )
}
export const Luck = ({ hero }: { hero: HeroDataModel }) => {
    const currentLuck = hero.stats.currentLuck
    const updateLuck = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { stats: { currentLuck: (currentLuck ?? 0) + (auxClick ? 1 : -1) } })
    }, [currentLuck])
    return (
        <Tracker
            name={lang.VGLITE.HeroSheet.luck}
            onClick={updateLuck}
            content={<div className={trackerLayout + " text-text-luck-current"}><LucideClover size={20} strokeWidth={1} />{currentLuck}</div>}>
        </Tracker>
    )
}
export const Studied = ({ hero }: { hero: HeroDataModel }) => {
    const { studied } = hero
    const updateStudied = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { studied: (studied ?? 0) + (auxClick ? 1 : -1) })
    }, [studied])
    return (
        <Tracker
            name={lang.VGLITE.HeroSheet.studied}
            onClick={updateStudied}
            content={<div className={trackerLayout + " text-text-studied-current"}><LucideBookMarked size={20} strokeWidth={1} />{studied}</div>}>
        </Tracker>
    )
}
const Tracker = ({ name, content, onClick }: { name: string, content: ReactNode, onClick: (auxClick: boolean) => void }) => (
    <div className={`flex items-center flex-col text-text-primary font-paradigm w-1/3 ${glowOnHover} cursor-pointer`}
        onClick={() => onClick(false)}
        onAuxClick={() => onClick(true)}
    >
        {name}
        <span className="font-eskapade font-bold text-4xl -mt-1 mb-1">{content}</span>
    </div>
)
const trackerLayout = `flex gap-1 items-center`

export const Speeds = ({ hero }: { hero: HeroDataModel }) => {
    const { crawl, travel, turn } = hero.speed
    if (crawl == null || travel == null || turn == null) return

    const localizeSpeed = (type: (keyof typeof lang.VGLITE.Speeds), speed: number) => localizeString(lang.VGLITE.Speeds[type], { speed: speed.toString() })

    return (
        <div className="min-w-1/2">
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
        <div className={`flex justify-between items-center font-eskapade text-lg ${glowOnHover} cursor-pointer border border-solid border-sheet-header-fill`} onClick={
            async (e: React.MouseEvent<HTMLDivElement>) => { rollSkillCheck(hero.parent, name, value, e) }
        }>
            <div className="ml-1 flex flex-col">
                <span className="text-xl font-bold">{name}</span>
                {/* <span className="text-text-aux font-paradigm text-xs -mt-1 mb-0.5">[{formula}]</span> */}
            </div>
            <div className="bg-section-header-fill font-bold text-text-section-header w-1/5 text-center text-3xl flex items-center justify-center">
                <span>{value}</span>
            </div>
        </div>
    )
}

export const Skills = ({ hero }: { hero: HeroDataModel }) => {
    const skills = ['arcana', 'brawl', 'craft', 'detect', 'finesse', 'influence', 'leadership', 'medicine', 'mysticism', 'performance', 'sneak', 'survival']
    return (
        <div>
            <Header title={lang.VGLITE.HeroSheet.skills} />
            <div className="grid @sm:grid-cols-2 gap-x-2">
                {
                    skills.map(sk => (                    
                        <Skill key={sk} hero={hero} isTrained={hero.skills[sk].isTrained} name={lang.VGLITE.Skills[sk].name} value={hero.skills[sk].value} isAttack={false} />
                    ))
                }
            </div>
        </div>
    )
}
export const Skill = ({ hero, isTrained, name, value, isAttack }: { hero: HeroDataModel, isTrained: boolean, name: string, value: number, isAttack: boolean }) => {
    return (
        <div className="w-full">
            <div className="flex items-center ml-1">
                <Star className={(isTrained ? 'text-ic-skill-trained fill-ic-skill-trained' : 'text-ic-skill-untrained')} size={18} />
                <div className={`flex justify-between ml-2 mt-1 w-full text-lg font-eskapade font-bold align-middle ${glowOnHover} cursor-pointer`} onClick={
                    async (e: React.MouseEvent<HTMLDivElement>) => { rollSkillCheck(hero.parent, name, value, e) }
                }>
                    <div>{name}</div>
                    <div className={(isAttack ? 'bg-section-header-fill font-bold text-xl text-text-section-header w-1/5 text-center flex items-center justify-center': 'text-xl mr-2')}>{value}</div>
                </div>
            </div>
            <ItemDivider />
        </div>
    )
}

export const Stats = ({ hero }: { hero: HeroDataModel }) => {
    const stats = ['might', 'dexterity', 'awareness', 'reason', 'presence', 'luck']
    const { isStatsDrawerOpen, toggleStatsDrawer } = useStatsDrawerStatus()
    /**
     * TODO: figure out how to make the stats array trasition/collapse up into the portrait
     *       and supply a ChevronDown to re-expand it.
     */
    return (
        <>{
            isStatsDrawerOpen ? <div className="pt-1 pb-1 -ml-1 space-y-4 bg-sheet-header-fill/10 rounded-br-lg border-4 border-double border-section-header-fill border-t-transparent">
                {
                    stats.map(stat => (
                        <Stat key={stat} name={lang.VGLITE.Stat[stat].abbr} value={hero.stats[stat]} />
                    ))            
                }
                <div className={`w-full ml-1.5 -mt-1 mb-1 cursor-pointer`} onClick={toggleStatsDrawer}>
                    <ChevronUp size={28} />
                </div>
            </div> : <></>
        }</>
    )
}
const Stat = ({ name, value }: { name: string, value: number }) => {
    return (
        <div className="text-text-special font-bold text-center">
            {name}
            <div className="flex items-center justify-center text-text-section-header font-eskapade text-4xl">
                <span className="bg-stat-block-fill min-w-[42px] pb-1">{value}</span>
            </div>
        </div>
    )
}

const StatsDrawerContext = createContext({
    isStatsDrawerOpen: true,
    toggleStatsDrawer: () => {  }
})

export const StatsDrawerContextProvider = ({ children }) => {
    const [isStatsDrawerOpen, setIsStatsDrawerOpen] = useState(true)
    const toggleStatsDrawer = useCallback(() => setIsStatsDrawerOpen(!isStatsDrawerOpen), [isStatsDrawerOpen])
    return (
        <StatsDrawerContext.Provider value={{
            isStatsDrawerOpen,
            toggleStatsDrawer
        }}>
            {children}
        </StatsDrawerContext.Provider>
    )
}

const useStatsDrawerStatus = () => useContext(StatsDrawerContext)