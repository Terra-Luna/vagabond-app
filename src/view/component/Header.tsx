export const Header = ({ title }: { title: string }) => {
    return (
        <div className="vglite-header">
            <Divider />
            <h1>{title}</h1>
            <Divider />
        </div>
    )
}

export const Divider = () => <div className="vglite-divider" />