import { tableBorder } from "../../../view/common/border-styles"

export const TextInput = ({ value, placeholder, onChange, textSize }: { value: string, placeholder: string, onChange: (input: string) => void, textSize?: string }) => {
    return (<input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${textSize ?? 'text-sm'} px-1 pt-0.5 w-full ${tableBorder}/50`}
    />)
}