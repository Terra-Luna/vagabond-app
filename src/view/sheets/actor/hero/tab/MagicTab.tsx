import { useCallback, useEffect, useState } from "react"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { PrimaryButton } from "../../../../component/Button"
import { ManaHUD } from "./component/spellcasting/ManaHUD"
import { SpellsList } from "./component/SpellsList"
import { useGlobalPopout } from "../../../../../apps/PopoutApplication"
import { SpellsEditor } from "../../../../../apps/hero-choices/SpellsEditor"

export const MagicTab = ({ hero }: { hero: HeroDataModel }) => {
    const [isSpellsEditorOpen, setIsSpellsEditorOpen] = useState(false)

    const closeSpellEditor = useCallback(() => {
        setIsSpellsEditorOpen(false)
    }, [])

    const editorPopout = useGlobalPopout(closeSpellEditor)

    useEffect(() => {
        if (isSpellsEditorOpen) {
            editorPopout.renderPopout(
                <SpellsEditor actor={hero.parent} />, "Select Spells", true
            )
        }
    }, [isSpellsEditorOpen])

    return (
        <div className="w-full">
            <ManaHUD hero={hero} />
            <SpellsList hero={hero} />
            <div className="w-full mt-1">
                <div className="ml-auto mb-12">
                    <PrimaryButton onClick={() => setIsSpellsEditorOpen(true)}>
                        {'Select Spells'}
                    </PrimaryButton>
                </div>
            </div>
        </div>
    )
}