import { Gauge } from "../../component/Gauge"

const infoBoxLayout = "content-center bg-wealth-fill/50 border border-solid border-table-border w-full py-1"
const infoBoxText = "text-text-encumbrance text-sm"

export interface CapacityInfo {
    bulk: number, capacity: number, isOverEncumbered: boolean
}

export const CapacityGauge = ({ label, capacityInfo }: { label: string, capacityInfo: CapacityInfo }) => {
    return (
        <div className={infoBoxLayout + " px-2 " + infoBoxText}>
            {label}
            <span className="text-base float-right">
                {capacityInfo.bulk} / {capacityInfo.capacity}
            </span>
            <Gauge value={capacityInfo.bulk} max={capacityInfo.capacity} fillColorClassName="bg-text-encumbrance" maxColorClassName="bg-destructive-action" />
        </div>
    )
}