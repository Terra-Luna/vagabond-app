import lang from "../../../../../../public/lang/en.json"
import { Sparkle, Sparkles } from "lucide-react"
import HeroDataModel from "../../../../../model/actor/HeroDataModel"
import { EditableTextField } from "../../../../component/EditableTextField"
import { SkillCard } from "../../../../component/SkillCard"
import { DamageTypeIcon } from "../../../../component/DamageTypeIcon"
import { useCallback } from "react"
import { updateDocument } from "../../../../../utils/documentUtils"
import { getId } from "../../../../../utils/modelUtil"
import { glowOnHover } from "../../../VgLiteSheet"

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
        <div className="flex text-3xl font-eskapade font-bold mt-1 mb-2 justify-evenly">
            <div className="flex items-center">
                <span className="text-lg justify-bottom">Mana:&nbsp;&nbsp;</span>
                <Sparkle className={`text-mana ${glowOnHover} cursor-pointer`} size={20}
                    onClick={() => updateMana(false)}
                    onAuxClick={() => updateMana(true)}
                />
                &nbsp;
                <span className={`${glowOnHover} cursor-pointer text-mana`}>
                    <EditableTextField boundValue={hero.mana.current?.toString() ?? ""} updateProps={{ actor: hero.parent, propertyPath: ['mana', 'current'] }} />
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
            <button className={`flex items-center bg-btn-primary-fill text-xl text-btn-primary-text rounded-lg px-2 ${glowOnHover} cursor-pointer hover:scale-105`} onClick={
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
        <div className="grid @sm:grid-cols-1 @lg:grid-cols-2 my-1 gap-x-1 gap-y-0.5">{
            hero.spells.map((sp: any) => (
                <SkillCard
                    key={getId(sp)}
                    title={sp.parent.name}
                    subtitles={[['Base dmg', lang.VGLITE.DamageTypes[sp.damageType] ?? '-' ]]}
                    description={sp.description}
                />
            ))
        }</div>
    )
}