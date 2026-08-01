import { SquarePen } from "lucide-react"
import { updateDocumentAtPath } from "../../utils/documentUtils"
import { Menu, MenuItem } from '@szhsin/react-menu'
import { DamageTypeIcon } from "./DamageTypeIcon"
import { menuOptionContainer, menuOptionText, menuOptionTextDefault, menuOptionTextSelected } from "../common/text-styles"
import { useEditMode } from "../context/EditModeContext/Hooks"

export interface OptionsSelectionMenuOption {
    key: string
    value: string
    isSelected: boolean
}

export const OptionsSelectionMenu = ({ obj, label, path, options }: {
    obj: any, label?: string, path: string[], options: OptionsSelectionMenuOption[]
}) => {
    const { isEditMode } = useEditMode()
    return (
        <div>
            <div className="flex items-center">
                {label && label}
                {isEditMode &&
                    <Menu menuButton={<SquarePen size={16} className={menuOptionText} />}>
                        <div className={menuOptionContainer}>
                            {
                                options.map(opt => (
                                    <MenuItem
                                        key={opt.key}
                                        onClick={(e) => {
                                            e.keepOpen = true
                                            options.find(it => it.key === opt.key)!.isSelected = !opt.isSelected
                                            updateDocumentAtPath(obj, path, options.filter(it => it.isSelected).map(it => it.key))
                                        }}
                                    >
                                        {
                                            opt.isSelected ?
                                                <p className={menuOptionTextSelected}>{opt.value}</p> :
                                                <p className={menuOptionTextDefault}>{opt.value}</p>
                                        }
                                    </MenuItem>
                                ))
                            }
                        </div>
                    </Menu>
                }
            </div>
        </div>
    )
}

export const DamageTypeIconDisplay = ({ dmgTypes }: { dmgTypes: any[] }) => {
    return (
        <div className="flex flex-wrap w-full">
            {
                dmgTypes.map((dmgType: any) => (
                    <div key={dmgType} className="content-center">
                        <DamageTypeIcon dmgType={dmgType} />
                    </div>
                ))
            }
        </div>
    )
}

export const StringOptionsDisplay = ({ options }: { options: any[] }) => {
    return (
        <p className="flex flex-wrap text-text-secondary font-paradigm font-normal italic">{options.join(", ")}</p>
    )
}