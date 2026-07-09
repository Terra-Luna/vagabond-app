import { DamageRollResult } from "../../combat/dice-rolls"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../utils/lang"
import { getCanvasToken, getTokenImg } from "../../utils/modelUtil"
import ReactHtmlParser from 'react-html-parser'
import { CardSubHeaderValues } from "../component/SkillCard"
import { SpellcastingLabel, SpellcastingSubtext } from "../sheets/actor/hero/tab/component/spellcasting/SpellcastingTypography"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"
import { DamageRolls } from "./component/DamageRolls"
import { TargetsDisplay } from "./component/TargetsDisplay"
import { TotalDmgFooter } from "./DamageRollChatCard"
import { SpellDataModel } from "../../model/item/character/SpellDataModel"
import { Sparkle } from "lucide-react"
import { useState, useCallback } from "react"

export const SpellCastChatCard = ({ heroId, spell, delivery, dmgRoll = undefined }: {
    heroId: string, spell: Item & { system: SpellDataModel }, delivery: any, dmgRoll?: DamageRollResult | undefined
}) => {
    const actor = game.actors?.get(heroId) as Actor & { system: HeroDataModel }
    
    const subtitle: CardSubHeaderValues[] = []
    if (delivery.damageDice > 0 && spell.system.damageType !== 'none') {
        subtitle.push({ label: vgLiteLang.HeroSheet.Magic.labelDmgBase, value: vgLiteLang.DamageTypes[spell.system.damageType] })
    }

    const [targets, setTargets] = useState(delivery.targetTokenIds.map(id => (
        { id: id, src: getTokenImg(getCanvasToken(id)), token: getCanvasToken(id) }
    )).filter(it => it.src != null && it.src.length > 0))

    const onRemoveTarget = useCallback((targetIndex) => {
        setTargets(targets.filter((_, i) => i !== targetIndex))
    }, [targets])

    return (
        <BaseChatCardHost
            banner={<ChatCardBanner
                tokenId={actor?.getActiveTokens()[0]?.id}
                portrait={getTokenImg(actor)}
                title={spell.name}
                subtitle={subtitle}
            />}
            contents={
                <div>
                    <TargetsDisplay targets={targets} onRemoveTarget={onRemoveTarget} />
                    {
                        dmgRoll ? <>
                            <DamageRolls result={dmgRoll} />
                            <TotalDmgFooter total={dmgRoll.total} dmgType={spell.system.damageType} targets={targets} /></> :
                            <></>
                    }
                    <div className="flex gap-x-1 items-center mt-1">
                        <SpellcastingLabel text={`${vgLiteLang.HeroSheet.Magic.labelDelivery}:`} />
                        <p className="font-normal">{delivery.name}</p>
                    </div>
                    {
                        delivery.isFocused ? 
                            <div className="flex gap-x-1 items-center">
                                <SpellcastingLabel text={`${vgLiteLang.HeroSheet.Magic.labelFocus}:`} />
                                <Sparkle size={18} className="text-mana" />
                            </div> : <></>
                    }
                    {
                        delivery.applyEffect ?
                            <div>
                                <SpellcastingLabel text={`${vgLiteLang.HeroSheet.Magic.labelEffect}:`} />
                                <SpellcastingSubtext text={ReactHtmlParser(spell.system.description)} />
                            </div> : <></>
                    }
                </div>
            }
        />
    )
}