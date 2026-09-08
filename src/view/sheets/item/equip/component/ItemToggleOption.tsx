import { useCallback } from "react"

import { Checkbox } from "../../../../component/Checkbox"

export const ItemToggleOption = ({ label, item, path }: {
    label: string,
    item: Item & { system: any },
    path: string
}) => {
    
    const onCheck = useCallback((isChecked) => {
        item.update({ [path]: isChecked } as Record<string, boolean>)
    }, [item])

    return (
        <Checkbox
            label={label}
            onCheckedChanged={onCheck}
            checked={foundry.utils.getProperty(item, path) as boolean}
        />
    )
}