interface Health {
    current: number;
    max: number;
    bonus: number;
}

const HPDisplay = ({ health }: { health: Health }) => {
    return (
        <h1 className="text-3xl font-bold underline" style={{ color: 'black' }}>
            {health.current} / {health.max} (bonus: {health.bonus})
        </h1>
    )
}

export default HPDisplay;