const EYE_ICON = "url(icons/svg/eye.svg)"

/**
 * The Focusing icon, drawn as a mask so it follows the current text color.
 */
export const FocusBadge = ({
  size = 20,
  className = "text-text-header-secondary",
  title,
  onClick,
}: {
  size?: number
  className?: string
  title?: string
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void
}) => (
  <span
    role={onClick ? "button" : "img"}
    title={title}
    onClick={onClick}
    className={`inline-block flex-shrink-0 bg-current ${onClick ? "cursor-pointer" : ""} ${className}`}
    style={{
      width: size,
      height: size,
      maskImage: EYE_ICON,
      maskSize: "contain",
      maskRepeat: "no-repeat",
      maskPosition: "center",
      WebkitMaskImage: EYE_ICON,
      WebkitMaskSize: "contain",
      WebkitMaskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
    }}
  />
)
