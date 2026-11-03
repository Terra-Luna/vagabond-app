import { Minus, Plus } from "lucide-react"

import { TotalDamage } from "../TotalDamage"
import { DiceRollComponent } from "./DiceRollComponent"

export const DamageRollsComponent = ({ attack }: { attack: any }) => {
  const result = attack?.damageRoll?.result

  return (
    <div className="flex flex-wrap grow justify-center items-start px-1">
      {result?.rollSummaries?.map((r, index) => (
        <div key={index}>
          <DiceRollComponent
            faces={r.faces}
            result={r.result}
            textSize={"text-4xl"}
            rerolled={r.rerolled}
            exploded={r.exploded}
          />
        </div>
      ))}

      {result && result.bonus !== 0 && (
        <div className="flex">
          <div className="content-center text-text-secondary h-9">
            {result.bonus > 0 ? (
              <Plus size={20} strokeWidth={2} />
            ) : (
              <Minus size={20} strokeWidth={2} />
            )}
          </div>

          <p className="h-full text-3xl">{Math.abs(result.bonus)}</p>
        </div>
      )}

      <TotalDamage attack={attack} />

      {/* WEAKNESS DIE (EXTRA DAMAGE DIE AGAINST WEAK TARGETS) */}
      {result?.weaknessRolls?.map((r, index) => (
        <div key={`weak-${index}`} className="flex items-start gap-x-1 -ml-2">
          <div className="content-center text-text-secondary h-9">
            <Plus size={20} strokeWidth={2} />
          </div>
          <div className="flex flex-col items-center -space-y-1 -ml-2">
            <DiceRollComponent
              faces={r.faces}
              result={r.result}
              textSize={"text-4xl"}
            />
            <p className="text-sm text-text-tertiary leading-none">vs. WEAK</p>
          </div>
        </div>
      ))}
    </div>
  )
}
