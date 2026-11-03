import { ReactNode } from "react"

import type { CardSubHeaderValues } from "../../component/CardSubHeader"
import { CardSubHeader } from "../../component/CardSubHeader"
import { Divider } from "../../component/Header"
import { TrashButton } from "../../component/TrashButton"
import { useChatMessageId } from "../ChatMessageContext"
import { ChatCardPortrait } from "./ChatCardPortrait"

export const ChatCardBanner = ({
  tokenId = "",
  portrait,
  title,
  subtitle = [],
}: {
  tokenId?: string
  portrait: string
  title: string | ReactNode
  subtitle?: CardSubHeaderValues[]
}) => {
  const messageId = useChatMessageId()
  const message = messageId ? game.messages?.get(messageId) : undefined
  const canDelete =
    !!message && !!game.user && message.canUserModify(game.user, "delete")

  return (
    <div>
      <div
        className={`flex space-x-1 items-center bg-section-header-fill rounded-t-md px-1 font-eskapade font-bold min-h-[54px]`}
      >
        {portrait != null && portrait.length > 0 && (
          <ChatCardPortrait portrait={portrait} tokenId={tokenId} />
        )}
        <div className="flex w-full items-center text-text-section-header">
          <div className="text-lg mr-1">{title}</div>
          <Divider />
        </div>
        {canDelete && (
          <TrashButton
            onClick={() => message?.delete()}
            className="text-text-section-header"
          />
        )}
      </div>
      {/* SUBHEADER */}
      {subtitle.length > 0 && (
        <CardSubHeader values={subtitle} showRightBorder={false} />
      )}
    </div>
  )
}
