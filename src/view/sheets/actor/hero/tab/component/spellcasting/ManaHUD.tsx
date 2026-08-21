import { Sparkle, Sparkles, X } from "lucide-react"
import { useCallback } from "react"
import { HeroDataModel } from "../../../../../../../model/actor/HeroDataModel"
import { updateDocument } from "../../../../../../../utils/documentUtils"
import { vgLiteLang } from "../../../../../../../utils/lang"
import { DamageTypeIcon } from "../../../../../../component/DamageTypeIcon"
import { EditableTextField } from "../../../../../../component/EditableTextField"
import { SpellcastingLabel } from "./SpellcastingTypography"
import { useSpellcastingMenuContext } from "./SpellcastingMenuContext"

export const ManaHUD = ({ hero, isCastMenuOpen = false }: { hero: HeroDataModel, isCastMenuOpen?: boolean }) => {
    const mana = hero.mana.current
    const updateMana = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { mana: { current: (mana ?? 0) + (auxClick ? 1 : -1) } })
    }, [mana])

    const { isSpellcastingOpen, setIsSpellcastingOpen, SpellcastingMenu } = useSpellcastingMenuContext()

    return (
        <div>
            <div className="flex gap-x-6 text-2xl font-eskapade font-bold mt-1 mb-2 justify-evenly">
                <div className="flex gap-x-1 ml-2 items-center">
                    <SpellcastingLabel text={vgLiteLang.HeroSheet.Magic.labelMana} />
                    <span title={vgLiteLang.HeroSheet.counter_tooltip}>
                        <Sparkle className={`text-mana mr-1 hover-glow`} size={20} onClick={() => updateMana(false)} onAuxClick={() => updateMana(true)} />
                    </span>
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

                {/* SPELLCASTING TAB */}
                {!isCastMenuOpen &&
                    <div className={`
                            flex items-center gap-x-1 ml-auto -mb-1 pl-6 pr-2 
                            bg-context-menu-fill hover-glow
                            [clip-path:polygon(100%_0,100%_100%,0_100%,30%_0)]
                        `}
                        onClick={() => { setIsSpellcastingOpen(!isSpellcastingOpen) }}
                    >
                        {!isSpellcastingOpen ?
                            <>
                                <DamageTypeIcon dmgType="magical" />
                                <p className="text-lg">{vgLiteLang.HeroSheet.Magic.btnCast}</p></> :
                            <>
                                <X size={14} />
                                <p className="text-lg">{vgLiteLang.ButtonActions.close}</p>
                            </>
                        }
                </div>}
            </div>

            <SpellcastingMenu />

        </div>
    )
}