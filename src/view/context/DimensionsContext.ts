import { createContext, useContext } from "react"

export const DimensionsContext = createContext({ width: 1, height: 1 })

export const useDimensions = () => useContext(DimensionsContext)