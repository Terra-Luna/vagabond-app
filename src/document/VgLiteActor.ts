export class VgLiteActor<SubType extends Actor.SubType = Actor.SubType> extends Actor<SubType> {

    override prepareEmbeddedDocuments(): void {
        super.prepareEmbeddedDocuments()
        const system = this.system as any
        
        /**
         * This collects all the Actor's Burn effects and compiles them
         * into their ...system.statuses.stacks.burning array.
         */
        system.statuses.stacks.burning = []
        const activeBurns = this.effects.filter(
            (e: any) => !e.disabled && e.name.includes("burning.name")
        )

        activeBurns.forEach((effect: any) => {
            const stackChange = effect.changes.find(
                (c: any) => c.key === "system.statuses.stacks.burning"
            )

            if (stackChange) {
                try {
                    const parsedData = JSON.parse(stackChange.value)
                    system.statuses.stacks.burning.push({
                        effectId: effect.id || "",
                        duration: parsedData.duration || "Cd4",
                        sourceUuid: parsedData.sourceUuid || effect.origin || ""
                    })
                }
                catch (err) {
                    system.statuses.stacks.burning.push({
                        effectId: effect.id || "",
                        duration: "Cd4",
                        sourceUuid: effect.origin || ""
                    })
                }
            }
        })
    }

}