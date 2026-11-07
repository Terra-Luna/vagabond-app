import { BookMarked, Clover } from "lucide-react"
import { useCallback, useEffect, useMemo } from "react"

import { getAllowLateLuckStudy } from "../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { SpellDataModel } from "../../../model/item/character/SpellDataModel"
import { appLang } from "../../../util/lang"
import { getCanvasToken, getTokenImg } from "../../../util/model-util"
import { DamageRollsComponent } from "../../../view/chat/component/DamageRollsComponent"
import { TargetsDisplay } from "../../../view/chat/component/TargetsDisplay"
import { SkillCheckDiceComponent } from "../../../view/chat/SkillCheckChatCard"
import { EnrichedContent } from "../../../view/component/EnrichedContent"
import { ClearHeader, Divider, Header } from "../../../view/component/Header"
import { CardSubHeader } from "../../../view/component/SkillCard"
import { ItemPortraitComponent } from "../../../view/sheets/item/shared/ItemPortraitComponent"
import { HeroAttack } from "../../engine/HeroAttack"
import { serializeAttack } from "../../engine/util/attack-serializer"
import { TargetDisplayItem } from "../hooks"
import { ImbueButton, ImbuedDamageSections } from "./ImbueComponents"
import { InteractiveChatCardButton } from "./InteractiveChatCardButton"
import { SpellAttackInfoComponent } from "./SpellAttackInfoComponent"

export const HeroAttackComponent = ({
  actor,
  attack,
  source,
  setRevision,
}: {
  actor: Actor & { system: HeroDataModel }
  attack: HeroAttack
  source: Item | undefined
  setRevision: any
}) => {
  const hasPermission = game.user?.isActiveGM || game.user?.id === attack.userId
  const isFailure =
    attack.skillCheck?.result?.outcome === appLang.RollResult.failure
  const needsResourceUpdates =
    hasPermission && !attack.isResolved && (isFailure || attack.showCritChoices)

  useEffect(() => {
    if (!needsResourceUpdates) return

    const handleUpdate = () => setRevision((prev) => prev + 1)

    const hookActorId = Hooks.on(
      "updateActor",
      (updatedActor: any, changes: any) => {
        if (updatedActor.id !== actor.id) return

        if (
          foundry.utils.hasProperty(changes, "system.statuses.counters.luck") ||
          foundry.utils.hasProperty(changes, "system.statuses.counters.studied")
        ) {
          handleUpdate()
        }
      },
    )

    return () => {
      Hooks.off("updateActor", hookActorId)
    }
  }, [actor.id, needsResourceUpdates, setRevision])

  const luck = useMemo<number>(
    () => actor.system.statuses.counters.luck,
    [actor.system.statuses.counters.luck, setRevision],
  )
  const studied = useMemo<number>(
    () => actor.system.statuses.counters.studied,
    [actor.system.statuses.counters.studied, setRevision],
  )

  const isFriendlySpell = useMemo<boolean>(() => {
    return attack.spellDelivery != null && !attack.hasHostileTargets
  }, [attack, setRevision])

  const canUpdateSkillCheck = useMemo<boolean>(() => {
    const hasResources = luck > 0 || studied > 0
    return (
      hasPermission &&
      actor.isOwner &&
      !attack.isResolved &&
      !attack.isRerolled &&
      isFailure &&
      hasResources
    )
  }, [luck, studied, attack, actor.isOwner, setRevision])

  const targets = useMemo<TargetDisplayItem[]>(() => {
    return (attack.targetIds ?? [])
      .map((id) => {
        const canvasToken = getCanvasToken(id)
        return {
          id: id,
          src: getTokenImg(canvasToken),
          token: canvasToken,
        }
      })
      .filter((it) => it.src != null && it.src.length > 0)
  }, [attack.targetIds, setRevision])

  const handleLuckReroll = useCallback(async () => {
    if (!actor.isOwner) return
    await attack.rollSkillCheck(true)
    setRevision((prev) => prev + 1)
  }, [actor, attack])

  const handleLateD6 = useCallback(
    async (resource: "luck" | "studied", currentValue: number) => {
      if (!actor.isOwner) return
      await attack.addLateFavor(resource, currentValue)
      setRevision((prev) => prev + 1)
    },
    [actor, attack],
  )

  const addCritLuck = useCallback(async () => {
    await attack.addCritLuck()
    setRevision((prev) => prev + 1)
  }, [attack])

  const addCritDamage = useCallback(async () => {
    await attack.addCritDamage()
    setRevision((prev) => prev + 1)
  }, [attack])

  const addSpellFx = useCallback(async () => {
    await attack.addCritSpellFx()
    setRevision((prev) => prev + 1)
  }, [attack])

  return (
    <div>
      {/* SKILL CHECK */}
      {attack.showSkillCheck && (
        <div>
          <Header
            title={`${attack.isDefenseCheck ? "Defense" : `${attack.skillCheck!.result!.skillName}`} Check`}
            textLeft={true}
          />
          <CardSubHeader
            showRightBorder={false}
            values={[
              {
                label: appLang.Combat.difficulty,
                value: attack.skillCheck?.difficulty?.toString(),
              },
              {
                label: appLang.Combat.result,
                value: attack.skillCheck?.result?.outcome,
              },
            ]}
          />

          <div className="flex flex-col justify-center items-center">
            {
              <SkillCheckDiceComponent
                d20s={attack.skillCheck?.result?.d20s}
                d6s={attack.skillCheck?.result?.d6s}
                modifier={attack.skillCheck?.modifier}
                favHinder={attack.skillCheck?.favorHinder}
                bonusDice={[]}
              />
            }

            {/* CRIT CHOICE BUTTONS */}
            {attack.showCritChoices && (
              <div className="flex flex-col gap-1 mb-1 px-1 w-full text-center text-base font-normal [&_span:has(>button)]:flex-1 [&_button]:w-full [&_button]:whitespace-nowrap">
                <div className="flex gap-1 w-full">
                  {/* GAIN A LUCK */}
                  <InteractiveChatCardButton
                    label={appLang.Combat.plusLuck}
                    tooltip={appLang.Combat.gainLuckTooltip}
                    fn={addCritLuck}
                    borderClassName="border-2 border-solid border-ic-luck/66"
                  />
                  {/* ADD DAMAGE EQUAL TO SKILL'S STAT */}
                  {!attack.isEffectOnlySpellAttack &&
                    !attack.isDefenseCheck && (
                      <InteractiveChatCardButton
                        label={appLang.Combat.plusDamage}
                        tooltip={appLang.Combat.addDamageTooltip}
                        fn={addCritDamage}
                        borderClassName="border-2 border-solid border-destructive-action/66"
                      />
                    )}
                </div>
                {/* ADD SPELL'S CRIT FX */}
                {source?.system instanceof SpellDataModel &&
                  !attack.isEffectOnlySpellAttack &&
                  !attack.spellDelivery?.applyEffect && (
                    <div className="flex w-full">
                      <InteractiveChatCardButton
                        label={appLang.Combat.spellEffect}
                        tooltip={appLang.Combat.applySpellOnCritTooltip}
                        fn={addSpellFx}
                      />
                    </div>
                  )}
              </div>
            )}

            {/* SKILL CHECK AUGMENTATION BUTTONS */}
            {canUpdateSkillCheck &&
              (luck > 0 || (studied > 0 && getAllowLateLuckStudy())) && (
                <div className="flex flex-col w-full gap-2">
                  <Divider />
                  <div className="grid grid-cols-2 gap-1 w-full items-center text-base font-normal px-1 mb-2 [&>span]:min-w-0 [&>span:last-child:nth-child(odd)]:col-span-2 [&>span>button]:w-full">
                    {luck > 0 && (
                      <>
                        <InteractiveChatCardButton
                          icon={
                            <Clover size={18} className="text-ic-luck h-full" />
                          }
                          label={appLang.ItemSheet.reroll}
                          tooltip={appLang.AttackBuilder.spendLuckToReroll}
                          borderClassName="border-2 border-solid border-ic-luck/66"
                          fn={() => handleLuckReroll()}
                        />
                        {getAllowLateLuckStudy() &&
                          !attack.skillCheck?.isFavored && (
                            <InteractiveChatCardButton
                              icon={
                                <Clover
                                  size={18}
                                  className="text-ic-luck h-full"
                                />
                              }
                              label={appLang.AttackBuilder.plusFavor}
                              tooltip={
                                appLang.AttackBuilder.spendLuckToAddFavor
                              }
                              borderClassName="border-2 border-solid border-ic-luck/66"
                              fn={() => handleLateD6("luck", luck)}
                            />
                          )}
                      </>
                    )}
                    {studied > 0 &&
                      getAllowLateLuckStudy() &&
                      !attack.skillCheck?.isFavored && (
                        <InteractiveChatCardButton
                          icon={
                            <BookMarked
                              size={18}
                              className="text-ic-studied h-full"
                            />
                          }
                          label={appLang.AttackBuilder.plusFavor}
                          tooltip={appLang.AttackBuilder.spendStudyToAddFavor}
                          borderClassName="border-2 border-solid border-ic-studied/66"
                          fn={() => handleLateD6("studied", studied)}
                        />
                      )}
                    {!game.user?.isActiveGM && (
                      <InteractiveChatCardButton
                        label={appLang.ButtonActions.resolve}
                        tooltip={appLang.Combat.resolveWithoutUpdatesTooltip}
                        fn={async () => {
                          await attack.resolve(serializeAttack)
                          setRevision((prev) => prev + 1)
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* TARGET TOKENS ARRAY */}
      {attack.showTargets && !attack.isDefenseCheck && (
        <div className="flex">
          <div className="flex flex-col w-full">
            <TargetsDisplay
              targets={targets}
              onRemoveTarget={
                game.user?.isActiveGM && !attack.isResolved
                  ? async (index: number) => {
                      const id = targets[index]?.id
                      if (!id) return
                      await attack.removeTarget(id)
                      setRevision((prev) => prev + 1)
                    }
                  : undefined
              }
            />
          </div>
        </div>
      )}

      {/* DAMAGE DISPLAY */}
      {attack.showDamage && (
        <div>
          {/* HEALING HEADER */}
          {isFriendlySpell &&
            attack.damageRoll?.dmgType === "healing" &&
            (attack.damageRoll?.result?.total ?? 0) > 0 && (
              <ClearHeader title={"Healing"} />
            )}

          {/* DAMAGE OR DEFENSE HEADER */}
          {attack.damageRoll?.dmgType !== "healing" &&
            attack.damageRoll?.dmgType !== "none" &&
            (attack.damageRoll?.result?.total ?? 0) > 0 && (
              <ClearHeader
                title={`${attack.isDefenseCheck ? "Damage Reduction" : "Damage"}`}
              />
            )}

          {/* SPELL ATTACK INFO */}
          {attack.isSpellAttack ? (
            <SpellAttackInfoComponent
              spell={source as Item & { system: SpellDataModel }}
              delivery={attack.spellDelivery}
              dmgRoll={attack.damageRoll?.result}
              img={
                source && (
                  <ItemPortraitComponent
                    item={source}
                    size={32}
                    disableCtxMenu={true}
                  />
                )
              }
            />
          ) : (
            <div className="w-full">
              {/* WEAPON ATTACK DAMAGE */}
              <DamageRollsComponent attack={attack} />
            </div>
          )}

          {/* IMBUED SPELL DAMAGE (ONE SECTION PER IMBUING HERO) */}
          <ImbuedDamageSections attack={attack} />
        </div>
      )}

      {/* ALCHEMY ITEM DESCRIPTION */}
      {(source?.type as any) === "alchemical" &&
        (source as any)?.system?.description && (
          <div>
            <EnrichedContent
              content={(source as any).system.description}
              styleClasses="text-sm font-paradigm font-normal px-2"
            />
          </div>
        )}

      {/* IMBUE BUTTON FOR WEAPON ATTACKS */}
      <ImbueButton attack={attack} />
    </div>
  )
}
