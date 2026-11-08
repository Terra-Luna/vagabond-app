import { Eye, MessageSquareText } from "lucide-react"

import { SpellSelectionApp } from "../../../../../../../apps/hero-choices/spells/SpellSelectionApp"
import { getMiniCardsPref } from "../../../../../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { HeroDataModel } from "../../../../../../../model/actor/HeroDataModel"
import { FocusSpellUtil } from "../../../../../../../model/actor/util/FocusSpellUtil"
import { spellDamageBase } from "../../../../../../../model/item/character/SpellDataModel"
import type { RuleFlagSource } from "../../../../../../../rules/util/item-rules-util"
import { appLang } from "../../../../../../../util/lang"
import { getId } from "../../../../../../../util/model-util"
import { sendVagabondChatCard } from "../../../../../../chat/ChatCardSerializer"
import { UtilityButton } from "../../../../../../component/Button"
import { useContextMenu } from "../../../../../../component/ContextMenu"
import { DynamicGrid } from "../../../../../../component/DynamicGrid"
import { FocusBadge } from "../../../../../../component/FocusBadge"
import { FocusTooltipFooter } from "../../../../../../component/FocusTooltipFooter"
import { InfoIcon } from "../../../../../../component/InfoIcon"
import { SkillCard, SkillCardTitle } from "../../../../../../component/SkillCard"
import { useSpellcastingMenuContext } from "./SpellcastingMenuContext"

export const SpellsList = ({ hero }: { hero: HeroDataModel }) => {
  const { onCtxMenu, ContextMenu } = useContextMenu()
  const { setIsSpellcastingOpen, onSelectSpell, selectedSpellId } =
    useSpellcastingMenuContext()
  const useMiniCards = getMiniCardsPref(hero.parent.id)
  const focusInstances =
    (hero.statuses?.counters?.focus ?? 0) > 0
      ? FocusSpellUtil.instances(hero.parent)
      : []
  const focusesFor = (sp: any) =>
    focusInstances.filter(
      (it) => it.spell === sp._sourceId || it.spell === sp.parent.uuid,
    )
  const sortedSpells = [...hero.spells].sort((a, b) =>
    a.parent.name.localeCompare(b.parent.name),
  )

  return (
    <div>
      <DynamicGrid widthIncrement={useMiniCards ? 1 : 2}>
        {sortedSpells.map((sp: any) => {
          const focuses = focusesFor(sp)
          return (
            <div
              key={sp.parent.uuid}
              onContextMenu={(e) =>
                onCtxMenu(e, [
                  {
                    icon: Eye,
                    label: appLang.Spellcasting.focusAction,
                    action: () => {
                      const focus = hero.statuses?.counters?.focus ?? 0
                      const canReplace =
                        hero.maxFocus === 1 &&
                        FocusSpellUtil.instances(hero.parent).length > 0
                      if (focus >= hero.maxFocus && !canReplace) {
                        ui.notifications?.warn(
                          appLang.Spellcasting.maxFocusMessage,
                        )
                        return
                      }
                      FocusSpellUtil.add(
                        hero.parent,
                        sp._sourceId ?? sp.parent.uuid,
                        foundry.utils.randomID(),
                      )
                    },
                  },
                  {
                    icon: MessageSquareText,
                    label: appLang.ButtonActions.chat,
                    action: () =>
                      sendVagabondChatCard(hero, "AbilityChatCard", {
                        actorId: getId(hero),
                        img: sp.parent.img,
                        title: sp.parent.name,
                        subtitle: spellDamageBase(sp),
                        description: sp.description,
                      }),
                  },
                ])
              }
            >
              <div
                onClick={() => {
                  if (!hero.parent.isOwner) return
                  onSelectSpell(sp._sourceId)
                  setIsSpellcastingOpen(true)
                }}
                className={`${selectedSpellId === sp._sourceId ? "border-3 border-solid border-wealth-denom-label rounded-md" : ""} w-full`}
              >
                <SkillCard
                  actor={hero.parent}
                  img={sp.parent.img}
                  dmgType={sp.damageType}
                  title={
                    <SkillCardTitle text={sp.parent.name}>
                      {(sp.ruleFlags ?? []).map(
                        (source: RuleFlagSource, index: number) => (
                          <InfoIcon
                            key={`${source.rule}-${index}`}
                            className="mr-0.5"
                            title={source.rule || appLang.RulesEditor.itemFlags}
                            content={
                              <div>
                                {source.flags.map((flag) => (
                                  <div
                                    key={flag.key}
                                    className="text-sm text-text-primary italic"
                                  >{`${flag.key}: ${flag.value}`}</div>
                                ))}
                              </div>
                            }
                          />
                        ),
                      )}
                    </SkillCardTitle>
                  }
                  subtitles={[
                    {
                      label: appLang.HeroSheet.Magic.labelDmgBase,
                      value: appLang.DamageTypes[sp.damageType],
                    },
                  ]}
                  description={sp.description}
                  mini={useMiniCards}
                  interactiveTooltip={false}
                  tooltipFooter={
                    focuses.length > 0 ? (
                      <FocusTooltipFooter instances={focuses} />
                    ) : undefined
                  }
                  badge={
                    focuses.length > 0 ? (
                      <div className="flex items-center gap-1">
                        {focuses.map((focus) => (
                          <FocusBadge
                            key={focus.id}
                            size={24}
                            title={appLang.Spellcasting.focusDropTooltip}
                            onClick={(e) => {
                              e.stopPropagation()
                              FocusSpellUtil.drop(hero.parent, focus.id)
                            }}
                          />
                        ))}
                      </div>
                    ) : undefined
                  }
                />
              </div>
            </div>
          )
        })}
      </DynamicGrid>

      {hero.parent.isOwner && (
        <div className="flex justify-between items-end w-full h-full mt-1">
          <UtilityButton
            onClick={() =>
              new SpellSelectionApp(hero.parent).render({ force: true })
            }
          >
            {"Select Spells"}
          </UtilityButton>
        </div>
      )}

      <ContextMenu />
    </div>
  )
}
