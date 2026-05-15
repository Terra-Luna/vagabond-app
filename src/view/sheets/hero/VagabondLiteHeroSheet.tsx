import { FoundryActor, updateActor, VagabondLiteActorSheet } from "../VagabondLiteActorSheet"
import HeroDataModel from "../../../model/actor/HeroDataModel"
import HPDisplay from "../../component/HPDisplay"
import { Identity } from "./Identity"
import { CharacterSheetHeader } from "./CharacterSheetHeader"
import { MainTab } from "./MainTab"

export default class VagabondLiteHeroSheet extends VagabondLiteActorSheet {
    Component = MyReactComponent
}

const MyReactComponent = ({ actor }: { actor: FoundryActor<HeroDataModel> }) => {
    const hero = actor.system;
    return (
        <div id="hero-sheet-div" style={{ color: 'black', backgroundColor: 'white' }}>
            <CharacterSheetHeader hero={hero} />
            <MainTab hero={hero} />
            <Identity hero={hero} />
            <HPDisplay health={hero.health} />
            Bound Relic Limit: {hero.boundRelicLimit}
            <button onClick={async () => {
                updateActor(actor, { health: { current: actor.system.health.current! += 1 }})
                updateActor(actor, { class: { spellcasting: { castSkill: 'mysticism'}}})
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