

rend.talents = {

	"strike":{
		name: "Strike",
		attack: { type: "melee" },
		defense: {
			type: "block",
			ungainly: +1,
			_vs: { "melee": { defense_weight: +1 } },
		},
	},

	"slam": {
		name: "Slam",
		attack: {
			type: "melee",
			attack_weight: +1,
			impact: +1,
			ungainly: +1,
		},
		defense: {
			_vs: { "melee": { kickback: +1 } },
		},
	},

	"tumble": {
		name: "Tumble",
		attack: {
			type: "melee",
			attack_weight: -1,
			kickback: -1,
		},
		defense: {
			defense_weight: -1,
			ungainly: +1,
			_vs: { "melee": { recoil: +1 } },
		}
	},

	"shield": {
		name: "Shield",
		attack: {
			type: "melee",
			attack_weight: -1,
			deflect: +1,
			disperse: +1,
		},
		defense: {
			defense_weight: +1,
			deflect: +1,
		},
	},


	"burst": {
		name: "Burst",
		attack: { type: "reach" },
		defense: {
			_vs: { "reach": { feedback: +1 } },
		}
	},

	"strafe": {
		name: "Strafe",
		attack: {
			type: "reach",
			attack_weight: -1,
		},
		defense: {
			_vs: { "melee": { deflect: +1 } },
		},
	},
	
	"push": {
		name: "Push",
		attack: {
			type: "reach",
			deflect: +1,
			_vs: {
				"evade": { attack_weight: +1 },
				"hazard": { impact: +1 },
			},
		},
	},
	
	
	"barrier": {
		name: "Barrier",
		defense: {
			type: "block",
			defense_weight: +1,
			disperse: +2,
		},
	},

}
