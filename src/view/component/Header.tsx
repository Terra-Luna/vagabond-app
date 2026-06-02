export const Header = ({ title }: { title: string }) => {
    return (
        <div className="bg-section-header-fill text-text-section-header font-eskapade font-bold w-full flex items-center text-lg">
            <Divider />
            <div>{title}</div>
            <Divider />
        </div>
    )
}

export const Divider = () => <div className="h-px bg-section-header-line w-full mx-1" />