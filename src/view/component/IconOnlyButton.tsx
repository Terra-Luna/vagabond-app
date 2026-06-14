import { ReactNode } from "react"
import { LucideProps } from "lucide-react"

export const IconOnlyButton = ({ Icon, className, ...rest }: { Icon: (props: Partial<LucideProps>) => ReactNode, className?: string } & Partial<LucideProps> & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => {
    return <button className={className} {...rest}><Icon {...rest} /></button>
}