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

export const ManaHUD = ({ hero }: { hero: HeroDataModel }) => {
    const mana = hero.mana.current
    const updateMana = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { mana: { current: (mana ?? 0) + (auxClick ? 1 : -1) } })
    }, [mana])

    const { isSpellcastingOpen, setIsSpellcastingOpen, setSpell, setSpells, SpellcastingMenu } = useSpellCastingMenu(hero)

    return (
        <div>
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
                    <p className="text-lg text-text-primary">{vgLiteLang.HeroSheet.Magic.labelCastMax}</p>
                    <Sparkles size={20} />
                    &nbsp;
                    <p>{hero.mana.maxCast}</p>
                </div>
                <div className="px-1" />
                <SecondaryButton
                    children={<p className="text-lg">{isSpellcastingOpen ? vgLiteLang.ButtonActions.cancel : vgLiteLang.HeroSheet.Magic.btnCast}</p>}
                    icon={isSpellcastingOpen ? <X size={18} className="text-destructive-action" /> : <DamageTypeIcon dmgType={'magical'} />}
                    onClick={() => {
                        setSpells(hero.spells as SpellDataModel[])
                        setSpell(hero.spells[0] as SpellDataModel)
                        setIsSpellcastingOpen(!isSpellcastingOpen)
                    }}
                />
            </div>
            <SpellcastingMenu />
        </div>
    )
}