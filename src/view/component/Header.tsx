export const Header = ({ title, collapseButton }: { title: string, collapseButton?: React.ReactElement }) => {
    return (
        <div className="bg-section-header-fill text-text-section-header font-eskapade font-bold w-full flex items-center text-lg">
            <Divider />
            <div>{title}</div>
            <Divider />
            {
                collapseButton ? <div className="mr-2">{collapseButton}</div> : <></>
            }
        </div>
    )
}

export const Divider = () => <div className={"grow h-[2px] bg-section-header-line mx-1"} />
export const ItemDivider = () => <div className={"grow h-[1px] bg-skill-divider"} />