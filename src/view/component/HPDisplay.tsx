interface Health {
    current: number;
    max: number;
    bonus: number;
}

const HPDisplay = ({ health }: { health: Health }) => {
    return (
        <div className="vglite-hp">
            <span className="current">{health.current}</span>
            <span className="slash"> / </span>
            <span className="max">{health.max}</span>
        </div>
    )
}

export default HPDisplay;