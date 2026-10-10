import { Eye, Pencil, Trash } from "lucide-react"

import { appLang } from "../../../utils/lang"
import { CtxMenuItem } from "../../component/ContextMenu"

export const useImageEdit = (item: Actor | Item) => {

    const viewImage = () => {
            new foundry.applications.apps.ImagePopout(
                item.img ?? '', {
                    src: item.img ?? '',
                    uuid: item.uuid,
                    window: { title: item.name }
                }
            ).render(true)
        }
        const editImage = () => {
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
            { icon: Pencil, label: appLang.ButtonActions.edit, action: () => editImage() },
            { icon: Trash, label: appLang.ButtonActions.remove, action: () => removeImage(), isDestructive: true }
        )
    }

    return { viewImage, editImage, removeImage, imageEditCtxMenuItems }
}