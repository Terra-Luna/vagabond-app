import { tableBorderRounded } from "../common/border-styles"

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    clearLabel?: string
    className?: string
}

export const SearchBar = ({ value, onChange, placeholder, clearLabel, className = "" }: SearchBarProps) => (
    <div className={`relative flex items-center ${className}`}>
        <input
            type="text"
            value={value}
            placeholder={placeholder}
            className={`w-full text-lg text-text-secondary font-paradigm font-normal italic px-2 py-1 pr-8 ${tableBorderRounded}`}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="off"
        />
        {value.length > 0 && (
            <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-0 pr-2 text-text-secondary hover:text-destructive-action font-bold cursor-pointer"
                aria-label={clearLabel}
            >✕</button>
        )}
    </div>
)
