import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { AdversaryDataModel } from "../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { lang } from "../../utils/lang"
import { HeaderWithClipPath } from "../component/SkillCard"
import { useCombatContext, useIsCurrentCombatant } from "./vglite-combat-tracker"
import { glowOnHover } from "../common/text-styles"

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
            <div>
                <GroupHeader label={lang.VGLITE.Combat.heroes} />
                <Group>{heroes?.map(hero => <Hero hero={hero} />)}</Group>
            </div>
            <div>
                <GroupHeader label={lang.VGLITE.Combat.adversaries} />
                <Group>{adversaries?.map(adv => <Adversary adversary={adv} />)}</Group>
            </div>
        </div>
    )
}

const GroupHeader = ({ label }) => {
    return (
        <div className="flex bg-section-header-fill px-1 font-eskapade font-bold">
            <div className="flex text-4xl text-text-section-header">{label}</div>
        </div>
    )
}

const Group = ({ children }) => {
    return (
        <div className="mt-4 pl-2 flex flex-col gap-4">{children}</div>
    )
}

const CombatantHeader = ({ token, name, children }) => {

    const [hovered, setIsHovered] = useState(false)

    Hooks.on("hoverToken", (hoveredToken, hover) => {
        if (hoveredToken === token) {
            setIsHovered(hover)
        }
    })

    return (
        <div className="flex">
            <CombatTrackerPortrait src={token?.document.texture.src} />
            <div>
                <div className={`px-1 font-eskapade text-text-header-tertiary font-bold text-lg border-solid border-l-2 border-stat-block-fill`}>
                    <p className={`hover-glow ${hovered ? "vglite-hovered" : ""}`}>{name}</p>
                </div>
                {children}
            </div>
        </div>

    )
}

const Combatant = ({ token, children }: { token: Token, children: ReactNode }) => {
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

    return (
        <div className={`cursor-pointer combatant data-combatant-id=${token.combatant.id}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}>
            {children}
        </div>
    )
}

const CombatTrackerPortrait = ({ src }) => {
    return (
        <img
            className="object-contain h-[54px] w-[54px] p-0.5 cursor-pointer" src={src} alt={''}
        />
    )
}

const Hero = ({ hero }) => {
    const token = useMemo(() => canvas?.tokens?.placeables.find(t => t.id === hero.token._id) as Token, [hero])
    const isCurrentCombatant = useIsCurrentCombatant(hero)

    return (
        <Combatant token={token}>
            <CombatantHeader name={hero.name} token={token}>
                <HeaderWithClipPath>
                    Status effects, etc
                </HeaderWithClipPath>
            </CombatantHeader>
        </Combatant>
    )
}

const Adversary = ({ adversary }) => {
    const token = useMemo(() => canvas?.tokens?.placeables.find(t => t.id === adversary.token._id) as Token, [adversary])
    const isCurrentCombatant = useIsCurrentCombatant(adversary)

    return (
        <Combatant token={token}>
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