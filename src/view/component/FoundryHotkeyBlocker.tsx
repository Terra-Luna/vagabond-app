import React, { ReactNode } from 'react'

export const FoundryHotkeyBlocker = ({ children }: { children: ReactNode }) => {
    const stopKeys = (e: React.KeyboardEvent) => {
        e.stopPropagation()
    }

    return (
        <div onKeyDown={stopKeys} onKeyUp={stopKeys}>
            {children}
        </div>
    )
}