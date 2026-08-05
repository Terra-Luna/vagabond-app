export const CounterInput = ({ tooltip, children }) => {
    return (
        <div className="flex flex-col items-center" title={tooltip}>
            {children}
        </div>
    )
}