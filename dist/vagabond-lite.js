//#region src/model/actor/ActorDataModel.ts
var e = () => {
	let e = foundry.data.fields;
	return {
		health: new e.SchemaField({
			value: new e.NumberField({
				required: !0,
				integer: !0,
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
			rating: new e.NumberField({ ...L }),
			bonus: new e.NumberField({
				required: !1,
				integer: !0,
				min: 0,
				initial: 0
			}),
			total: new e.NumberField({ ...L })
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
		return {
			...super.defineSchema(),
			...n()
		};
	}
	async prepareDerivedData() {
		super.prepareDerivedData(), this.health.max = this.size?.toUpperCase() === "SMALL" ? this.hitDice : Math.floor(this.hitDice * 4.5), this.threatLevel = this.calculateThreatLevel();
	}
	calculateThreatLevel() {
		return i(this);
	}
}, i = (e) => {
	var t = e.armor.total * 2, n = e.health.max / 10, r = (e.actions.map((e) => e.avgDamage).reduce((e, t) => (e || 0) + (t || 0), 0) || 0) / e.actions.entries.length / 6;
	return ((t + n) / 4 + (r || 0)).toFixed(2);
}, a = () => {
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
}, o = class extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return a();
	}
	async consolidateDenominations() {
		s(this);
	}
}, s = (e) => {
	var t = Math.floor(e.c / 100);
	e.s += t, e.c %= 100;
	var n = Math.floor(e.s / 100);
	e.g += n, e.s %= 100;
}, c = () => ({ description: new foundry.data.fields.HTMLField() }), l = class extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return c();
	}
}, u = () => {
	let e = foundry.data.fields;
	return {
		value: new e.SchemaField({ ...o.defineSchema() }),
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
}, d = class extends l {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...u()
		};
	}
}, f = () => (foundry.data.fields, {}), p = class extends l {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...f()
		};
	}
}, m = () => {
	let e = foundry.data.fields;
	return {
		granted: new e.ArrayField(new e.StringField(), { initial: [] }),
		choices: h()
	};
}, h = () => {
	let e = foundry.data.fields;
	return new e.ArrayField(new e.SchemaField({
		options: new e.ArrayField(new e.StringField(), { initial: [] }),
		count: new e.NumberField({
			integer: !0,
			initial: 0,
			min: 0
		})
	}), { initial: [] });
}, g = () => {
	let e = foundry.data.fields;
	return {
		name: new e.StringField({
			...F,
			initial: ""
		}),
		description: new e.StringField({ initial: "" }),
		level: new e.NumberField({
			required: !0,
			integer: !0,
			min: 1,
			max: 10,
			initial: 1
		}),
		statBonus: new e.NumberField({
			...I,
			max: 10
		}),
		perkOptions: new e.ArrayField(new e.StringField({ initial: "" }), { initial: [] }),
		perkLimit: new e.NumberField({ ...I }),
		skillTraining: new e.NumberField({
			...I,
			max: 10
		}),
		skillOptions: h()
	};
}, _ = () => {
	let e = foundry.data.fields;
	return {
		isSpellcaster: new e.BooleanField({ initial: !1 }),
		manaMultiplier: new e.NumberField({
			integer: !0,
			min: 0,
			initial: 0
		}),
		manaStat: new e.StringField({
			initial: null,
			nullable: !0,
			required: !1
		}),
		castStat: new e.StringField({
			initial: null,
			nullable: !0,
			required: !1
		})
	};
}, v = () => (foundry.data.fields, {}), y = () => {
	let e = foundry.data.fields;
	return {
		spellcasting: new e.SchemaField({ ..._() }),
		keyStats: new e.ArrayField(new e.StringField(), { initial: [] }),
		skillsTraining: new e.SchemaField({ ...m() }),
		features: new e.ArrayField(new e.SchemaField({ ...g() })),
		spellsProgression: new e.SchemaField({ ...v() })
	};
}, b = class extends l {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...y()
		};
	}
}, x = () => {
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
		ancestry: new e.SchemaField({ ...p.defineSchema() }),
		class: new e.SchemaField({ ...b.defineSchema() }),
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
		inventory: new e.SchemaField({
			wealth: new e.SchemaField({ ...o.defineSchema() }),
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
			equipped: new e.ArrayField(new e.SchemaField({ ...d.defineSchema() }))
		}),
		boundRelicLimit: new e.NumberField({
			integer: !0,
			initial: 3
		})
	};
}, S = class extends t {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...x()
		};
	}
	async prepareDerivedData() {
		super.prepareDerivedData(), this.health.max = this.stats.might * (this.level.current || 1);
	}
}, C = () => {
	let e = foundry.data.fields;
	return {
		armorType: new e.StringField({
			reuired: !1,
			initial: "light",
			choices: [
				"light",
				"medium",
				"heavy"
			]
		}),
		baseArmor: new e.NumberField({
			integer: !0,
			min: 0,
			initial: 0
		})
	};
}, w = class extends d {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...C()
		};
	}
	prepareDerivedData() {
		super.prepareDerivedData(), this.baseArmor = {
			light: 1,
			medium: 2,
			heavy: 3
		}[this.armorType || 0];
	}
	onEquip(e) {}
	onUse() {}
}, T = () => {
	let e = foundry.data.fields;
	return {
		range: new e.StringField({
			required: !1,
			initial: "close",
			choices: [
				"close",
				"near",
				"far"
			]
		}),
		damage1H: new e.StringField({
			required: !1,
			initial: ""
		}),
		damage2H: new e.StringField({
			required: !1,
			initial: ""
		}),
		grip: new e.SchemaField({
			options: new e.StringField({
				required: !1,
				initial: "1H",
				choices: [
					"1H",
					"2H",
					"V",
					"F"
				]
			}),
			gripState: new e.StringField({
				required: !1,
				initial: ""
			})
		}),
		attackSkills: new e.ArrayField(new e.StringField({
			initial: "",
			required: !0
		}), { initial: [] }),
		properties: new e.ArrayField(new e.StringField({
			required: !0,
			blank: !1
		}), { initial: [] }),
		explodeData: new e.SchemaField({
			canExplode: new e.BooleanField({ initial: !1 }),
			explodesOn: new e.ArrayField(new e.NumberField({
				integer: !0,
				initial: 0,
				required: !1
			}), { initial: [] })
		}),
		isCrude: new e.BooleanField({ initial: !1 })
	};
}, E = class extends d {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...T()
		};
	}
	onEquip(e) {}
	onUse() {}
}, D = () => (foundry.data.fields, {}), O = class extends d {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...D()
		};
	}
	onEquip(e) {}
	onUse() {}
}, k = () => (foundry.data.fields, {}), A = class extends l {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...k()
		};
	}
}, j = () => (foundry.data.fields, {}), M = class extends l {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...j()
		};
	}
}, N = () => (foundry.data.fields, {}), P = class extends t {
	static defineSchema() {
		return {
			...super.defineSchema(),
			...N()
		};
	}
};
//#endregion
//#region src/vagabond-lite.ts
Hooks.once("init", () => {
	console.log("HELLO WORLD"), Object.assign(CONFIG.Actor.dataModels, {
		hero: S,
		adversary: r,
		npc: P
	}, CONFIG.Item.dataModels, {
		armor: w,
		weapon: E,
		sundry: O,
		ancestry: p,
		class: b,
		perk: M,
		spell: A
	});
});
var F = {
	required: !0,
	nullable: !1
}, I = {
	integer: !0,
	min: 0,
	initial: 0
}, L = {
	required: !0,
	integer: !0,
	min: 0,
	initial: 0
};
//#endregion
export { L as requiredInteger, F as requiredString, I as standardInteger };

//# sourceMappingURL=vagabond-lite.js.map