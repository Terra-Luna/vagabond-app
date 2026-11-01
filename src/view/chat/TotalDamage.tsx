
import { tableBorderRounded } from "../common/border-styles"
import { DamageTypeIcon } from "../component/DamageTypeIcon"

export const TotalDamage = ({ attack }: { attack: any }) => {
    return (
        <div className={`flex items-center justify-center mx-2 gap-x-1 px-1 ${tableBorderRounded}`}>
            <div className="text-3xl text-text-primary">{attack.damageRoll?.result?.total ?? 0}</div>
            <DamageTypeIcon dmgType={attack.isDefenseCheck ? 'defense' : attack.damageRoll?.result?.dmgType ?? ''} />
        </div>
    )
}