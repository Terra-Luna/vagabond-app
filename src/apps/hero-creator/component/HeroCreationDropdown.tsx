import { CustomDropDown } from "../../../view/component/Dropdown"
import { HeroCreationLabel } from "./HeroCreationTypography"

export const HeroCreationDropdown = ({ label, value, options, onChange }: {
    label?: string, value: string, options: { label: string, value: any }[], onChange: any
}) => {
    return (
        <div>
            <HeroCreationLabel text={label ?? ''} />
            <CustomDropDown
                value={value}
                options={options}
                className={"text-xl"}
                onChange={(e) => { onChange(e.target.value) }}
            />
        </div>
    )
}