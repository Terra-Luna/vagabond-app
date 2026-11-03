export const DraggableStatBlock = ({ index, value, isUsed, onDragStart }) => {
  return (
    <div
      key={index}
      draggable={!isUsed ? "true" : "false"}
      onDragStart={(e) => onDragStart(e, value, index)}
      className={`
                text-5xl text-text-stat-block text-center
                bg-stat-block-fill px-8 pb-3 pt-1 min-w-[80px]
                border border-solid border-sheet-main-fill rounded-md
                select-none group transition-all duration-200
                ${isUsed ? "opacity-0 pointer-events-none" : "cursor-grab active:cursor-grabbing"}
            `}
    >
      {value}
    </div>
  )
}
