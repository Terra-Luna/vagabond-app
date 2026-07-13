import React from 'react'

interface StopPropagationProps {
    children: React.ReactNode
}

export const FoundryHotkeyBlocker = ({ children }: StopPropagationProps) => {    
    const stopKeys = (e: React.KeyboardEvent) => {
        e.stopPropagation()
    }

    return (
        <div onKeyDown={stopKeys} onKeyUp={stopKeys}>
            {children}
        </div>
    )
}