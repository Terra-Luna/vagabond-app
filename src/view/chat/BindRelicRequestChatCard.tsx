import {
  BIND_REQUEST_FLAG,
  WAS_BOUND_FLAG,
} from "../../model/item/equip/EquipmentDataModel"
import { sys_id } from "../../util/foundry-util"
import { appLang } from "../../util/lang"
import { localizeString } from "../../util/locale-util"
import { getTokenImg } from "../../util/model-util"
import {
  DestructiveButton,
  PrimaryButton,
  UtilityButton,
} from "../component/Button"
import { useChatMessageId } from "./ChatMessageContext"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"

const STATUS_FLAG = "bindRequestStatus"

export const BindRelicRequestChatCard = ({
  heroId,
  itemUuid,
}: {
  heroId: string
  itemUuid: string
}) => {
  const messageId = useChatMessageId()
  const message = messageId ? game.messages?.get(messageId) : undefined
  const status = message?.getFlag(sys_id, STATUS_FLAG) as
    | "accepted"
    | "rejected"
    | undefined

  const hero = game.actors?.get(heroId)
  const item = fromUuidSync(itemUuid) as (Item & { system: any }) | null
  const strings = appLang.HeroSheet.Inventory

  const notifyPlayers = (accepted: boolean) => {
    const userIds = (
      game.users?.filter(
        (user) => !user.isGM && !!hero?.testUserPermission(user, "OWNER"),
      ) ?? []
    ).map((user) => user.id)
    if (userIds.length === 0) return
    const template = accepted
      ? appLang.Notifications.bindRequestAcceptedNotice
      : appLang.Notifications.bindRequestRejectedNotice
    game.socket?.emit(`system.${sys_id}`, {
      action: "notifyBindResult",
      data: {
        userIds,
        message: localizeString(template, { name: item?.name ?? "" }),
      },
    })
  }

  const resolve = async (accepted: boolean) => {
    if (!item || !message || !game.user?.isActiveGM) return
    if (accepted) {
      if (!item.system.hasFreeRelicSlot()) return
      await item.update({
        "system.isBound": true,
        [`flags.${sys_id}.${WAS_BOUND_FLAG}`]: true,
      } as Record<string, any>)
    }
    await item.unsetFlag(sys_id, BIND_REQUEST_FLAG)
    await message.setFlag(
      sys_id,
      STATUS_FLAG,
      accepted ? "accepted" : "rejected",
    )
    notifyPlayers(accepted)
  }

  if (!hero || !item) return null

  return (
    <BaseChatCardHost
      banner={
        <ChatCardBanner
          portrait={getTokenImg(hero)}
          title={strings.bindRequestTitle}
        />
      }
      contents={
        <div className="flex flex-col gap-1 px-2 pb-1">
          <div className="flex gap-x-2 items-center">
            <span>{strings.bindRequestHero}:</span>
            <span className="font-normal">{hero.name}</span>
          </div>
          <div className="flex gap-x-2 items-center">
            <span>{strings.bindRequestItem}:</span>
            <span className="font-normal">{item.name}</span>
          </div>
          <div>
            <UtilityButton onClick={() => item.sheet?.render(true)}>
              {strings.bindRequestOpenItem}
            </UtilityButton>
          </div>

          {status ? (
            <p className="text-center italic">
              {status === "accepted"
                ? strings.bindRequestAccepted
                : strings.bindRequestRejected}
            </p>
          ) : (
            game.user?.isActiveGM && (
              <div className="flex justify-between items-center gap-x-2 mt-1">
                <PrimaryButton onClick={() => resolve(true)}>
                  {appLang.ButtonActions.accept}
                </PrimaryButton>
                <DestructiveButton
                  onClick={() => resolve(false)}
                  hideIcon={true}
                >
                  {appLang.ButtonActions.reject}
                </DestructiveButton>
              </div>
            )
          )}
        </div>
      }
    />
  )
}
