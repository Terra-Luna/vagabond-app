import { Eye, PlayIcon, RefreshCw, Sparkles, StopCircle, Trash } from "lucide-react"
import { forwardRef, ReactNode, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react"

import { addCountdown, removeAllBurns } from "../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { AdversaryDataModel } from "../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { NpcDataModel } from "../../model/actor/NpcDataModel"
import { CombatGroup } from "../../model/combat/VagabondCombatant"
import { vgLiteLang } from "../../utils/lang"
import { localizeString } from "../../utils/localeUtils"
import { getCanvasToken } from "../../utils/modelUtil"
import { CtxMenuItem, useContextMenu } from "../../view/component/ContextMenu"
import { FoundryHotkeyBlocker } from "../../view/component/FoundryHotkeyBlocker"
import { Gauge } from "../../view/component/Gauge"
import { IconOnlyButton } from "../../view/component/IconOnlyButton"
import { HeaderWithClipPath } from "../../view/component/SkillCard"
import { CanvasReadyWrapper } from "../../view/wrappers/CanvasReadyWrapper"
import { useFoundryHook } from "../../view/wrappers/hooks"
import { getControlledCombatants, getControlledTokens, performAsyncActionOnControlledCombatants } from "../combat-utils"
import { VagabondCombat, VagabondCombatant } from "../documents/VagabondCombat"
import { controlledCombatantsHaveStatus, getCombatantStatuses } from "../engine/util/status"
import { BulkCombatantEditView } from "./BulkCombatantEditView"
import { useIsCurrentCombatant } from "./hooks"

const getCombat = () => game.combat as VagabondCombat


const getCombatantById = (id: string) => {
    const combatants = getCombat()?.combatants?.contents

    if (!combatants?.length) {
        return null
    }

    return combatants.find(c => c.id === id || c._id === id)
}

const getSortedCombatants = (combatants) => [...getHeroes(combatants), ...getAdversaries(combatants), ...getNpcs(combatants)]

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
                            <GroupHeader groupName="heroes" label={vgLiteLang.Combat.heroes} />
                            <GroupBody>{heroes?.map((hero) => <Hero key={hero.id} hero={hero} lastClickedCombatants={lastClickedCombatants} setlastClickedCombatants={setlastClickedCombatants} />)}</GroupBody>
                        </Group>
                    }
                    {npcs?.length > 0 &&
                        <Group groupName="npcs">
                            <GroupHeader groupName="npcs" label={vgLiteLang.Combat.npcs} />
                            <GroupBody>{npcs?.map(npc => <Adversary key={npc.id} adversary={npc} lastClickedCombatants={lastClickedCombatants} setlastClickedCombatants={setlastClickedCombatants} />)}</GroupBody>
                        </Group>
                    }
                    {adversaries?.length > 0 &&
                        <Group groupName="adversaries">
                            <GroupHeader groupName="adversaries" label={vgLiteLang.Combat.adversaries} />
                            <GroupBody>{adversaries?.map(adv => <Adversary key={adv.id} adversary={adv} lastClickedCombatants={lastClickedCombatants} setlastClickedCombatants={setlastClickedCombatants} />)}</GroupBody>
                        </Group>
                    }
                </div>
                {game.user?.isGM && (
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

const GroupHeader = ({ label }: { groupName: CombatGroup, label: string }) => {

    return (
        <div className="flex bg-section-header-fill px-1 font-eskapade font-bold py-1 mb-1">
            <p className={`flex text-xl text-text-section-header`}>{`${label}`}</p>
        </div>
    )
}

const GroupBody = ({ children }) => {
    return (
        <div className="pl-2 flex flex-col gap-y-1">{children}</div>
    )
}

const CombatantHeader = ({ token, combatant, name, children, onClick }) => {
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
    const opacityClass = isActiveCombatant || (combatant.activations.value ?? 0 > 0) ? '' : 'opacity-90 grayscale-[85%]'
    const disposition = combatant.token?.disposition

    return (
        <div className="flex w-full">
            <div className={`flex w-full ${opacityClass}`}>
                <CombatTrackerPortrait src={token?.document.texture.src} disposition={disposition === -1 ? "HOSTILE" : "FRIENDLY"} isControlled={controlled} isHovered={hovered} isHidden={isHidden} onClick={onClick} />
                <div className="w-full pr-4">
                    <div className={`px-1 font-eskapade text-text-header-tertiary font-bold text-lg`}>
                        <p className={`hover-glow ${hovered ? "vglite-hovered" : ""} leading-none`}>{name}</p>
                    </div>
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

    const onClick = useCallback((e: MouseEvent, tokenWasClicked?: boolean) => {
        if (token.controlled && (e.shiftKey || e.ctrlKey)) {
            token.release()
            setlastClickedCombatants(lastClickedCombatants.filter(c => c !== combatant.id))
            return
        } else if (e.shiftKey) {
            // control all tokens between the first token clicked and this one
            const previousCombatant = getCombatantById(lastClickedCombatants[lastClickedCombatants.length - 1])
            if (previousCombatant) {
                getCombatantsBetweenIndices(getIndexOfCombatant(previousCombatant), getIndexOfCombatant(combatant)).forEach(comb => canvas?.tokens?.placeables.find(t => t.id === comb.token._id)?.control({ releaseOthers: false }))
            }
        } else if (e.ctrlKey) {
            token.control({ releaseOthers: (!e.shiftKey && !e.ctrlKey) });
        }
        else if (e.altKey) {
            canvas?.ping(token.center)
        } else {
            token.control({ releaseOthers: true })
            if (tokenWasClicked) {
                game.canvas?.animatePan({ x: token.x, y: token.y });
            }
        }

        if (combatant.id) {
            setlastClickedCombatants([...lastClickedCombatants, combatant.id])
        }
    }, [token, combatant, lastClickedCombatants])

    useImperativeHandle(ref, () => ({ onClick }))

    const onDoubleClick = useCallback(() => {
        token.actor?.sheet?.render(true)
    }, [token])

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
                await performAsyncActionOnControlledCombatants(combatant => combatant.actor?.toggleStatusEffect(statusKey, { active: !controlledCombatantsHaveStatus(statusKey) }))
            }
            return { label: vgLiteLang.StatusConditions[statusKey].name, icon: StatusMenuItemIcon, action, isSelected: () => controlledCombatantsHaveStatus(statusKey) } as CtxMenuItem
        }

        const makeBurnMenuItem = () => {
            const StatusMenuItemIcon = () => <StatusIcon status="burning" size={24} className="mr-1 bg-sheet-header-fill" />
            const getHasStatus = () => controlledCombatantsHaveStatus("burning")

            const xStart = 0.1
            const yStart = 0.1
            let x = xStart
            let y = yStart
            const step = 0.1

            const applyBurn = async (e, damageType: string, duration: number) => {
                e.keepOpen = true
                performAsyncActionOnControlledCombatants(async combatant => {
                    await addCountdown(
                        `${combatant.actor?.name}: ${vgLiteLang.StatusConditions["burning"].name} (${vgLiteLang.DamageTypes[damageType]})`,
                        duration, 0.1, y,
                        combatant.actor?.uuid ?? '',
                        combatant.token?.uuid,
                        { id: "burning", damageType }
                    )

                    if (y + step < 0.8) {
                        y += step
                    } else if (x + step < 0.8) {
                        x += step
                        y = yStart
                    }
                })
            }

            const subMenuItems = () => {
                const items = Object.keys(vgLiteLang.DamageTypes)
                    .filter(damageType => !(["none", "mana", "silvered", "coldiron"].includes(damageType)))
                    .map(damageType => ({
                        label: vgLiteLang.DamageTypes[damageType],
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
                        label: "Clear All", action: async (e) => {
                            e.keepOpen = true
                            performAsyncActionOnControlledCombatants(comb => removeAllBurns(comb.token?.actor?.uuid))
                        }, isSelected: true
                    })
                }
                return items
            }

            return {
                label: vgLiteLang.StatusConditions["burning"].name,
                icon: StatusMenuItemIcon,
                isSelected: getHasStatus,
                subMenuItems
            } as CtxMenuItem
        }

        const actions = [
            {
                icon: Sparkles,
                label: controlledTokens().size > 1
                    ? `${vgLiteLang.Combat.applyEff} ${vgLiteLang.Combat.allSelected}`
                    : vgLiteLang.Combat.applyEff,
                subMenuItems: [
                    makeBurnMenuItem(),
                    ...Object.keys(vgLiteLang.StatusConditions)
                        .filter(statusKey => !["burning", "dead", "fatigued"].includes(statusKey))
                        .map(statusKey => makeStatusConditionMenuItem(statusKey))
                ]
            }
        ] as CtxMenuItem[]

        if (game.user?.isGM) {
            actions.push(
                {
                    icon: Eye,
                    label: controlledTokens().size > 1 ? "Toggle Visibility (All selected)" : getCanvasToken(token?.id)?.document.hidden ? "Show" : "Hide",
                    action: updateVisibility,
                },
                ...(controlledTokens
                    ().find(token => (token.combatant as VagabondCombatant).activations.value === 0) ? [{
                    icon: RefreshCw,
                    label: "Refresh Activations",
                    action: () => performAsyncActionOnControlledCombatants(comb => comb.resetActivations())
                }] : []),
                {
                    icon: Trash,
                    label: "Remove",
                    action: (e) => {
                        e.keepOpen = true
                        getCombat().deleteEmbeddedDocuments("Combatant", [token.combatant.id])
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
            <div className={`flex w-full justify-between cursor-pointer combatant data-combatant-id=${combatant.id} bg-color-red`}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={e => onClick(e as any)}
                onDoubleClick={onDoubleClick}
                onAuxClick={e => onClick(e as any)}
                onContextMenu={e => {
                    if (game.user?.isGM || combatant.isOwner) {
                        onCtxMenu(e, ctxMenuActions())
                    }
                }}
                title={vgLiteLang.Combat.keyExplainer}
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
    const borderColor = `#${dispositionColor.toString(16)}`
    const borderStyle = (isHovered || isControlled) ? "border-solid border-2" : "";

    return (
        <img
            onClick={(e) => onClick(e, true)}
            style={{ borderColor }}
            className={`object-contain h-[54px] w-[54px] p-0.5 cursor-pointer mr-2 self-center ${borderStyle} transition-opacity duration-1200 ${isHidden ? 'opacity-50' : ''}`} src={src} alt={''}
        />
    )
}

const getStatusIcons = (combatant) => {
    const statuses = getCombatantStatuses(combatant)
    return statuses.map((status) => {
        const img = CONFIG.statusEffects.find(e => e.id === status)?.img
        const title = vgLiteLang.StatusConditions[status].name
        return img ? <img key={status} src={img} height={12} width={12} title={title} /> : <></>
    })
}

const StatusIcon = ({ status, size, className }: { status: string, size?: number, className?: string }) => {
    const img = CONFIG.statusEffects.find(e => e.id === status)?.img
    const title = vgLiteLang.StatusConditions[status].name
    return img ? <img key={status} src={img} height={size ?? 12} width={size ?? 12} title={title} className={className} /> : <></>
}

const StatusIcons = ({ combatant }) => {
    return (
        <HeaderWithClipPath fullWidth>
            <div className="flex gap-1 min-h-3">{getStatusIcons(combatant)}</div>
        </HeaderWithClipPath>
    )
}

const Hero = ({ hero, lastClickedCombatants, setlastClickedCombatants }) => {
    const token = useMemo(() => canvas?.tokens?.placeables.find(t => t.id === hero.tokenId) as Token, [hero])
    const heroActorModel = hero.actor.system
    const combatantComponentRef = useRef<{ onClick: any }>(null)

    return (
        <Combatant ref={combatantComponentRef} token={token} combatant={hero} lastClickedCombatants={lastClickedCombatants} setlastClickedCombatants={setlastClickedCombatants}>
            <CombatantHeader name={hero.name} token={token} combatant={hero} onClick={combatantComponentRef.current?.onClick}>
                <div className="w-full" title={heroActorModel.mana.max > 0
                    ? localizeString(vgLiteLang.Combat.statTooltip, { hp: heroActorModel.health.current?.toString(), hpMax: heroActorModel.health.max?.toString(), luck: heroActorModel.statuses.counters.luck?.toString(), luckMax: heroActorModel.stats.luck?.toString(), mana: heroActorModel.mana.current?.toString(), manaMax: heroActorModel.mana.max?.toString() })
                    : localizeString(vgLiteLang.Combat.statTooltipNoMana, { hp: heroActorModel.health.current?.toString(), hpMax: heroActorModel.health.max?.toString(), luck: heroActorModel.statuses.counters.luck?.toString(), luckMax: heroActorModel.stats.luck?.toString() })}>
                    <Gauge max={heroActorModel.health.max} value={heroActorModel.health.current} fillColorClassName="bg-ic-hp/75" size="sm" rounded={false} />
                    <Gauge max={heroActorModel.stats.luck} value={heroActorModel.statuses.counters.luck} fillColorClassName="bg-ic-luck/75" size="sm" rounded={false} />
                    {(heroActorModel.mana.max > 0) && <Gauge max={heroActorModel.mana.max} value={heroActorModel.mana.current} fillColorClassName="bg-mana/75" size="sm" rounded={false} />}
                </div>
                <div>
                    <StatusIcons combatant={hero} />
                </div>
            </CombatantHeader>
        </Combatant>
    )
}

const ActivateCombatantButton = ({ combatant }: { combatant: VagabondCombatant }) => {
    let component = <div className="min-w-[24px] mr-4" />
    if (!combatant.isOwner && !game.user?.isActiveGM) { return component }

    const isCurrentCombatant = useIsCurrentCombatant(combatant)
    const hasActivationsLeft = combatant.activations.value ?? 0 > 0

    const id = combatant?._id

    const activateCombatant = useCallback(() => {
        if (id) {
            getCombat().activateCombatant(id)
        }
    }, [combatant])

    const deactivateCombatant = useCallback(() => {
        if (id) {
            getCombat().deactivateCombatant(id)
        }
    }, [combatant])

    if (isCurrentCombatant) {
        component = <IconOnlyButton title={vgLiteLang.Combat.end} Icon={StopCircle} className="ml-auto mr-4" colorClassName="text-text-header-tertiary" onClick={deactivateCombatant} />
    }
    else if (hasActivationsLeft) {
        component = <IconOnlyButton title={vgLiteLang.Combat.activate} Icon={PlayIcon} className="ml-auto mr-4" colorClassName="text-text-header-tertiary" onClick={activateCombatant} />
    }

    return component
}

const Adversary = ({ adversary, lastClickedCombatants, setlastClickedCombatants }) => {
    const token = useMemo(() => canvas?.tokens?.placeables?.find(t => t?.id === adversary?.token?._id) as Token, [adversary])
    const adversaryModel = adversary.actor.system
    const combatantComponentRef = useRef<{ onClick: any }>(null)

    return (
        <Combatant ref={combatantComponentRef} token={token} combatant={adversary} lastClickedCombatants={lastClickedCombatants} setlastClickedCombatants={setlastClickedCombatants}>
            <CombatantHeader name={token?.document?.name ?? adversary.name} combatant={adversary} token={token} onClick={combatantComponentRef.current?.onClick}>
                <div className="w-full" title={localizeString(vgLiteLang.Combat.hpTooltip, { hp: adversaryModel.health.current?.toString(), hpMax: adversaryModel.health.max?.toString() })}>
                    <Gauge max={adversaryModel.health.max} value={adversaryModel.health.current} fillColorClassName="bg-ic-hp/75" size="sm" rounded={false} />
                </div>
                <div>
                    <StatusIcons combatant={adversary} />
                </div>
            </CombatantHeader>
        </Combatant>

    )
}

const getCombatantSystem = (combatant) => combatant?.actor?.system
const getHeroes = (combatants) => combatants?.filter(c => getCombatantSystem(c) instanceof HeroDataModel)
const getAdversaries = (combatants) => combatants?.filter(c => getCombatantSystem(c) instanceof AdversaryDataModel)
const getNpcs = (combatants) => combatants?.filter(c => getCombatantSystem(c) instanceof NpcDataModel)