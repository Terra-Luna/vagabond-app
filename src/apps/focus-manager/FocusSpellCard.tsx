import { FocusUpkeep } from "../../combat/spellcasting/FocusUpkeep"
import type { FocusInstance } from "../../model/actor/util/FocusSpellUtil"
import { appLang } from "../../util/lang"
import { localizeString } from "../../util/locale-util"
import { FocusTooltipFooter } from "../../view/component/FocusTooltipFooter"
import { SkillCard, SkillCardTitle } from "../../view/component/SkillCard"

/** The Focused spell's compact card, whose tooltip explains this round's upkeep. */
export const FocusSpellCard = ({
  hero,
  instance,
}: {
  hero: Actor & { system: any }
  instance: FocusInstance
}) => {
  const spellItem = fromUuidSync(instance.spell as any) as any
  if (!spellItem) return null

  const spellName = instance.delivery?.spell.name ?? spellItem.name ?? ""
  const needsCheck = FocusUpkeep.needsCheck(hero, instance)
  const cost = FocusUpkeep.upkeepCost(instance)
  const tooltip = [
    localizeString(
      needsCheck
        ? appLang.Spellcasting.focusUpkeepDescription
        : appLang.Spellcasting.focusUpkeepDescriptionNoCheck,
      { spell: spellName, mana: String(cost) },
    ),
    needsCheck && appLang.Spellcasting.focusUpkeepPayTooltip,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className="flex-1 max-w-[50%] min-w-24 [&>span]:block [&>span]:min-w-0">
      <SkillCard
        actor={hero}
        img={spellItem.img ?? ""}
        dmgType={spellItem.system?.damageType}
        title={<SkillCardTitle text={spellItem.name} />}
        subtitles={[
          {
            label: appLang.HeroSheet.Magic.labelDmgBase,
            value: appLang.DamageTypes[spellItem.system?.damageType],
          },
        ]}
        description={spellItem.system?.description ?? ""}
        mini={true}
        tooltipFooter={
          <FocusTooltipFooter instances={[instance]} text={tooltip} />
        }
      />
    </div>
  )
}
