import { useCallback, useMemo, useState } from "react"
import { getCanvasToken, getTokenImg } from "../../utils/modelUtil"
import { deserializeAttack, serializeAttack } from "../engine/util/attack-serializer"
import { BaseChatCardHost } from "../../view/chat/component/BaseChatCardHost"
import { ChatCardBanner } from "../../view/chat/component/ChatCardBanner"
import { HeroAttack } from "../engine/HeroAttack"
import { AdversaryAttack } from "../engine/AdversaryAttack"
import { Divider, Header } from "../../view/component/Header"
import { SkillCheckDiceComponent } from "../../view/chat/SkillCheckChatCard"
import { TargetsDisplay } from "../../view/chat/component/TargetsDisplay"
import { useLiveTargetSync, TargetDisplayItem } from "../engine/util/target-sync"
import { CardSubHeader } from "../../view/component/SkillCard"
import { vgLiteLang } from "../../utils/lang"
import { BookMarked, Clover } from "lucide-react"
import { DiceRoll } from "../../view/chat/component/DiceRoll"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { TotalDmgFooter } from "../../view/chat/DamageRollChatCard"
import { DamageRollsComponent } from "../../view/chat/component/DamageRollsComponent"
import { DamageTypeIcon } from "../../view/component/DamageTypeIcon"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { SpellDataModel } from "../../model/item/character/SpellDataModel"
import { SpellAttackInfoComponent } from "./SpellAttackInfoComponent"

export const InteractiveAttackChatCard = ({ actorId, attackId }: { actorId: string, attackId: string }) => {
    const actor = useMemo(() => getCanvasToken(actorId)?.actor ?? game.actors?.get(actorId), [actorId])

    const snapshot = useMemo(() => {
        const rawArray = actor?.getFlag("vagabond-lite" as any, "attacks") as any[] ?? []
        const found = rawArray.find(atk => atk.id === attackId)
        return found ? foundry.utils.deepClone(found) : null
    }, [actor, attackId])

    const attack = useMemo(() => {
        return snapshot ? deserializeAttack(snapshot) : null
    }, [snapshot])

    return (
        <div>
            {actor && attack &&
                <BaseChatCardHost
                    banner={<ChatCardBanner
                        tokenId={actor?.getActiveTokens()[0]?.id}
                        portrait={getTokenImg(actor)}
                        title={attack.title}
                    />}
                    contents={<>
                        {attack instanceof HeroAttack && <HeroAttackComponent actor={actor as Actor & { system: HeroDataModel }} attack={attack} />}
                        {attack instanceof AdversaryAttack && <AdversaryAttackComponent actor={actor} attack={attack} />}
                        {/* {game.user?.isGM &&
                            <div>
                                <Header title={"GM Tools"} />
                                <button onClick={() => { }}>
                                    Resolve
                                </button>
                            </div>
                        } */}
                    </>}
                />
            }
        </div>
    )
}

const HeroAttackComponent = ({ actor, attack }: { actor: Actor & { system: HeroDataModel }, attack: HeroAttack }) => {
    const luck = useMemo<number>(() => actor.system.statuses.counters.luck, [actor.system.statuses.counters.luck])
    const studied = useMemo<number>(() => actor.system.statuses.counters.studied, [actor.system.statuses.counters.studied])

    const isFriendlySpell = useMemo<boolean>(() => {
        return attack.spellDelivery != null && !attack.hasHostileTargets()
    }, [attack])

    const showDamage = useMemo<boolean>(() => {
        return (attack.skillCheckResult?.outcome !== vgLiteLang.RollResult.failure && attack.damageRollResult != null) || isFriendlySpell
    }, [attack.skillCheckResult?.outcome])

    const canUpdateSkillCheck = useMemo<boolean>(() => {
        const isFailure = attack.skillCheckResult?.outcome === vgLiteLang.RollResult.failure && attack.skillCheckResult?.d6 === 0
        const hasResources = luck > 0 || studied > 0
        return !attack.isRerolled && isFailure && hasResources
    }, [luck, studied, attack])

    const liveTargetIds = useLiveTargetSync(attack)

    const targets = useMemo<TargetDisplayItem[]>(() => {
        return liveTargetIds
            .map(id => {
                const canvasToken = getCanvasToken(id)
                return {
                    id: id,
                    src: getTokenImg(canvasToken),
                    token: canvasToken
                }
            })
            .filter(it => it.src != null && it.src.length > 0)
    }, [liveTargetIds])

    const source = useMemo<Item | undefined>(() => {
        const item = ItemsCache.allItems().find(it => it.uuid === attack.sourceId)
        return item
    }, [attack])

    const handleLuckyD6 = useCallback(async () => {
        await actor.update({ 'system.statuses.counters.luck': luck - 1} as Record<string, number>)
        await attack.addLateD6()
    }, [luck])

    const handleLuckReroll = useCallback(async () => {
        await actor.update({ 'system.statuses.counters.luck': luck - 1 } as Record<string, number>)
        await attack.rollSkillCheck(true)
    }, [attack])

    const handleStudiedD6 = useCallback(async () => {
        await actor.update({ 'system.statuses.counters.studied': studied - 1 } as Record<string, number>)
        await attack.addLateD6()
    }, [studied])

    return (
        <div>
            {/* SKILL CHECK */}
            {attack.skillCheckResult &&
                <div>
                    <Header title={`${attack.skillCheckResult.skillName} Check`} textLeft={true} />
                    <CardSubHeader showRightBorder={false} values={[
                        { label: "Difficulty", value: attack.skillCheckResult.difficulty.toString() },
                        { label: "Result", value: attack.skillCheckResult.outcome }
                    ]} /> 
                    <div className="flex flex-col justify-center items-center">
                        <SkillCheckDiceComponent
                            d20={attack.skillCheckResult.d20}
                            d6={attack.skillCheckResult.d6}
                            favHinder={attack.skillCheckResult.favorHinder}
                        />

                        {/* LUCK & STUDIED REROLL BUTTONS */}
                        {canUpdateSkillCheck &&
                            <div className="flex flex-col w-full gap-2">
                                <Divider />
                                <div className="flex gap-x-1 justify-between px-8">
                                    {luck > 0 && <>
                                        <button title={"Spend a Luck to add Favor"} onClick={() => handleLuckyD6()}>
                                            <DiceRoll faces={6} result={<Clover size={24} className="text-ic-luck cursor-pointer" />} />
                                        </button>
                                        <button title={"Spend a Luck to re-roll"} onClick={() => handleLuckReroll()}>
                                            <DiceRoll faces={20} result={<Clover size={24} className="text-ic-luck cursor-pointer" />} />
                                        </button>
                                    </>}
                                    {studied > 0 &&
                                        <button title={"Spend a Studied die to add Favor"} onClick={() => handleStudiedD6()}>
                                            <DiceRoll faces={6} result={<BookMarked size={24} className="text-ic-studied cursor-pointer" />} />
                                        </button>
                                    }
                                </div>
                            </div>
                        }
                    </div>
                </div>
            }

            {/* TARGET TOKENS ARRAY */}
            {liveTargetIds.length > 0 && (<>
                <Header title={'Targets'} />
                <TargetsDisplay targets={targets} />
            </>)}

            {/* DAMAGE DISPLAY */}
            {showDamage &&
                <div>
                    {!isFriendlySpell && <Header title={'Damage'} />}
                    {/* SPELL ATTACK INFO */}
                    {source?.system instanceof SpellDataModel ?
                        <SpellAttackInfoComponent
                            spell={source as Item & { system: SpellDataModel }}
                            delivery={attack.spellDelivery}
                            dmgRoll={attack.damageRollResult}
                        /> :
                        /* WEAPON ATTACK DAMAGE */
                        <div className="w-full">
                            <DamageRollsComponent result={attack.damageRollResult!} />
                            <div className="flex items-center justify-center">
                                <TotalDmgFooter total={
                                    <div className="flex gap-x-1 items-center">
                                        <p>{attack.damageRollResult?.total}</p>
                                        <DamageTypeIcon dmgType={attack.damageRollResult?.dmgType ?? ''} />
                                    </div>
                                } />
                            </div>
                        </div>
                    }
                </div>
            }
        </div>
    )
}

const AdversaryAttackComponent = ({ actor, attack }: { actor: Actor, attack: AdversaryAttack }) => {
    return (
        <div>
            Under construction...
        </div>
    )
}