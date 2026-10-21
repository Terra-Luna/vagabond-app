import { X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { AdversaryDataModel } from "../../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { NpcDataModel } from "../../../model/actor/NpcDataModel"
import { PolymorphFlag } from "../../../model/actor/type/PolymorphFlag"
import { sys_id } from "../../../utils/foundryUtils"
import { appLang } from "../../../utils/lang"
import { tableBorderRounded } from "../../../view/common/border-styles"
import { buttonAnimation } from "../../../view/component/Button"
import { CollapsibleSection } from "../../../view/component/Collapsible"
import { IconOnlyButton } from "../../../view/component/IconOnlyButton"
import { Tooltip } from "../../../view/component/Tooltip"
import { TrashButton } from "../../../view/component/TrashButton"
import { NpcSheetComponent } from "../../../view/sheets/actor/npc/component/NpcSheetComponent"
import { api } from "../../api/VagabondAPI"
import { HeroCreationSubtext } from "../../hero-creator/component/HeroCreationTypography"
import { showConfirmationDialog } from "../dialog/showConfirmationDialog"

const FAVORITE_DRAG_TYPE = "application/x-vagabond-polymorph-favorite"

interface PolymorphFavorite { uuid: string, img: string }

export const PolymorphAppView = ({ actor }: {
    actor: Actor & { system: HeroDataModel | AdversaryDataModel | NpcDataModel }
}) => {

    const [isMorphDragOver, setIsMorphDragOver] = useState(false)
    const [isFavDragOverIdx, setIsFavDragOverIdx] = useState<number | false>(false)
    const [polymorph, setPolymorph] = useState<PolymorphFlag | undefined>(() => actor.system.polymorph)

    useEffect(() => {
        setPolymorph(actor.system.polymorph)
        const hookId = Hooks.on("updateActor", (updatedActor: Actor) => {
            if (updatedActor.id === actor.id) {
                setPolymorph(actor.system.polymorph)
            }
        })
        return () => Hooks.off("updateActor", hookId)
    }, [actor])

    const [favorites, setFavorites] = useState<PolymorphFavorite[]>(actor.getFlag(sys_id, "polymorphFavorites") as PolymorphFavorite[])

    const saveFavorites = async (updated: PolymorphFavorite[]) => {
        setFavorites(updated)
        await actor.setFlag(sys_id, "polymorphFavorites" as any, updated)
    }

    /**
     * Restricts polymorph form candidates to Actors of type Adversary or Npc and returns the match from the drag data.
     */
    const findStatBlock = async (event: React.DragEvent<HTMLDivElement>) => {
        const dragData = foundry.applications.ux.TextEditor.getDragEventData(event.nativeEvent) as any
        const uuid: string | undefined = dragData?.type === "Actor"
            ? dragData.uuid
            : event.dataTransfer.getData("text/plain") || undefined

        const form = uuid ? await fromUuid(uuid as any) as any : undefined
        if (form?.documentName === "Actor"
            && (form.system instanceof AdversaryDataModel || form.system instanceof NpcDataModel)
            && form.system.hitDice <= actor.system.modifiers.polymorph.castingLevel
            && (form.system.beingType === "beast" || form.system.beingSubtype === "beast")
        ) {
            return form as Actor & { system: AdversaryDataModel | NpcDataModel }
        }
        return undefined
    }

    /**
     * Calls our API to perform the polymorph action with the dropped UUID.
     */
    const handleMorphDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
        setIsMorphDragOver(false)

        const statBlock = await findStatBlock(event)

        if (statBlock) {
            await api.util.polymorph({ caster: actor, target: actor, form: statBlock as any })
        }
        else {
            showConfirmationDialog({
                title: "Invalid polymorph form",
                description: `Forms must be of type (or sub-type) "Beast" with HD less than or equal to ${actor.system.modifiers.polymorph.castingLevel}`,
                variant: "info"
            })
        }
    }

    /**
     * Handles dropping a new favorite as well as drag/drop re-ordering of existing favorites.
     */
    const handleFavDrop = async (event: React.DragEvent<HTMLDivElement>, replaceIdx?: number) => {
        event.preventDefault()
        event.stopPropagation()
        setIsFavDragOverIdx(false)

        const fromIdxData = event.dataTransfer.getData(FAVORITE_DRAG_TYPE)
        if (fromIdxData !== "") {
            const fromIdx = Number(fromIdxData)
            if (!favorites[fromIdx]) return

            const updated = [...favorites]
            const [moved] = updated.splice(fromIdx, 1)
            const toIdx = replaceIdx ?? updated.length
            updated.splice(toIdx, 0, moved)
            await saveFavorites(updated)
            return
        }

        const form = await findStatBlock(event)

        if (!form) {
            showConfirmationDialog({
                title: "Invalid polymorph form",
                description: `Forms must be of type (or sub-type) "Beast" with HD less than or equal to ${actor.system.modifiers.polymorph.castingLevel}.`,
                variant: "info"
            })
            return
        }
        if (favorites.some(f => f.uuid === form.uuid)) return

        const updated = [...favorites]
        const favorite: PolymorphFavorite = { uuid: form.uuid, img: form.img ?? '' }

        if (replaceIdx !== undefined) {
            updated[replaceIdx] = favorite
        }
        else {
            updated.push(favorite)
        }

        await saveFavorites(updated)
    }

    /**
     * Calling our API with no "form" argument cancels the polymorph effect.
     */
    const cancelPolymorph = async () => {
        await api.util.polymorph({ caster: actor, target: actor })
    }

    return (
        <div className={`flex flex-col items-center bg-sheet-main-fill p-2 gap-2`}>
            {/* DROP ZONE */}
            {polymorph
                ? <PolymorphCard polymorph={polymorph} onDrop={handleMorphDrop} onCancel={cancelPolymorph} isHovered={isMorphDragOver} />
                : <div
                    className={`flex w-full items-center justify-center py-8 px-4 rounded bg-context-menu-fill ${isMorphDragOver ? "border border-solid border-wealth-denom-label" : "border border-dashed border-table-border"}`}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsMorphDragOver(true) }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsMorphDragOver(false) }}
                    onDrop={handleMorphDrop}
                >
                    <span className="text-text-tertiary italic">
                        {`Drop here to Polymorph ${actor.system instanceof HeroDataModel ? `(HD Limit: ${actor.system.modifiers.polymorph.castingLevel})` : ""}`}
                    </span>
                </div>
            }

            {/* HERO TYPES CAN HAVE FAVORITES */}
            {actor.system instanceof HeroDataModel && (
                <div className="w-full">
                    <CollapsibleSection
                        title="Favorites"
                        content={
                            <div className="flex flex-col gap-1">
                                {favorites.map((favorite, index) => (
                                    <PolymorphFavoriteCard
                                        key={index}
                                        uuid={favorite.uuid}
                                        index={index}
                                        isHovered={isFavDragOverIdx === index}
                                        onDragOver={() => setIsFavDragOverIdx(index)}
                                        onDragLeave={() => setIsFavDragOverIdx(false)}
                                        onDrop={(e) => handleFavDrop(e, index)}
                                        onDelete={() => saveFavorites(favorites.filter((_, i) => i !== index))}
                                    />
                                ))}

                                {/* ADD FAVORITE DROP ZONE */}
                                <span className="text-text-tertiary italic">
                                    <PolymorphFavoriteCard
                                        isHovered={isFavDragOverIdx === favorites.length}
                                        onDragOver={() => setIsFavDragOverIdx(favorites.length)}
                                        onDragLeave={() => setIsFavDragOverIdx(false)}
                                        onDrop={(e) => handleFavDrop(e)}
                                    />
                                </span>
                            </div>
                        }
                    />
                </div>
            )}

            {/* ADVERSARIES COMPENDIUM LINK */}
            <div className="w-full">
                <button onClick={() => game.packs?.get("vagabond-app.adversaries")?.render(true)} className={`hover-glow cursor-pointer ${buttonAnimation}`}>
                    <HeroCreationSubtext text={"Browse Stat Blocks"} />
                </button>
            </div>

        </div>
    )
}

const PolymorphCard = ({ polymorph, onDrop, onCancel, isHovered }: {
    polymorph: PolymorphFlag,
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void,
    onCancel: () => void,
    isHovered: boolean
}) => {

    const actor = useMemo(() => {
        try {
            const { name, img, system, items } = polymorph.statBlock
            return new (Actor as any).implementation({ name, img, type: "adversary", system, items }) as Actor & { system: AdversaryDataModel | NpcDataModel }
        }
        catch {
            return undefined
        }
    }, [polymorph.statBlock])

    const content = (
        <div className="flex items-center gap-x-4 text-xl">
            <img
                src={polymorph.statBlock.img}
                alt={polymorph.statBlock.name}
                className="w-20 h-20 cursor-pointer"
                onClick={() => actor?.sheet?.render(true)}
            />
            <div className="text-text-primary text-2xl font-eskapade">
                {polymorph.statBlock.name}
            </div>
        </div>
    )

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
            onDrop={(e) => onDrop(e)}
            className={`
                relative flex flex-col w-full items-start gap-2 p-2 bg-context-menu-fill
                ${isHovered
                    ? "border border-solid border-wealth-denom-label"
                    : `${tableBorderRounded}`
                }
            `}
        >
            <IconOnlyButton
                Icon={X}
                size={24}
                title={appLang.ButtonActions.cancelPolymorph}
                className="absolute top-1 right-1"
                colorClassName="text-text-tertiary hover:text-destructive-action"
                onClick={onCancel}
            />

            {actor
                ? <Tooltip content={
                    <div className="relative flex w-[280px] max-h-[80vh] bg-sheet-main-fill">
                        <NpcSheetComponent actor={actor} hidePortrait={true} />
                    </div>}>{content}</Tooltip>
                : content
            }
        </div>
    )
}

const PolymorphFavoriteCard = ({ uuid, index, isHovered, onDragOver, onDragLeave, onDrop, onDelete }: {
    uuid?: string,
    index?: number,
    isHovered: boolean,
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void,
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void,
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void,
    onDelete?: () => void
}) => {
    const [statBlock, setStatBlock] = useState<(Actor & { system: AdversaryDataModel | NpcDataModel }) | undefined>()

    useEffect(() => {
        let cancelled = false
        if (!uuid) return
        fromUuid(uuid as any).then(doc => { if (!cancelled) setStatBlock(doc as any) })
        return () => { cancelled = true }
    }, [uuid])

    const content = (
        <div className="flex items-center gap-2">
            {statBlock?.img && <img
                src={statBlock?.img} alt={statBlock?.name}
                className="w-12 h-12 cursor-pointer"
                onClick={() => statBlock?.sheet?.render(true)}
            />}
            {statBlock?.name ?? "Drop stat blocks here to Favorite"}
        </div>
    )

    return (
        <div
            draggable={!!uuid}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onDragOver(e) }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); onDragLeave(e) }}
            onDragStart={(e) => {
                e.stopPropagation()
                if (uuid) e.dataTransfer.setData("text/plain", uuid)
                if (index !== undefined) e.dataTransfer.setData(FAVORITE_DRAG_TYPE, String(index))
            }}
            onDrop={onDrop}
            className={`flex items-center gap-2 bg-context-menu-fill p-2 min-h-[56px]
                ${uuid ? "cursor-grab justify-between" : "justify-center"}
                ${isHovered
                    ? "border border-solid border-wealth-denom-label"
                    : tableBorderRounded
                }`}
        >
            {statBlock
                ? <Tooltip content={
                    <div className="relative flex w-[280px] max-h-[80vh] bg-sheet-main-fill">
                        <NpcSheetComponent actor={statBlock} hidePortrait={true} />
                    </div>
                }>
                    {content}
                </Tooltip>
                : content
            }
            {onDelete && <TrashButton onClick={onDelete} />}
        </div>
    )
}