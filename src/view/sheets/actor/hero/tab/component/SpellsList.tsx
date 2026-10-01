import { MessageSquareText, Wand2 } from "lucide-react"

import { getMiniCardsPref } from "../../../../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { HeroDataModel } from "../../../../../../model/actor/HeroDataModel"
import { spellDamageBase } from "../../../../../../model/item/character/SpellDataModel"
import { appLang } from "../../../../../../utils/lang"
import { getId } from "../../../../../../utils/modelUtil"
import { AbilityChatCard } from "../../../../../chat/AbilityChatCard"
import { sendVagabondChatMessage } from "../../../../../chat/ChatCardSerializer"
import { useContextMenu } from "../../../../../component/ContextMenu"
import { DynamicGrid } from "../../../../../component/DynamicGrid"
import { SkillCard, SkillCardTitle } from "../../../../../component/SkillCard"
import { useSpellcastingMenuContext } from "./spellcasting/SpellcastingMenuContext"

export const SpellsList = ({ hero }: { hero: HeroDataModel }) => {

    const { onCtxMenu, ContextMenu } = useContextMenu()
    const { setIsSpellcastingOpen, onSelectSpell, selectedSpellId } = useSpellcastingMenuContext()
    const useMiniCards = getMiniCardsPref(hero.parent.id)

    return (<div>
        <DynamicGrid wideMode={!useMiniCards}>
            {hero.spells.sort((a, b) => a.parent.name.localeCompare(b.parent.name)).map((sp: any, index: number) => (
                <div key={index} onContextMenu={(e) => onCtxMenu(e, [
                    {
                        icon: Wand2, label: appLang.HeroSheet.Magic.btnCast, action: () => {
                            onSelectSpell(sp._sourceId)
                            setIsSpellcastingOpen(true)
                        }
                    },
                    {
                        icon: MessageSquareText, label: appLang.ButtonActions.chat, action: () =>
                            sendVagabondChatMessage(
                                hero,
                                <AbilityChatCard
                                    actorId={getId(hero)}
                                    img={sp.parent.img}
                                    title={sp.parent.name}
                                    subtitle={spellDamageBase(sp)}
                                    description={sp.description}
                                />
                            )
                    }
                ])}>
                    <div onClick={() => {
                        onSelectSpell(sp._sourceId)
                        setIsSpellcastingOpen(true)
                    }} className={`${selectedSpellId === sp._sourceId ? 'border-3 border-solid border-wealth-denom-label rounded-md' : ''} w-full`}>
                        <SkillCard
                            actor={hero.parent}
                            img={sp.parent.img}
                            dmgType={sp.damageType}
                            title={<SkillCardTitle text={sp.parent.name} />}
                            subtitles={[
                                { label: appLang.HeroSheet.Magic.labelDmgBase, value: appLang.DamageTypes[sp.damageType] }
                            ]}
                            description={sp.description}
                            mini={useMiniCards}
                        />
                    </div>
                </div>
            ))}
        </DynamicGrid>

        <ContextMenu />

    </div>
    )
}