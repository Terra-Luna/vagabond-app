export const DraggableStatBlock = ({ index, value, isUsed, onDragStart }) => {
    return (
        <div
            key={index}
            draggable={!isUsed ? "true" : "false"}
            onDragStart={(e) => onDragStart(e, value, index)}
            className={`
                text-4xl text-text-stat-block text-center
                bg-stat-block-fill px-4 pb-2
                border border-solid border-table-border rounded-md
                select-none group transition-all duration-200
                ${isUsed ? 'opacity-0 pointer-events-none w-[40px]' : 'cursor-grab active:cursor-grabbing'}
            `}
        >
            {value}
        </div>
    )
}