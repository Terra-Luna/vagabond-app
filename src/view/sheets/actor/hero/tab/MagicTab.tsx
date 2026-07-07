import { MessageSquareText, Sparkle, Sparkles, Trash } from "lucide-react"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { EditableTextField } from "../../../../component/EditableTextField"
import { SkillCard } from "../../../../component/SkillCard"
import { DamageTypeIcon } from "../../../../component/DamageTypeIcon"
import { useCallback } from "react"
import { updateDocument } from "../../../../../utils/documentUtils"
import { getId } from "../../../../../utils/modelUtil"
import { SecondaryButton } from "../../../../component/Button"
import { useContextMenu } from "../../../../component/ContextMenu"
import { AbilityChatCard } from "../../../../chat/AbilityChatCard"
import { glowOnHover } from "../../../../common/text-styles"
import { vgLiteLang } from "../../../../../utils/lang"
import { spellDamageBase } from "../../../../../model/item/character/SpellDataModel"
import { sendVgLiteChatMessage } from "../../../../chat/ChatCardSerializer"

export const MagicTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div>
            <ManaDisplay hero={hero} />
            <Spells hero={hero} />
        </div>
    )
}

const ManaDisplay = ({ hero }: { hero: HeroDataModel }) => {
    const mana = hero.mana.current
    const updateMana = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { mana: { current: (mana ?? 0) + (auxClick ? 1 : -1) } })
    }, [mana])

    return (
        <div className="flex text-3xl font-eskapade font-bold mt-1 mb-2 justify-evenly">
            <div className="flex items-center">
                <span className="text-lg justify-bottom">{vgLiteLang.HeroSheet.Magic.labelMana}</span>
                <Sparkle className={`text-mana ${glowOnHover} cursor-pointer`} size={20}
                    onClick={() => updateMana(false)}
                    onAuxClick={() => updateMana(true)}
                />
                &nbsp;
                <span className={`${glowOnHover} cursor-pointer text-mana`}>
                    <EditableTextField
                        boundValue={hero.mana.current?.toString() ?? ""}
                        updateProps={{ object: hero.parent, path: ['mana', 'current'] }}
                        placeholder="0"
                        hideBorderOnEditMode={true}
                    />
                </span>
                <p>/</p>
                <p>{hero.mana.max}</p>
            </div>
            <div className="flex items-center text-mana">
                <span className="text-lg text-text-primary">{vgLiteLang.HeroSheet.Magic.labelCastMax}</span>
                <Sparkles size={20} />
                &nbsp;
                <span>{hero.mana.maxCast}</span>
            </div>
            <div className="px-1" />
            <SecondaryButton
                children={<p className="text-lg">{vgLiteLang.HeroSheet.Magic.btnCast}</p>}
                icon={<DamageTypeIcon dmgType={'magical'} />}
                onClick={() => {

                }}
            />
        </div>
    )
}

const Spells = ({ hero }: { hero: HeroDataModel }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    return (
        <div>
            <div className="grid @sm:grid-cols-1 @lg:grid-cols-2 my-1 gap-x-1 gap-y-0.5">
                {
                    hero.spells.map((sp: any) => (
                        <div key={getId(sp)} onContextMenu={(e) => onCtxMenu(e, [
                            {
                                icon: MessageSquareText, label: vgLiteLang.ButtonActions.chat, action: () =>
                                    sendVgLiteChatMessage(
                                        hero,
                                        <AbilityChatCard
                                            actorId={getId(hero)}
                                            img={sp.parent.img}
                                            title={sp.parent.name}
                                            subtitle={spellDamageBase(sp)}
                                            description={sp.description}
                                        />
                                    )
                            },
                            { icon: Trash, label: vgLiteLang.ButtonActions.remove, action: () => { hero.parent.deleteEmbeddedDocuments("Item", [getId(sp)]) }, isDestructive: true }
                        ])}>
                            <SkillCard
                                img={sp.parent.img}
                                dmgType={sp.damageType}
                                title={sp.parent.name}
                                subtitles={[{ label: vgLiteLang.HeroSheet.Magic.labelDmgBase, value: vgLiteLang.DamageTypes[sp.damageType] }]}
                                description={sp.description}
                            />
                        </div>
                    ))
                }
            </div>
            <ContextMenu />
        </div>
    )
}