import { AdversaryDataModel } from "../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../model/actor/HeroDataModel"

export const CombatTracker = ({ data }) => {
    const { combat } = data
    const combatants = combat.combatants.contents

    const heroes = getHeroes(combatants)
    const adversaries = getAdversaries(combatants)

    return (
        <div className="flex flex-col gap-6">
            <div>
                <div className="text-xl text-text-header-secondary">HEROES!!!!</div>
                {heroes.map(hero => <div>{hero.name}</div>)}
            </div>
            <div>
                <div className="text-xl text-text-header-secondary">ADVERSESSSSSS</div>
                {adversaries.map(adv => <div>{adv.name}</div>)}
            </div>
        </div>
    )
}

const getCombatantSystem = (combatant) => combatant.actor.system
const getHeroes = (combatants) => combatants.filter(c => getCombatantSystem(c) instanceof HeroDataModel)
const getAdversaries = (combatants) => combatants.filter(c => getCombatantSystem(c) instanceof AdversaryDataModel)