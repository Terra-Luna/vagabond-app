import { useMemo } from "react"

import { AdversaryDataModel } from "../../../../model/actor/AdversaryDataModel"
import { NpcDataModel } from "../../../../model/actor/NpcDataModel"
import type { PolymorphFlag } from "../../../../model/actor/util/PolymorphUtil"

export const usePolymorphActor = (polymorph?: PolymorphFlag): (Actor & { system: AdversaryDataModel | NpcDataModel }) | undefined => {
    return useMemo(() => {
        if (!polymorph) return undefined

        try {
            const { name, tokenImg, system, items } = polymorph.statBlock
            return new (Actor as any).implementation({
                name,
                img: tokenImg,
                type: "adversary",
                system,
                items
            }) as Actor & { system: AdversaryDataModel | NpcDataModel }
        }
        catch {
            return undefined
        }
    }, [polymorph?.statBlock])
}
