import { NumericCounterInput } from "../../../../../../../component/EditableTextField"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const SpellRangeInput = ({
  size,
  label,
  onUpdateAreaSize,
  increment,
  readOnly = false,
}: {
  size: number
  label: string
  onUpdateAreaSize: (input: string | null) => void
  increment: number
  readOnly?: boolean
}) => {
  return (
    <div className="flex flex-col justify-center">
      <SpellcastingLabel text={label} />
      <span className="flex justify-center text-xl font-eskapade">
        {readOnly ? (
          <p>{size}&apos;</p>
        ) : (
          <NumericCounterInput
            value={size}
            valueAppend={"'"}
            onChange={onUpdateAreaSize}
            incrementBy={increment}
          />
        )}
      </span>
    </div>
  )
}
