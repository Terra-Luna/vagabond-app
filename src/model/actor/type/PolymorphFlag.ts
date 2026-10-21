import type { NpcDataModel } from "../NpcDataModel"

export interface PolymorphFlag {
    casterId: string,
    duration: 'focus' | 'continual',
    statBlock: PolymorphStatBlock,
    equipHistory?: (string | null)[]
}

interface PolymorphStatBlock {
    id: string,
    name: string,
    tokenImg: string,
    items: any[],
    system: NpcDataModel
}