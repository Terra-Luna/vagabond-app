import { sheetPropLabel, sheetPropValue } from "../../../../common/text-styles"

export const ItemSheetPropLabel = ({ label, className = "font-bold" }) => {
    return <p className={`${sheetPropLabel} ${className} line-clamp-1`}>{label}</p>
}

export const ItemSheetPropValue = ({ value }) => {
    return <div className={`${sheetPropValue}`}>
        {value}
    </div>
}

export const ItemSheetProperty = ({ label, value }) => {
    return (
        <div className="flex gap-x-2 items-center mt-1">
            <ItemSheetPropLabel label={label} />
            <ItemSheetPropValue value={value} />
        </div>
    )
}