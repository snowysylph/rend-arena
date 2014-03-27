rend.gear = {

	// Weapons

	"blade": {
		name: "Composite Blade",
		category: "weapon",
		desc: "A duelist’s favorite. The predominant bladefighting style among Pilots can generally be summed up as ‘aggressive parrying.’ It’s tricky to master, but certainly looks impressive when a Pilot can pull it off.",
		"attack": {
			type: "melee",
			vs_types: {
				melee: { deflection: +1 },
			},
		},
		"defend": {
			type: "parry",
			defense_weight: -1,
			vs_types: {
				melee: { kickback: +1 },
			},
		},
	},

	"hammer": {
		name: "Impact Hammer",
		category: "weapon",
		desc: "The weapon of choice for Pilots unsure about how to spell ‘subtlety.’ Great for knocking your opponents on their collective tuckuses and for swinging around wildly to keep them from getting close.",
		"attack": {
			type: "melee",
			attack_weight: +1,
			concussive: +1,
			vs_types: {
				block: { attack_weight: +1 },
			},
		},
		"defend": {
			type: "hazard",
			vs_types: {
				melee: { defense_weight: +1 },
			},
		},
	},
	
	"lance": {
		name: "Ion Lance",
		category: "weapon",
		desc: "The Lance’s beam ionizes the air as it passes through, leaving behind a lingering (and painful) trail to complicate your opponent’s efforts to establish line of sight. Also provides a spectacular light show in a color or colors of your choice!",
		"attack": {
			type: "direct",
			attack_weight: -1,
			vs_types: {
				direct: { feedback: +1 },
			},
		},
		"defend": {
			type: "hazard",
			vs_types: { 
				direct: { feedback: +1 },
				melee: { feedback: +1 },
			},
		},
	},

	"minigun": {
		name: "Minigun",
		category: "weapon",
		"attack": {
			type: "direct",
		},
		"defend": {
			type: "hazard",
			vs_types: {
				direct: { kickback: +1 },
				guided: { defense_weight: -1 },
			},
		},
	},
	
	"cannon": {
		name: "Pulse Cannon",
		category: "weapon",
		desc: "No nonsense and no gimmicks, just a high-energy pulse blast with respectable stopping power.",
		"attack": {
			type: "direct",
			attack_weight: +1,
			concussive: +1,
		},
	},
	
	// Propulsion
	
	"boost_rocket": {
		name: "Boost Rocket",
		category: "propulsion",
		"attack": {
			type: "melee",
			attack_weight: +2,
			recoil: +1,
		},
		"defend": {
			type: "evade",
			defense_weight: -2,
			vs_types: {
				melee: { defense_weight: +4 },
			},
		}
	},
	
	"thrusters": {
		name: "Thrusters",
		category: "propulsion",
		"defend": {
			type: "evade",
			vs_types: {
				direct: { defense_weight: +1 },
				melee: { defense_weight: +1 },
				guided: { defense_weight: -1 },
			},
		},
		"rest": { suppression: -1 },
	},
	
	// Shielding
	
	"reactive_shield": {
		name: "Reactive Shield",
		category: "shield",
		"defend": {
			type: "block",
			deflection: +1,
			vs_types: {
				melee: { kickback: +1 },
			},
		},
		"rest": { toughness: +1 },
	},
	
	// Chassis Upgrades
	
	"armor": {
		name: "Armor Plating",
		category: "chassis",
		"passive": { defense_weight: +1 },
	},
	
	"robust": {
		name: "Robust Construction",
		category: "chassis",
		"passive": { toughness: +1 },
	},
	
	"capacitors": {
		name: "Capacitors",
		category: "chassis",
		"passive": { max_stamina: +1 },
	},
}
