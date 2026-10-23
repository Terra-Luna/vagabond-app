import { ToggleLeft, ToggleRight, X } from "lucide-react"
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"

import { TargetDisplayItem } from "../../../combat/ui/hooks"
import { AdversaryDataModel } from "../../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { NpcDataModel } from "../../../model/actor/NpcDataModel"
import { PolymorphFlag, PolymorphUtil } from "../../../model/actor/util/PolymorphUtil"
import { VagabondAppError } from "../../../model/common/VagabondAppError"
import { sys_id } from "../../../utils/foundryUtils"
import { appLang } from "../../../utils/lang"
import { localizeString } from "../../../utils/localeUtils"
import { getTokenImg } from "../../../utils/modelUtil"
import { formatSpeeds } from "../../../utils/speedUtils"
import { sendVagabondChatCard } from "../../../view/chat/ChatCardSerializer"
import { TargetsDisplay } from "../../../view/chat/component/TargetsDisplay"
import { useTargetSync } from "../../../view/chat/component/TargetSyncUseCase"
import { tableBorderRounded, wealthBorderRounded } from "../../../view/common/border-styles"
import { buttonAnimation, UtilityButton } from "../../../view/component/Button"
import { CollapsibleSection } from "../../../view/component/Collapsible"
import { ClearHeader } from "../../../view/component/Header"
import { IconOnlyButton } from "../../../view/component/IconOnlyButton"
import { Tooltip } from "../../../view/component/Tooltip"
import { TrashButton } from "../../../view/component/TrashButton"
import { usePolymorphActor } from "../../../view/sheets/actor/component/usePolymorphActor"
import { NpcSheetComponent } from "../../../view/sheets/actor/npc/component/NpcSheetComponent"
import { HeroCreationSubtext } from "../../hero-creator/component/HeroCreationTypography"
import { showConfirmationDialog } from "../dialog/ConfirmationDialogUseCase"

const FAVORITE_DRAG_TYPE = "application/x-vagabond-polymorph-favorite"

export const PolymorphAppView = ({ caster, header }: {
    caster: Actor & { system: HeroDataModel | AdversaryDataModel | NpcDataModel },
    header?: ReactNode
}) => {

    const syncedTargets = useTargetSync()

    const targets = useMemo<TargetDisplayItem[]>(() => {
        if (syncedTargets.length > 0) return syncedTargets
        const token = caster.getActiveTokens()[0]
        return [{ id: caster.id!, src: getTokenImg(token ?? caster), token }]
    }, [syncedTargets, caster])

    const [isMorphDragOver, setIsMorphDragOver] = useState(false)
    const [isFavDragOverIdx, setIsFavDragOverIdx] = useState<number | false>(false)
    const [selfPolymorph, setSelfPolymorph] = useState<PolymorphFlag | undefined>(() => caster.system.polymorph)
    const [isFocused, setIsFocused] = useState(true)

    const castingLevel = caster.system instanceof HeroDataModel
        ? caster.system.level.current! + (caster.system.modifiers.polymorph.castingLevelBonus || caster.system.modifiers.casting.effectiveLevelBonus)
        : 999

    useEffect(() => {
        setSelfPolymorph(caster.system.polymorph)
        const hookId = Hooks.on("updateActor", (updatedActor: Actor) => {
            if (updatedActor.id === caster.id) {
                setSelfPolymorph(caster.system.polymorph)
            }
        })
        return () => Hooks.off("updateActor", hookId)
    }, [caster])

    const [favorites, setFavorites] = useState<string[]>(() => {
        const stored = caster.getFlag(sys_id, "polymorphFavorites") as unknown
        return Array.isArray(stored) ? stored : []
    })

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

        const statBlock = uuid ? await fromUuid(uuid as any) as any : undefined

        if (!statBlock) {
            throw new VagabondAppError({
                name: appLang.Polymorph.error,
                message: appLang.Polymorph.statBlockLookupFailed
            })
        }

        if (statBlock?.documentName === "Actor" && (statBlock.system instanceof AdversaryDataModel || statBlock.system instanceof NpcDataModel) && (
            game.user?.isActiveGM || ( // <-- Let GMs polymorph things into whatever
                statBlock.system.hitDice <= castingLevel && (statBlock.system.beingType === "beast" || statBlock.system.beingSubtype === "beast")
            ))
        ) {
            return statBlock as Actor & { system: AdversaryDataModel | NpcDataModel }
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

        const statBlock = await (async () => {
            try {
                return await findStatBlock(event)
            }
            catch (error: any) {
                ui.notifications?.error(`${error.name}: ${error.message}`)
                return undefined
            }
        })()

        if (statBlock) {
            polymorphTargets(statBlock, isFocused)
        }
        else {
            showConfirmationDialog({
                title: appLang.Polymorph.invalidFormTitle,
                description: localizeString(appLang.Polymorph.invalidFormDescription, { hd: String(castingLevel) }),
                variant: "info"
            })
        }
    }

    const polymorphTargets = useCallback(async (statBlock: Actor & { system: any }, focused: boolean) => {
        const duration = caster.system.modifiers.polymorph.continualSelf && isTargetSelf()
            ? 'continual'
            : (focused ? 'focus' : 'turn')

        const ownedTargets: any[] = []
        const requested: { actorId: string, tokenId?: string }[] = []

        for (const target of targets) {
            const targetActor = target.token?.actor ?? (target.id === caster.id ? caster : undefined)
            if (!targetActor) continue

            if (targetActor.isOwner) {
                ownedTargets.push(targetActor)
            }
            else {
                requested.push({ actorId: targetActor.id!, tokenId: target.token?.id })
            }
        }

        if (ownedTargets.length > 0) {
            PolymorphUtil.polymorph({ caster: caster, targets: ownedTargets, form: statBlock as any, duration })
        }

        if (requested.length > 0) {
            sendVagabondChatCard(caster, "PolymorphRequestChatCard", {
                casterId: caster.id,
                targets: requested,
                duration,
                formUuid: statBlock.uuid
            })
        }
    }, [targets, caster])

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

        const form = await (async () => {
            try {
                return await findStatBlock(event)
            }
            catch (error: any) {
                ui.notifications?.error(`${error.name}: ${error.message}`)
                return undefined
            }
        })()

        if (!form) {
            showConfirmationDialog({
                title: appLang.Polymorph.invalidFormTitle,
                description: localizeString(appLang.Polymorph.invalidFormDescription, { hd: String(castingLevel) }),
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
     * Calling our function with no "form" argument cancels the polymorph effect.
     */
    const cancelPolymorph = async () => {
        await PolymorphUtil.polymorph({ caster: caster, targets: [caster] })
    }

    const isTargetSelf = () => {
        return targets.length <= 1 && targets[0].token?.actor?.id === caster.id
    }

    return (
        <div>
            <div className="relative w-full">
                <span className="w-full -mt-px text-text-primary font-paradigm">
                    <ClearHeader title={appLang.HeroSheet["tab-polymorph"]} />
                </span>
                <div className="absolute top-0 right-1 text-text-primary" title={"Revert polymorph effects maintained by you (others)"}>
                    <UtilityButton onClick={async () => await PolymorphUtil.releaseAllPolymorphs(caster, false, false)}>Revert</UtilityButton>
                </div>
            </div>

            <div className={`flex flex-col items-center text-base text-text-header-primary font-eskapade bg-sheet-main-fill gap-2 ${header ? "" : "p-1"}`}>

                {/* HEADER (Stationary) */}
                <div className="flex flex-col sticky items-center w-full gap-2 bg-sheet-main-fill top-0 z-10">

                    {/* TARGETS */}
                    {(targets.length > 1 || (targets.length === 1 && targets[0].token?.actor?.id !== caster.id)) &&
                        <span className="text-text-primary">
                            <TargetsDisplay targets={targets} />
                        </span>
                    }

                    {/* DROP ZONE */}
                    <div className="pb-0.5 border-b-2 border-solid border-skill-divider w-full">
                        {selfPolymorph && isTargetSelf()
                            ? <div
                                className="w-full"
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsMorphDragOver(true) }}
                                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsMorphDragOver(false) }}
                                onDrop={handleMorphDrop}
                            >
                                <PolymorphCard polymorph={selfPolymorph} onCancel={cancelPolymorph} isHovered={isMorphDragOver} />
                            </div>
                            : <div
                                className={`flex flex-col w-full items-center justify-center py-4 px-4 rounded text-text-header-primary/80 text-center whitespace-pre-line bg-sheet-header-fill ${isMorphDragOver ? `${wealthBorderRounded}` : "border border-dashed border-table-border"}`}
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsMorphDragOver(true) }}
                                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsMorphDragOver(false) }}
                                onDrop={handleMorphDrop}
                            >
                                <span className="italic">
                                    {`${localizeString(appLang.Polymorph.dropZone, { noun: isTargetSelf() ? appLang.Polymorph.self : appLang.Polymorph.targets })}\n${caster.system instanceof HeroDataModel ? localizeString(appLang.Polymorph.hdLimit, { hd: String(castingLevel) }) : ""}`}
                                </span>

                                <div className="flex gap-x-1 mt-2 -mb-2 ml-auto">
                                    <p className="text-text-header-primary">
                                        {appLang.HeroSheet.Magic.labelFocus}
                                    </p>
                                    <button type="button" onClick={() => setIsFocused(!isFocused)} className="cursor-pointer">
                                        {isFocused
                                            ? <ToggleRight size={24} className="text-ic-luck" />
                                            : <ToggleLeft size={24} className="text-text-header-primary/50" />
                                        }
                                    </button>
                                </div>
                            </div>
                        }
                    </div>
                </div>

                {/* HERO TYPES CAN HAVE FAVORITES */}
                {caster.system instanceof HeroDataModel && caster.system.spells.some(sp => sp.parent.flags[sys_id].polymorph) && (
                    <div className="w-full">
                        <CollapsibleSection
                            title={appLang.Polymorph.favorites}
                            content={
                                <div className="flex flex-col gap-1 mt-1 max-h-[50vh] overflow-y-auto">
                                    {favorites?.map((favorite, index) => (
                                        <PolymorphFavoriteCard
                                            key={index}
                                            uuid={favorite}
                                            index={index}
                                            isHovered={isFavDragOverIdx === index}
                                            onDragOver={() => setIsFavDragOverIdx(index)}
                                            onDragLeave={() => setIsFavDragOverIdx(false)}
                                            onDrop={(e) => handleFavDrop(e, index)}
                                            onDelete={() => saveFavorites(favorites.filter((_, i) => i !== index))}
                                        />
                                    ))}

                                    {/* ADD FAVORITE DROP ZONE */}
                                    <span className="text-text-header-primary/80 italic">
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
                        <HeroCreationSubtext text={appLang.Polymorph.browseStatBlocks} />
                    </button>
                </div>

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
                <p className="text-xs text-text-header-secondary font-paradigm">{appLang.Polymorph.currentState}</p>
                <p className="text-text-header-primary font-eskapade">{polymorph.statBlock.name}</p>
            </div>
        </div>
    )

    return (
        <div className={`relative flex flex-col w-full items-start gap-2 p-2 bg-sheet-header-fill ${isHovered ? `${wealthBorderRounded}` : `${tableBorderRounded}`}`}>
            <IconOnlyButton
                Icon={X}
                size={24}
                title={appLang.ButtonActions.cancelPolymorph}
                className="absolute top-1 right-1"
                colorClassName="text-text-header-primary/80 hover:text-destructive-action"
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

    const image = (<div>
        {getTokenImg(statBlock) && <img
            src={getTokenImg(statBlock)} alt={statBlock?.name}
            className="w-10 h-10 cursor-pointer"
            onClick={() => statBlock?.sheet?.render(true)}
        />}
    </div>)

    const name = statBlock?.name ?? appLang.Polymorph.dropToFavorite

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
            className={`flex items-center gap-2 p-2 min-h-[56px]
                ${uuid ? "cursor-grab justify-between" : "justify-center"}
                ${isHovered ? `${wealthBorderRounded} bg-sheet-header-fill/66` : `${tableBorderRounded} bg-sheet-header-fill`}
            `}
        >
            {statBlock
                ? <div className="flex items-center gap-2">
                    <Tooltip content={
                        <div className="flex w-[300px] max-h-[80vh] bg-sheet-main-fill">
                            <NpcSheetComponent actor={statBlock} hidePortrait={true} />
                        </div>
                    }>
                        {image}
                    </Tooltip>

                    <div className="flex flex-col gap-1">
                        <p className="text-lg">{name}</p>
                        <div className="flex flex-wrap gap-1 -mt-1.5 text-xs text-text-header-secondary font-paradigm italic">
                            <p>{localizeString(appLang.Polymorph.hd, { hd: String(statBlock?.system?.hitDice ?? 0) })}</p>
                            <p>{`|`}</p>
                            <p>{localizeString(appLang.Polymorph.ac, { ac: String(statBlock?.system?.armor?.rating ?? 0) })}</p>
                            <p>{`|`}</p>
                            <p>{formatSpeeds(statBlock?.system?.speeds ?? [])}</p>
                        </div>
                    </div>
                </div>
                : <div className="flex items-center gap-2">
                    {image}
                    {name}
                </div>
            }
            {onDelete && <TrashButton onClick={onDelete} />}
        </div>
    )
}