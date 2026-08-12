import { CustomDropDown } from "../../view/component/Dropdown"

export const DieSizeSelector = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    return (
        <div title={"Die size"}>
            <CustomDropDown
                value={value}
                options={[
                    { value: '', label: "-"},
                    { value: "1", label: "d1" },
                    { value: "4", label: "d4" },
                    { value: "6", label: "d6" },
                    { value: "8", label: "d8" },
                    { value: "10", label: "d10" },
                    { value: "12", label: "d12" },
                    { value: "20", label: "d20" },
                ]}
                onChange={(e) => onChange(e.target.value)}
                className="pt-1"
            />
        </div>
    )
}