import { Plus } from "lucide-react"
import { DamageRollResult, rollCountdownDie } from "../../../combat/dice-rolls"
import { glowOnHover } from "../../common/text-styles"
import { sendCountdownRollMessage } from "../ChatCardSerializer"
import { DiceRoll } from "./DiceRoll"

export const DamageRolls = ({ result }: { result: DamageRollResult }) => {
    return (
        <div className="flex flex-wrap grow gap-x-2 mt-2 justify-center">
            {
                result.rollsSummary.map((r, index) => (
                    <div key={index}>
                        <DiceRoll faces={r.dieSize} result={r.result} textSize={"text-4xl"} exploded={r.exploded} />
                    </div>
                ))
            }
            {
                result.bonus === 0 ? <></> :
                    <div className="flex space-x-2">
                        <div className="h-full content-center text-text-secondary"><Plus size={24} /></div>
                        <p className="h-full text-4xl">{result.bonus}</p>
                    </div>
            }
            {
                !result.appliesBurn || result.burnDuration.length === 0 ? <></> :
                    <div className="flex space-x-2 items-center">
                        <div className="h-full content-center text-text-secondary"><Plus size={18} /></div>
                        <p
                            className={`h-full text-xl content-center ${glowOnHover} cursor-pointer`}
                            onClick={async () => {
                                const cdRes = await rollCountdownDie({
                                    name: result.atkName,
                                    duration: result.burnDuration
                                })
                                sendCountdownRollMessage(cdRes)
                            }}
                        >
                            {result.burnDuration}
                        </p>
                    </div>
            }
        </div>
    )
}