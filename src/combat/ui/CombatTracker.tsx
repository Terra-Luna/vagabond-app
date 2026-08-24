import { Eye, PlayIcon, StopCircle, Trash } from "lucide-react"
import { ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"

import { AdversaryDataModel } from "../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { CombatGroup } from "../../model/combat/VagabondCombatant"
import { lang } from "../../utils/lang"
import { getCanvasToken } from "../../utils/modelUtil"
import { CtxMenuItem, useContextMenu } from "../../view/component/ContextMenu"
import { FoundryHotkeyBlocker } from "../../view/component/FoundryHotkeyBlocker"
import { Gauge } from "../../view/component/Gauge"
import { IconOnlyButton } from "../../view/component/IconOnlyButton"
import { HeaderWithClipPath } from "../../view/component/SkillCard"
import { CanvasReadyWrapper } from "../../view/wrappers/CanvasReadyWrapper"
import { useFoundryHook } from "../../view/wrappers/hooks"
import { getControlledCombatants, getControlledTokens } from "../combat-utils"
import { VagabondCombat, VagabondCombatant } from "../documents/VagabondCombat"
import { allCombatantsHaveStatus, getCombatantStatuses } from "../engine/util/status"
import { BulkCombatantEditView } from "./BulkCombatantEditView"
import { useIsCurrentCombatant } from "./CombatTrackerDocument"

const getCombat = () => game.combat as VagabondCombat


const getCombatantById = (id: string) => {
    const combatants = getCombat()?.combatants?.contents

    if (!combatants?.length) {
        return null
    }

    return combatants.find(c => c.id === id || c._id === id)
}

const getIndexOfCombatant = (combatant) => {
    const combatants = getCombat()?.combatants?.contents

    if (!combatants?.length) {
        return -1
    }

    const sortedCombatants = [...getHeroes(combatants), ...getAdversaries(combatants)]

    return sortedCombatants.indexOf(combatant)
}

const getCombatantsBetweenIndices = (idx1, idx2) => {
    const combatants = getCombat()?.combatants?.contents

    if (!combatants?.length) {
        return []
    }

    const sortedCombatants = [...getHeroes(combatants), ...getAdversaries(combatants)]

    return sortedCombatants.slice(Math.min(idx1, idx2), Math.max(idx1, idx2) + 1)
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

    return (
        <CanvasReadyWrapper>
            <div className="flex flex-col h-full">
                <div className="flex flex-col gap-1 overflow-auto" ref={containerRef} onScroll={handleScroll}>
                    {heroes?.length > 0 &&
                        <Group groupName="heroes">
                            <GroupHeader groupName="heroes" label={lang.VGLITE.Combat.heroes} />
                            <GroupBody>{heroes?.map((hero) => <Hero key={hero.id} hero={hero} lastClickedCombatants={lastClickedCombatants} setlastClickedCombatants={setlastClickedCombatants} />)}</GroupBody>
                        </Group>
                    }
                    {adversaries?.length > 0 &&
                        <Group groupName="adversaries">
                            <GroupHeader groupName="adversaries" label={lang.VGLITE.Combat.adversaries} />
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

const CombatantHeader = ({ token, combatant, name, children }) => {
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
                <CombatTrackerPortrait src={token?.document.texture.src} disposition={disposition === -1 ? "HOSTILE" : "FRIENDLY"} isControlled={controlled} isHovered={hovered} isHidden={isHidden} />
                <div className="w-full pr-4">
                    <div className={`px-1 font-eskapade text-text-header-tertiary font-bold text-lg`}>
                        <p className={`hover-glow ${hovered ? "vglite-hovered" : ""} leading-none -mb-0.5`}>{name}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>

    )
}

const Combatant = ({ token, children, combatant, lastClickedCombatants, setlastClickedCombatants }: { token: Token, children: ReactNode, combatant: VagabondCombatant, lastClickedCombatants: string[], setlastClickedCombatants: (ids: string[]) => void }) => {
    // we are cheating a bit here, but it works!
    //  act like hovering our entries in the tracker is hovering the token
    const onMouseEnter = useCallback(() => {
        (token as any)?._onHoverIn(new MouseEvent('mouseenter'), { hoverOutOthers: true })
    }, [token])

    const onMouseLeave = useCallback(() => {
        (token as any)?._onHoverOut(new MouseEvent('mouseleave'))
    }, [token])

    const onClick = useCallback((e: MouseEvent) => {
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
            game.canvas?.animatePan({ x: token.x, y: token.y });
        }

        if (combatant.id) {
            setlastClickedCombatants([...lastClickedCombatants, combatant.id])
        }
    }, [token, combatant, lastClickedCombatants])

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
            const allCombatants = new Set(getControlledCombatants())
            allCombatants.add(combatant)
            const hasStatus = allCombatantsHaveStatus([...allCombatants], statusKey)
            const action = () => {
                allCombatants.forEach(combatant => combatant.actor?.toggleStatusEffect(statusKey, { active: !hasStatus }))
            }
            return { label: lang.VGLITE.StatusConditions[statusKey].name, icon: StatusMenuItemIcon, action, isSelected: hasStatus } as CtxMenuItem
        }

        const makeBurnMenuItem = () => {
            const StatusMenuItemIcon = () => <StatusIcon status="burning" size={24} className="mr-1 bg-sheet-header-fill" />
            return {
                label: lang.VGLITE.StatusConditions["burning"].name, icon: StatusMenuItemIcon, subMenuItems: Object.keys(lang.VGLITE.DamageTypes).filter(damageType => !(["none", "mana", "silvered", "coldiron"].includes(damageType))).map(damageType => {
                    return {
                        label: lang.VGLITE.DamageTypes[damageType], subMenuItems: [
                            { label: "cd4" },
                            { label: "cd6" },
                            { label: "cd8" },
                            { label: "cd10" },
                            { label: "cd12" },
                            { label: "cd20" },
                        ]
                    }
                })
            } as CtxMenuItem
        }

        const actions = [
            { label: controlledTokens().size > 1 ? "Toggle Visibility of Selected Tokens" : getCanvasToken(token?.id)?.document.hidden ? "Show" : "Hide", action: updateVisibility, icon: Eye },
            { label: controlledTokens().size > 1 ? "Apply Effect to Selected Tokens" : "Apply Effect", subMenuItems: [makeBurnMenuItem(), ...Object.keys(lang.VGLITE.StatusConditions).filter(statusKey => statusKey !== "burning").map(statusKey => makeStatusConditionMenuItem(statusKey))] },
            { label: "Remove", action: () => getCombat().deleteEmbeddedDocuments("Combatant", [token.combatant.id]), icon: Trash, isDestructive: true },
        ] as CtxMenuItem[]

        return actions
    }

    return (
        <>
            <ContextMenu />
            <div className={`flex w-full justify-between cursor-pointer combatant data-combatant-id=${combatant.id}`}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={onClick as any}
                onDoubleClick={onDoubleClick}
                onContextMenu={e => onCtxMenu(e, ctxMenuActions())}
                title={lang.VGLITE.Combat.keyExplainer}
            >
                <div className="w-full">
                    {children}
                </div>
                <ActivateCombatantButton combatant={combatant} />
            </div>
        </>
    )
}

const CombatTrackerPortrait = ({ src, isControlled, isHovered, disposition, isHidden }) => {
    const dispositionColor = isControlled ? CONFIG.Canvas.dispositionColors.CONTROLLED : isHovered ? CONFIG.Canvas.dispositionColors[disposition] : ""
    const borderColor = `#${dispositionColor.toString(16)}`
    const borderStyle = (isHovered || isControlled) ? "border-solid border-2" : "";

    return (
        <img
            style={{ borderColor }}
            className={`object-contain h-[54px] w-[54px] p-0.5 cursor-pointer mr-2 self-center ${borderStyle} transition-opacity duration-1200 ${isHidden ? 'opacity-50' : ''}`} src={src} alt={''}
        />
    )
}

const getStatusIcons = (combatant) => {
    const statuses = getCombatantStatuses(combatant)
    return statuses.map((status) => {
        const img = CONFIG.statusEffects.find(e => e.id === status)?.img
        const title = lang.VGLITE.StatusConditions[status].name
        return img ? <img key={status} src={img} height={12} width={12} title={title} /> : <></>
    })
}

const StatusIcon = ({ status, size, className }: { status: string, size?: number, className?: string }) => {
    const img = CONFIG.statusEffects.find(e => e.id === status)?.img
    const title = lang.VGLITE.StatusConditions[status].name
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

    return (
        <Combatant token={token} combatant={hero} lastClickedCombatants={lastClickedCombatants} setlastClickedCombatants={setlastClickedCombatants}>
            <CombatantHeader name={hero.name} token={token} combatant={hero}>
                <div className="w-full">
                    <Gauge max={heroActorModel.health.max} value={heroActorModel.health.current} fillColorClassName="bg-ic-hp" size="sm" />
                    <Gauge max={heroActorModel.stats.luck} value={heroActorModel.statuses.counters.luck} fillColorClassName="bg-ic-luck" size="sm" />
                    {(heroActorModel.mana.max > 0) && <Gauge max={heroActorModel.mana.max} value={heroActorModel.mana.current} fillColorClassName="bg-mana" size="sm" />}
                </div>
                <div className="mt-1">
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
        component = <IconOnlyButton title="Finish Turn (localify me)" Icon={StopCircle} className="ml-auto mr-4" colorClassName="text-text-header-tertiary" onClick={deactivateCombatant} />
    } else if (hasActivationsLeft) {
        component = <IconOnlyButton title="Activate Combatant (localify me)" Icon={PlayIcon} className="ml-auto mr-4" colorClassName="text-text-header-tertiary" onClick={activateCombatant} />
    }

    return component
}

const Adversary = ({ adversary, lastClickedCombatants, setlastClickedCombatants }) => {
    const token = useMemo(() => canvas?.tokens?.placeables?.find(t => t?.id === adversary?.token?._id) as Token, [adversary])
    const adversaryModel = adversary.actor.system

    return (
        <Combatant token={token} combatant={adversary} lastClickedCombatants={lastClickedCombatants} setlastClickedCombatants={setlastClickedCombatants}>
            <CombatantHeader name={token?.document?.name ?? adversary.name} combatant={adversary} token={token}>
                <div className="w-full">
                    <Gauge max={adversaryModel.health.max} value={adversaryModel.health.current} fillColorClassName="bg-ic-hp" size="sm" />
                </div>
                <div className="mt-1">
                    <StatusIcons combatant={adversary} />
                </div>
            </CombatantHeader>
        </Combatant>

    )
}

const getCombatantSystem = (combatant) => combatant?.actor?.system
const getHeroes = (combatants) => combatants?.filter(c => getCombatantSystem(c) instanceof HeroDataModel)
const getAdversaries = (combatants) => combatants?.filter(c => getCombatantSystem(c) instanceof AdversaryDataModel)