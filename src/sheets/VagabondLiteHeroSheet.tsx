import ReactDom from "react-dom/client"
import { VagabondLiteActorSheet } from "./VagabondLiteActorSheet"
import HeroDataModel from "../model/actor/HeroDataModel";

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
    const reactRoot = document.createElement("vagabond-lite-root")

    const root = ReactDom.createRoot(element.appendChild(reactRoot))
    root.render(<div id="adasdiv" style={{ color: 'white', height: 400, backgroundColor: 'black' }}>
        {JSON.stringify(heroData.toJSON())}
        <button onClick={() => {
            console.log("click")
        }}>Hi!</button>
    </div>)
})
