import { MessageSquareText } from "lucide-react"

import { SpellSelectionApp } from "../../../../../../../apps/hero-choices/spells/SpellSelectionApp"
import { getMiniCardsPref } from "../../../../../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { HeroDataModel } from "../../../../../../../model/actor/HeroDataModel"
import { spellDamageBase } from "../../../../../../../model/item/character/SpellDataModel"
import { appLang } from "../../../../../../../utils/lang"
import { getId } from "../../../../../../../utils/modelUtil"
import { sendVagabondChatCard } from "../../../../../../chat/ChatCardSerializer"
import { PrimaryButton } from "../../../../../../component/Button"
import { useContextMenu } from "../../../../../../component/ContextMenu"
import { DynamicGrid } from "../../../../../../component/DynamicGrid"
import { SkillCard, SkillCardTitle } from "../../../../../../component/SkillCard"
import { useSpellcastingMenuContext } from "./SpellcastingMenuContext"

export const SpellsList = ({ hero }: { hero: HeroDataModel }) => {

    const { onCtxMenu, ContextMenu } = useContextMenu()
    const { setIsSpellcastingOpen, onSelectSpell, selectedSpellId } = useSpellcastingMenuContext()
    const useMiniCards = getMiniCardsPref(hero.parent.id)

    return (<div>
        <DynamicGrid widthIncrement={useMiniCards ? 1 : 2}>
            {hero.spells.sort((a, b) => a.parent.name.localeCompare(b.parent.name)).map((sp: any, index: number) => (
                <div key={index} onContextMenu={(e) => onCtxMenu(e, [
                    {
                        icon: MessageSquareText, label: appLang.ButtonActions.chat, action: () =>
                            sendVagabondChatCard(
                                hero,
                                "AbilityChatCard",
                                {
                                    actorId: getId(hero),
                                    img: sp.parent.img,
                                    title: sp.parent.name,
                                    subtitle: spellDamageBase(sp),
                                    description: sp.description
                                }
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

        <div className="flex justify-between items-end w-full h-full mt-1">
            {/* LAUCH SPELL SELECTION APP */}
            <PrimaryButton onClick={() => new SpellSelectionApp(hero.parent).render({ force: true })}>
                {'Select Spells'}
            </PrimaryButton>
        </div>

        <ContextMenu />

    </div>
    )
}