import { Plus } from "lucide-react"
import { DiceRoll } from "./DiceRoll"
import { DamageRollResult } from "../../../combat/engine/DamageRoll"

export const DamageRollsComponent = ({ result }: { result: DamageRollResult }) => {
    return (
        <div className="flex flex-wrap grow gap-x-1 mt-2 justify-center max-h-48 overflow-y-auto">
            {result?.rollsSummary?.map((r, index) => (
                    <div key={index}>
                        <DiceRoll faces={r.dieSize} result={r.result} textSize={"text-4xl"} exploded={r.exploded} />
                    </div>
                ))
            }
            {result?.bonus > 0 && 
                <div className="flex space-x-2">
                    <div className="h-full content-center text-text-secondary"><Plus size={24} /></div>
                    <p className="h-full text-4xl">{result.bonus}</p>
                </div>
            }
        </div>
    )
}