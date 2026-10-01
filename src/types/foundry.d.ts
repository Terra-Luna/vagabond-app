import type { VagabondAPI } from "../apps/api/VagabondAPI"

declare global {
    interface GameSystem {
        api: VagabondAPI
    }
}

export { }