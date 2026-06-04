import { Sparkle, Sparkles } from "lucide-react";
import HeroDataModel from "../../../../../model/actor/HeroDataModel";
import { EditableTextField } from "../../../../component/EditableTextField";
import { SkillCard } from "../../../../component/SkillCard";

export const MagicTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div>
            <ManaDisplay hero={hero} />
            <Spells hero={hero} />
        </div>
    )
}

const ManaDisplay = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className="flex text-3xl font-eskapade font-bold mt-0.5 mb-0.5 ml-4 mr-4 justify-evenly">
            <div className="flex items-center">
                <span className="text-lg justify-bottom">Mana:&nbsp;&nbsp;</span>
                <Sparkle className="text-mana" size={20} />
                &nbsp;
                <span className="text-mana">
                    <EditableTextField initialValue={hero.mana.current?.toString() ?? ""} updateProps={{ actor: hero.parent, propertyPath: ['mana', 'current'] }} />
                </span>
                <span className="slash">&nbsp;/&nbsp;</span>
                <span className="text-mana">{hero.mana.max}</span>
            </div>
            <div className="flex items-center text-mana">
                <span className="text-lg text-text-primary">Cast Max:&nbsp;&nbsp;</span>
                <Sparkles size={20} />
                &nbsp;
                <span>{hero.mana.maxCast}</span>
            </div>
        </div>
    )
}

const Spells = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div>{
            hero.spells.map(sp => (
                <SkillCard
                    key={sp.name}
                    title={sp.name}
                    subtitles={[['Base dmg', sp.damageType]]}
                    description={sp.description}
                />
            ))
        }</div>
    )
}