import { Import, Eye, Pencil, Trash } from "lucide-react"
import { importHero } from "../../../../api/tagalong/TagalongImporter"
import ActorDataModel, { BaseActorSchema } from "../../../../model/actor/ActorDataModel"
import HeroDataModel from "../../../../model/actor/HeroDataModel"
import { CtxMenuItem, useContextMenu } from "../../../component/ContextMenu"

export const Portrait = ({ actor }: { actor: ActorDataModel<BaseActorSchema> }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    
    const importFromVgbndApp = async () => {
        const tagalongLink = prompt(
            'Enter character link from Vagabond Tagalong App',
            'https://www.vgbnd.app/character/e38db88c-ec28-4b67-a44c-09f0fe199d01'
        )
        if (tagalongLink != null) {
            importHero(actor as HeroDataModel, tagalongLink)
        }
    }
    const viewImage = () => {
        new foundry.applications.apps.ImagePopout(
            actor.parent.img, {
                src: actor.parent.img,
                uuid: actor.parent.uuid,
                window: { title: actor.parent.name }
            }
        ).render(true)
    }
    const editImage = () => {
        new foundry.applications.apps.FilePicker({
            type: "image",
            current: actor.parent.img,
            callback: async (path) => {
                await actor.parent.update({ img: path })
                await actor.parent.update({ 'prototypeToken.texture.src': path })
                await actor.parent.update({ 'prototypeToken.texture.scaleX': 1 })
                await actor.parent.update({ 'prototypeToken.texture.scaleY': 1 })
                await actor.parent.update({ 'prototypeToken.ring.subject.texture': path })
            }
        }).render()
    }
    const removeImage = async () => {
        await actor.parent.update({ img: '' })
        await actor.parent.update({ 'prototypeToken.texture.src': '' })
        await actor.parent.update({ 'prototypeToken.ring.enabled': false })
        await actor.parent.update({ 'prototypeToken.ring.subject.texture': '' })
    }

    const contextMenuItems: CtxMenuItem[] = []
    if (actor instanceof HeroDataModel && actor.tagalongId == null) {
        contextMenuItems.push({ icon: Import, label: 'Import hero', action: () => importFromVgbndApp() })
    }
    contextMenuItems.push(
        { icon: Eye, label: 'View', action: () => viewImage() },
        { icon: Pencil, label: 'Edit', action: () => editImage() },
        { icon: Trash, label: 'Remove', action: () => removeImage(), isDestructive: true }
    )

    return (
        <div onContextMenu={(e) => onCtxMenu(e, contextMenuItems)}>
            <img className={`bg-transparent object-cover h-[154px] w-[110px]`} src={actor.parent.img} alt={actor.parent.name} />
            <ContextMenu />
        </div>
    )
}