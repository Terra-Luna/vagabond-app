import { Sparkle, Sparkles } from "lucide-react"
import { ReactNode, useMemo } from "react"
import ReactHtmlParser from 'react-html-parser'

import { SpellDataModel } from "../../model/item/character/SpellDataModel"
import { appLang } from "../../utils/lang"
import { DamageRollsComponent } from "../../view/chat/component/DamageRollsComponent"
import { TotalDmgFooter } from "../../view/chat/DamageRollChatCard"
import { DamageTypeIcon } from "../../view/component/DamageTypeIcon"
import { CardSubHeader, CardSubHeaderValues } from "../../view/component/SkillCard"
import { SpellcastingSubtext } from "../../view/sheets/actor/hero/tab/component/spellcasting/SpellcastingTypography"
import { DamageRollResult } from "../engine/roll/DamageRoll"

export const SpellAttackInfoComponent = ({ spell, delivery, dmgRoll = undefined, img }: {
    spell: Item & { system: SpellDataModel }, delivery: any, dmgRoll?: DamageRollResult | undefined, img?: ReactNode
}) => {
    const subtitle: CardSubHeaderValues[] = []
    if (delivery.damageDice > 0 && spell.system.damageType !== 'none') {
        subtitle.push({ label: appLang.HeroSheet.Magic.labelDmgBase, value: appLang.DamageTypes[spell.system.damageType] })
    }
    subtitle.push({ label: appLang.HeroSheet.Magic.labelMana, value: delivery.manaCost })

    const subheaders = useMemo(() => {
        const subs = [{ label: "Delivery", value: delivery.name }]
        if (delivery.isFocused) {
            subs.push({ label: appLang.HeroSheet.Magic.labelFocus, value: <Sparkle size={18} className="text-mana" /> })
        }
        if (delivery.applyEffect) {
            subs.push({ label: appLang.HeroSheet.Magic.labelEffect, value: <Sparkles size={18} className="text-mana" /> })
        }

        return subs
    }, [])

    return (
        <div>
            {
                dmgRoll && <div className="flex flex-col gap-1 justify-center">
                    <DamageRollsComponent result={dmgRoll} />
                    <div className="flex items-center justify-center">
                        {img && <div>{img}</div>}
                        <TotalDmgFooter total={
                            <div className="flex gap-x-1 items-center">
                                <p>{dmgRoll.total}</p>
                                <DamageTypeIcon dmgType={dmgRoll.dmgType} />
                            </div>
                        } />
                    </div>
                    <div>
                        <CardSubHeader showRightBorder={false} values={subheaders} />
                    </div>
                </div>
            }
            {delivery.applyEffect && <div className="flex px-1">
                <SpellcastingSubtext text={ReactHtmlParser(spell.system.description)} />
            </div>}
        </div>
    )
}