import Select from 'react-select'

const defaultoptions = [{ label: "sup", value: "dude" }, { label: "SAH", value: "DUDE" }]

export const MultiSelect = ({ options = defaultoptions }: { options?: { label: string; value: string }[] }) => {
    return <Select options={options} isMulti />
}