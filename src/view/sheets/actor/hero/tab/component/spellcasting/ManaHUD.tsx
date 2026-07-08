import { Sparkle, Sparkles, X } from "lucide-react"
import { useCallback } from "react"
import { HeroDataModel } from "../../../../../../../model/actor/HeroDataModel"
import { updateDocument } from "../../../../../../../utils/documentUtils"
import { vgLiteLang } from "../../../../../../../utils/lang"
import { glowOnHover } from "../../../../../../common/text-styles"
import { SecondaryButton } from "../../../../../../component/Button"
import { DamageTypeIcon } from "../../../../../../component/DamageTypeIcon"
import { EditableTextField } from "../../../../../../component/EditableTextField"
import { useSpellCastingMenu } from "./SpellcastingMenu"
import { SpellDataModel } from "../../../../../../../model/item/character/SpellDataModel"
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
                    <Sparkle className={`text-mana mr-1 ${glowOnHover} cursor-pointer`} size={20} strokeWidth={1} onClick={() => updateMana(false)} onAuxClick={() => updateMana(true)} />
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
                <div className="ml-auto">
                    <SecondaryButton
                        children={<p className="text-lg">{isSpellcastingOpen ? vgLiteLang.ButtonActions.cancel : vgLiteLang.HeroSheet.Magic.btnCast}</p>}
                        icon={isSpellcastingOpen ? <X size={18} className="text-destructive-action" /> : <DamageTypeIcon dmgType={'magical'} />}
                        onClick={() => {
                            setSpells(hero.spells as SpellDataModel[])
                            setSpell(spell || hero.spells[0] as SpellDataModel)
                            setIsSpellcastingOpen(!isSpellcastingOpen)
                        }}
                    />
                </div>

            </div>
            <SpellcastingMenu />
        </div>
    )
}