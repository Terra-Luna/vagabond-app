import { Clover, Eye, PlayIcon, RefreshCw, Sparkles, StopCircle, Trash } from "lucide-react"
import { forwardRef, ReactNode, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react"

import { useOverlayItemSync } from "../../apps/overlay/usecase/OverlayItemSyncUseCase"
import { CountdownManager, CountdownSchema } from "../../apps/vagabond-tools/usecase/CountdownManager"
import { canInteractWithOverlayObject } from "../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { CombatGroup } from "../../model/combat/VagabondCombatant"
import { sys_id } from "../../utils/foundryUtils"
import { DieIcon } from "../../view/chat/component/DieIcon"
import { appLang } from "../../utils/lang"
import { localizeString } from "../../utils/localeUtils"
import { getCanvasToken } from "../../utils/modelUtil"
import { UtilityButton } from "../../view/component/Button"
import { CtxMenuItem, useContextMenu } from "../../view/component/ContextMenu"
import { DiceRollButton } from "../../view/component/DiceRollButton"
import { FoundryHotkeyBlocker } from "../../view/component/FoundryHotkeyBlocker"
import { Gauge } from "../../view/component/Gauge"
import { IconOnlyButton } from "../../view/component/IconOnlyButton"
import { HeaderWithClipPath } from "../../view/component/SkillCard"
import { Tooltip } from "../../view/component/Tooltip"
import { CanvasReadyWrapper } from "../../view/wrappers/CanvasReadyWrapper"
import { useFoundryHook } from "../../view/wrappers/hooks"
import { combineCombatantWithControlledCombatants, getControlledCombatants, getControlledTokens, performAsyncActionOnControlledCombatants } from "../combat-utils"
import { VagabondActiveEffect } from "../documents/VagabondActiveEffect"
import { VagabondCombat, VagabondCombatant } from "../documents/VagabondCombat"
import { CountdownRoll } from "../engine/roll/CountdownRoll"
import { controlledCombatantsHaveStatus, getCombatantStatuses } from "../engine/util/status"
import { BulkCombatantEditView } from "./BulkCombatantEditView"
import { useCombatContext, useIsCurrentCombatant } from "./hooks"

const getCombat = () => game.combat as VagabondCombat

const getCombatantById = (id: string) => {
    const combatants = getCombat()?.combatants?.contents

    if (!combatants?.length) {
        return null
    }

    return combatants.find(c => c.id === id || c._id === id)
}

const getSortedCombatants = (combatants) => [
    ...getHeroes(combatants),
    ...getNpcs(combatants),
    ...getAdversaries(combatants)
]

const getIndexOfCombatant = (combatant) => {
    const combatants = getCombat()?.combatants?.contents

    if (!combatants?.length) {
        return -1
    }

    return getSortedCombatants(combatants).indexOf(combatant)
}

const getCombatantsBetweenIndices = (idx1, idx2) => {
    const combatants = getCombat()?.combatants?.contents

    if (!combatants?.length) {
        return []
    }

    if (idx1 < 0 || idx2 < 0) {
        return []
    }

    return getSortedCombatants(combatants).slice(Math.min(idx1, idx2), Math.max(idx1, idx2) + 1)
}

export const CombatTracker = ({ combat }) => {
    const combatants = combat?.combatants?.contents

    const [lastClickedCombatants, setlastClickedCombatants] = useState([])
    const [controlledCombatants, setControlledCombatants] = useState(getControlledCombatants())

    const containerRef = useRef<HTMLDivElement>(null);
    const scrollPosRef = useRef(0);

    useFoundryHook("refreshToken" as any, () => {
        setControlledCombatants(getControlledCombatants())
    })

    // for some reason scroll positioning isn't being maintained. this is a hack but it works
    useLayoutEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = scrollPosRef.current;
        }
    }, [combatants]);

    if (!combatants?.length) {
        return <></>
    }

    const handleScroll = () => {
        if (containerRef.current) {
            scrollPosRef.current = containerRef.current.scrollTop;
        }
    };

    const heroes = getHeroes(combatants)
    const adversaries = getAdversaries(combatants)
    const npcs = getNpcs(combatants)

    return (
        <CanvasReadyWrapper>
            <div className="flex flex-col h-full">
                <div className="flex flex-col gap-1 overflow-auto" ref={containerRef} onScroll={handleScroll}>
                    {heroes?.length > 0 &&
                        <Group groupName="heroes">
                            <GroupHeader groupName="heroes" label={appLang.Combat.heroes} combatants={heroes} />
                            <GroupBody>
                                {heroes?.map((hero) =>
                                    <Hero key={hero.id}
                                        hero={hero}
                                        lastClickedCombatants={lastClickedCombatants}
                                        setlastClickedCombatants={setlastClickedCombatants}
                                    />)
                                }
                            </GroupBody>
                        </Group>
                    }
                    {npcs?.length > 0 &&
                        <Group groupName="npcs">
                            <GroupHeader groupName="npcs" label={appLang.Combat.npcs} combatants={npcs} />
                            <GroupBody>
                                {npcs?.map(npc =>
                                    <Adversary key={npc.id}
                                        adversary={npc}
                                        lastClickedCombatants={lastClickedCombatants}
                                        setlastClickedCombatants={setlastClickedCombatants}
                                    />)
                                }
                            </GroupBody>
                        </Group>
                    }
                    {adversaries?.length > 0 &&
                        <Group groupName="adversaries">
                            <GroupHeader groupName="adversaries" label={appLang.Combat.adversaries} combatants={adversaries} />
                            <GroupBody>
                                {adversaries?.map(adv =>
                                    <Adversary key={adv.id}
                                        adversary={adv}
                                        lastClickedCombatants={lastClickedCombatants}
                                        setlastClickedCombatants={setlastClickedCombatants}
                                    />)
                                }
                            </GroupBody>
                        </Group>
                    }
                </div>
                {game.user?.isActiveGM && (
                    <footer className="shrink-0 pt-4 mt-auto">
                        <FoundryHotkeyBlocker>
                            <BulkCombatantEditView combatants={controlledCombatants} />
                        </FoundryHotkeyBlocker>
                    </footer>)}
            </div>
        </CanvasReadyWrapper>
    )
}

const Group = ({ children }: { groupName: CombatGroup, children: ReactNode }) => {
    return (
        <div>
            {children}
        </div>
    )
}

const rolledThisRound = new Set<string>()
const rolledListeners = new Set<() => void>()
const roundKey = (suffix: string) => `${getCombat()?.id}:${getCombat()?.round}:${suffix}`
const groupRolledKey = (groupName: string) => roundKey(`group:${groupName}`)
const dieRolledKey = (cdId: string) => roundKey(`die:${cdId}`)
const markRolled = (key: string) => {
    rolledThisRound.add(key)
    rolledListeners.forEach(listener => listener())
}
const useRolledTracking = () => {
    const [, forceRender] = useState(0)
    useEffect(() => {
        const listener = () => forceRender(n => n + 1)
        rolledListeners.add(listener)
        // re-render on round changes so buttons re-enable
        const hookId = Hooks.on("updateCombat", listener)
        return () => {
            rolledListeners.delete(listener)
            Hooks.off("updateCombat", hookId)
        }
    }, [])
}

const GroupHeader = ({ groupName, label, combatants }: { groupName: CombatGroup, label: string, combatants: VagabondCombatant[] }) => {
    const [cds, setCds] = useState<CountdownSchema[]>(CountdownManager.getAll())
    useRolledTracking()
    useOverlayItemSync(setCds, CountdownManager.getAll, `${sys_id}.countdowns`)

    const hasRolled = rolledThisRound.has(groupRolledKey(groupName))

    const groupCdIds = combatants.flatMap(c => getCombatantStatusCountdowns(cds, c).map(cd => cd.id))
    const uniqueIds = Array.from(new Set(groupCdIds))
    const allDiceRolled = uniqueIds.every(id => rolledThisRound.has(dieRolledKey(id)))

    const rollAll = async () => {
        if (hasRolled) return
        const idsToRoll = uniqueIds.filter(id => !rolledThisRound.has(dieRolledKey(id)))
        markRolled(groupRolledKey(groupName))
        idsToRoll.forEach(id => markRolled(dieRolledKey(id)))
        for (const id of idsToRoll) {
            await rollStatusCountdown(id)
        }
    }

    return (
        <div className="flex items-center justify-between bg-section-header-fill px-1 font-eskapade font-bold py-1 mb-1">
            <p className={`flex text-xl text-text-header-secondary`}>{`${label}`}</p>
            {uniqueIds.length > 0 && game.user?.isActiveGM &&
                <span className="text-text-primary">
                    <UtilityButton onClick={rollAll} disabled={hasRolled || allDiceRolled}>
                        {appLang.Combat.rollCountdowns}
                    </UtilityButton>
                </span>
            }
        </div>
    )
}

const GroupBody = ({ children }) => {
    return (
        <div className="pl-2 flex flex-col gap-y-1">{children}</div>
    )
}

const CombatantHeader = ({ token, combatant, name, children, onClick, tooltipDescription, luck = undefined }) => {
    const realToken = getCanvasToken(token?.id)

    const [hovered, setIsHovered] = useState(false)
    const [controlled, setIsControlled] = useState(false)
    const [isHidden, setIsHidden] = useState(realToken?.document.hidden)

    useFoundryHook("hoverToken" as any, (hoveredToken, hover) => {
        if (hoveredToken === token) {
            setIsHovered(hover)
        }
    })

    useEffect(() => {
        const hookId = Hooks.on("refreshToken", () => {
            const isControlled = !!game.canvas?.tokens?.controlled.includes(token)
            if (isControlled) {
                // this fixes tokens in the tracker keeping their "hovered" state when they get de-selected with ctrl / shift
                setIsHovered(false)
            }
            setIsControlled(isControlled)
            setIsHidden(realToken?.document.hidden)
        })

        const hookId2 = Hooks.on("controlToken", () => {
            setIsControlled(!!game.canvas?.tokens?.controlled.includes(token))
        })

        return () => {
            Hooks.off("refreshToken", hookId)
            Hooks.off("controlToken", hookId2)
        }
    }, [token, realToken])


    const isActiveCombatant = game.combat?.combatant === combatant
    const opacityClass = isActiveCombatant || ((combatant.activations?.value ?? 0) > 0) ? '' : 'opacity-90 grayscale-[85%]'
    const disposition = combatant.token?.disposition

    return (
        <div className="flex w-full">
            <div className={`flex w-full ${opacityClass}`}>
                <CombatTrackerPortrait
                    src={token?.document.texture.src}
                    isControlled={controlled}
                    isHovered={hovered}
                    isHidden={isHidden}
                    onClick={onClick}
                    disposition={disposition === -1
                        ? "HOSTILE"
                        : (disposition === 0
                            ? "NEUTRAL"
                            : "FRIENDLY"
                        )
                    }
                />

                <div className="w-full pr-4">
                    <Tooltip title={name} content={tooltipDescription}>
                        <div className="flex items-center justify-between gap-x-1">
                            <div className={`px-1 font-eskapade text-text-secondary font-bold text-lg`}>
                                <p className={`hover-glow ${hovered ? "app-hovered" : ""} leading-none`}>{name}</p>
                            </div>
                            {luck &&
                                <div className={`flex gap-x-1 items-center -mb-1`}>
                                    <Clover size={14} className="text-ic-luck" />
                                    <p className="text-lg text-ic-luck font-eskapade">{luck}</p>
                                </div>
                            }
                        </div>
                    </Tooltip>
                    {children}
                </div>
            </div>
        </div>
    )
}

const Combatant = forwardRef(({ token, children, combatant, lastClickedCombatants, setlastClickedCombatants }: { token: Token, children: ReactNode, combatant: VagabondCombatant, lastClickedCombatants: string[], setlastClickedCombatants: (ids: string[]) => void }, ref) => {
    // we are cheating a bit here, but it works!
    //  act like hovering our entries in the tracker is hovering the token
    const onMouseEnter = useCallback(() => {
        (token as any)?._onHoverIn(new MouseEvent('mouseenter'), { hoverOutOthers: true })
    }, [token])

    const onMouseLeave = useCallback(() => {
        (token as any)?._onHoverOut(new MouseEvent('mouseleave'))
    }, [token])

    const onClick = useCallback((e: MouseEvent, rightClick?: boolean, tokenWasClicked?: boolean) => {
        if (!token) return
        if (token.controlled && (e.shiftKey || e.ctrlKey)) {
            token.release()
            setlastClickedCombatants(lastClickedCombatants.filter(c => c !== combatant.id))
            return
        } else if (e.shiftKey) {
            // control all tokens between the first token clicked and this one
            const previousCombatant = getCombatantById(lastClickedCombatants[lastClickedCombatants.length - 1])
            if (previousCombatant) {
                getCombatantsBetweenIndices(getIndexOfCombatant(previousCombatant), getIndexOfCombatant(combatant)).forEach(comb => canvas?.tokens?.placeables.find(t => t.id === comb.token?._id)?.control({ releaseOthers: false }))
            }
        } else if (e.ctrlKey) {
            token.control({ releaseOthers: (!e.shiftKey && !e.ctrlKey) });
        }
        else if (e.altKey) {
            canvas?.ping(token.center)
        } else {
            token.control({ releaseOthers: !rightClick || !(getControlledTokens().length > 1) })
            if (tokenWasClicked && token.isVisible) {
                game.canvas?.animatePan({ x: token.x, y: token.y });
            }
        }

        if (combatant.id) {
            setlastClickedCombatants([...lastClickedCombatants, combatant.id])
        }
    }, [token, combatant, lastClickedCombatants])

    useImperativeHandle(ref, () => ({ onClick }))

    const onDoubleClick = useCallback(() => {
        combatant.actor?.sheet?.render(true)
    }, [combatant])

    const { onCtxMenu, ContextMenu } = useContextMenu()

    const ctxMenuActions = () => {
        const controlledTokens = () => {
            const tokens = new Set(getControlledTokens())
            const realToken = getCanvasToken(token?.id)
            if (realToken) tokens.add(realToken)
            return tokens
        }

        const updateVisibility = () => {
            controlledTokens().forEach(token => token.document.update({ hidden: !token.document.hidden }))
        }

        const makeStatusConditionMenuItem = (statusKey: string) => {
            const StatusMenuItemIcon = () => <StatusIcon status={statusKey} size={24} className="mr-1 bg-sheet-header-fill" />
            const action = async (e) => {
                e.keepOpen = true
                const shouldBeActive = !controlledCombatantsHaveStatus(statusKey, combatant)
                await performAsyncActionOnControlledCombatants(comb => comb.actor?.toggleStatusEffect(statusKey, { active: shouldBeActive }), combatant)
            }
            const applyWithDuration = async (e, duration: number) => {
                e.keepOpen = true
                const combatants = combineCombatantWithControlledCombatants(combatant)
                const existing = CountdownManager.getAll()
                const toRemove = new Set(combatants.map(c => `${c.token?.uuid ?? ""}|${c.actor?.uuid ?? ""}`))
                const kept = existing.filter(cd => cd.result.status !== statusKey || !toRemove.has(`${cd.result.tokenUuid ?? ""}|${cd.result.actorUuid ?? ""}`))
                if (kept.length !== existing.length) await CountdownManager.setAll(kept)
                await performAsyncActionOnControlledCombatants(comb => comb.actor?.toggleStatusEffect(statusKey, { active: true }), combatant)
                await CountdownManager.addAll(combatants.map(comb => ({
                    label: `${comb.actor?.name}: ${appLang.StatusConditions[statusKey].name}`,
                    duration,
                    actorId: comb.actor?.uuid ?? '',
                    tokenUuid: comb.token?.uuid,
                    status: { id: statusKey }
                })))
            }
            const subMenuItems = [4, 6, 8, 10, 12, 20].map(d => ({ label: `Cd${d}`, action: (e) => applyWithDuration(e, d) })) as CtxMenuItem[]
            return {
                label: appLang.StatusConditions[statusKey].name,
                icon: StatusMenuItemIcon,
                action,
                ...(VagabondActiveEffect.statusesWithoutDuration.includes(statusKey) ? {} : { subMenuItems }),
                isSelected: () => controlledCombatantsHaveStatus(statusKey, combatant)
            } as CtxMenuItem
        }

        const makeBurnMenuItem = () => {
            const StatusMenuItemIcon = () => <StatusIcon status="burning" size={24} className="mr-1 bg-sheet-header-fill" />
            const getHasStatus = () => controlledCombatantsHaveStatus("burning", combatant)

            const xStart = 0.1
            const yStart = 0.1
            let x = xStart
            let y = yStart
            const step = 0.1

            const applyBurn = async (e, damageType: string, duration: number) => {
                e.keepOpen = true
                const combatants = combineCombatantWithControlledCombatants(combatant)
                const countdownsToAdd: {
                    label: string
                    duration: number
                    x?: number
                    y?: number
                    actorId?: string
                    tokenUuid?: string
                    status?: { id: string, damageType?: string }
                }[] = []

                for (const comb of combatants) {
                    countdownsToAdd.push({
                        label: `${comb.actor?.name}: ${appLang.StatusConditions["burning"].name} (${appLang.DamageTypes[damageType]})`,
                        duration,
                        x,
                        y,
                        actorId: comb.actor?.uuid ?? '',
                        tokenUuid: comb.token?.uuid,
                        status: { id: "burning", damageType }
                    })

                    if (y + step < 0.8) {
                        y += step
                    } else if (x + step < 0.8) {
                        x += step
                        y = yStart
                    }
                }

                await CountdownManager.addAll(countdownsToAdd)
            }

            const subMenuItems = () => {
                const items = Object.keys(appLang.DamageTypes)
                    .filter(damageType => !(["none", "mana", "silvered", "coldiron", "adamant", "fatigue", "slash", "pierce"].includes(damageType)))
                    .map(damageType => ({
                        label: appLang.DamageTypes[damageType],
                        subMenuItems: [
                            { label: "Cd4", action: (e) => applyBurn(e, damageType, 4) },
                            { label: "Cd6", action: (e) => applyBurn(e, damageType, 6) },
                            { label: "Cd8", action: (e) => applyBurn(e, damageType, 8) },
                            { label: "Cd10", action: (e) => applyBurn(e, damageType, 10) },
                            { label: "Cd12", action: (e) => applyBurn(e, damageType, 12) },
                            { label: "Cd20", action: (e) => applyBurn(e, damageType, 20) }
                        ]
                    })) as CtxMenuItem[]
                
                if (getHasStatus()) {
                    items.unshift({
                        label: appLang.Combat.clearAll, action: async (e) => {
                            e.keepOpen = true
                            const combatants = combineCombatantWithControlledCombatants(combatant)
                            const actorUuids = combatants.map(c => c.token?.actor?.uuid).filter(Boolean) as string[]
                            await CountdownManager.removeBurns(actorUuids)
                        }, isSelected: true
                    })
                }

                return items
            }

            return {
                label: appLang.StatusConditions["burning"].name,
                icon: StatusMenuItemIcon,
                isSelected: getHasStatus,
                subMenuItems
            } as CtxMenuItem
        }

        const actions = [
            {
                icon: Sparkles,
                label: controlledTokens().size > 1
                    ? `${appLang.Combat.applyEff} ${appLang.Combat.allSelected}`
                    : appLang.Combat.applyEff,
                subMenuItems: [
                    makeBurnMenuItem(),
                    ...Object.keys(appLang.StatusConditions)
                        .filter(statusKey => !["burning", "dead", "fatigued"].includes(statusKey))
                        .map(statusKey => makeStatusConditionMenuItem(statusKey))
                ]
            }
        ] as CtxMenuItem[]

        if (game.user?.isActiveGM) {
            actions.push(
                {
                    icon: Eye,
                    label: controlledTokens().size > 1 ? appLang.Combat.toggleVisibilitySelected : getCanvasToken(token?.id)?.document.hidden ? appLang.Combat.show : appLang.Combat.hide,
                    action: updateVisibility,
                },
                ...(controlledTokens
                    ().find(token => (token.combatant as VagabondCombatant | null)?.activations?.value === 0) ? [{
                        icon: RefreshCw,
                        label: appLang.Combat.refreshActivations,
                        action: () => performAsyncActionOnControlledCombatants(comb => comb.resetActivations(), combatant)
                    }] : []),
                {
                    icon: Trash,
                    label: controlledTokens().size > 1 ? appLang.Combat.removeAll : appLang.ButtonActions.remove,
                    action: (e) => {
                        e.keepOpen = true
                        const ids = combineCombatantWithControlledCombatants(combatant).map(c => c?.id).filter(Boolean) as string[]
                        if (ids.length) getCombat()?.deleteEmbeddedDocuments("Combatant", ids)
                    },
                    isDestructive: true
                }
            )
        }

        return actions
    }

    return (
        <>
            <ContextMenu />
            <div className={`flex w-full justify-between items-center cursor-pointer combatant data-combatant-id=${combatant.id} bg-color-red`}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={e => onClick(e as any)}
                onDoubleClick={onDoubleClick}
                onAuxClick={e => onClick(e as any, true)}
                onContextMenu={e => {
                    if (game.user?.isActiveGM || combatant.isOwner) {
                        onCtxMenu(e, ctxMenuActions())
                    }
                }}
            >
                <div className="w-full">
                    {children}
                </div>
                <ActivateCombatantButton combatant={combatant} />
            </div>
        </>
    )
})

const CombatTrackerPortrait = ({ src, isControlled, isHovered, disposition, isHidden, onClick }) => {
    const dispositionColor = isControlled ? CONFIG.Canvas.dispositionColors.CONTROLLED : isHovered ? CONFIG.Canvas.dispositionColors[disposition] : ""
    const borderColor = `#${(dispositionColor ?? "").toString(16)}`
    const borderStyle = (isHovered || isControlled) ? "border-solid border-2" : "";
    return (
        <Tooltip content={appLang.Combat.keyExplainer}>
            <img
                onClick={(e) => { onClick(e, false, true); e.stopPropagation(); }}
                onAuxClick={(e) => { onClick(e, true, true); e.stopPropagation(); }}
                style={{ borderColor }}
                className={`object-contain h-[54px] w-[54px] p-0.5 cursor-pointer mr-2 self-center ${borderStyle} transition-opacity duration-1200 ${isHidden ? 'opacity-50' : ''}`} src={src} alt={''}
            />
        </Tooltip>
    )
}

const getStatusIcons = (combatant) => {
    const statuses = getCombatantStatuses(combatant)
    return statuses.map((status, index) => {
        const img = CONFIG.statusEffects.find(e => e.id === status)?.img
        const title = appLang.StatusConditions[status]?.name ?? status
        const description = appLang.StatusConditions[status]?.description ?? ""
        return img
            ? <Tooltip key={index} title={title} content={description}>
                <img src={img} height={12} width={12} />
            </Tooltip>
            : <></>
    })
}

const StatusIcon = ({ status, size, className }: { status: string, size?: number, className?: string }) => {
    const img = CONFIG.statusEffects.find(e => e.id === status)?.img
    const title = appLang.StatusConditions[status]?.name ?? status
    const description = appLang.StatusConditions[status]?.description ?? ""
    return img
        ? <Tooltip title={title} content={description}>
            <img key={status} src={img} height={size ?? 12} width={size ?? 12} className={className} />
        </Tooltip>
        : <></>
}

const StatusIcons = ({ combatant }) => {
    return (
        <HeaderWithClipPath fullWidth>
            <div className="flex gap-1 min-h-3">{getStatusIcons(combatant)}</div>
        </HeaderWithClipPath>
    )
}

const rollStatusCountdown = async (cdId: string) => {
    const current = CountdownManager.getAll().find(cd => cd.id === cdId)
    if (!current || current.result.duration === 0) return
    if (!canInteractWithOverlayObject(current, CountdownManager.checkPermission)) return

    const roll = new CountdownRoll(current.result)
    await roll.roll(true)

    const expired = roll.result.duration === 0
    await CountdownManager.setAll(CountdownManager.getAll().flatMap(cd =>
        cd.id !== cdId ? [cd] : (expired ? [] : [{ ...cd, result: roll.result }])
    ))

    if (current.result.status === "burning") await roll.applyBurningDamage()
}

const getCombatantStatusCountdowns = (cds: CountdownSchema[], combatant: VagabondCombatant) =>
    cds.filter(cd =>
        cd.result.status &&
        cd.result.duration > 0 &&
        cd.result.actorUuid === combatant.actor?.uuid &&
        (!cd.result.tokenUuid || cd.result.tokenUuid === combatant.token?.uuid)
    )

export const rollPendingCountdowns = async (combatant: VagabondCombatant) => {
    if (rolledThisRound.has(groupRolledKey(combatant.combatGroup))) return
    const pending = getCombatantStatusCountdowns(CountdownManager.getAll(), combatant)
        .map(cd => cd.id)
        .filter(id => !rolledThisRound.has(dieRolledKey(id)))
    pending.forEach(id => markRolled(dieRolledKey(id)))
    for (const id of pending) {
        await rollStatusCountdown(id)
    }
}

export const activateCombatantAndRollCountdowns = async (combatant: VagabondCombatant) => {
    const id = combatant?._id
    if (!id) return
    await getCombat()?.activateCombatant(id)
    if (game.user?.isActiveGM) {
        await rollPendingCountdowns(combatant)
    }
    else if (game.users?.activeGM) {
        // Players can't roll countdowns themselves; ask the active GM's client to.
        game.socket?.emit(`system.${sys_id}`, {
            action: "rollCombatantCountdowns",
            user: game.user?.id,
            data: { combatId: getCombat()?.id, combatantId: id }
        })
    }
}

export const StatusCountdowns = ({ combatant, actorUuid, tokenUuid, burningOnly, alwaysClickable, className = "flex flex-wrap gap-0.5" }: {
    combatant?: VagabondCombatant, actorUuid?: string, tokenUuid?: string, burningOnly?: boolean, alwaysClickable?: boolean, className?: string
}) => {
    const targetActorUuid = actorUuid ?? combatant?.actor?.uuid
    const targetTokenUuid = tokenUuid ?? combatant?.token?.uuid
    const [cds, setCds] = useState<CountdownSchema[]>(CountdownManager.getAll())
    const { onCtxMenu, ContextMenu } = useContextMenu()
    useOverlayItemSync(setCds, CountdownManager.getAll, `${sys_id}.countdowns`)

    const combatantCountdowns = cds.filter(cd =>
        cd.result.status &&
        (!burningOnly || (cd.result.status === "burning" && cd.result.duration > 0)) &&
        cd.result.actorUuid === targetActorUuid &&
        (!cd.result.tokenUuid || !targetTokenUuid || cd.result.tokenUuid === targetTokenUuid)
    )

    const rollCountdown = (cdId: string) => {
        if (!game.user?.isActiveGM || isDieDisabled(cdId)) return
        markRolled(dieRolledKey(cdId))
        return rollStatusCountdown(cdId)
    }

    useRolledTracking()

    const isDieDisabled = (cdId: string) =>
        !game.user?.isActiveGM ||
        (!alwaysClickable && (rolledThisRound.has(dieRolledKey(cdId)) || (!!combatant && rolledThisRound.has(groupRolledKey(combatant.combatGroup)))))

    const deleteCountdown = async (cdId: string) => {
        await CountdownManager.setAll(CountdownManager.getAll().filter(cd => cd.id !== cdId))
    }

    if (!combatantCountdowns.length) return <></>

    return (
        <div className={className}>
            <ContextMenu />
            {combatantCountdowns.map(cd => {
                const statusName = appLang.StatusConditions[cd.result.status as string]?.name ?? cd.result.status
                const damageTypeName = cd.result.status === "burning" && cd.result.damageType
                    ? (appLang.DamageTypes[cd.result.damageType] ?? cd.result.damageType)
                    : undefined
                const tooltipName = damageTypeName ? `${statusName} - ${damageTypeName}` : statusName
                return (
                    <DiceRollButton
                        key={cd.id}
                        faces={cd.result.rollSummary?.faces ?? cd.result.duration}
                        result={cd.result.rollSummary?.result ?? ''}
                        textSize="text-2xl"
                        title={`${tooltipName} (Cd${cd.result.duration})`}
                        disabled={isDieDisabled(cd.id)}
                        onClick={(e) => { e.stopPropagation(); rollCountdown(cd.id) }}
                        onDoubleClick={(e) => e.stopPropagation()}
                        onAuxClick={(e) => e.stopPropagation()}
                        onContextMenu={(e) => {
                            e.stopPropagation()
                            if (!game.user?.isActiveGM) return
                            onCtxMenu(e, [{
                                label: appLang.ButtonActions.delete,
                                icon: Trash,
                                isDestructive: true,
                                action: () => deleteCountdown(cd.id)
                            }])
                        }}
                    />
                )
            })}
        </div>
    )
}

const Hero = ({ hero, lastClickedCombatants, setlastClickedCombatants }) => {
    const token = canvas?.tokens?.placeables?.find(t => t.id === hero.tokenId) as Token
    const heroActorModel = hero.actor.system
    const combatantComponentRef = useRef<{ onClick: any }>(null)

    const hp = heroActorModel.health.value?.toString()
    const hpMax = heroActorModel.health.max?.toString()
    const mana = heroActorModel.mana?.value?.toString()
    const manaMax = heroActorModel.mana?.max?.toString()
    const hasMana = heroActorModel.mana?.max > 0
    const luck = heroActorModel.statuses.counters.luck?.toString()
    const hasLuck = heroActorModel.stats?.luck

    const tooltipDescription = `${hasMana
        ? localizeString(appLang.Combat.statTooltip, { hp, hpMax, mana, manaMax, luck })
        : localizeString(appLang.Combat.statTooltipNoMana, { hp, hpMax, luck })
        }`

    return (
        <Combatant ref={combatantComponentRef} token={token} combatant={hero} lastClickedCombatants={lastClickedCombatants} setlastClickedCombatants={setlastClickedCombatants}>
            <CombatantHeader name={hero.name} token={token} combatant={hero} onClick={combatantComponentRef.current?.onClick} tooltipDescription={tooltipDescription} luck={hasLuck ? luck : undefined}>
                <Tooltip title={hero.name} content={tooltipDescription}>
                    <div className="w-full">
                        <Gauge max={hpMax} value={hp} fillColorClassName="bg-ic-hp/75" size="sm" rounded={false} />
                        {hasMana && <Gauge max={manaMax} value={mana} fillColorClassName="bg-mana/75" size="sm" rounded={false} />}
                    </div>
                </Tooltip>
                <div className="flex flex-col gap-0.5">
                    <StatusIcons combatant={hero} />
                    <StatusCountdowns combatant={hero} />
                </div>
            </CombatantHeader>
        </Combatant>
    )
}

const ActivateCombatantButton = ({ combatant }: { combatant: VagabondCombatant }) => {
    let component = <div className="min-w-[24px] mr-4" />

    const isCurrentCombatant = useIsCurrentCombatant(combatant)
    const { activeCombatantId } = useCombatContext()
    const hasOtherActiveCombatant = !!activeCombatantId && !isCurrentCombatant
    const hasActivationsLeft = (combatant.activations?.value ?? 0) > 0

    const id = combatant?._id

    const activateCombatant = useCallback(async () => {
        if (id) await activateCombatantAndRollCountdowns(combatant)
    }, [combatant])

    const deactivateCombatant = useCallback(() => {
        if (id) {
            getCombat()?.deactivateCombatant(id)
        }
    }, [combatant])

    if (!combatant.isOwner && !game.user?.isActiveGM) {
        // Spotlight indicator for combatants the user doesn't control.
        if (isCurrentCombatant) {
            return <div className="ml-auto mr-4 text-2xl" title={`${combatant.name}`}>
                <DieIcon faces={20} exploded={false} />
            </div>
        }
        return component
    }

    if (isCurrentCombatant) {
        component = <Tooltip content={appLang.Combat.end}>
            <IconOnlyButton
                Icon={StopCircle}
                className="ml-auto mr-4"
                colorClassName="text-text-header-tertiary"
                onClick={deactivateCombatant}
            />
        </Tooltip>
    }
    else if (hasActivationsLeft && !hasOtherActiveCombatant) {
        component = <Tooltip content={appLang.Combat.activate}>
            <IconOnlyButton
                Icon={PlayIcon}
                className="ml-auto mr-4"
                colorClassName="text-text-header-tertiary"
                onClick={activateCombatant}
            />
        </Tooltip>
    }

    return component
}

const Adversary = ({ adversary, lastClickedCombatants, setlastClickedCombatants }) => {
    const token = canvas?.tokens?.placeables?.find(t => t?.id === adversary?.token?._id) as Token
    const adversaryModel = adversary.actor.system
    const combatantComponentRef = useRef<{ onClick: any }>(null)
    const tooltipDescription = localizeString(appLang.Combat.hpTooltip, { hp: adversaryModel.health.value?.toString(), hpMax: adversaryModel.health.max?.toString() })

    return (
        <Combatant ref={combatantComponentRef} token={token} combatant={adversary} lastClickedCombatants={lastClickedCombatants} setlastClickedCombatants={setlastClickedCombatants}>
            <CombatantHeader name={token?.document?.name ?? adversary.name} combatant={adversary} token={token} onClick={combatantComponentRef.current?.onClick} tooltipDescription={tooltipDescription}>
                <Tooltip title={token?.document?.name ?? adversary.name} content={tooltipDescription}>
                    <div className="w-full">
                        <Gauge
                            max={adversaryModel.health.max}
                            value={adversaryModel.health.value}
                            fillColorClassName="bg-ic-hp/75"
                            size="sm"
                            rounded={false}
                        />
                    </div>
                </Tooltip>
                <div className="flex flex-col gap-0.5">
                    <StatusIcons combatant={adversary} />
                    <StatusCountdowns combatant={adversary} />
                </div>
            </CombatantHeader>
        </Combatant>

    )
}

// Each group is listed in turn order (the combat's turn sorting) rather than creation order.
const inTurnOrder = (combatants: VagabondCombatant[], group: string) => {
    const turns = (getCombat()?.turns ?? []) as VagabondCombatant[]
    const turnIndex = (c: VagabondCombatant) => {
        const i = turns.findIndex(t => t.id === c.id)
        return i < 0 ? Number.MAX_SAFE_INTEGER : i
    }
    return (combatants ?? [])
        .filter(c => c.actor && c.combatGroup === group)
        .sort((a, b) => turnIndex(a) - turnIndex(b))
}
const getHeroes = (combatants: VagabondCombatant[]) => inTurnOrder(combatants, "heroes")
const getAdversaries = (combatants: VagabondCombatant[]) => inTurnOrder(combatants, "adversaries")
const getNpcs = (combatants: VagabondCombatant[]) => inTurnOrder(combatants, "npcs")
