export const Header = ({ title }: { title: string }) => {
    return (
        <div className="vglite-header">
            <Divider />
            <div>{title}</div>
            <Divider />
        </div>
    )
}

export const Divider = () => <div className="vglite-divider" />