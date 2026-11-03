import { createContext, useContext } from "react"

export const ChatMessageContext = createContext<string>("")

export const useChatMessageId = () => useContext(ChatMessageContext)
