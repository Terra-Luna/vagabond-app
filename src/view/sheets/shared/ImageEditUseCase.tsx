import { Crop, Eye, Pencil, Trash } from "lucide-react"

import { PortraitAdjustApp } from "../../../apps/portrait/PortraitAdjustApp"
import { appLang } from "../../../utils/lang"
import { CtxMenuItem } from "../../component/ContextMenu"

export const useImageEdit = (item: Actor | Item, itemsBeforeRemove: CtxMenuItem[] = []) => {

    const viewImage = () => {
        new foundry.applications.apps.ImagePopout(
            item.img ?? '', {
            src: item.img ?? '',
            uuid: item.uuid,
            window: { title: item.name }
        }).render(true)
    }

    const changeImage = () => {
        new foundry.applications.apps.FilePicker({
            type: "image",
            current: item.img ?? '',
            callback: async (path) => {
                await item.update({ img: path })

                if (item instanceof Actor) {
                    await (item as any).update({
                        'prototypeToken.texture.src': path,
                        'prototypeToken.texture.scaleX': 1,
                        'prototypeToken.texture.scaleY': 1,
                        'prototypeToken.ring.subject.texture': path
                    })
                }
            }
        }).render()
    }

    const removeImage = async () => {
        await item.update({ img: '' })

        if (item instanceof Actor) {
            await (item as any).update({
                'prototypeToken.texture.src': '',
                'prototypeToken.ring.enabled': false,
                'prototypeToken.ring.subject.texture': ''
            })
        }
    }

    const imageEditCtxMenuItems: CtxMenuItem[] = []
    imageEditCtxMenuItems.push(
        { icon: Eye, label: appLang.ButtonActions.view, action: () => viewImage() }
    )

    if (item.isOwner) {
        imageEditCtxMenuItems.push(
            { icon: Pencil, label: appLang.ButtonActions.change, action: () => changeImage() },
            ...(item instanceof Actor && item.img
                ? [{ icon: Crop, label: appLang.ButtonActions.adjust, action: () => new PortraitAdjustApp(item).render({ force: true }) }]
                : []),
            ...itemsBeforeRemove,
            { icon: Trash, label: appLang.ButtonActions.remove, action: () => removeImage(), isDestructive: true }
        )
    }

    return { viewImage, changeImage, removeImage, imageEditCtxMenuItems }
}