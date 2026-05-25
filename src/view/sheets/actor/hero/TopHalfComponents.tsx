import { Heart, Shield, Star, LucideBookMarked, LucideHeartOff, LucideClover } from "lucide-react";
import HeroDataModel from "../../../../model/actor/HeroDataModel";
import { ReactNode } from "react";
import lang from "../../../../../public/lang/en.json"
import { Header } from "../../../component/Header";
import { GridItem, GridRow } from "../../../component/Grid";
import { localizeString } from "../../../../utils/localeUtils";
import { skillCheck } from "../../../../combat/skillCheck";

export const Avatar = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <img className="vglite-thumbnail" src={hero.parent.img} alt={hero.parent.name} />
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
export const HPAndArmorDisplay = ({ health, armor }: { health: Health, armor: Armor }) => {
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

export const Stats = ({ hero }: { hero: HeroDataModel }) => {
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

export const Trackers = ({ hero }: { hero: HeroDataModel }) => {
    const { studied, fatigue } = hero;
    const currentLuck = hero.stats.currentLuck;

    return (
        <div className="vglite-trackers">
            <Header title={lang.VGLITE.HeroSheet.trackers} />
            <div className="trackers-container">
                <Tracker name={lang.VGLITE.HeroSheet.fatigue} content={<div className="trackers-container vglite-fatigue"><LucideHeartOff size={20} />{fatigue}</div>}></Tracker>
                <Tracker name={lang.VGLITE.HeroSheet.studied} content={<div className="trackers-container vglite-studied"><LucideBookMarked size={20} />{studied}</div>}></Tracker>
                <Tracker name={lang.VGLITE.HeroSheet.luck} content={<div className="trackers-container vglite-luck"><LucideClover size={20} />{currentLuck}</div>}></Tracker>
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
                skillCheck(hero.parent, name, value, e)
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