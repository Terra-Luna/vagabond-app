import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication"
import { ActiveEffectsView } from "./ActiveEffectsView"

export class ActiveEffectsApp extends VagabondApplication {

    document: Actor | Item

    constructor(document: Actor | Item) {
        super({
            id: `active-effects-${document.id}`,
            window: { title: "Create your Hero" },
            position: { width: 400 },
            Component: ActiveEffectsView,
        } as VagabondAppArgs)
        this.document = document
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            initialDocument: this.document
        }
    }

}