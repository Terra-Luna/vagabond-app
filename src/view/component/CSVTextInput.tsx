import { useEffect,useState } from 'react'

interface CSVTextInputProps {
    value: number[]
    onChange: (values: number[]) => void
    placeholder?: string
    className?: string
    label?: string
}

export const CSVTextInput = ({
    value,
    onChange,
    placeholder = "e.g., 6, 10, 12",
    className = "",
    label
}: CSVTextInputProps) => {
    const [localString, setLocalString] = useState('')

    useEffect(() => {
        if (value) {
            setLocalString(value.join(', '))
        }
    }, [value])

    const handleBlur = () => {
        const parsedNumbers = localString
            .split(',')
            .map(item => item.trim())
            .filter(item => item !== '')
            .map(item => Number(item))
            .filter(item => !isNaN(item))

        const uniqueNumbers = Array.from(new Set(parsedNumbers))
        onChange(uniqueNumbers)
        setLocalString(uniqueNumbers.join(', '))
    }

    return (
        <div className="flex flex-col gap-y-1 w-full">
            {label && <label className="text-lg font-eskapade text-text-primary">{label}</label>}
            <input
                type="text"
                value={localString}
                onChange={(e) => setLocalString(e.target.value)}
                onBlur={handleBlur}
                placeholder={placeholder}
                className={`border border-solid border-table-border/50 px-2 py-1 text-sm ${className}`}
            />
        </div>
    )
}