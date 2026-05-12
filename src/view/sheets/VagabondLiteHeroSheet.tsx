import { FoundryActor, updateActor, VagabondLiteActorSheet } from "./VagabondLiteActorSheet"
import HeroDataModel from "../../model/actor/HeroDataModel"
import HPDisplay from "../component/HPDisplay"

export default class VagabondLiteHeroSheet extends VagabondLiteActorSheet {
    Component = MyReactComponent
}

const MyReactComponent = ({ actor }: { actor: FoundryActor<HeroDataModel> }) => {
    const hero = actor.system;
    return (
        <div id="hero-sheet-div" style={{ color: 'black', backgroundColor: 'white' }}>
            <HPDisplay health={hero.health} />
            Bound Relic Limit: {hero.boundRelicLimit}
            <button onClick={async () => {
                actor.update({"system.health.bonus": 100})
                updateActor(actor, { boundRelicLimit: 1 })
                let roll = await new Roll('2d12').evaluate()
                let results = (roll.terms[0] as any).results // <-- fake error, can we fix?
                console.log(results)
                ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({}),
                    content: `<h3>Rolling: 2d12</h3><br><p>${results[0].result} + ${results[1].result} = ${roll._total}`,
                    rolls: [roll]
                })
            }}>Roll 2d12</button>
        </div>
    )
}