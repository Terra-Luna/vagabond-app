import { vgLiteLang } from "../../utils/lang"
import ReactHtmlParser from 'react-html-parser'
import { CardSubHeader, CardSubHeaderValues } from "../../view/component/SkillCard"
import { SpellcastingLabel, SpellcastingSubtext } from "../../view/sheets/actor/hero/tab/component/spellcasting/SpellcastingTypography"
import { DamageRollsComponent } from "../../view/chat/component/DamageRollsComponent"
import { TotalDmgFooter } from "../../view/chat/DamageRollChatCard"
import { SpellDataModel } from "../../model/item/character/SpellDataModel"
import { Sparkle } from "lucide-react"
import { DamageRollResult } from "../engine/DamageRoll"
import { DamageTypeIcon } from "../../view/component/DamageTypeIcon"
import { useMemo } from "react"

export const SpellAttackInfoComponent = ({ spell, delivery, dmgRoll = undefined }: {
    spell: Item & { system: SpellDataModel }, delivery: any, dmgRoll?: DamageRollResult | undefined
}) => {
    const subtitle: CardSubHeaderValues[] = []
    if (delivery.damageDice > 0 && spell.system.damageType !== 'none') {
        subtitle.push({ label: vgLiteLang.HeroSheet.Magic.labelDmgBase, value: vgLiteLang.DamageTypes[spell.system.damageType] })
    }
    subtitle.push({ label: vgLiteLang.HeroSheet.Magic.labelMana, value: delivery.manaCost })

    const subheaders = useMemo(() => {
        const subs = [{ label: "Delivery", value: delivery.name }]
        if (delivery.isFocused) {
            subs.push({ label: vgLiteLang.HeroSheet.Magic.labelFocus, value: <Sparkle size={18} className="text-mana" /> })
        }
        return subs
    }, [])

    return (
        <div>
            {
                dmgRoll && <>
                    <CardSubHeader showRightBorder={false} values={subheaders} /> 
                    <DamageRollsComponent result={dmgRoll} />
                    <TotalDmgFooter total={
                        <div className="flex gap-x-1 items-center">
                            <p>{dmgRoll.total}</p>
                            <DamageTypeIcon dmgType={dmgRoll.dmgType} />
                        </div>
                    } />
                </>
            }
            {delivery.applyEffect && <>
                <SpellcastingLabel text={`${vgLiteLang.HeroSheet.Magic.labelEffect}:`} />
                <SpellcastingSubtext text={ReactHtmlParser(spell.system.description)} />
            </>}
        </div>
    )
}