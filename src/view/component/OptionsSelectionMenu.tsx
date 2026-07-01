import { SquarePen } from "lucide-react"
import { updateDocumentAtPath } from "../../utils/documentUtils"
import { glowOnHover } from "../sheets/VgLiteSheet"
import { Menu, MenuItem } from '@szhsin/react-menu'
import { DamageTypeIcon } from "./DamageTypeIcon"

interface OptionsSelectionMenuOption {
    key: string
    value: string
    isSelected: boolean
}

export const OptionsSelectionMenu = ({ obj, label, path, options }: { obj: any, label: string, path: string[], options: OptionsSelectionMenuOption[] }) => {
    return (
        <div>
            <div className="flex items-center">
                {label}
                <Menu menuButton={<SquarePen size={16} className={`text-stat-block-fill ml-2 cursor-pointer ${glowOnHover}`} />}>
                    <div className="bg-context-menu-fill text-left border border-solid border-table-border rounded-sm p-2">
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
                                            <p className={`text-stat-block-fill font-bold ${glowOnHover}`}>{opt.value}</p> :
                                            <p className={`text-text-primary font-normal ${glowOnHover}`}>{opt.value}</p>
                                    }
                                </MenuItem>
                            ))
                        }
                    </div>
                </Menu>
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
        <p className="flex flex-wrap text-text-secondary font-paradigm font-normal">{options.join(", ")}</p>
    )
}