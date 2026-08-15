import { ReactNode } from "react"
import { RollPreset } from "../RollBuilderApp"
import { DiceRoll } from "../../../combat/engine/roll/DiceRoll"
import { HeroAttack } from "../../../combat/engine/HeroAttack"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { RollButton } from "./RollButton"

export const RollPresetRow = ({ actor, preset, EditButton, TrashButton }: {
    actor: Actor & { system: HeroDataModel },
    preset: RollPreset,
    EditButton: ReactNode,
    TrashButton: ReactNode
}) => {
    return (
        <div className="flex px-2 py-1 border-t border-solid border-table-border">
            {/* PRESET TITLE + DESCRIPTION */}
            <div>
                <div className="flex gap-x-1 text-base font-eskapade">
                    {preset.title.length > 0 && <p className="font-bold">{`${preset.title}${preset.description.length > 0 ? ':' : ''}`}</p>}
                    {preset.description.length > 0 && <p>{preset.description}</p>}
                </div>

                {/* PRESET METADATA GHOST TEXT */}
                <div className="flex gap-x-1 text-xs text-text-tertiary font-paradigm italic -mt-1">
                    <p>{`${vgLiteLang.Skills[preset.skill]?.name ?? vgLiteLang.Saves[preset.skill]?.name ?? ''},`}</p>
                    <p>{`${preset.d20Count}d20,`}</p>
                    <p>{`${preset.favorHinder !== 'none' ? vgLiteLang.FavorHinder[preset.favorHinder] + "," : ''}`}</p>
                    <p>{`Crit: ${preset.critThreshold},`}</p>
                    <p>{`${preset.damageRolls.map(r => new DiceRoll(r).toRollFormula()).join("+")}`}</p>
                </div>
            </div>

            {/* ROLL | EDIT | DELETE BUTTONS */}
            <div className="flex gap-x-2 items-center content-center ml-auto">
                <div className="mr-4">
                    <RollButton onClick={() => HeroAttack.buildCustomRoll(actor, preset)} />
                </div>
                {EditButton}
                {TrashButton}
            </div>
        </div>
    )
}