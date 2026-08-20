import { Heart, Shield, LucideBookMarked, LucideHeartOff, LucideClover, Star, ChevronRight, Eye } from "lucide-react"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { ReactNode, useCallback } from "react"
import { Divider, Header, ItemDivider } from "../../../../component/Header"
import { localizeString } from "../../../../../utils/localeUtils"
import { EditableTextField } from "../../../../component/EditableTextField"
import { updateDocument } from "../../../../../utils/documentUtils"
import { SkillCheckChatCard } from "../../../../chat/SkillCheckChatCard"
import { getId } from "../../../../../utils/modelUtil"
import { useStatsDrawerStatus } from "./statdrawer/hooks"
import { lang, vgLiteLang } from "../../../../../utils/lang"
import { sendVagabondChatMessage } from "../../../../chat/ChatCardSerializer"
import { CollapsibleSection } from "../../../../component/Collapsible"
import { SkillCheck } from "../../../../../combat/engine/roll/SkillCheck"
import { TrackerUpdateChatCard } from "../../../../chat/TrackerUpdateChatCard"

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
                    <span className={`text-4xl text-text-hp-current hover-glow`}>
                        <EditableTextField
                            boundValue={health.current?.toString() ?? ""}
                            updateProps={{ object: hero.parent, path: ['health', 'current'] }}
                            placeholder="0"
                            hideBorderOnEditMode={true}
                        />
                    </span>
                </div>
                <div title={vgLiteLang.HeroSheet.counter_tooltip}
                    className="absolute -right-1 bottom-1.5 flex items-center justify-center min-w-[28px] border-2 border-solid border-text-primary rounded-full bg-sheet-main-fill font-eskapade font-bold"
                    onClick={() => updateHp(false)} onAuxClick={() => updateHp(true)}
                >
                    <span className={`text-xl text-text-hp-max px-1 hover-glow`}>{health.max}</span>
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
            <div title={vgLiteLang.HeroSheet.counter_tooltip} className="ml-6">
                <Fatigue hero={hero} />
            </div>
        </div>
    )
}

export const Fatigue = ({ hero }: { hero: HeroDataModel }) => {
    const fatigue = hero.statuses.counters.fatigue
    const updateFatigue = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { statuses: { counters: { fatigue: (fatigue ?? 0) + (auxClick ? 1 : -1) } } })
    }, [fatigue])
    return (
        <div className={`flex items-center flex-col pb-4 text-text-primary font-paradigm w-1/3 hover-glow`}
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
    const luck = hero.statuses.counters.luck
    const updateLuck = useCallback(async (auxClick: boolean, e?: any) => {
        if (e?.shiftKey && !auxClick) {
            const roll = await new Roll('1d6').evaluate()
            sendVagabondChatMessage(
                hero,
                <TrackerUpdateChatCard
                    heroId={hero.parent.id}
                    resource="luck"
                    verb={vgLiteLang.HeroSheet.spent}
                    roll={roll.total}
                />, [roll]
            )
            await hero.parent.update(
                { 'system.statuses.counters.luck': luck - 1 } as Record<string, number>,
                { ['skipTrackerChatCard' as string]: true }
            )
        }
        else {
            await hero.parent.update({
                'system.statuses.counters.luck': luck + (auxClick ? 1 : -1)
            } as Record<string, number>)
        }
    }, [luck])
    return (
        <Tracker name={lang.VGLITE.HeroSheet.luck} title={`${vgLiteLang.HeroSheet.counter_tooltip_roll}${vgLiteLang.HeroSheet.counter_tooltip}`} onClick={updateLuck}>
            <div className={trackerLayout + " text-text-luck-current"}>
                <LucideClover size={20} strokeWidth={1} />
                {luck}
            </div>
        </Tracker>
    )
}

export const Studied = ({ hero }: { hero: HeroDataModel }) => {
    const studied = hero.statuses.counters.studied
    const updateStudied = useCallback(async (auxClick: boolean, e?: any) => {
        if (e?.shiftKey && !auxClick) {
            const roll = await new Roll('1d6').evaluate()
            sendVagabondChatMessage(
                hero,
                <TrackerUpdateChatCard
                    heroId={hero.parent.id}
                    resource="studied"
                    verb={vgLiteLang.HeroSheet.spent}
                    roll={roll.total}
                />, [roll]
            )
            await hero.parent.update(
                { 'system.statuses.counters.studied': studied - 1 } as Record<string, number>,
                { ['skipTrackerChatCard' as string]: true }
            )
        }
        else {
            await hero.parent.update({
                'system.statuses.counters.studied': studied + (auxClick ? 1 : -1)
            } as Record<string, number>)
        }
    }, [studied])
    return (
        <Tracker name={lang.VGLITE.HeroSheet.studied} title={`${vgLiteLang.HeroSheet.counter_tooltip_roll}${vgLiteLang.HeroSheet.counter_tooltip}`} onClick={updateStudied}>
            <div className={trackerLayout + " text-text-studied-current"}>
                <LucideBookMarked size={20} strokeWidth={1} />
                {studied}
            </div>
        </Tracker>
    )
}

export const Focus = ({ hero }: { hero: HeroDataModel }) => {
    const focus = hero.statuses.counters.focus
    const updateFocus = useCallback(async (auxClick: boolean) => {
        await hero.parent.update({
            'system.statuses.counters.focus': focus + (auxClick ? 1 : -1)
        } as Record<string, number>)
    }, [focus])
    return (
        <Tracker name={lang.VGLITE.HeroSheet.focus} title={`${vgLiteLang.HeroSheet.counter_tooltip}`} onClick={updateFocus}>
            <div className={trackerLayout + " text-text-secondary"}>
                <Eye size={20} strokeWidth={1} />
                {focus}
            </div>
        </Tracker>
    )
}

const Tracker = ({ name, title, children, onClick }: { name: string, title: string, children: ReactNode, onClick: (auxClick: boolean, e?: any) => void }) => (
    <div title={title} className={`flex items-center flex-col text-text-primary font-paradigm w-1/3 hover-glow`}
        onClick={(e) => onClick(false, e)}
        onAuxClick={() => onClick(true)}
    >
        {name}
        <span className="font-eskapade font-bold text-4xl -mt-1 mb-1">{children}</span>
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
    const { reflex, endure, will } = hero.modifiers.skillCheck
    return (
        <div className="w-full flex flex-col gap-y-0.5">
            <Header title={lang.VGLITE.HeroSheet.saves} />
            <Save hero={hero} save={{ key: 'reflex', ...lang.VGLITE.Saves.reflex, value: hero.saves.reflex, mod: reflex.modifier ?? 0 }} />
            <Save hero={hero} save={{ key: 'endure', ...lang.VGLITE.Saves.endure, value: hero.saves.endure, mod: endure.modifier ?? 0 }} />
            <Save hero={hero} save={{ key: 'will', ...lang.VGLITE.Saves.will, value: hero.saves.will, mod: will.modifier ?? 0 }} />
        </div>
    )
}
const Save = ({ hero, save }: {
    hero: HeroDataModel,
    save: {
        key: string,
        name: string,
        formula: string,
        description: string,
        value: number,
        mod: number
    }
}) => {
    return (
        <div title={`${save.formula}\n${lang.VGLITE.HeroSheet.skills_tooltip}`}>
            <div className={`flex font-eskapade hover-glow border border-solid border-table-border/50`} onClick={
                async (e: React.MouseEvent<HTMLDivElement>) => {
                    const skillCheck = await new SkillCheck(hero, { type: 'save', skill: save.key, clickEvent: e }).roll()
                    sendVagabondChatMessage(hero, <SkillCheckChatCard actorId={getId(hero)} result={skillCheck} />, skillCheck.rolls)
                }
            }>
                <div className="mx-1 w-full line-clamp-1">
                    <div className="flex justify-between items-center">
                        <span className="-mt-1 text-xl font-bold">{save.name}</span>
                        {save.mod !== 0 &&
                            <span className="-mt-1 text-xs text-text-tertiary font-normal">{`(${save.mod > 0 ? '+' : '-'}${save.mod})`}</span>
                        }
                    </div>
                    <span className="text-xs text-text-secondary font-paradigm italic line-clamp-1">{save.description}</span>
                </div>
                <div className="flex w-1/4 items-center justify-center text-3xl text-text-section-header font-bold bg-section-header-fill">
                    {save.value}
                </div>
            </div>
        </div>
    )
}

export const Skills = ({ hero }: { hero: HeroDataModel }) => {
    const skills = Object.keys(vgLiteLang.Skills)
    return (
        <div>
            <CollapsibleSection settingsKey={`hero-sheet-collapsed-${(hero as any)._id}`} title={lang.VGLITE.HeroSheet.skills} content={
                <div className="grid @sm:grid-cols-2 gap-x-2">
                    {
                        skills.map(sk => (
                            <Skill key={sk} hero={hero} isTrained={hero.skills[sk].isTrained} skillKey={sk} name={lang.VGLITE.Skills[sk].name} value={hero.skills[sk].value} isAttack={false} />
                        ))
                    }
                </div>
            } />
        </div>
    )
}
export const Skill = ({ hero, isTrained, skillKey, name, value, isAttack }: { hero: HeroDataModel, isTrained: boolean, skillKey: string, name: string, value: number, isAttack: boolean }) => {
    return (
        <div title={lang.VGLITE.HeroSheet.skills_tooltip} className="w-full">
            <div className="flex items-center ml-1">
                <Star className={(isTrained ? 'text-ic-skill-trained fill-ic-skill-trained' : 'text-ic-skill-untrained')} size={18} />
                <div className={`flex justify-between ml-2 mt-1 w-full text-lg font-eskapade font-bold align-middle hover-glow`} onClick={
                    async (e: React.MouseEvent<HTMLDivElement>) => {
                        const skillCheck = await new SkillCheck(hero, { type: isAttack ? 'attack' : 'check', skill: skillKey, clickEvent: e }).roll()
                        sendVagabondChatMessage(hero, <SkillCheckChatCard actorId={getId(hero)} result={skillCheck} />, skillCheck.rolls)
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
    )
}

export const Stats = ({ hero }: { hero: HeroDataModel }) => {
    const stats = ['might', 'dexterity', 'awareness', 'reason', 'presence', 'luck']
    const { isStatsDrawerOpen, toggleStatsDrawer } = useStatsDrawerStatus()

    return (
        <>{
            isStatsDrawerOpen &&
            <div className="absolute pt-1 pb-1 mt-1 -ml-11.5 space-y-4 bg-sheet-main-fill/75 rounded-bl-lg rounded-tl-lg border-2 border-solid border-section-header-fill border-r-transparent">
                {stats.map(stat => (
                    <Stat key={stat} actor={hero.parent} stat={stat} />
                ))}
                <div className={`w-full ml-1.5 -mt-1 mb-1 cursor-pointer`} onClick={toggleStatsDrawer}>
                    <ChevronRight size={28} />
                </div>
            </div>
        }</>
    )
}
const Stat = ({ actor, stat }: { actor: Actor & { system: any }, stat: string }) => {
    const name = lang.VGLITE.Stat[stat].abbr
    const value = actor.system.stats[stat]
    return (
        <div className="text-text-special font-bold text-center">
            {name}
            <div className="flex items-center justify-center text-text-stat-block font-eskapade text-4xl">
                {/* GM's can edit stats directly - modifiers from rules will not be affected. */}
                {game.user?.isActiveGM
                    ? <span className="bg-stat-block-fill min-w-[42px] pb-1">
                        <EditableTextField
                            boundValue={actor.system.stats[stat]}
                            placeholder={"2"}
                            onSave={async (value) => {
                                await actor.update({ [`system.stats.${stat}`]: value })
                                return true
                            }}
                        />
                    </span>
                    : <span className="bg-stat-block-fill min-w-[42px] pb-1">
                        {value}
                    </span>
                }
            </div>
        </div>
    )
}