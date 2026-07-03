const infoBoxLayout = "content-center bg-wealth-fill/50 border border-solid border-table-border w-full py-1"
const infoBoxText = "text-section-header-fill text-sm"

export interface CapacityInfo {
    bulk: number, capacity: number, isOverEncumbered: boolean
}

export const CapacityGauge = ({ label, capacityInfo}: { label: string, capacityInfo: CapacityInfo }) => {
    return (
        <div className={infoBoxLayout + " px-2 " + infoBoxText}>
            {label}
            <span className="text-base float-right">
                {capacityInfo.bulk} / {capacityInfo.capacity}
            </span>
            <div className="h-[12px] my-1 -mx-1 border border-solid border-table-border rounded-md">
                <Gauge bulk={capacityInfo.bulk} capacity={capacityInfo.capacity} isFull={capacityInfo.isOverEncumbered} />
            </div>
        </div>
    )
}

export const Gauge = ({ bulk, capacity, isFull: isOverEncumbered }: { bulk: number, capacity: number, isFull: boolean }) => {
    const width = Math.min(bulk / capacity * 100, 100)
    const fillColor = isOverEncumbered ? "bg-destructive-action " : "bg-section-header-fill"
    return (
        <div
            className={fillColor + " h-[10px] rounded-md"}
            style={{
                width: `${width}%`, transition: "width 0.8s ease-in-out"
            }} />
    )
}