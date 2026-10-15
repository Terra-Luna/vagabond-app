import { Sparkle, Sparkles, X } from "lucide-react"
import { useCallback } from "react"

import { HeroDataModel } from "../../../../../../../model/actor/HeroDataModel"
import { ItemsCache } from "../../../../../../../rules/util/ItemsCache"
import { updateDocument } from "../../../../../../../utils/documentUtils"
import { appLang } from "../../../../../../../utils/lang"
import { DamageTypeIcon } from "../../../../../../component/DamageTypeIcon"
import { EditableTextField } from "../../../../../../component/EditableTextField"
import { SkillCard, SkillCardTitle } from "../../../../../../component/SkillCard"
import { Tooltip } from "../../../../../../component/Tooltip"
import { useSpellcastingMenuContext } from "./SpellcastingMenuContext"

export const ManaHUD = ({ hero, isCastMenuOpen = false, hideTab = false }: { hero: HeroDataModel, isCastMenuOpen?: boolean, hideTab?: boolean }) => {
    const mana = hero.mana.value

    const updateMana = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { mana: { value: (mana ?? 0) + (auxClick ? 1 : -1) } })
    }, [mana])

    const { isSpellcastingOpen, setIsSpellcastingOpen, SpellcastingMenu, selectedSpellId } = useSpellcastingMenuContext()
    const spell = ItemsCache.spells().find(s => s.uuid === selectedSpellId)

    return (
        <div>
            <div className="flex gap-x-2 text-2xl font-eskapade font-bold mt-1 mb-2 justify-between">
                {hideTab && spell &&
                    <SkillCard
                        actor={hero.parent}
                        img={spell.img ?? ""}
                        dmgType={spell.system.damageType}
                        title={<SkillCardTitle text={spell.name} />}
                        subtitles={[
                            { label: appLang.HeroSheet.Magic.labelDmgBase, value: appLang.DamageTypes[spell.system.damageType] }
                        ]}
                        description={spell.system.description}
                        mini={true}
                    />
                }

                {/* CURRENT MANA */}
                <div className={`flex items-end gap-x-4 ml-auto ${hideTab ? "px-2" : ""}`}>
                    <div className="flex gap-x-1 items-center">
                        {/* <SpellcastingLabel text={appLang.HeroSheet.Magic.labelMana} /> */}
                        <Tooltip title={appLang.HeroSheet.Magic.labelMana} content={`Current / Max${appLang.HeroSheet.counter_tooltip}`}>
                            <Sparkle className={`text-mana mr-1 hover-glow`} size={20} onClick={() => updateMana(false)} onAuxClick={() => updateMana(true)} />
                        </Tooltip>
                        <span className="text-mana">
                            <EditableTextField
                                boundValue={hero.mana.value?.toString() ?? ""}
                                updateProps={{ object: hero.parent, path: ['mana', 'value'] }}
                                placeholder="0"
                                hideBorderOnEditMode={true}
                            />
                        </span>
                        <p>/</p>
                        <p>{hero.mana.max}</p>
                    </div>

                    {/* MAX MANA / CAST */}
                    <Tooltip title={appLang.HeroSheet.Magic.labelCastMax} content={`Maximum mana allowed per-cast.`}>
                        <div className="flex gap-x-1 items-center">
                        <Sparkles size={20} className="text-mana" />
                            <p>{hero.mana.maxCast}</p>
                    </div>
                    </Tooltip>
                </div>

                {/* SPELLCASTING TAB */}
                {!isCastMenuOpen && !hideTab &&
                    <div className={`
                            flex items-center gap-x-1 -mb-1 pl-6 pr-2 
                            bg-context-menu-fill hover-glow
                            [clip-path:polygon(100%_0,100%_100%,0_100%,30%_0)]
                        `}
                        onClick={() => { setIsSpellcastingOpen(!isSpellcastingOpen) }}
                    >
                        {!isSpellcastingOpen ?
                            <>
                                <DamageTypeIcon dmgType="magical" size={16} />
                                <p className="text-base">{appLang.HeroSheet.Magic.btnCast}</p></> :
                            <>
                                <X size={14} />
                                <p className="text-base">{appLang.ButtonActions.close}</p>
                            </>
                        }
                </div>}
            </div>

            <SpellcastingMenu />

        </div>
    )
}