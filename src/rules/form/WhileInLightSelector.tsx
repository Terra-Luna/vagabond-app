import { appLang } from "../../util/lang"
import { ItemRuleSelector } from "../shared/ItemRuleInput"

export const WhileInLightSelector = ({
  value,
  onChange,
  allowNone = true,
}: {
  value: string
  onChange: (value: string) => void
  allowNone?: boolean
}) => (
  <ItemRuleSelector
    label={appLang.RulesEditor.whileInLight}
    value={value}
    options={
      <>
        {allowNone && <option value="">{appLang.RulesEditor.always}</option>}
        <option value="basic">{appLang.ItemSheet.lightTypeNone}</option>
        <option value="sunlight">{appLang.ItemSheet.sunlight}</option>
        <option value="moonlight">{appLang.ItemSheet.moonlight}</option>
      </>
    }
    onChange={(e) => onChange(e.target.value)}
  />
)
