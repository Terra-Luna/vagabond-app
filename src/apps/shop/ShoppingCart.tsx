import { ReactNode } from "react"

import { vgLiteLang } from "../../utils/lang"

export const ShoppingCart = ({ children }: { children: ReactNode }) => {
    return (
        <div className="overflow-auto">
            <table className="table-fixed w-full border border-solid border-table-border">
                <thead className="bg-section-header-fill text-text-section-header text-sm">
                    <tr>
                        <th className="text-left pl-2 w-5/9">{vgLiteLang.HeroSheet.Inventory.item}</th>
                        <th className="text-center">{vgLiteLang.HeroSheet.Inventory.slots}</th>
                        <th className="text-center">{vgLiteLang.HeroSheet.Inventory.value}</th>
                        <th className="text-center ml-auto" />
                    </tr>
                </thead>
                <tbody className="font-eskapade">
                    {children}
                </tbody>
            </table>
        </div>
    )
}