import { createContext, useContext } from "react"

export const DimensionsContext = createContext({ width: 1, height: 1, top: 0, left: 0 })

export const useDimensions = () => useContext(DimensionsContext)