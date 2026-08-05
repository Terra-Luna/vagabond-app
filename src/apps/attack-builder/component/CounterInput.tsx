export const CounterInput = ({ tooltip, children }) => {
    return (
        <div className="flex flex-col items-start" title={tooltip}>
            {children}
        </div>
    )
}