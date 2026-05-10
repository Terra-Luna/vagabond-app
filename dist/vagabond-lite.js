//#region src/model/actor/ActorBase.mts
var e = () => {
	let e = foundry.data.fields;
	return {
		health: new e.SchemaField({
			value: new e.NumberField({
				required: !0,
				number: !0,
				min: 0,
				initial: 2
			}),
			max: new e.NumberField({
				required: !0,
				integer: !0,
				min: 0,
				initial: 2
			}),
			maxBonus: new e.NumberField({
				required: !1,
				integer: !0,
				min: 0,
				initial: 0
			})
		}),
		armor: new e.SchemaField({
			rating: new e.NumberField({
				required: !0,
				integer: !0,
				min: 0,
				initial: 0
			}),
			bonus: new e.NumberField({
				required: !1,
				integer: !0,
				min: 0,
				initial: 0
			}),
			total: new e.NumberField({
				required: !0,
				integer: !0,
				min: 0,
				initial: 0
			})
		}),
		movement: new e.ArrayField(new e.SchemaField({
			speed: new e.NumberField({
				integer: !0,
				min: 0
			}),
			type: new e.StringField({ choices: [
				"walk",
				"fly",
				"cling",
				"climb",
				"phase",
				"swim"
			] })
		})),
		size: new e.StringField({
			choices: [
				"small",
				"medium",
				"large",
				"huge",
				"giant",
				"colossal"
			],
			initital: "medium"
		}),
		beingType: new e.StringField({
			choices: [
				"artificial",
				"beast",
				"cryptid",
				"fae",
				"humanlike",
				"outer",
				"primordial",
				"undead"
			],
			initial: "humanlike"
		}),
		senses: new e.SchemaField({
			allsight: new e.BooleanField({ initial: !1 }),
			blindsight: new e.BooleanField({ initial: !1 }),
			darksight: new e.BooleanField({ initial: !1 }),
			echolocation: new e.BooleanField({ initial: !1 }),
			seismicsense: new e.BooleanField({ initial: !1 }),
			telepathy: new e.BooleanField({ initial: !1 })
		})
	};
}, t = class extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return { ...e() };
	}
}, n = () => {
	let e = foundry.data.fields;
	return {
		hitDice: new e.NumberField({
			required: !0,
			integer: !0,
			min: 1,
			initial: 1
		}),
		threatLevel: new e.StringField(),
		zone: new e.StringField({ choices: [
			"frontline",
			"midline",
			"backline"
		] }),
		morale: new e.NumberField({
			integer: !0,
			min: 2,
			max: 12
		}),
		numberAppearing: new e.StringField(),
		actions: new e.ArrayField(new e.SchemaField({
			name: new e.StringField(),
			type: new e.StringField({ choices: [
				"Melee",
				"Ranged",
				"Cast",
				"Combo"
			] }),
			description: new e.StringField(),
			damage: new e.StringField({
				required: !1,
				initial: "1d4"
			}),
			avgDamage: new e.NumberField({
				required: !1,
				integer: !0,
				initial: 0
			})
		})),
		abilities: new e.ArrayField(new e.SchemaField({
			name: new e.StringField(),
			description: new e.StringField()
		}))
	};
}, r = class extends t {
	static defineSchema() {
		return foundry.data.fields, {
			...super.defineSchema(),
			...n()
		};
	}
	async prepareDerivedData() {
		super.prepareDerivedData(), this.health.max = this.size?.toUpperCase() === "SMALL" ? this.hitDice : Math.floor(this.hitDice * 4.5), this.threatLevel = this._calculateThreatLevel();
	}
	_calculateThreatLevel() {
		var e = this.armor.total * 2, t = this.health.max / 10, n = (this.actions.map((e) => e.avgDamage).reduce((e, t) => (e || 0) + (t || 0), 0) || 0) / this.actions.entries.length / 6;
		return ((e + t) / 4 + (n || 0)).toFixed(2);
	}
}, i = () => {
	let e = foundry.data.fields;
	return {
		g: new e.NumberField({
			required: !0,
			integer: !0,
			min: 0,
			initial: 0
		}),
		s: new e.NumberField({
			required: !0,
			integer: !0,
			min: 0,
			initial: 0
		}),
		c: new e.NumberField({
			required: !0,
			integer: !0,
			min: 0,
			initial: 0
		})
	};
}, a = class extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return i();
	}
	async consolidateDenominations() {
		o(this);
	}
}, o = (e) => {
	var t = Math.floor(e.c / 100);
	e.s += t, e.c %= 100;
	var n = Math.floor(e.s / 100);
	e.g += n, e.s %= 100;
}, s = () => ({ description: new foundry.data.fields.HTMLField() }), c = class extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return s();
	}
}, l = () => {
	let e = foundry.data.fields;
	return {
		value: new e.SchemaField({ ...a.defineSchema() }),
		slots: new e.NumberField({
			integer: !0,
			min: 0,
			max: 4
		}),
		isEquipped: new e.BooleanField({ initial: !1 }),
		relicData: new e.SchemaField({
			isRelic: new e.BooleanField({ initial: !1 }),
			requiresBind: new e.BooleanField({ initial: !1 }),
			isBound: new e.BooleanField({ initial: !1 })
		})
	};
}, u = class extends c {
	static defineSchema() {
		return foundry.data.fields, {
			...super.defineSchema(),
			...l()
		};
	}
}, d = () => {
	let e = foundry.data.fields;
	return {
		mana: new e.SchemaField({
			max: new e.NumberField({
				required: !0,
				integer: !0,
				min: 0,
				initial: 0
			}),
			value: new e.NumberField({
				required: !0,
				integer: !0,
				min: 0,
				initial: 0
			}),
			maxCast: new e.NumberField({ integer: !0 })
		}),
		currentLuck: new e.NumberField({
			integer: !0,
			initial: 2,
			max: 2
		}),
		fatigue: new e.NumberField({
			choices: [
				0,
				1,
				2,
				3,
				4,
				5
			],
			initial: 0
		}),
		level: new e.SchemaField({
			current: new e.NumberField({
				integer: !0,
				min: 0,
				max: 10,
				initial: 0
			}),
			xp: new e.NumberField({
				integer: !0,
				initial: 0
			}),
			xpToLevel: new e.NumberField({
				integer: !0,
				initial: 10
			})
		}),
		stats: new e.SchemaField({
			might: new e.NumberField({
				integer: !0,
				min: 2,
				max: 7,
				initial: 2
			}),
			dexterity: new e.NumberField({
				integer: !0,
				min: 2,
				max: 7,
				initial: 2
			}),
			awareness: new e.NumberField({
				integer: !0,
				min: 2,
				max: 7,
				initial: 2
			}),
			reason: new e.NumberField({
				integer: !0,
				min: 2,
				max: 7,
				initial: 2
			}),
			presence: new e.NumberField({
				integer: !0,
				min: 2,
				max: 7,
				initial: 2
			}),
			luck: new e.NumberField({
				integer: !0,
				min: 2,
				max: 7,
				initial: 2
			})
		}),
		boundRelicLimit: new e.NumberField({
			integer: !0,
			initial: 3
		}),
		inventory: new e.SchemaField({
			wealth: new e.SchemaField({ ...a.defineSchema }),
			maxSlots: new e.NumberField({
				integer: !0,
				min: 8,
				initial: 8
			}),
			slotBonus: new e.NumberField({
				integer: !0,
				min: 0,
				initial: 0
			}),
			equipped: new e.ArrayField(new e.TypedSchemaField({ ...u.defineSchema }))
		})
	};
}, f = class extends t {
	static defineSchema() {
		return foundry.data.fields, {
			...super.defineSchema(),
			...d()
		};
	}
	async prepareDerivedData() {
		super.prepareDerivedData(), this.health.max = this.stats.might * (this.level.current || 1);
	}
};
//#endregion
//#region src/vagabond-lite.ts
Hooks.once("init", () => {
	console.log("HELLO WORLD"), Object.assign(CONFIG.Actor.dataModels, {
		hero: f,
		adversary: r
	});
});
//#endregion

//# sourceMappingURL=vagabond-lite.js.map