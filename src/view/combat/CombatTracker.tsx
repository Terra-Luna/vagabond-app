import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { AdversaryDataModel } from "../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { lang } from "../../utils/lang"
import { HeaderWithClipPath } from "../component/SkillCard"
import { useCombatContext, useIsCurrentCombatant } from "./vglite-combat-tracker"
import { glowOnHover } from "../common/text-styles"
import { CombatGroup } from "../../model/combat/VgLiteCombatant"
import { VgLiteCombat, VgLiteCombatant } from "../../document/VgLiteCombat"
import { IconOnlyButton } from "../component/IconOnlyButton"
import { PlayIcon, PlusIcon, StopCircle } from "lucide-react"
import { useContextMenu } from "../component/ContextMenu"
import { Gauge } from "../component/Gauge"

const isGroupActive = (groupName: CombatGroup) => (game.combat as VgLiteCombat).isGroupActive(groupName)
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
            <Group groupName="heroes">
                <GroupHeader groupName="heroes" label={lang.VGLITE.Combat.heroes} />
                <GroupBody>{heroes?.map(hero => <Hero hero={hero} />)}</GroupBody>
            </Group>
            <Group groupName="adversaries">
                <GroupHeader groupName="adversaries" label={lang.VGLITE.Combat.adversaries} />
                <GroupBody>{adversaries?.map(adv => <Adversary adversary={adv} />)}</GroupBody>
            </Group>
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

const GroupHeader = ({ label, groupName }: { groupName: CombatGroup, label: string }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    const setGroupActive = useCallback(() => {
        getCombat().activateGroup(groupName)
    }, [groupName])

    return (
        <div className="flex bg-section-header-fill px-1 font-eskapade font-bold py-1" onContextMenu={e => onCtxMenu(e, [{ label: "Activate", icon: PlayIcon, action: setGroupActive }])}>
            <p className={`flex text-xl text-text-section-header ${isGroupActive(groupName) ? "vglite-hovered" : ""}`}>{`${label} ${isGroupActive(groupName) ? "(Active)" : ""}`}</p>
            <ContextMenu />
        </div>
    )
}

const GroupBody = ({ children }) => {
    return (
        <div className="mt-4 pl-2 flex flex-col gap-4">{children}</div>
    )
}

const CombatantHeader = ({ token, name, children }) => {
    const [hovered, setIsHovered] = useState(false)
    const { onCtxMenu, ContextMenu } = useContextMenu()

    Hooks.on("hoverToken", (hoveredToken, hover) => {
        if (hoveredToken === token) {
            setIsHovered(hover)
        }
    })

    return (
        <div className="flex" onContextMenu={e => onCtxMenu(e, [{ label: "Activate Combatant (localify me)", action: () => getCombat().activateCombatant(token.combatant.id), icon: PlayIcon }])}>
            <CombatTrackerPortrait src={token?.document.texture.src} />
            <div>
                <div className={`px-1 font-eskapade text-text-header-tertiary font-bold text-lg border-solid border-l-2 border-stat-block-fill`}>
                    <p className={`hover-glow ${hovered ? "vglite-hovered" : ""}`}>{name}</p>
                </div>
                {children}
            </div>
            <ContextMenu />
        </div>

    )
}

const Combatant = ({ token, children, combatant }: { token: Token, children: ReactNode, combatant: VgLiteCombatant }) => {
    // we are cheating a bit here, but it works!
    //  act like hovering our entries in the tracker is hovering the token
    const onMouseEnter = useCallback(() => {
        (token as any)._onHoverIn(new MouseEvent('mouseenter'), { hoverOutOthers: true })
    }, [token])

    const onMouseLeave = useCallback(() => {
        (token as any)._onHoverOut(new MouseEvent('mouseleave'))
    }, [token])

    const onClick = useCallback(() => {
        token.control({ releaseOthers: true });
    }, [token])

    const onDoubleClick = useCallback(() => {
        token.actor?.sheet?.render(true)
    }, [token])

    const isActiveCombatant = game.combat?.combatant === combatant

    const opacityClass = isActiveCombatant || (combatant.activations.value ?? 0 > 0) ? undefined : 'opacity-50';

    return (
        <div className={`cursor-pointer combatant data-combatant-id=${combatant.id} flex ${opacityClass}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
        >
            {children}
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

const Hero = ({ hero }) => {
    const token = useMemo(() => canvas?.tokens?.placeables.find(t => t.id === hero.token._id) as Token, [hero])
    const heroActorModel = hero.actor.system

    return (
        <Combatant token={token} combatant={hero}>
            <CombatantHeader name={hero.name} token={token}>
                <div className="px-1">
                    <Gauge max={heroActorModel.health.max} value={heroActorModel.health.current} fillColorClassName="bg-ic-hp" size="sm" />
                    <Gauge max={heroActorModel.stats.luck} value={heroActorModel.statuses.counters.luck} fillColorClassName="bg-ic-luck" size="sm" />
                    {(heroActorModel.mana.max > 0) && <Gauge max={heroActorModel.mana.max} value={heroActorModel.mana.current} fillColorClassName="bg-mana" size="sm" />}
                </div>
                <div className="mt-1"></div>
                <HeaderWithClipPath>
                    Status effects, etc
                </HeaderWithClipPath>
            </CombatantHeader>
        </Combatant>
    )
}

const ActivateCombatantButton = ({ combatant }: { combatant: VgLiteCombatant }) => {
    const isCurrentCombatant = useIsCurrentCombatant(combatant)
    const isInActiveGroup = isGroupActive(combatant.groupName)
    const hasActivationsLeft = combatant.activations.value ?? 0 > 0

    if (!isInActiveGroup) return undefined

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
        return <IconOnlyButton title="Finish Turn (localify me)" Icon={StopCircle} className="ml-auto mr-4" onClick={deactivateCombatant} />
    } else if (hasActivationsLeft) {
        return <IconOnlyButton title="Activate Combatant (localify me)" Icon={PlayIcon} className="ml-auto mr-4" onClick={activateCombatant} />
    }

    return undefined
}

const Adversary = ({ adversary }) => {
    const token = useMemo(() => canvas?.tokens?.placeables.find(t => t.id === adversary.token._id) as Token, [adversary])

    return (
        <Combatant token={token} combatant={adversary}>
            <CombatantHeader name={adversary.name} token={token}>
                <HeaderWithClipPath>
                    Status effects, etc
                </HeaderWithClipPath>
            </CombatantHeader>
        </Combatant>

    )
}

const getCombatantSystem = (combatant) => combatant?.actor?.system
const getHeroes = (combatants) => combatants?.filter(c => getCombatantSystem(c) instanceof HeroDataModel)
const getAdversaries = (combatants) => combatants?.filter(c => getCombatantSystem(c) instanceof AdversaryDataModel)