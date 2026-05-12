import ReactDom from "react-dom/client"
import { VagabondLiteActorSheet } from "./VagabondLiteActorSheet"
import AdversaryDataModel from "../model/actor/AdversaryDataModel";

export default class VagabondLiteAdversarySheet extends VagabondLiteActorSheet {
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
        classes: ['vagabond', 'actor', 'adversary'],
        position: {
            width: 430  // Ensure character sheet keeps its proper width
        }
    });
}

Hooks.on("renderActorSheetV2", ({ element, document: doc }) => {
    const advData = doc.system as AdversaryDataModel
    console.log(advData)
    const reactRoot = document.createElement("vagabond-lite-root")
    const root = ReactDom.createRoot(element.appendChild(reactRoot))
    root.render(<div id="adversary-sheet-div" style={{ color: 'white', height: 400, backgroundColor: 'black' }}>
        {JSON.stringify(advData.toJSON())}
    </div>)
})
