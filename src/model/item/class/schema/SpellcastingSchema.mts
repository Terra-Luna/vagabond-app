export const spellcastingSchema = () => {
    const f = foundry.data.fields
    return new f.SchemaField({
        isSpellcaster: new f.BooleanField({ initial: false }),
        manaMultiplier: new f.NumberField({ integer: true, min: 0, initial: 0 }),
        manaStat: new f.StringField({ initial: null, nullable: true, required: false }),
        castStat: new f.StringField({ initial: null, nullable: true, required: false })
    })
}