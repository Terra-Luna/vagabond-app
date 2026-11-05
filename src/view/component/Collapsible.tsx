import { LucideChevronDown, LucideChevronUp } from "lucide-react"
import { ReactNode, useCallback, useState } from "react"

import { fields } from "../../model/common/shared-schemas"
import { sys_id } from "../../util/foundry-util"
import { appLang } from "../../util/lang"
import { ClearHeader, Header, SkillCardAction } from "./Header"

export interface CollapsibleHeaderProps {
  img?: string
  dmgType?: string
  title: string | ReactNode
  toggleCollapsedButton?: ReactNode
  toggleCollapsed?: () => void
  actions?: SkillCardAction[]
  badge?: ReactNode
}

interface CollapsibleHeader {
  ({ toggleCollapsedButton, title }: CollapsibleHeaderProps): ReactNode
}

export const Collapsible = ({
  img = "",
  dmgType = "none",
  title,
  Header,
  content,
  startCollapsed = false,
  hideCollapseButton,
  className,
  actions,
  badge,
}: {
  img?: string
  dmgType?: string
  title: string | ReactNode
  Header: CollapsibleHeader
  content: ReactNode
  startCollapsed?: boolean
  hideCollapseButton?: boolean
  className?: string
  actions?: SkillCardAction[]
  badge?: ReactNode
}) => {
  const [isCollapsed, setCollapsed] = useState(startCollapsed)
  const toggleCollapsed = useCallback(() => {
    setCollapsed(!isCollapsed)
  }, [isCollapsed])
  return (
    <div className={className}>
      <Header
        img={img}
        dmgType={dmgType}
        title={title}
        badge={badge}
        toggleCollapsed={hideCollapseButton ? undefined : toggleCollapsed}
        actions={actions}
        toggleCollapsedButton={
          hideCollapseButton ? null : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                toggleCollapsed()
              }}
            >
              <ToggleCollapseIcon isCollapsed={isCollapsed} />
            </button>
          )
        }
      />
      {isCollapsed ? <></> : content}
    </div>
  )
}

export const CollapsibleSection = ({
  title,
  content,
  settingsKey,
  startCollapsed = false,
  useClearHeader = false,
  actions,
}: {
  title: string | ReactNode
  content: React.ReactElement
  settingsKey?: string
  startCollapsed?: boolean
  useClearHeader?: boolean
  actions?: SkillCardAction[]
}) => {
  let initialCollapsedValue = startCollapsed
  const settings = game.settings! as any
  if (settingsKey) {
    settings.register(sys_id, settingsKey, {
      name: appLang.General.heroSheetSetting,
      hint: appLang.General.heroSheetDynamicSetting,
      scope: "client",
      type: new fields.BooleanField(),
      default: false,
    })

    initialCollapsedValue = settings.get(sys_id, settingsKey)
  }

  const [isCollapsed, setCollapsed] = useState(initialCollapsedValue)
  const toggleCollapsed = useCallback(() => {
    const newVal = !isCollapsed
    if (settingsKey) {
      settings.set(sys_id, settingsKey, newVal)
    }
    setCollapsed(newVal)
  }, [isCollapsed, settingsKey])

  return (
    <div>
      <div onClick={toggleCollapsed}>
        {useClearHeader ? (
          <ClearHeader
            title={title}
            collapseButton={
              <ToggleCollapseIcon isCollapsed={isCollapsed} isClear={true} />
            }
          />
        ) : (
          <Header
            title={title}
            collapseButton={<ToggleCollapseIcon isCollapsed={isCollapsed} />}
            actions={actions}
          />
        )}
      </div>
      {isCollapsed ? <></> : content}
    </div>
  )
}

const ToggleCollapseIcon = ({
  isCollapsed,
  isClear,
}: {
  isCollapsed: boolean
  isClear?: boolean
}) => {
  const style = isClear
    ? "text-text-primary"
    : "text-text-header-secondary bg-section-header-fill rounded-full"
  return isCollapsed ? (
    <LucideChevronDown className={style} />
  ) : (
    <LucideChevronUp className={style} />
  )
}
