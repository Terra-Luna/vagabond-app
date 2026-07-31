import { useCallback, useMemo } from "react"
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
import { PrimaryButton, SecondaryButton } from "../../view/component/Button"
import { ItemPortraitComponent } from "../../view/sheets/item/shared/ItemPortraitComponent"

export const InteractiveAttackChatCard = ({ actorId, attackId }: { actorId: string, attackId: string }) => {
    const actor = useMemo(() => getCanvasToken(actorId)?.actor ?? game.actors?.get(actorId), [actorId])

    const snapshot = useMemo(() => {
        const attacks = actor?.getFlag("vagabond-lite" as any, "attacks") as any[] ?? []
        const match = attacks.find(atk => atk.id === attackId)
        return match ? foundry.utils.deepClone(match) : null
    }, [actor])

    const attack = useMemo(() => {
        return snapshot ? deserializeAttack(snapshot) : null
    }, [actor, snapshot])

    const source = useMemo<Item | undefined>(() => {
        if (attack instanceof HeroAttack && attack.sourceId) {
            const item = ItemsCache.allItems().find(it => it.uuid === attack.sourceId)
            return item
        }
    }, [attack])

    return (
        <div>
            {actor && attack && <BaseChatCardHost
                banner={
                    <ChatCardBanner
                        tokenId={actor?.getActiveTokens()[0]?.id}
                        portrait={getTokenImg(actor)}
                        title={
                            <div className="flex gap-x-1 items-center">
                                {source && <ItemPortraitComponent item={source} size={32} />}
                                {attack.title}
                            </div>
                        }
                    />}
                contents={
                    <div>
                        {/* ATTACK CONTENT BY CHARACTER TYPE */}
                        {attack instanceof HeroAttack && <HeroAttackComponent actor={actor as Actor & { system: HeroDataModel }} attack={attack} source={source} />}
                        {attack instanceof AdversaryAttack && <AdversaryAttackComponent actor={actor} attack={attack} />}

                        {/* GM TOOLS */}
                        {(game.user?.isGM && !attack.isResolved) &&
                            <div className="mt-0.5">
                                <Header title={"GM Tools"} />
                                <div className="flex gap-x-1 justify-center items-center mt-0.5">
                                    <PrimaryButton onClick={async () => await attack.resolve(serializeAttack)}>
                                        Resolve
                                    </PrimaryButton>
                                </div>
                            </div>
                        }
                    </div>}
                />
            }
        </div>
    )
}

const HeroAttackComponent = ({ actor, attack, source }: { actor: Actor & { system: HeroDataModel }, attack: HeroAttack, source: Item | undefined }) => {
    const luck = useMemo<number>(() => actor.system.statuses.counters.luck, [actor.system.statuses.counters.luck])
    const isMaxLuck = useMemo<boolean>(() => luck === actor.system.stats.luck, [luck])
    const studied = useMemo<number>(() => actor.system.statuses.counters.studied, [actor.system.statuses.counters.studied])

    const isFriendlySpell = useMemo<boolean>(() => {
        return attack.spellDelivery != null && !attack.hasHostileTargets()
    }, [attack])

    const showDamage = useMemo<boolean>(() => {
        const hasDamageRoll = attack.damageRollResult != null
        return hasDamageRoll || isFriendlySpell
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

    const handleLuckyD6 = useCallback(async () => {
        await actor.update({ 'system.statuses.counters.luck': luck - 1 } as Record<string, number>, { ['skipTrackerChatCard' as string]: true })
        await attack.addLateFavor()
    }, [luck, attack])

    const handleLuckReroll = useCallback(async () => {
        await actor.update({ 'system.statuses.counters.luck': luck - 1 } as Record<string, number>, { ['skipTrackerChatCard' as string]: true })
        await attack.rollSkillCheck(true)
    }, [luck, attack])

    const handleStudiedD6 = useCallback(async () => {
        await actor.update({ 'system.statuses.counters.studied': studied - 1 } as Record<string, number>, { ['skipTrackerChatCard' as string]: true })
        await attack.addLateFavor()
    }, [studied, attack])

    const addCritLuck = useCallback(async () => {
        await attack.addCritLuck()
    }, [luck])

    const addCritDamage = useCallback(async () => {
        await attack.addCritDamage()
    }, [])

    const addSpellFx = useCallback(async () => {
        await attack.addCritSpellFx()
    }, [])

    return (
        <div>
            {/* SKILL CHECK */}
            {attack.showSkillCheck &&
                <div>
                    <Header title={`${attack.skillCheckResult!.skillName} Check`} textLeft={true} />
                    <CardSubHeader showRightBorder={false} values={[
                        { label: "Difficulty", value: attack.skillCheckResult!.difficulty.toString() },
                        { label: "Result", value: attack.skillCheckResult!.outcome }
                    ]} /> 
                    <div className="flex flex-col justify-center items-center">
                        <SkillCheckDiceComponent
                            d20={attack.skillCheckResult!.d20}
                            d6={attack.skillCheckResult!.d6}
                            favHinder={attack.skillCheckResult!.favorHinder}
                        />

                        {/* CRIT CHOICE BUTTONS */}
                        {attack.showCritChoices &&
                            <div className="flex wrap gap-1 mb-1 justify-center text-center content-center">
                                {/* GAIN A LUCK */}
                                {!isMaxLuck && <SecondaryButton onClick={addCritLuck}>+1 Luck</SecondaryButton>}
                                {/* ADD DAMAGE EQUAL TO SKILL'S STAT */}
                                <SecondaryButton onClick={addCritDamage}>+Damage</SecondaryButton>
                                {/* ADD SPELL'S CRIT FX */}
                                {source?.system instanceof SpellDataModel &&
                                    <SecondaryButton onClick={addSpellFx}>Spell Crit Eff.</SecondaryButton>
                                }
                            </div>
                        }

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
            {
                attack.showTargets && (<>
                <Header title={'Targets'} />
                <TargetsDisplay targets={targets} />
            </>)}

            {/* DAMAGE DISPLAY */}
            {
                attack.showDamage &&
                <div>
                    {/* HIDE THE DAMAGE HEADER IF IT WAS HEALING OR FRIENDLY FX ONLY */}
                    {!isFriendlySpell && <Header title={'Damage'} />}

                    {/* SPELL ATTACK INFO */}
                    {source?.system instanceof SpellDataModel ?
                        <SpellAttackInfoComponent
                            spell={source as Item & { system: SpellDataModel }}
                            delivery={attack.spellDelivery}
                            dmgRoll={attack.damageRollResult}
                        /> :
                        <div className="w-full">
                            {/* WEAPON ATTACK DAMAGE */}
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