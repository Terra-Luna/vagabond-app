import { Sparkle, Sparkles, X } from "lucide-react"
import { useCallback } from "react"
import { HeroDataModel } from "../../../../../../../model/actor/HeroDataModel"
import { updateDocument } from "../../../../../../../utils/documentUtils"
import { vgLiteLang } from "../../../../../../../utils/lang"
import { glowOnHover } from "../../../../../../common/text-styles"
import { DamageTypeIcon } from "../../../../../../component/DamageTypeIcon"
import { EditableTextField } from "../../../../../../component/EditableTextField"
import { useSpellCastingMenu } from "./SpellcastingMenu"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const ManaHUD = ({ hero }: { hero: HeroDataModel }) => {
    const mana = hero.mana.current
    const updateMana = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { mana: { current: (mana ?? 0) + (auxClick ? 1 : -1) } })
    }, [mana])

    const { isSpellcastingOpen, setIsSpellcastingOpen, spell, setSpell, setSpells, SpellcastingMenu } = useSpellCastingMenu(hero)

    return (
        <div>
            <div className="flex gap-x-6 text-2xl font-eskapade font-bold mt-1 mb-2 justify-evenly">
                <div className="flex gap-x-1 ml-4 items-center">
                    <SpellcastingLabel text={vgLiteLang.HeroSheet.Magic.labelMana} />
                    <Sparkle className={`text-mana mr-1 ${glowOnHover} cursor-pointer`} size={20} onClick={() => updateMana(false)} onAuxClick={() => updateMana(true)} />
                    <span className="text-mana">
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
                <div className="flex gap-x-1 items-center">
                    <SpellcastingLabel text={vgLiteLang.HeroSheet.Magic.labelCastMax} />
                    <Sparkles size={20} className="text-mana" />
                    <p>{hero.mana.maxCast}</p>
                </div>

                <div className={`flex items-center gap-x-1 ml-auto -mb-1.5 pl-6 pr-2 bg-table-border/10 ${glowOnHover} cursor-pointer [clip-path:polygon(100%_0,100%_100%,0_100%,30%_0)]`}
                    onClick={() => {
                        setSpells(hero.parent.items.filter(i => i.type === 'spell'))
                        setSpell(spell || hero.parent.items.filter(i => i.type === 'spell')[0])
                        setIsSpellcastingOpen(!isSpellcastingOpen)
                    }}
                >
                    {
                        !isSpellcastingOpen ?
                            <>
                                <DamageTypeIcon dmgType="magical" />
                                <p className="text-lg">{vgLiteLang.HeroSheet.Magic.btnCast}</p></> :
                            <>
                                <X size={14} />
                                <p className="text-lg">{vgLiteLang.ButtonActions.close}</p>
                            </>
                    }

                </div>
            </div>
            <SpellcastingMenu />
        </div>
    )
}