export const Header = ({ title }: { title: string }) => {
    return (
        <div className="bg-section-header-fill text-text-section-header font-eskapade font-bold w-full flex items-center text-lg">
            <Divider />
            <div>{title}</div>
            <Divider />
        </div>
    )
}

const divider = "h-px grow"
export const Divider = () => <div className={divider + " bg-section-header-line mx-1"} />
export const ItemDivider = () => <div className={divider + " bg-skill-divider"} />