import { sys_id } from "../../utils/foundryUtils";
import { appLang } from "../../utils/lang";
import { defaultPortraitFrame, PortraitFrameData, portraitFrameFlag } from "../../view/sheets/actor/component/PortraitFrame";
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication";
import { PortraitAdjustView } from "./PortraitAdjustView";

/**
 * Allows for adjustment of portrait framing on Actor sheets. Position is saved as a flag on the Actor. 
 */
export class PortraitAdjustApp extends VagabondApplication {

    actor: Actor

    constructor(actor: Actor) {
        super({
            window: { title: `${actor.name}: ${appLang.ButtonActions.adjust}`, resizable: false },
            position: { width: 280, height: "auto" },
            Component: PortraitAdjustView
        } as VagabondAppArgs)
        this.actor = actor
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            img: this.actor.img ?? '',
            name: this.actor.name,
            initialFrame: (this.actor.getFlag(sys_id, portraitFrameFlag) as PortraitFrameData | undefined) ?? defaultPortraitFrame,
            onCancel: this.onCancel,
            onSave: this.onSave
        }
    }

    onCancel = () => {
        this.close()
    }

    onSave = async (frame: PortraitFrameData) => {
        await this.actor.setFlag(sys_id, portraitFrameFlag, frame)
        this.close()
    }
}