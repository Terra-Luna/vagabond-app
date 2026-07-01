import { LucideCheckCheck, LucideCheckSquare, LucideSquare } from "lucide-react";

interface CheckboxProps {
    label: string;
    onCheckedChanged: (checked: boolean) => void;
    checked: boolean;
}

export const Checkbox = ({ label, onCheckedChanged, checked }: CheckboxProps) => (
    <label className="flex items-center gap-1" onClick={() => onCheckedChanged(!checked)}>
        <input
            className="hidden"
            type="checkbox"
            checked={checked} />

        <span className="" aria-hidden="true">
            {checked ? <LucideCheckSquare /> : <LucideSquare />}
        </span>

        <span className="">{label}</span>
    </label>
)