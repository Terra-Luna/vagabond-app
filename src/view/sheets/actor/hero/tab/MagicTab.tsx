import { Sparkle, Sparkles } from "lucide-react";
import HeroDataModel from "../../../../../model/actor/HeroDataModel";
import { EditableTextField } from "../../../../component/EditableTextField";
import { SkillCard } from "../../../../component/SkillCard";
import { DamageTypeIcon } from "../../../../component/DamageTypeIcon";
import { useCallback } from "react";
import { updateDocument } from "../../../../../utils/documentUtils";

export const MagicTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div>
            <ManaDisplay hero={hero} />
            <Spells hero={hero} />
        </div>
    )
}

const ManaDisplay = ({ hero }: { hero: HeroDataModel }) => {
    const mana = hero.mana.current
    const updateMana = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { mana: { current: (mana ?? 0) + (auxClick ? 1 : -1) } })
    }, [mana])
    
    return (
        <div className="flex text-3xl font-eskapade font-bold mt-1 mb-2 ml-4 justify-evenly">
            <div className="flex items-center">
                <span className="text-lg justify-bottom">Mana:&nbsp;&nbsp;</span>
                <Sparkle className="text-mana" size={20}
                    onClick={() => updateMana(false)}
                    onAuxClick={() => updateMana(true)}
                />
                &nbsp;
                <span className="cursor-pointer text-mana">
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
            <button className="flex items-center bg-btn-primary-fill text-xl text-btn-primary-text rounded-lg px-2 cursor-pointer" onClick={
                () => ui.notifications?.info("Feature coming soon!")
            }>
                <span className="mr-2">Cast</span>
                <DamageTypeIcon dmgType={'magical'} />
            </button>
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