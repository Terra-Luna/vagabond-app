import { Heart, Shield, LucideBookMarked, LucideHeartOff, LucideClover, Star, ChevronRight } from "lucide-react"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { ReactNode, useCallback } from "react"
import { Divider, Header, ItemDivider } from "../../../../component/Header"
import { localizeString } from "../../../../../utils/localeUtils"
import { rollSkillCheck } from "../../../../../combat/dice-rolls"
import { EditableTextField } from "../../../../component/EditableTextField"
import { updateDocument } from "../../../../../utils/documentUtils"
import { SkillCheckChatCard } from "../../../../chat/SkillCheckChatCard"
import { getId } from "../../../../../utils/modelUtil"
import { Tooltip } from "../../../../component/Tooltip"
import { glowOnHover } from "../../../../common/text-styles"
import { useStatsDrawerStatus } from "./StatsDrawer/hooks"
import { lang } from "../../../../../utils/lang"
import { sendVgLiteChatMessage } from "../../../../../utils/chatMessageUtil"

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
        updateDocument(hero.parent, { health: { current: (hp ?? 0) + (auxClick ? 1 : -1) } })
    }, [hp])
    return (
        <div className={`flex grow items-center justify-between mt-1 mx-1`}>
            {/* HP CURRENT / MAX */}
            <div className="relative items-center justify-center w-[80px] h-[80px]">
                <span className="absolute -top-0.5 w-full text-center text-xs text-text-primary pb-1">{lang.VGLITE.HeroSheet.hp}</span>
                <Heart className="w-full h-full text-text-primary fill-sheet-header-fill/10" strokeWidth={0.5} />
                <div className="absolute inset-0 flex items-center justify-center font-eskapade font-bold">
                    <span className={`text-4xl text-text-hp-current ${glowOnHover} cursor-pointer`}>
                        <EditableTextField
                            boundValue={health.current?.toString() ?? ""}
                            updateProps={{ object: hero.parent, path: ['health', 'current'] }}
                            placeholder="0"
                            hideBorderOnEditMode={true}
                        />
                    </span>
                </div>
                <div className="absolute -right-1 bottom-1.5 flex items-center justify-center min-w-[28px] border-2 border-solid border-text-primary rounded-full bg-sheet-main-fill font-eskapade font-bold" onClick={() => updateHp(false)} onAuxClick={() => updateHp(true)}>
                    <span className={`text-xl text-text-hp-max px-1 ${glowOnHover} cursor-pointer`}>{health.max}</span>
                </div>
            </div>
            <Divider />
            {/* ARMOR RATING */}
            <div className="relative items-center justify-center w-[60px] h-[60px]">
                <span className="absolute -top-3 w-full text-center text-xs text-text-primary">{lang.VGLITE.HeroSheet.armor}</span>
                <Shield className="w-full h-full text-ic-armor-border fill-ic-armor-fill" strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl text-text-armor font-eskapade font-bold`}>
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
    )
}

export const Fatigue = ({ hero }: { hero: HeroDataModel }) => {
    const { fatigue } = hero
    const updateFatigue = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { fatigue: (fatigue ?? 0) + (auxClick ? 1 : -1) })
    }, [fatigue])
    return (
        <div className={`flex items-center flex-col pb-4 text-text-primary font-paradigm w-1/3 ${glowOnHover} cursor-pointer`}
            onClick={() => updateFatigue(false)}
            onAuxClick={() => updateFatigue(true)}
        >
            <span className="text-xs">{lang.VGLITE.HeroSheet.fatigue}</span>
            <span className="font-eskapade font-bold text-4xl">{
                <div className={trackerLayout + " text-text-fatigue-current"}>
                    <LucideHeartOff size={28} />
                    <span className="min-w-[1ch]">{fatigue}</span>
                </div>
            }</span>
        </div>
    )
}

export const Luck = ({ hero }: { hero: HeroDataModel }) => {
    const { currentLuck } = hero.stats
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
    return (
        <div className="w-full flex flex-col gap-y-0.5">
            <Header title={lang.VGLITE.HeroSheet.saves} />
            <Save hero={hero} save={{ ...lang.VGLITE.Saves.reflex, value: hero.saves.reflex }} />
            <Save hero={hero} save={{ ...lang.VGLITE.Saves.endure, value: hero.saves.endure }} />
            <Save hero={hero} save={{ ...lang.VGLITE.Saves.will, value: hero.saves.will }} />
        </div>
    )
}
const Save = ({ hero, save }: { hero: HeroDataModel, save: { name: string, formula: string, description: string, value: number } }) => {
    return (
        <Tooltip text={lang.VGLITE.HeroSheet.skills_tooltip}>
            <div className={`flex justify-between items-center font-eskapade text-lg ${glowOnHover} cursor-pointer border border-solid border-sheet-header-fill`} onClick={
                async (e: React.MouseEvent<HTMLDivElement>) => {
                    const skillCheck = await rollSkillCheck(save.name, save.value, e)
                    sendVgLiteChatMessage(hero, <SkillCheckChatCard actorId={getId(hero)} result={skillCheck} />, skillCheck.rolls)
                }
            }>
                <div className="ml-1 flex">
                    <p className="text-xl font-bold">{save.name}</p>
                    <p className="text-xs float-right">{save.formula}</p>
                </div>
                <p className="bg-section-header-fill font-bold text-text-section-header w-1/5 text-center text-3xl flex items-center justify-center">
                    {save.value}
                </p>
            </div>
        </Tooltip>
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
        <Tooltip text={lang.VGLITE.HeroSheet.skills_tooltip}>
            <div className="w-full">
                <div className="flex items-center ml-1">
                    <Star className={(isTrained ? 'text-ic-skill-trained fill-ic-skill-trained' : 'text-ic-skill-untrained')} size={18} />
                    <div className={`flex justify-between ml-2 mt-1 w-full text-lg font-eskapade font-bold align-middle ${glowOnHover} cursor-pointer`} onClick={
                        async (e: React.MouseEvent<HTMLDivElement>) => {
                            const skillCheck = await rollSkillCheck(name, value, e)
                            sendVgLiteChatMessage(hero, <SkillCheckChatCard actorId={getId(hero)} result={skillCheck} />, skillCheck.rolls)
                        }
                    }>
                        <div>{name}</div>
                        <div className={(isAttack ?
                            'bg-section-header-fill font-bold text-xl text-text-section-header w-1/5 text-center flex items-center justify-center' :
                            'text-xl mr-2'
                        )}>
                            {value}
                        </div>
                    </div>
                </div>
                <ItemDivider />
            </div>
        </Tooltip>
    )
}

export const Stats = ({ hero }: { hero: HeroDataModel }) => {
    const stats = ['might', 'dexterity', 'awareness', 'reason', 'presence', 'luck']
    const { isStatsDrawerOpen, toggleStatsDrawer } = useStatsDrawerStatus()

    return (
        <>{
            isStatsDrawerOpen ? <div className="absolute pt-1 pb-1 mt-1 -ml-11.5 space-y-4 bg-sheet-main-fill/75 rounded-bl-lg rounded-tl-lg border-2 border-solid border-section-header-fill border-r-transparent">
                {
                    stats.map(stat => (
                        <Stat key={stat} name={lang.VGLITE.Stat[stat].abbr} value={hero.stats[stat]} />
                    ))
                }
                {<div className={`w-full ml-1.5 -mt-1 mb-1 cursor-pointer`} onClick={toggleStatsDrawer}>
                    <ChevronRight size={28} />
                </div>}
            </div> : <></>
        }</>
    )
}
const Stat = ({ name, value }: { name: string, value: number }) => {
    return (
        <div className="text-text-special font-bold text-center">
            {name}
            <div className="flex items-center justify-center text-text-stat-block font-eskapade text-4xl">
                <span className="bg-stat-block-fill min-w-[42px] pb-1">{value}</span>
            </div>
        </div>
    )
}