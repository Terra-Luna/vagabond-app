import { Heart, Shield, LucideBookMarked, LucideHeartOff, LucideClover } from "lucide-react";
import HeroDataModel from "../../../../../model/actor/HeroDataModel";
import { ReactNode, useCallback } from "react";
import lang from "../../../../../../public/lang/en.json"
import { Header } from "../../../../component/Header";
import { GridItem, GridRow } from "../../../../component/Grid";
import { localizeString } from "../../../../../utils/localeUtils";
import { rollSkillCheck } from "../../../../../combat/dice-rolls";
import { EditableTextField } from "../../../../component/EditableTextField";
import { updateDocument } from "../../../../../utils/documentUtils";
import { fetchAndUpdate } from "../../../../../api/tagalong/TagalongImporter";

export const Avatar = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <img
            className="vglite-thumbnail"
            src={hero.parent.img}
            alt={hero.parent.name}
            onClick={async (event) => {
                if (hero.tagalongId == undefined) {
                    const tagalongLink = prompt('Enter character link from Vagabond Tagalong App')
                    if (tagalongLink != null) {
                        fetchAndUpdate(hero, tagalongLink)
                    }
                }
            }}
        />
    );
}

interface Health {
    current: number | null;
    max: number | null;
}
interface Armor {
    rating: number | null;
}
export const HPAndArmorDisplay = ({ health, armor, hero }: { health: Health, armor: Armor, hero: HeroDataModel }) => {
    return (
        <div className="hero-hp">
            <Heart className="vglite-heart-icon" size={20} />
            &nbsp;
            <span className="current">
                <EditableTextField initialValue={health.current?.toString() ?? ""} updateProps={{ actor: hero.parent, propertyPath: ['health', 'current'] }} />
            </span>
            <span className="slash">&nbsp;/&nbsp;</span>
            <span className="max">{health.max}</span>
            <Shield className="vglite-shield-icon" size={20} />
            &nbsp;
            <div className="hero-armor">
                <span className="rating">{armor.rating}</span>
            </div>
        </div>
    )
}

export const Stats = ({ hero }: { hero: HeroDataModel }) => {
    const stats = ['might', 'dexterity', 'awareness', 'reason', 'presence', 'luck']
    return <div className="vglite-stats-container">{
        stats.map(stat => (
            <Stat key={stat} name={lang.VGLITE.Stat[stat].abbr} value={hero.stats[stat]} />
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

export const Trackers = ({ hero }: { hero: HeroDataModel }) => {
    const { studied, fatigue } = hero;
    const currentLuck = hero.stats.currentLuck;

    const updateLuck = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { stats: { currentLuck: (currentLuck ?? 0) + (auxClick ? 1 : -1) } })
    }, [currentLuck])

    const updateStudied = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { studied: (studied ?? 0) + (auxClick ? 1 : -1) })
    }, [studied])

    const updateFatigue = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { fatigue: (fatigue ?? 0) + (auxClick ? 1 : -1) })
    }, [fatigue])

    return (
        <div className="vglite-trackers">
            <Header title={lang.VGLITE.HeroSheet.trackers} />
            <div className="trackers-container">
                <Tracker
                    name={lang.VGLITE.HeroSheet.fatigue}
                    onClick={updateFatigue}
                    content={<div className="trackers-container vglite-fatigue"><LucideHeartOff size={20} />{fatigue}</div>}></Tracker>
                <Tracker
                    name={lang.VGLITE.HeroSheet.studied}
                    onClick={updateStudied}
                    content={<div className="trackers-container vglite-studied"><LucideBookMarked size={20} />{studied}</div>}></Tracker>
                <Tracker
                    name={lang.VGLITE.HeroSheet.luck}
                    onClick={updateLuck}
                    content={<div className="trackers-container vglite-luck"><LucideClover size={20} />{currentLuck}</div>}></Tracker>
            </div>
        </div>
    )
}

const Tracker = ({ name, content, onClick }: { name: string, content: ReactNode, onClick: (auxClick: boolean) => void }) => (
    <div className="vglite-tracker" onClick={() => onClick(false)} onAuxClick={() => onClick(true)} >
        {name}
        {content}
    </div>
)

export const Saves = ({ hero }: { hero: HeroDataModel }) => {
    const { reflex, endure, will } = hero.saves
    return (
        <div className="vglite-saves">
            <Header title={lang.VGLITE.HeroSheet.saves} />
            <Save hero={hero} name={lang.VGLITE.Saves.reflex} value={reflex!} />
            <Save hero={hero} name={lang.VGLITE.Saves.endure} value={endure!} />
            <Save hero={hero} name={lang.VGLITE.Saves.will} value={will!} />
        </div>
    )
}

export const Save = ({ hero, name, value }: { hero: HeroDataModel, name: string; value: number }) => {
    return (
        <GridRow className="vglite-save" onClick={
            async (e: React.MouseEvent<HTMLDivElement>) => {
                rollSkillCheck(hero.parent, name, value, e)
            }
        }>
            <GridItem lg={4} sm={3} className="save-value">
                <span>{value}</span>
            </GridItem>
            <GridItem lg={9} sm={9} className="save-name">
                {name}
            </GridItem>
        </GridRow>
    )
}

export const Speeds = ({ hero }: { hero: HeroDataModel }) => {
    const { crawl, travel, turn } = hero.speed
    if (crawl == null || travel == null || turn == null) return;

    const localizeSpeed = (type: (keyof typeof lang.VGLITE.Speeds), speed: number) => localizeString(lang.VGLITE.Speeds[type], { speed: speed.toString() })

    return (
        <div className="vglite-speeds">
            <Header title={lang.VGLITE.HeroSheet.speeds} />
            <div className="vglite-speeds-container">
                <Speed name={lang.VGLITE.Speeds.turn} value={localizeSpeed('turnSpeed', turn)} />
                <Speed name={lang.VGLITE.Speeds.crawl} value={localizeSpeed('crawlSpeed', crawl)} />
                <Speed name={lang.VGLITE.Speeds.travel} value={localizeSpeed('travelSpeed', travel)} />
            </div>
        </div>
    )
}

export const Speed = ({ name, value }: { name: string; value: string }) => (
    <div className="vglite-speed">
        <div className="speed-value">{value}</div>
        <div className="speed-name">{name}</div>
    </div>
)