import { Sparkle, Sparkles } from "lucide-react"
import { ReactNode, useMemo } from "react"
import ReactHtmlParser from "react-html-parser"

import { SpellDataModel } from "../../../model/item/character/SpellDataModel"
import { appLang } from "../../../util/lang"
import { DamageRollsComponent } from "../../../view/chat/component/DamageRollsComponent"
import { CardSubHeader, CardSubHeaderValues } from "../../../view/component/SkillCard"
import { DamageRollResult } from "../../engine/roll/DamageRoll"

export const SpellAttackInfoComponent = ({
  spell,
  delivery,
  dmgRoll = undefined,
  img,
}: {
  spell?: Item & { system: SpellDataModel }
  delivery: any
  dmgRoll?: DamageRollResult | undefined
  img?: ReactNode
}) => {
  const subtitle: CardSubHeaderValues[] = []

  if (
    delivery.damageDice > 0 &&
    spell?.system?.damageType &&
    spell.system.damageType !== "none"
  ) {
    subtitle.push({
      label: appLang.HeroSheet.Magic.labelDmgBase,
      value: appLang.DamageTypes[spell.system.damageType],
    })
  }
  subtitle.push({
    label: appLang.HeroSheet.Magic.labelMana,
    value: delivery.manaCost,
  })

  const subheaders = useMemo(() => {
    const subs = [
      {
        label: appLang.Spellcasting.deliveryAbbreviation,
        value: delivery.name,
      },
    ]
    if (delivery.isFocused) {
      subs.push({
        label: appLang.HeroSheet.Magic.labelFocus,
        value: <Sparkle size={14} className="text-mana" />,
      })
    }
    if (delivery.applyEffect) {
      subs.push({
        label: appLang.Spellcasting.effectAbbreviation,
        value: <Sparkles size={14} className="text-mana" />,
      })
    }

    return subs
  }, [])

  return (
    <div>
      {dmgRoll && (
        <div className="flex flex-col gap-1 justify-center">
          {img && <div className="flex justify-center">{img}</div>}
          <DamageRollsComponent attack={{ damageRoll: { result: dmgRoll } }} />
          <div>
            <CardSubHeader showRightBorder={false} values={subheaders} />
          </div>
        </div>
      )}
      {delivery.applyEffect && (
        <div className="px-1 max-h-20 overflow-y-auto text-sm text-text-secondary font-eskapade font-normal">
          {ReactHtmlParser(spell?.system?.description)}
        </div>
      )}
    </div>
  )
}
