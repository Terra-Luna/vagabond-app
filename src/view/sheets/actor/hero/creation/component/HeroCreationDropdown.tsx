import { DropDown } from "../../../../../component/Dropdown"
import { HeroCreationLabel } from "./HeroCreationTypography"

export const HeroCreationDropdown = ({ label, value, options, onChange }: {
    label: string, value: string, options: { label: string, value: any }[], onChange: any
}) => {
    return (
        <div>
            <HeroCreationLabel text={label} />
            <DropDown
                value={value}
                options={options}
                updateMechanism={{ onChange: onChange }}
            />
        </div>
    )
}