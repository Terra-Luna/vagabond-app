import { ReactNode } from "react"

import { DimensionsContext } from "../context/DimensionsContext"
import { EditModeOptions } from "../context/EditModeContext/EditModeOptions"
import { EditModeContextProvider } from "./EditModeContextProvider"
import { EmotionCacheContext } from "./EmotionCacheContext"
import { FoundryHotkeyBlocker } from "./FoundryHotkeyBlocker"

interface SheetWrappersProps {
  children: ReactNode
  dimensions: { width: number; height: number; top: number; left: number }
  isDetached: boolean
  rawHeight: number | "auto"
  scaduRoot: ShadowRoot
  startInEditMode: boolean | EditModeOptions
  theme: string
}

export const SheetWrappers = ({
  children,
  dimensions: { width, height, top, left },
  isDetached,
  rawHeight,
  scaduRoot,
  startInEditMode,
  theme,
}: SheetWrappersProps) => (
  <FoundryHotkeyBlocker>
    <DimensionsContext.Provider value={{ width, height, top, left }}>
      <EditModeContextProvider
        initialEditMode={
          typeof startInEditMode === "boolean"
            ? startInEditMode
              ? EditModeOptions.TRUE
              : EditModeOptions.FALSE
            : startInEditMode
        }
      >
        <EmotionCacheContext scaduRoot={scaduRoot}>
          <div
            className={`
                        ${theme} app-themed-content flex flex-col bg-sheet-main-fill
                        font-paradigm tracking-wider rounded-b-lg overflow-hidden
                    `}
            style={{
              height:
                isDetached || typeof rawHeight === "number" ? height : "100%",
              maxHeight: isDetached ? undefined : `calc(88vh - ${top}px)`,
              overflowY:
                rawHeight === "auto" && !isDetached ? "auto" : undefined,
            }}
          >
            {children}
          </div>
        </EmotionCacheContext>
      </EditModeContextProvider>
    </DimensionsContext.Provider>
  </FoundryHotkeyBlocker>
)
