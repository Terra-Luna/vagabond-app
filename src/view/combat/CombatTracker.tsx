import { useCallback, useMemo } from "react"
import { AdversaryDataModel } from "../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { lang } from "../../utils/lang"
import { HeaderWithClipPath } from "../component/SkillCard"

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
    return <div className="flex bg-section-header-fill px-1 font-eskapade font-bold">
        <div className="flex text-3xl text-text-section-header">{label}</div>
    </div>
}

const Group = ({ children }) => {
    return (
        <div className="mt-4 pl-2 flex flex-col gap-4">{children}</div>
    )
}

const CombatantHeader = ({ children }) => {
    return (
        <div className="bg-section-header-fill px-1 font-eskapade text-text-header-secondary font-bold text-lg">
            {children}
        </div>
    )
}

const Combatant = ({ token, children }) => {
    const onMouseEnter = useCallback(() => {
        token?.setTarget(true)
    }, [token])

    const onMouseLeave = useCallback(() => {
        token?.setTarget(false)
    }, [token])

    const onClick = useCallback(() => {
        token.document.object.control({ releaseOthers: true });
    }, [token])

    return (
        <div className="cursor-pointer" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick}>{children}</div>
    )
}

const Hero = ({ hero }) => {
    const token = useMemo(() => canvas?.tokens?.placeables.find(t => t.id === hero.token._id), [hero])

    return (
        <Combatant token={token}>
            <CombatantHeader>{hero.name}</CombatantHeader>
            <HeaderWithClipPath>
                Status effects, etc
            </HeaderWithClipPath>
        </Combatant>
    )
}

const Adversary = ({ adversary }) => {
    const token = useMemo(() => canvas?.tokens?.placeables.find(t => t.id === adversary.token._id), [adversary])

    return (
        <Combatant token={token}>
            <CombatantHeader>{adversary.name}</CombatantHeader>
            <HeaderWithClipPath>
                Status, kill buttons
            </HeaderWithClipPath>
        </Combatant>

    )
}

const getCombatantSystem = (combatant) => combatant?.actor?.system
const getHeroes = (combatants) => combatants?.filter(c => getCombatantSystem(c) instanceof HeroDataModel)
const getAdversaries = (combatants) => combatants?.filter(c => getCombatantSystem(c) instanceof AdversaryDataModel)