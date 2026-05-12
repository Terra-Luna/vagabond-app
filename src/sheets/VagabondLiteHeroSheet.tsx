import { VagabondLiteActorSheet } from "./VagabondLiteActorSheet"
import HeroDataModel from "../model/actor/HeroDataModel";
import ReactDom from 'react-dom/client'

export default class VagabondLiteHeroSheet extends VagabondLiteActorSheet {
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
        classes: ['vagabond', 'actor', 'hero'],
        position: {
            width: 430  // Ensure character sheet keeps its proper width
        }
    });
}

Hooks.on("renderActorSheetV2", ({ element, document: doc }) => {
    const heroData = doc.system as HeroDataModel
    console.log(heroData)
    const reactRoot = document.createElement("vagabond-lite-root")
    const root = ReactDom.createRoot(element.appendChild(reactRoot))
    root.render(<div id="hero-sheet-div" style={{ color: 'black', height: 400, backgroundColor: 'white' }}>
        {JSON.stringify(heroData.toJSON())}
        <button onClick={async () => {
            let roll = await new Roll('2d12').evaluate()
            let results = roll.terms[0].results // <-- fake error, can we fix?
            console.log(results)
            ChatMessage.create({
                speaker: ChatMessage.getSpeaker({}),
                content: `<h3>Rolling: 2d12</h3><br><p>${results[0].result} + ${results[1].result} = ${roll._total}`,
                rolls: [roll]
            })
        }}>Roll 2d12</button>
    </div>)
})
