import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication"
import { ActiveEffectsView } from "./ActiveEffectsView"

export class ActiveEffectsApp extends VagabondApplication {

    document: Actor | Item

    constructor(document: Actor | Item) {
        super({
            id: `active-effects-${document.id}`,
            window: { title: "Active Effects" },
            position: { width: 400 },
            Component: AEAppView,
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

// eslint-disable-next-line react-refresh/only-export-components
const AEAppView = ({ document }) => {
    return (
        <div className="p-2">
            <ActiveEffectsView initialDocument={document} />
        </div>
    )
}