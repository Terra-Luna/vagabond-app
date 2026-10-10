import { BookMarked, Clover } from "lucide-react"
import { useCallback, useEffect, useMemo } from "react"

import { SpellcastingApp } from "../../../apps/spellcasting/SpellcastingApp"
import { getAllowLateLuckStudy } from "../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { SpellDataModel } from "../../../model/item/character/SpellDataModel"
import { appLang } from "../../../utils/lang"
import { getCanvasToken, getTokenImg } from "../../../utils/modelUtil"
import { DamageRollsComponent } from "../../../view/chat/component/DamageRollsComponent"
import { TargetsDisplay } from "../../../view/chat/component/TargetsDisplay"
import { SkillCheckDiceComponent } from "../../../view/chat/SkillCheckChatCard"
import { TotalDmgFooter } from "../../../view/chat/TotalDamageFooter"
import { UtilityButton } from "../../../view/component/Button"
import { DamageTypeIcon } from "../../../view/component/DamageTypeIcon"
import { EnrichedContent } from "../../../view/component/EnrichedContent"
import { ClearHeader, Divider, Header } from "../../../view/component/Header"
import { CardSubHeader } from "../../../view/component/SkillCard"
import { ItemPortraitComponent } from "../../../view/sheets/item/shared/ItemPortraitComponent"
import { HeroAttack } from "../../engine/HeroAttack"
import { TargetDisplayItem, useLiveTargetSync } from "../../engine/usecase/LiveTargetSyncUseCase"
import { InteractiveChatCardButton } from "./InteractiveChatCardButton"
import { SpellAttackInfoComponent } from "./SpellAttackInfoComponent"

const hasOffensiveSpell = (actor: any): boolean =>
    !!actor?.system?.spells?.some(sp => sp.damageType !== 'none' && sp.damageType !== 'healing')

/**
 * The user's character if it has an offensive spell, otherwise (for the active GM)
 * the first controlled token's actor that does.
 */
const getImbueActor = (): (Actor & { system: HeroDataModel }) | undefined => {
    const character = game.user?.character
    if (hasOffensiveSpell(character)) return character as any
    if (!game.user?.isActiveGM) return undefined
    const controlled: any[] = game.canvas?.tokens?.controlled ?? []
    return controlled.map(token => token.actor).find(hasOffensiveSpell)
}

export const HeroAttackComponent = ({ actor, attack, source, setRevision }: {
    actor: Actor & { system: HeroDataModel }, attack: HeroAttack, source: Item | undefined, setRevision: any
}) => {
    const canImbue = !!getImbueActor()
    const hasPermission = game.user?.isActiveGM || game.user?.id === attack.userId
    const isFailure = attack.skillCheck?.result?.outcome === appLang.RollResult.failure
    const needsResourceUpdates = hasPermission && !attack.isResolved && (
        isFailure || attack.showCritChoices
    )

    useEffect(() => {
        if (!needsResourceUpdates) return

        const handleUpdate = () => setRevision(prev => prev + 1)

        const hookActorId = Hooks.on("updateActor", (updatedActor: any, changes: any) => {
            if (updatedActor.id !== actor.id) return

            if (foundry.utils.hasProperty(changes, "system.statuses.counters.luck") ||
                foundry.utils.hasProperty(changes, "system.statuses.counters.studied")) {
                handleUpdate()
            }
        })

        return () => {
            Hooks.off("updateActor", hookActorId)
        }
    }, [actor.id, needsResourceUpdates, setRevision])

    const luck = useMemo<number>(() => actor.system.statuses.counters.luck, [actor.system.statuses.counters.luck, setRevision])
    const studied = useMemo<number>(() => actor.system.statuses.counters.studied, [actor.system.statuses.counters.studied, setRevision])

    const isFriendlySpell = useMemo<boolean>(() => {
        return attack.spellDelivery != null && !attack.hasHostileTargets
    }, [attack, setRevision])

    const canUpdateSkillCheck = useMemo<boolean>(() => {
        const hasResources = luck > 0 || studied > 0
        return hasPermission && !attack.isResolved && !attack.isRerolled && isFailure && hasResources
    }, [luck, studied, attack, setRevision])

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
    }, [liveTargetIds, setRevision])

    const handleLuckReroll = useCallback(async () => {
        await attack.rollSkillCheck(true)
        setRevision(prev => prev + 1)
    }, [attack])

    const handleLateD6 = useCallback(async (resource: 'luck' | 'studied', currentValue: number) => {
        await attack.addLateFavor(resource, currentValue);
        setRevision(prev => prev + 1)
    }, [attack])

    const addCritLuck = useCallback(async () => {
        await attack.addCritLuck()
        setRevision(prev => prev + 1)
    }, [attack])

    const addCritDamage = useCallback(async () => {
        await attack.addCritDamage()
        setRevision(prev => prev + 1)
    }, [attack])

    const addSpellFx = useCallback(async () => {
        await attack.addCritSpellFx()
        setRevision(prev => prev + 1)
    }, [attack])

    return (
        <div>
            {/* TARGET TOKENS ARRAY */}
            {attack.showTargets && !attack.isDefenseCheck &&
                <div className="flex">
                    <div className="flex flex-col w-full">
                        <TargetsDisplay targets={targets} />
                    </div>
                </div>
            }

            {/* SKILL CHECK */}
            {attack.showSkillCheck &&
                <div>
                    <Header title={`${attack.isDefenseCheck ? "Defense" : `${attack.skillCheck!.result!.skillName}`} Check`} textLeft={true} />
                    <CardSubHeader showRightBorder={false} values={[
                        { label: appLang.Combat.difficulty, value: attack.skillCheck?.difficulty?.toString() },
                        { label: appLang.Combat.result, value: attack.skillCheck?.result?.outcome }
                    ]} />

                    <div className="flex flex-col justify-center items-center">
                        {<SkillCheckDiceComponent
                            d20s={attack.skillCheck?.result?.d20s}
                            d6s={attack.skillCheck?.result?.d6s}
                            modifier={attack.skillCheck?.modifier}
                            favHinder={attack.skillCheck?.favorHinder}
                            bonusDice={[]}
                        />}

                        {/* CRIT CHOICE BUTTONS */}
                        {attack.showCritChoices &&
                            <div className="flex wrap gap-1 mb-1 justify-center text-center text-base font-normal content-center">
                                {/* GAIN A LUCK */}
                                <InteractiveChatCardButton label={appLang.Combat.plusLuck} tooltip={appLang.Combat.gainLuckTooltip} fn={addCritLuck} />
                                {/* ADD DAMAGE EQUAL TO SKILL'S STAT */}
                                {!attack.isEffectOnlySpellAttack && !attack.isDefenseCheck &&
                                    <InteractiveChatCardButton label={appLang.Combat.plusDamage} tooltip={appLang.Combat.addDamageTooltip} fn={addCritDamage} />
                                }
                                {/* ADD SPELL'S CRIT FX */}
                                {source?.system instanceof SpellDataModel && !attack.isEffectOnlySpellAttack &&
                                    <InteractiveChatCardButton label={appLang.Combat.spellEffect} tooltip={appLang.Combat.applySpellOnCritTooltip} fn={addSpellFx} />
                                }
                            </div>
                        }

                        {/* SKILL CHECK AUGMENTATION BUTTONS */}
                        {canUpdateSkillCheck && (luck > 0 || (studied > 0 && getAllowLateLuckStudy())) &&
                            <div className="flex flex-col w-full gap-2">
                                <Divider />
                                <div className="flex gap-x-1 items-center justify-center text-base font-normal px-4 mb-2">
                                    {luck > 0 && <>
                                        <InteractiveChatCardButton
                                            icon={<Clover size={18} className="text-ic-luck h-full" />}
                                            label={appLang.ItemSheet.reroll} tooltip={appLang.AttackBuilder.spendLuckToReroll}
                                            fn={() => handleLuckReroll()}
                                        />
                                        {getAllowLateLuckStudy() &&
                                            <InteractiveChatCardButton
                                                icon={<Clover size={18} className="text-ic-luck h-full" />}
                                                label={appLang.AttackBuilder.plusFavor} tooltip={appLang.AttackBuilder.spendLuckToAddFavor}
                                                fn={() => handleLateD6('luck', luck)}
                                            />}
                                    </>}
                                    {studied > 0 && getAllowLateLuckStudy() &&
                                        <InteractiveChatCardButton
                                            icon={<BookMarked size={18} className="text-ic-studied h-full" />}
                                            label={appLang.AttackBuilder.plusFavor} tooltip={appLang.AttackBuilder.spendStudyToAddFavor}
                                            fn={() => handleLateD6('studied', studied)}
                                        />
                                    }
                                </div>
                            </div>
                        }
                    </div>
                </div>
            }

            {/* DAMAGE DISPLAY */}
            {attack.showDamage &&
                <div>
                    {/* HEALING HEADER */}
                    {isFriendlySpell && attack.damageRoll?.dmgType === "healing" && (attack.damageRoll?.result?.total ?? 0) > 0 &&
                        <ClearHeader title={"Healing"} />
                    }

                    {/* DAMAGE OR DEFENSE HEADER */}
                    {attack.damageRoll?.dmgType !== "healing" && attack.damageRoll?.dmgType !== "none" && (attack.damageRoll?.result?.total ?? 0) > 0 &&
                        <ClearHeader title={`${attack.isDefenseCheck ? 'Damage Reduction' : 'Damage'}`} />
                    }

                    {/* SPELL ATTACK INFO */}
                    {attack.isSpellAttack
                        ? <SpellAttackInfoComponent
                            spell={source as Item & { system: SpellDataModel }}
                            delivery={attack.spellDelivery}
                            dmgRoll={attack.damageRoll?.result}
                            img={source && <ItemPortraitComponent item={source} size={32} disableCtxMenu={true} />}
                        />
                        : <div className="w-full">
                            {/* WEAPON ATTACK DAMAGE */}
                            <DamageRollsComponent result={attack.damageRoll!.result!} />
                            {/* IMBUE BUTTON FOR WEAPON ATTACKS */}
                            {!attack.isResolved && !attack.isDefenseCheck && canImbue &&
                                <div className="flex items-center justify-center mb-1">
                                    <UtilityButton title={appLang.Combat.imbueAttack} onClick={() =>
                                        new SpellcastingApp(getImbueActor(), true).render({ force: true })
                                    }>
                                        Imbue
                                    </UtilityButton>
                                </div>
                            }
                            <div className="flex items-center justify-center">
                                {source && <ItemPortraitComponent item={source} size={32} disableCtxMenu={true} />}
                                <TotalDmgFooter total={
                                    <div className="flex gap-x-1 items-center">
                                        <p>{attack.damageRoll?.result?.total}</p>
                                        <DamageTypeIcon dmgType={attack.isDefenseCheck ? 'defense' : attack.damageRoll?.result?.dmgType ?? ''} />
                                    </div>
                                } />
                            </div>
                        </div>
                    }
                </div>
            }

            {/* ALCHEMY ITEM DESCRIPTION */}
            {(source?.type as any) === 'alchemical' && (source as any)?.system?.description &&
                <div>
                    <EnrichedContent content={(source as any).system.description} styleClasses="text-sm font-paradigm font-normal px-2" />
                </div>
            }
        </div>
    )
}
