import { ReactNode } from "react"

export const BorderedContent = ({ children }: { children: ReactNode }) => {
    return (
        <div className="flex w-fit gap-x-2 p-2 mx-auto justify-center border border-solid border-table-border rounded-md">
            {children}
        </div>
    )
}