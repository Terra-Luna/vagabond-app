import { getManaEnforcement } from "../../../../../../../apps/vagabond-tools/VagabondSettingsRegistry"
import { vgLiteLang } from "../../../../../../../utils/lang"

export const SpellcastingLabel = ({ text }: { text: any }) => {
    return <div className="text-sm text-text-header-tertiary font-eskapade font-bold">{text}</div>
}

export const SpellcastingValue = ({ text }: { text: any }) => {
    return <div className="text-4xl text-text-header-tertiary font-eskapade font-bold">{text}</div>
}

export const SpellcastingSubtext = ({ text }: { text: any }) => {
    return <div className="max-h-[72px] overflow-y-auto">
        <div className="text-sm text-text-secondary font-eskapade font-normal">{text}</div>
    </div>
}

export const SpellcastingErrMsg = ({ cost, mana, maxCast }: { cost: number, mana: number, maxCast: number }) => {
    const enforce = getManaEnforcement()
    return (<div className="flex gap-x-2">
        {(enforce && cost > mana) && <div className="text-destructive-action text-base">
            {vgLiteLang.HeroSheet.Magic.manaErrMsg}</div>
        }
        {(enforce && cost > maxCast) && <div className="text-destructive-action text-base">
            {vgLiteLang.HeroSheet.Magic.maxErrMsg}</div>
        }
    </div>)
}