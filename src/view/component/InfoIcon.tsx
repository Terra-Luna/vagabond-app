import { Info } from "lucide-react"
import type { ReactNode } from "react"

import { Tooltip } from "./Tooltip"

/** A small info icon that explains something in a tooltip when hovered. */
export const InfoIcon = ({
  title,
  content,
  maxWidth,
  className = "",
}: {
  title: string
  content: ReactNode
  maxWidth?: string
  className?: string
}) => {
  return (
    <Tooltip title={title} content={content} maxWidth={maxWidth}>
      <Info
        size={14}
        strokeWidth={3}
        className={`text-text-header-tertiary ${className}`.trim()}
      />
    </Tooltip>
  )
}
