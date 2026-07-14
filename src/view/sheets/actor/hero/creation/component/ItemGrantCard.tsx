import { HeroCreationValue, HeroCreationSubtext } from "./HeroCreationTypography"

export const ItemGrantCard = ({ name, subtext, source }: { name: string, subtext?: string | undefined, source: string }) => {
    return (
        <div className="flex gap-x-2 justify-between items-center p-2 bg-context-menu-fill/25 border border-solid border-table-border rounded-sm">
            <div className="flex gap-x-2 items-center">
                <HeroCreationValue text={name} />
                { subtext && <HeroCreationSubtext text={subtext} /> }
            </div>
            <div className="bg-context-menu-fill border border-solid border-table-border rounded-sm px-1 py-0.5">
                <HeroCreationSubtext text={source} />
            </div>
        </div>
    )
}