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

export const SpellcastingErrMsg = () => {
    return <div className="text-destructive-action text-base">{vgLiteLang.HeroSheet.Magic.manaErrMsg}</div>
}