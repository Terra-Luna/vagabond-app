export const TotalDmgFooter = ({ total }) => {
    return (
        <div className="flex h-full items-center justify-center space-x-2">
            <p className="text-xl text-text-secondary font-paradigm font-normal mr-2">Total:</p>
            <div className="text-3xl text-text-primary">{total}</div>
        </div>
    )
}