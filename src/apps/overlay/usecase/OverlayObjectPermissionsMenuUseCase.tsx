import { Eye, Globe, Link2, Users } from "lucide-react"
import { useRef } from "react"

import { CtxMenuItem } from "../../../view/component/ContextMenu"
import {
    isVisibleInCurrentScene, isVisibleToCurrentUser, OverlayObjectPermissions,
    togglePlayerInteraction, togglePlayerVisibility, toggleSceneLink
} from "../../vagabond-tools/usecase/VagabondSettingsHelper"

type PermissionedOverlayObject = OverlayObjectPermissions & { id: string }

/**
 * Shared GM context-menu logic (player visibility/interaction toggles, scene link) and visibility
 * filtering for overlay widgets like Progress Clocks and Countdown Timers. Any newly-added "widgets"
 * should be able to share this logic.
 */
export const useOverlayObjectPermissionsMenu = <T extends PermissionedOverlayObject>(
    items: T[],
    saveItems: (items: T[]) => Promise<void>,
    getPlayerDefaultPermission: () => boolean
) => {
    const itemsRef = useRef(items)
    itemsRef.current = items

    const visibleItems = items.filter(item => isVisibleToCurrentUser(item) && isVisibleInCurrentScene(item))

    const setOverrides = async (id: string, overrides: Partial<T>) => {
        await saveItems(itemsRef.current.map(item => item.id === id ? { ...item, ...overrides } : item))
    }

    const playerVisibilitySubMenu = (id: string): CtxMenuItem[] => {
        return (game.users?.filter(u => !u.isGM) ?? []).map(user => ({
            label: user.name ?? '',
            isSelected: () => !itemsRef.current.find(it => it.id === id)?.hiddenFromUserIds?.includes(user.id),
            action: async (e) => {
                e.keepOpen = true
                const item = itemsRef.current.find(it => it.id === id)
                if (!item) return
                await setOverrides(id, { hiddenFromUserIds: togglePlayerVisibility(item, user.id) } as Partial<T>)
            }
        }))
    }

    const playerInteractionSubMenu = (id: string): CtxMenuItem[] => {
        return (game.users?.filter(u => !u.isGM) ?? []).map(user => ({
            label: user.name ?? '',
            isSelected: () => itemsRef.current.find(it => it.id === id)?.interactableUserIds?.includes(user.id) ?? getPlayerDefaultPermission(),
            action: async (e) => {
                e.keepOpen = true
                const item = itemsRef.current.find(it => it.id === id)
                if (!item) return
                await setOverrides(id, { interactableUserIds: togglePlayerInteraction(item, user.id, getPlayerDefaultPermission()) } as Partial<T>)
            }
        }))
    }

    const gmMenuItems = (item: T): CtxMenuItem[] => (!game.user?.isGM ? [] : [
        { label: "Player Visibility", icon: Eye, subMenuItems: () => playerVisibilitySubMenu(item.id) },
        { label: "Player Interaction", icon: Users, subMenuItems: () => playerInteractionSubMenu(item.id) },
        {
            label: item.sceneId ? "Unlink from Scene (Make Global)" : "Link to Current Scene",
            icon: item.sceneId ? Globe : Link2,
            action: async () => await setOverrides(item.id, { sceneId: toggleSceneLink(item) } as Partial<T>)
        }
    ])

    return { itemsRef, visibleItems, setOverrides, gmMenuItems }
}
