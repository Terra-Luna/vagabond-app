import { vgLiteLang } from "../../../../../../../utils/lang"

export const SpellcastingLabel = ({ text }: { text: any }) => {
    return <p className="text-base text-text-header-tertiary font-eskapade font-bold">{text}</p>
}

export const SpellcastingValue = ({ text }: { text: any }) => {
    return <p className="text-4xl text-text-header-tertiary font-eskapade font-bold">{text}</p>
}

export const SpellcastingSubtext = ({ text }: { text: any }) => {
    return <div className="max-h-[56px] overflow-y-auto">
        <p className="text-sm text-text-secondary font-eskapade font-normal">{text}</p>
    </div>
}

export const SpellcastingErrMsg = () => {
    return <p className="text-destructive-action text-base">{vgLiteLang.HeroSheet.Magic.manaErrMsg}</p>
}