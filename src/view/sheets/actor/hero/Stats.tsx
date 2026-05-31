import HeroDataModel from "../../../../model/actor/HeroDataModel";
import localeJson from '../../../../../public/lang/en.json';

export const Stats = ({ hero }: { hero: HeroDataModel }) => {
    const stats = ['might', 'dexterity', 'awareness', 'reason', 'presence', 'luck']
    return <div className="vglite-stats-container">{
        stats.map(stat => (
            <Stat name={localeJson.VGLITE.Stat[stat].abbr} value={hero.stats[stat]} />
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