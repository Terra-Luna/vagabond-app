import { Minus, Plus } from "lucide-react"

import { DamageRollResult } from "../../../combat/engine/roll/DamageRoll"
import { DiceRollComponent } from "./DiceRollComponent"

export const DamageRollsComponent = ({ result }: { result: DamageRollResult }) => {
    return (
        <div className="flex flex-wrap grow justify-center items-start">
            {result?.rollSummaries?.map((r, index) => (
                <div key={index}>
                    <DiceRollComponent faces={r.faces} result={r.result} textSize={"text-4xl"} rerolled={r.rerolled} exploded={r.exploded} />
                </div>
            ))}

            {result?.bonus !== 0 &&
                <div className="flex space-x-2">
                    <div className="content-center text-text-secondary h-9">
                        {result.bonus > 0
                            ? <Plus size={20} strokeWidth={2} />
                            : <Minus size={20} strokeWidth={2} />
                        }
                    </div>
                    <p className="h-full text-3xl">{Math.abs(result.bonus)}</p>
                </div>
            }

            {/* WEAKNESS DIE (EXTRA DAMAGE DIE AGAINST WEAK TARGETS) */}
            {result?.weaknessRolls?.map((r, index) => (
                <div key={`weak-${index}`} className="flex items-start space-x-1">
                    <div className="content-center text-text-secondary h-9">
                        <Plus size={20} strokeWidth={2} />
                    </div>
                    <div className="flex flex-col items-center -space-y-1 -ml-2">
                        <DiceRollComponent faces={r.faces} result={r.result} textSize={"text-4xl"} />
                        <p className="text-sm text-text-tertiary leading-none">vs. WEAK</p>
                    </div>
                </div>
            ))}
        </div>
    )
}