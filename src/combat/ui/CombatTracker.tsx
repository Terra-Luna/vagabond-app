import { ReactNode, useCallback, useMemo, useState } from "react"
import { AdversaryDataModel } from "../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { lang } from "../../utils/lang"
import { HeaderWithClipPath } from "../../view/component/SkillCard"
import { useIsCurrentCombatant } from "./vglite-combat-tracker"
import { CombatGroup } from "../../model/combat/VgLiteCombatant"
import { VgLiteCombat, VgLiteCombatant } from "../documents/VgLiteCombat"
import { IconOnlyButton } from "../../view/component/IconOnlyButton"
import { PlayIcon, StopCircle, Trash } from "lucide-react"
import { CtxMenuItem, useContextMenu } from "../../view/component/ContextMenu"
import { Gauge } from "../../view/component/Gauge"
import { getCombatantStatuses } from "../engine/status"

const getCombat = () => game.combat as VgLiteCombat

export const CombatTracker = ({ data }) => {
    const { combat } = data
    const combatants = combat?.combatants?.contents

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
                    <GroupBody>{heroes?.map((hero, index) => <Hero key={index} hero={hero} />)}</GroupBody>
                </Group>
            }
            {adversaries?.length > 0 &&
                <Group groupName="adversaries">
                    <GroupHeader groupName="adversaries" label={lang.VGLITE.Combat.adversaries} />
                    <GroupBody>{adversaries?.map(adv => <Adversary key={adv.id} adversary={adv} />)}</GroupBody>
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
    const { onCtxMenu, ContextMenu } = useContextMenu()

    Hooks.on("hoverToken", (hoveredToken, hover) => {
        if (hoveredToken === token) {
            setIsHovered(hover)
        }
    })

    const ctxMenuActions = useMemo<CtxMenuItem[]>(() => {
        return [
            { label: "Activate Combatant (localify me)", action: () => getCombat().activateCombatant(token.combatant.id), icon: PlayIcon },
            { label: "Remove", action: () => getCombat().deleteEmbeddedDocuments("Combatant", [token.combatant.id]), icon: Trash, isDestructive: true }
        ]
    }, [])

    const isActiveCombatant = game.combat?.combatant === combatant
    const opacityClass = isActiveCombatant || (combatant.activations.value ?? 0 > 0) ? '' : 'opacity-90 grayscale-[85%]'

    return (
        <div className="flex w-full" onContextMenu={e => onCtxMenu(e, ctxMenuActions)}>
            <div className={`flex w-full ${opacityClass}`}>
                <CombatTrackerPortrait src={token?.document.texture.src} />
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

const Combatant = ({ token, children, combatant }: { token: Token, children: ReactNode, combatant: VgLiteCombatant }) => {
    // we are cheating a bit here, but it works!
    //  act like hovering our entries in the tracker is hovering the token
    const onMouseEnter = useCallback(() => {
        (token as any)?._onHoverIn(new MouseEvent('mouseenter'), { hoverOutOthers: true })
    }, [token])

    const onMouseLeave = useCallback(() => {
        (token as any)?._onHoverOut(new MouseEvent('mouseleave'))
    }, [token])

    const onClick = useCallback(() => {
        token.control({ releaseOthers: true });
        canvas?.ping(token.center)
    }, [token])

    const onDoubleClick = useCallback(() => {
        token.actor?.sheet?.render(true)
    }, [token])

    return (
        <div className={`flex w-full justify-between cursor-pointer combatant data-combatant-id=${combatant.id}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
        >
            <div className="w-full">
                {children}
            </div>
            <ActivateCombatantButton combatant={combatant} />
        </div>
    )
}

const CombatTrackerPortrait = ({ src }) => {
    return (
        <img
            className="object-contain h-[54px] w-[54px] p-0.5 cursor-pointer self-center" src={src} alt={''}
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
            <div className="min-h-3">{getStatusIcons(combatant)}</div>
        </HeaderWithClipPath>
    )
}

const Hero = ({ hero }) => {
    const token = useMemo(() => canvas?.tokens?.placeables.find(t => t.id === hero.tokenId) as Token, [hero])
    const heroActorModel = hero.actor.system

    return (
        <Combatant token={token} combatant={hero}>
            <CombatantHeader name={hero.name} token={token} combatant={hero}>
                <div className="w-full">
                    <Gauge max={heroActorModel.health.max} value={heroActorModel.health.current} fillColorClassName="bg-ic-hp" size="sm" />
                    <Gauge max={heroActorModel.stats.luck} value={heroActorModel.statuses.counters.luck} fillColorClassName="bg-ic-luck" size="sm" />
                    {(heroActorModel.mana.max > 0) && <Gauge max={heroActorModel.mana.max} value={heroActorModel.mana.current} fillColorClassName="bg-mana" size="sm" />}
                </div>
                <div className="mt-1"></div>
                <StatusIcons combatant={hero} />
            </CombatantHeader>
        </Combatant>
    )
}

const ActivateCombatantButton = ({ combatant }: { combatant: VgLiteCombatant }) => {
    if (!combatant.isOwner && !game.user?.isActiveGM) { return }

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
        return <IconOnlyButton title="Finish Turn (localify me)" Icon={StopCircle} className="ml-auto mr-4" colorClassName="text-text-header-tertiary" onClick={deactivateCombatant} />
    } else if (hasActivationsLeft) {
        return <IconOnlyButton title="Activate Combatant (localify me)" Icon={PlayIcon} className="ml-auto mr-4" colorClassName="text-text-header-tertiary" onClick={activateCombatant} />
    }

    return undefined
}

const Adversary = ({ adversary }) => {
    const token = useMemo(() => canvas?.tokens?.placeables.find(t => t.id === adversary.token._id) as Token, [adversary])

    return (
        <Combatant token={token} combatant={adversary}>
            <CombatantHeader name={token?.document?.name ?? adversary.name} combatant={adversary} token={token}>
                <StatusIcons combatant={adversary} />
            </CombatantHeader>
        </Combatant>

    )
}

const getCombatantSystem = (combatant) => combatant?.actor?.system
const getHeroes = (combatants) => combatants?.filter(c => getCombatantSystem(c) instanceof HeroDataModel)
const getAdversaries = (combatants) => combatants?.filter(c => getCombatantSystem(c) instanceof AdversaryDataModel)