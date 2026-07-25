import { ReactNode } from "react"
import { LucideProps } from "lucide-react"

export const IconOnlyButton = ({ Icon, className, colorClassName, ...rest }: { Icon: (props: Partial<LucideProps>) => ReactNode, className?: string, colorClassName?: string } & Partial<LucideProps> & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => {
    return <button className={`${className} cursor-pointer`} {...rest}><Icon className={colorClassName} {...rest} /></button>
}