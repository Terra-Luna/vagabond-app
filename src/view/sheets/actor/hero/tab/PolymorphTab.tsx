import { PolymorphAppView } from "../../../../../apps/vagabond-tools/polymorph/PolymorphAppView"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { appLang } from "../../../../../utils/lang"
import { ClearHeader } from "../../../../component/Header"

export const PolymorphTab = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {
    return <div className="w-full mb-4">
        <PolymorphAppView caster={actor} header={<ClearHeader title={appLang.HeroSheet["tab-polymorph"]} />} />
    </div>
}