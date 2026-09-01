import { tableBorderRounded } from "../../../view/common/border-styles"
import { HeroCreationSubLabel, HeroCreationSubtext } from "./HeroCreationTypography"

export const ItemGrantCard = ({ img, name, subtext, source }: { img?: string, name: string, subtext?: string | undefined, source: string }) => {
    return (
        <div className={`flex gap-x-2 justify-between items-center px-2 py-1 bg-context-menu-fill/25 ${tableBorderRounded}`}>
            <div className="flex gap-x-2 items-center">
                {img && <img src={img} height={32} width={32} className="border border-solid border-text-primary rounded-sm" />}
                <HeroCreationSubLabel text={name} />
                { subtext && <HeroCreationSubtext text={subtext} /> }
            </div>
            <div className={`bg-context-menu-fill px-1 py-0.5 ${tableBorderRounded}`}>
                <HeroCreationSubtext text={source} />
            </div>
        </div>
    )
}