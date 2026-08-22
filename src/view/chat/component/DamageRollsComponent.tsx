import { Plus } from "lucide-react"

import { DamageRollResult } from "../../../combat/engine/roll/DamageRoll"
import { DiceRollComponent } from "./DiceRollComponent"

export const DamageRollsComponent = ({ result }: { result: DamageRollResult }) => {
    return (
        <div className="flex flex-wrap grow gap-x-1 mt-2 justify-center max-h-32 overflow-y-auto">
            {result?.rollSummaries?.map((r, index) => (
                    <div key={index}>
                    <DiceRollComponent faces={r.faces} result={r.result} textSize={"text-4xl"} exploded={r.exploded} />
                    </div>
                ))
            }
            {result?.bonus > 0 && 
                <div className="flex space-x-2">
                    <div className="h-full content-center text-text-secondary"><Plus size={20} strokeWidth={2} /></div>
                    <p className="h-full text-3xl">{result.bonus}</p>
                </div>
            }
        </div>
    )
}