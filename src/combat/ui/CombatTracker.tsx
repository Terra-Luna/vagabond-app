import { PlayIcon, Trash, StopCircle, Edit } from "lucide-react"
import { ReactNode, useState, useMemo, useCallback, useEffect } from "react"
import { AdversaryDataModel } from "../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { CombatGroup } from "../../model/combat/VgLiteCombatant"
import { lang } from "../../utils/lang"
import { useContextMenu, CtxMenuItem } from "../../view/component/ContextMenu"
import { IconOnlyButton } from "../../view/component/IconOnlyButton"
import { HeaderWithClipPath } from "../../view/component/SkillCard"
import { VgLiteCombat, VgLiteCombatant } from "../documents/VgLiteCombat"
import { useIsCurrentCombatant } from "./CombatTrackerDocument"
import { Gauge } from "../../view/component/Gauge"
import { getCombatantStatuses } from "../engine/status"
import { BulkCombatantEditApp } from "../../apps/bulk-combatant-edit/BulkCombatantEditApp"

const getCombat = () => game.combat as VgLiteCombat

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

    if (!combatants?.length) {
        return <></>
    }

    const heroes = getHeroes(combatants)
    const adversaries = getAdversaries(combatants)

    return (
        <div className="flex flex-col gap-6 pb-2">
            {heroes?.length > 0 &&
                <Group groupName="heroes">
                    <GroupHeader groupName="heroes" label={lang.VGLITE.Combat.heroes} />
                    <GroupBody>{heroes?.map((hero, index) => <Hero key={index} hero={hero} lastClickedCombatants={lastClickedCombatants} setlastClickedCombatants={setlastClickedCombatants} />)}</GroupBody>
                </Group>
            }
            {adversaries?.length > 0 &&
                <Group groupName="adversaries">
                    <GroupHeader groupName="adversaries" label={lang.VGLITE.Combat.adversaries} />
                    <GroupBody>{adversaries?.map(adv => <Adversary key={adv.id} adversary={adv} lastClickedCombatants={lastClickedCombatants} setlastClickedCombatants={setlastClickedCombatants} />)}</GroupBody>
                </Group>
            }
        </div>
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
        <div className="flex bg-section-header-fill px-1 font-eskapade font-bold py-1">
            <p className={`flex text-xl text-text-section-header`}>{`${label}`}</p>
        </div>
    )
}

const GroupBody = ({ children }) => {
    return (
        <div className="mt-4 pl-2 flex flex-col gap-4">{children}</div>
    )
}

const CombatantHeader = ({ token, combatant, name, children }) => {
    const [hovered, setIsHovered] = useState(false)
    const [controlled, setIsControlled] = useState(false)
    const { onCtxMenu, ContextMenu } = useContextMenu()

    useEffect(() => {
        const hookId = Hooks.on("hoverToken", (hoveredToken, hover) => {
            if (hoveredToken === token) {
                setIsHovered(hover)
            }
        })
        return () => {
            Hooks.off("hoverToken", hookId)
        }
    }, [token])

    useEffect(() => {
        const hookId = Hooks.on("refreshToken", () => {
            const isControlled = !!game.canvas?.tokens?.controlled.includes(token)
            if (isControlled) {
                // this fixes tokens in the tracker keeping their "hovered" state when they get de-selected with ctrl / shift
                setIsHovered(false)
            }
            setIsControlled(isControlled)
        })

        const hookId2 = Hooks.on("controlToken", () => {
            setIsControlled(!!game.canvas?.tokens?.controlled.includes(token))
        })

        return () => {
            Hooks.off("refreshToken", hookId)
            Hooks.off("controlToken", hookId2)
        }
    }, [token])


    const ctxMenuActions = () => {
        const actions = [
            { label: "Activate Combatant (localify me)", action: () => getCombat().activateCombatant(token.combatant.id), icon: PlayIcon },
            { label: "Remove", action: () => getCombat().deleteEmbeddedDocuments("Combatant", [token.combatant.id]), icon: Trash, isDestructive: true }
        ] as any

        const controlledTokens = game.canvas?.tokens?.controlled
        if (controlledTokens?.length ?? 0 > 0) {
            const controlledCombatants = controlledTokens?.filter(t => t.combatant).map(t => t.combatant!) ?? []
            actions.push({
                label: "Bulk Edit Combatants", action: () => {
                    new BulkCombatantEditApp(controlledCombatants as VgLiteCombatant[]).render({ force: true }).then(() => {
                        // for whatever reason we lose the "controlled" state of the combatants, we gotta re-select them
                        controlledCombatants.forEach(comb => canvas?.tokens?.placeables.find(t => t.id === comb.token?._id)?.control({ releaseOthers: false }))
                    })
                }, icon: Edit
            })
        }

        return actions
    }

    const isActiveCombatant = game.combat?.combatant === combatant
    const opacityClass = isActiveCombatant || (combatant.activations.value ?? 0 > 0) ? '' : 'opacity-90 grayscale-[85%]'
    const disposition = combatant.token.disposition
    
    return (
        <div className="flex w-full" onContextMenu={e => onCtxMenu(e, ctxMenuActions())}>
            <div className={`flex w-full ${opacityClass}`}>
                <CombatTrackerPortrait src={token?.document.texture.src} disposition={disposition === -1 ? "HOSTILE" : "FRIENDLY"} isControlled={controlled} isHovered={hovered} />
                <div className="w-full pr-4">
                    <div className={`px-1 font-eskapade text-text-header-tertiary font-bold text-lg`}>
                        <p className={`hover-glow ${hovered ? "vglite-hovered" : ""}`}>{name}</p>
                    </div>
                    {children}
                </div>
            </div>
            <ContextMenu />
        </div>

    )
}

const Combatant = ({ token, children, combatant, lastClickedCombatants, setlastClickedCombatants }: { token: Token, children: ReactNode, combatant: VgLiteCombatant, lastClickedCombatants: string[], setlastClickedCombatants: (ids: string[]) => void }) => {
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

    return (
        <div className={`flex w-full justify-between cursor-pointer combatant data-combatant-id=${combatant.id}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick as any}
            onDoubleClick={onDoubleClick}
            title={lang.VGLITE.Combat.keyExplainer}
        >
            <div className="w-full">
                {children}
            </div>
            <ActivateCombatantButton combatant={combatant} />
        </div>
    )
}

const CombatTrackerPortrait = ({ src, isControlled, isHovered, disposition }) => {
    const dispositionColor = isControlled ? CONFIG.Canvas.dispositionColors.CONTROLLED : isHovered ? CONFIG.Canvas.dispositionColors[disposition] : ""
    const borderColor = `#${dispositionColor.toString(16)}`
    const borderStyle = (isHovered || isControlled) ? "border-solid border-2" : "";
    return (
        <img
            style={{ borderColor }}
            className={`object-contain h-[54px] w-[54px] p-0.5 cursor-pointer mr-2 self-center ${borderStyle}`} src={src} alt={''}
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

const ActivateCombatantButton = ({ combatant }: { combatant: VgLiteCombatant }) => {
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
    const token = useMemo(() => canvas?.tokens?.placeables.find(t => t.id === adversary.token._id) as Token, [adversary])
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