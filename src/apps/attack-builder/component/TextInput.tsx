export const TextInput = ({value, placeholder, onChange}: { value: string, placeholder: string, onChange: (input: string) => void }) => {
    return (<input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm border border-solid border-table-border/50 px-1 pt-0.5 w-full"
    />)
}