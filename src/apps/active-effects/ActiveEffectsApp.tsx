import { VagabondLiteAppArgs, VagabondLiteApplication } from "../VagabondLiteApplication"
import { ActiveEffectsView } from "./ActiveEffectsView"

export class ActiveEffectsApp extends VagabondLiteApplication {

    document: Actor | Item

    constructor(document: Actor | Item) {
        super({
            window: { title: "Create your Hero" },
            position: { width: 400 },
            Component: ActiveEffectsView,
        } as VagabondLiteAppArgs)
        this.document = document
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            initialDocument: this.document
        }
    }

}