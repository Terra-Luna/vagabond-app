import { ReactNode } from "react"
import { AttackPreset } from "../AttackBuilderApp"
import { DiceRoll } from "../../../combat/engine/DiceRoll"
import { HeroAttack } from "../../../combat/engine/HeroAttack"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { AttackButton } from "./AttackButton"

export const AttackPresetRow = ({ actor, preset, EditButton, TrashButton }: {
    actor: Actor & { system: HeroDataModel },
    preset: AttackPreset,
    EditButton: ReactNode,
    TrashButton: ReactNode
}) => {
    return (
        <div className="flex px-2 py-1 border-t border-solid border-table-border">
            {/* ATTACK TITLE + DESCRIPTION */}
            <div>
                <div className="flex gap-x-1 text-base font-eskapade">
                    <p className="font-bold">{`${preset.title}${preset.description.length > 0 ? ':' : ''}`}</p>
                    {preset.description.length > 0 && <p>{preset.description}</p>}
                </div>

                {/* ATTACK METADATA GHOST TEXT */}
                <div className="flex gap-x-1 text-xs text-text-tertiary font-paradigm italic -mt-1">
                    <p>{`${vgLiteLang.Skills[preset.skill]?.name ?? vgLiteLang.Saves[preset.skill]?.name ?? ''},`}</p>
                    <p>{`${preset.d20Count}d20,`}</p>
                    <p>{`${preset.favorHinder !== 'none' ? vgLiteLang.FavorHinder[preset.favorHinder] + "," : ''}`}</p>
                    <p>{`Crit: ${preset.critThreshold},`}</p>
                    <p>{`${preset.damageRolls.map(r => new DiceRoll(r).toRollFormula()).join("+")}`}</p>
                </div>
            </div>

            {/* ATTACK | EDIT | DELETE BUTTONS */}
            <div className="flex gap-x-2 items-center content-center ml-auto">
                <div className="mr-4">
                    <AttackButton onClick={() => HeroAttack.buildCustomAttack(actor, preset)} />
                </div>
                {EditButton}
                {TrashButton}
            </div>
        </div>
    )
}