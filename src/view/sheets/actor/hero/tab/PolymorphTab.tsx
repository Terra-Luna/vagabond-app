import { PolymorphAppView } from "../../../../../apps/vagabond-tools/polymorph/PolymorphAppView"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"

export const PolymorphTab = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {
    return <div className="w-full mb-4">
        <PolymorphAppView caster={actor} />
    </div>
}