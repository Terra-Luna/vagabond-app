import { X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { TargetDisplayItem } from "../../../combat/ui/hooks"
import { AdversaryDataModel } from "../../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { NpcDataModel } from "../../../model/actor/NpcDataModel"
import { PolymorphFlag } from "../../../model/actor/type/PolymorphFlag"
import { sys_id } from "../../../utils/foundryUtils"
import { appLang } from "../../../utils/lang"
import { getTokenImg } from "../../../utils/modelUtil"
import { formatSpeeds } from "../../../utils/speedUtils"
import { TargetsDisplay } from "../../../view/chat/component/TargetsDisplay"
import { useTargetSync } from "../../../view/chat/component/TargetSyncUseCase"
import { tableBorderRounded, wealthBorderRounded } from "../../../view/common/border-styles"
import { buttonAnimation } from "../../../view/component/Button"
import { CollapsibleSection } from "../../../view/component/Collapsible"
import { IconOnlyButton } from "../../../view/component/IconOnlyButton"
import { Tooltip } from "../../../view/component/Tooltip"
import { TrashButton } from "../../../view/component/TrashButton"
import { usePolymorphActor } from "../../../view/sheets/actor/component/usePolymorphActor"
import { NpcSheetComponent } from "../../../view/sheets/actor/npc/component/NpcSheetComponent"
import { api } from "../../api/VagabondAPI"
import { HeroCreationSubtext } from "../../hero-creator/component/HeroCreationTypography"
import { showConfirmationDialog } from "../dialog/showConfirmationDialog"

const FAVORITE_DRAG_TYPE = "application/x-vagabond-polymorph-favorite"

export const PolymorphAppView = ({ caster }: {
    caster: Actor & { system: HeroDataModel | AdversaryDataModel | NpcDataModel }
}) => {

    const syncedTargets = useTargetSync()

    const targets = useMemo<TargetDisplayItem[]>(() => {
        if (syncedTargets.length > 0) return syncedTargets
        const token = caster.getActiveTokens()[0]
        return [{ id: caster.id!, src: getTokenImg(token ?? caster), token }]
    }, [syncedTargets, caster])

    const [isMorphDragOver, setIsMorphDragOver] = useState(false)
    const [isFavDragOverIdx, setIsFavDragOverIdx] = useState<number | false>(false)
    const [polymorph, setPolymorph] = useState<PolymorphFlag | undefined>(() => caster.system.polymorph)

    const castingLevel = caster.system instanceof HeroDataModel
        ? caster.system.level.current! + (caster.system.modifiers.polymorph.castingLevel || caster.system.modifiers.casting.effectiveLevelBonus)
        : 0

    useEffect(() => {
        setPolymorph(caster.system.polymorph)
        const hookId = Hooks.on("updateActor", (updatedActor: Actor) => {
            if (updatedActor.id === caster.id) {
                setPolymorph(caster.system.polymorph)
            }
        })
        return () => Hooks.off("updateActor", hookId)
    }, [caster])

    const [favorites, setFavorites] = useState<string[]>(caster.getFlag(sys_id, "polymorphFavorites") as string[])

    const saveFavorites = async (updated: string[]) => {
        setFavorites(updated)
        await caster.setFlag(sys_id, "polymorphFavorites" as any, updated)
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
            && form.system.hitDice <= castingLevel
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
            for (const target of targets) {
                const targetActor = target.token?.actor ?? (target.id === caster.id ? caster : undefined)
                if (!targetActor) continue
                await api.util.polymorph({
                    caster: caster,
                    target: targetActor as any,
                    form: statBlock as any
                })
            }
        }
        else {
            showConfirmationDialog({
                title: "Invalid polymorph form",
                description: `Forms must be a type (or sub-type) of "Beast" with HD less than or equal to ${castingLevel}`,
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
                description: `Forms must be of type (or sub-type) "Beast" with HD less than or equal to ${castingLevel}.`,
                variant: "info"
            })
            return
        }

        // Prevent dupes
        if (favorites.some(f => f === form.uuid)) return

        const updated = [...favorites]

        if (replaceIdx !== undefined) {
            updated[replaceIdx] = form.uuid
        }
        else {
            updated.push(form.uuid)
        }

        await saveFavorites(updated)
    }

    /**
     * Calling our API with no "form" argument cancels the polymorph effect.
     */
    const cancelPolymorph = async () => {
        await api.util.polymorph({ caster: caster, target: caster })
    }

    return (
        <div className={`flex flex-col items-center text-base text-text-primary font-eskapade bg-sheet-main-fill p-2 gap-2`}>

            {/* TARGETS */}
            {(targets.length > 1 || (targets.length === 1 && targets[0].token?.actor?.id !== caster.id)) &&
                <TargetsDisplay targets={targets} />
            }

            {/* DROP ZONE */}
            {polymorph && targets.length <= 1 && targets[0].token?.actor?.id === caster.id
                ? <div
                    className="w-full"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsMorphDragOver(true) }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsMorphDragOver(false) }}
                    onDrop={handleMorphDrop}
                >
                    <PolymorphCard polymorph={polymorph} onCancel={cancelPolymorph} isHovered={isMorphDragOver} />
                </div>
                : <div
                    className={`flex w-full items-center justify-center py-8 px-4 rounded bg-context-menu-fill ${isMorphDragOver ? `${wealthBorderRounded}` : "border border-dashed border-table-border"}`}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsMorphDragOver(true) }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsMorphDragOver(false) }}
                    onDrop={handleMorphDrop}
                >
                    <span className="text-text-tertiary italic px-8 text-center whitespace-pre-line">
                        {`Drop stat block here to Polymorph Targets.\n${caster.system instanceof HeroDataModel ? `(HD Limit: ${castingLevel})` : ""}`}
                    </span>
                </div>
            }

            {/* HERO TYPES CAN HAVE FAVORITES */}
            {caster.system instanceof HeroDataModel && caster.system.spells.some(sp => sp.parent.flags[sys_id].polymorph) && (
                <div className="w-full">
                    <CollapsibleSection
                        title="Favorites"
                        content={
                            <div className="flex flex-col gap-1 mt-1">
                                {favorites?.map((favorite, index) => (
                                    <PolymorphFavoriteCard
                                        key={index}
                                        uuid={favorite}
                                        index={index}
                                        isCurrent={polymorph?.statBlock?.id === favorite}
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
                                        isHovered={isFavDragOverIdx === favorites?.length}
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

const PolymorphCard = ({ polymorph, onCancel, isHovered }: {
    polymorph: PolymorphFlag,
    onCancel: () => void,
    isHovered: boolean
}) => {
    const actor = usePolymorphActor(polymorph)
    const content = (
        <div className="flex items-center gap-x-4 text-2xl">
            <img
                src={polymorph.statBlock.tokenImg}
                alt={polymorph.statBlock.name}
                className="w-12 h-12 cursor-pointer"
                onClick={() => actor?.sheet?.render(true)}
            />
            <div>
                <p className="text-xs text-text-secondary font-paradigm">Current State</p>
                <p className="text-text-primary font-eskapade">{polymorph.statBlock.name}</p>
            </div>
        </div>
    )

    return (
        <div className={`relative flex flex-col w-full items-start gap-2 p-2 bg-context-menu-fill ${isHovered ? `${wealthBorderRounded}` : `${tableBorderRounded}`}`}>
            <IconOnlyButton
                Icon={X}
                size={20}
                title={appLang.ButtonActions.cancelPolymorph}
                className="absolute top-1 right-1"
                colorClassName="text-text-tertiary hover:text-destructive-action"
                onClick={onCancel}
            />

            {actor
                ? <Tooltip content={
                    <div className="relative flex w-[300px] max-h-[80vh] bg-sheet-main-fill">
                        <NpcSheetComponent actor={actor} hidePortrait={true} />
                    </div>}>{content}</Tooltip>
                : content
            }
        </div>
    )
}

const PolymorphFavoriteCard = ({ uuid, index, isHovered, isCurrent, onDragOver, onDragLeave, onDrop, onDelete }: {
    uuid?: string,
    index?: number,
    isHovered: boolean,
    isCurrent?: boolean,
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

    const image = (<div>
        {getTokenImg(statBlock) && <img
            src={getTokenImg(statBlock)} alt={statBlock?.name}
            className="w-10 h-10 cursor-pointer"
            onClick={() => statBlock?.sheet?.render(true)}
        />}
    </div>)

    const name = statBlock?.name ?? "Drop stat blocks here to Favorite"

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
                ${isCurrent || isHovered ? `${wealthBorderRounded}` : `${tableBorderRounded}`}
            `}
        >
            {statBlock
                ? <div className="flex items-center gap-4">
                    <Tooltip content={
                        <div className="flex w-[300px] max-h-[80vh] bg-sheet-main-fill">
                            <NpcSheetComponent actor={statBlock} hidePortrait={true} />
                        </div>
                    }>{image}</Tooltip>
                    <div className="flex flex-col gap-1">
                        <p className="text-lg">{name}</p>
                        <div className="flex flex-wrap gap-1 -mt-1.5 text-xs text-text-secondary font-paradigm italic">
                            <p>{`HD: ${statBlock?.system?.hitDice ?? 0}`}</p>
                            <p>{`|`}</p>
                            <p>{`AC: ${statBlock?.system?.armor?.rating ?? 0}`}</p>
                            <p>{`|`}</p>
                            <p>{formatSpeeds(statBlock?.system?.speeds ?? [])}</p>
                        </div>
                    </div>
                </div>
                : <div className="flex items-center gap-4">
                    {image}
                    {name}
                </div>
            }
            {onDelete && <TrashButton onClick={onDelete} />}
        </div>
    )
}