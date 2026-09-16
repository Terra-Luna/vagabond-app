import { getManaEnforcement } from "../../../../../../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { appLang } from "../../../../../../../../utils/lang"

export const SpellcastingLabel = ({ text }: { text: any }) => {
    return <div className="text-sm text-text-header-tertiary font-eskapade font-bold">{text}</div>
}

export const SpellcastingValue = ({ text }: { text: any }) => {
    return <div className="text-4xl text-text-header-tertiary font-eskapade font-bold">{text}</div>
}

export const SpellcastingMana = ({ text }: { text: any }) => {
    return <div className="text-4xl text-text-primary font-eskapade font-bold">{text}</div>
}

export const SpellcastingSubtext = ({ text }: { text: any }) => {
    return <div className="max-h-[100px] overflow-y-auto">
        <div className="text-sm text-text-secondary font-eskapade font-normal">{text}</div>
    </div>
}

export const SpellcastingErrMsg = ({ cost, mana, maxCast }: { cost: number, mana: number, maxCast: number }) => {
    const enforce = getManaEnforcement()
    return (<div className="flex gap-x-1 mt-2 text-destructive-action text-base font-normal">
        {(enforce && cost > mana) && <p>{appLang.HeroSheet.Magic.manaErrMsg}</p>}
        {(enforce && cost > mana && cost > maxCast) && <p className="">&</p>}
        {(enforce && cost > maxCast) && <p>{appLang.HeroSheet.Magic.maxErrMsg}</p>}
    </div>)
}