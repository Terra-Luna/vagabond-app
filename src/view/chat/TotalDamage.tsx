
import { DamageTypeIcon } from "../component/DamageTypeIcon"

export const TotalDamage = ({ attack }: { attack: any }) => {
    return (
        <div className="flex items-center justify-center ml-2 gap-x-1">
            <p className="text-xl text-text-secondary font-paradigm font-normal">[</p>
            <div className="text-3xl text-text-primary">{attack.damageRoll?.result?.total ?? 0}</div>
            <DamageTypeIcon dmgType={attack.isDefenseCheck ? 'defense' : attack.damageRoll?.result?.dmgType ?? ''} />
            <p className="text-xl text-text-secondary font-paradigm font-normal">]</p>
        </div>
    )
}