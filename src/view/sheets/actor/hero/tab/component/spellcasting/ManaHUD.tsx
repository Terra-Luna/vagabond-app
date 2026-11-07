import { Sparkle, Sparkles, X } from "lucide-react"
import { useCallback } from "react"

import { FocusManagerApp } from "../../../../../../../apps/focus-manager/FocusManagerApp"
import { HeroDataModel } from "../../../../../../../model/actor/HeroDataModel"
import { FocusSpellUtil } from "../../../../../../../model/actor/util/FocusSpellUtil"
import { ItemsCache } from "../../../../../../../rules/util/ItemsCache"
import { updateDocument } from "../../../../../../../util/foundry-util"
import { appLang } from "../../../../../../../util/lang"
import { useContextMenu } from "../../../../../../component/ContextMenu"
import { DamageTypeIcon } from "../../../../../../component/DamageTypeIcon"
import { EditableTextField } from "../../../../../../component/EditableTextField"
import { FocusBadge } from "../../../../../../component/FocusBadge"
import { SkillCard, SkillCardTitle } from "../../../../../../component/SkillCard"
import { Tooltip } from "../../../../../../component/Tooltip"
import { useSpellcastingMenuContext } from "./SpellcastingMenuContext"

export const ManaHUD = ({
  hero,
  isCastMenuOpen = false,
  hideTab = false,
}: {
  hero: HeroDataModel
  isCastMenuOpen?: boolean
  hideTab?: boolean
}) => {
  const { onCtxMenu, ContextMenu } = useContextMenu()
  const mana = hero.mana.value
  const focusUsed = Math.min(hero.statuses?.counters?.focus ?? 0, hero.maxFocus)
  const updateMana = useCallback(
    (auxClick: boolean) => {
      updateDocument(hero.parent, {
        mana: { value: (mana ?? 0) + (auxClick ? 1 : -1) },
      })
    },
    [mana],
  )

  const {
    isSpellcastingOpen,
    setIsSpellcastingOpen,
    SpellcastingMenu,
    selectedSpellId,
  } = useSpellcastingMenuContext()
  const spell = ItemsCache.spells().find((s) => s.uuid === selectedSpellId)

  return (
    <div>
      <div
        className={`flex gap-x-2 text-2xl font-eskapade font-bold mt-0.5 mb-1 justify-between`}
      >
        {hideTab && spell && (
          <div className="-ml-0.5 -mt-0.5 min-w-0 flex-1 [&>span]:block [&>span]:min-w-0">
            <SkillCard
              actor={hero.parent}
              img={spell.img ?? ""}
              dmgType={spell.system.damageType}
              title={<SkillCardTitle text={spell.name} />}
              subtitles={[
                {
                  label: appLang.HeroSheet.Magic.labelDmgBase,
                  value: appLang.DamageTypes[spell.system.damageType],
                },
              ]}
              description={spell.system.description}
              mini={true}
            />
          </div>
        )}

        {/* CURRENT MANA */}
        <div
          className={`flex items-center gap-x-4 ml-auto shrink-0 ${hideTab ? "px-2" : ""}`}
        >
          <div className="flex gap-x-1 items-center">
            {/* <SpellcastingLabel text={appLang.HeroSheet.Magic.labelMana} /> */}
            <Tooltip
              title={appLang.HeroSheet.Magic.labelMana}
              content={`Current / Max${appLang.HeroSheet.counter_tooltip}`}
            >
              <Sparkle
                className={`text-mana mr-1 hover-glow`}
                size={20}
                onClick={() => updateMana(false)}
                onAuxClick={() => updateMana(true)}
              />
            </Tooltip>
            <span className="text-mana">
              <EditableTextField
                boundValue={hero.mana.value?.toString() ?? ""}
                updateProps={{ object: hero.parent, path: ["mana", "value"] }}
                placeholder="0"
                hideBorderOnEditMode={true}
              />
            </span>
            <p>/</p>
            <p>{hero.mana.max}</p>
          </div>

          {/* MAX MANA / CAST */}
          <Tooltip
            title={appLang.HeroSheet.Magic.labelCastMax}
            content={`Maximum mana allowed per-cast.`}
          >
            <div className="flex gap-x-1 items-center">
              <Sparkles size={20} className="text-mana" />
              <p>{hero.mana.maxCast}</p>
            </div>
          </Tooltip>

          {/* FOCUS */}
          {hero.maxFocus > 0 && (
            <Tooltip
              title={appLang.StatusConditions.focusing.name}
              content={`${focusUsed} / ${hero.maxFocus}`}
            >
              <div
                className={`flex gap-x-1 items-center ${hero.parent.isOwner ? "hover-glow cursor-pointer" : ""}`}
                onClick={() => {
                  if (hero.parent.isOwner)
                    FocusManagerApp.launch(hero.parent as any)
                }}
                onContextMenu={(e) =>
                  hero.parent.isOwner &&
                  onCtxMenu(e, [
                    {
                      icon: X,
                      label: appLang.Spellcasting.focusClearAll,
                      isDestructive: true,
                      action: () => FocusSpellUtil.clearAll(hero.parent),
                    },
                  ])
                }
              >
                <FocusBadge
                  size={20}
                  className={
                    focusUsed > 0
                      ? "text-text-header-secondary"
                      : "text-text-tertiary"
                  }
                />
                {hero.maxFocus > 1 && (
                  <div className="flex flex-col items-center text-sm leading-none">
                    <span>{focusUsed}</span>
                    <span className="block self-stretch h-px bg-current my-px" />
                    <span>{hero.maxFocus}</span>
                  </div>
                )}
              </div>
            </Tooltip>
          )}
        </div>

        {/* SPELLCASTING TAB */}
        {hero.parent.isOwner && !isCastMenuOpen && !hideTab && (
          <div
            className={`
                            flex items-center gap-x-1 -mb-1 pl-6 pr-2 
                            bg-context-menu-fill hover-glow
                            [clip-path:polygon(100%_0,100%_100%,0_100%,30%_0)]
                        `}
            onClick={() => {
              setIsSpellcastingOpen(!isSpellcastingOpen)
            }}
          >
            {!isSpellcastingOpen ? (
              <>
                <DamageTypeIcon dmgType="magical" size={16} />
                <p className="text-base">{appLang.HeroSheet.Magic.btnCast}</p>
              </>
            ) : (
              <>
                <X size={14} />
                <p className="text-base">{appLang.ButtonActions.close}</p>
              </>
            )}
          </div>
        )}
      </div>

      {hero.parent.isOwner && <SpellcastingMenu />}
      <ContextMenu />
    </div>
  )
}
