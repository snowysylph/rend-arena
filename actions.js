rend.actions = {};

rend.phases = {

	declare: function declare (actor, action){
		var event = {
			actor: actor,
			action: action,
			mods: {},
			effects: [],
		};
	
		rend.stack(event.mods, actor.action());
	
		if (event.action.rolls){
			event.weight = (event.mods.attack_weight || 0);
			event.raw = rend.roll(cfg.scale);
			event.roll = event.raw + event.weight;
		}
		return event;
	},

	target: function target (event, target){
		event.target = target;
		var action_type = event.actor.action().type,
				defense_type = event.target.defense().type;
	
		rend.stack(event.mods, [
			target.defense(),
			action_type && target.defense(action_type),
			defense_type && event.actor.action(defense_type),
		]);
		
		if (event.action.rolls){
			// Redo weight calculations!
			event.weight = (event.mods.attack_weight || 0) - 
										 (event.mods.defense_weight || 0);
			event.roll = event.raw + event.weight;
		}
	
		return event;
	},
	
	resolve: function resolve (event){
		event.actor_effects = {};
		event.actor_costs = {};
		event.target_effects = {};
		
		event.action.resolve(event);
		
		rend.mods.forEach(function (mod){
			var value = event.mods[mod.name]; 
			if (value && mod.effect) mod.effect(event, value);
		})
		
		rend.stack(event.actor, [
			event.actor_effects,
			event.actor_costs,
		])
		
		if (event.target) {
			rend.stack(event.target, event.target_effects)
		};
		
		return event;
	},
	
	print: function print (event){
		rend.print(event.action.print(event));
	},
}

rend.actions = {

	"attack": {
		targeted: true,
		rolls: true,
		resolve: function resolve_attack (event) {
			event.actor_costs.stamina = -1;
		
			if (event.roll > event.target.suppression){
			// It's a miss! 
				event.result = "miss";
				event.target_effects.suppression = event.roll - event.target.suppression;
			} else if (event.roll == event.target.suppression){
			// A glancing hit!
				event.result = "glancing_hit";
				event.isHit = true;
				event.target_effects.suppression = 1;
				event.target_effects.damage = 1;
			} else {
			// A hit!
				event.result = "hit";
				event.isHit = true;
				event.target_effects.damage = event.roll;
			}
		},
		
		print: function print_attack (event){
			var output = "";
		
			output += event.actor.printName() +" attacks";
			if (event.actor.using) output += " with "+ rend.linkItem(event.actor.using);
			// Maybe add something mentioning the defense item here?	
			
			// Print out deets on our roll!
			output += " ([color="+ cfg.printColors.damage +"]"+
				event.roll + rend.prefix(event.weight) +"="+ event.roll_weighted +"[/color])";
		
			// Tell us what happened!
			output += " and ";
			switch (event.result){
				case "miss":
					output += rend.bbColor("suppression") +"[i]misses![/i][/color]";
					break;
				case "glancing_hit":
					output += "lands a "+ rend.bbColor("damage") +"[i]glancing hit![/i][/color]";
					break;
				case "hit":
					output += rend.bbColor("alert") +"[i]hits![/i][/color]";
					break;
			};
			
			output += "[i]";
			if (event.result == "miss"){
			// If our attack missed, print Suppression gain explicitly to make it
			// clear how this works.
				output += "\n"+ event.target.name +"'s"+
					rend.bbColor("suppression")+ " Suppression increased to "+
					event.target.suppression +"[/color].";
			} else {
			// If the attack hit, just print what it did.
				output += "\n"+ event.target.name +" recieves "+
					rend.printList(event.target_effects, { showAlways: ["damage"] }) +".";
					
				if (rend.hasValues(event.actor_effects)){
					output += "\n"+ event.actor.name +" recieves "+
						rend.printList(event.actor_effects) +".";
				}
			}
			
			// Invert stamina cost 'cause we're 'spending' it. 
			event.actor_costs.stamina *= -1;
			output += "\n"+ event.actor.name +" spends "+
				rend.printList(event.actor_costs, { showAlways: ["stamina"] }) +".";
			output += "[/i]";
			
			return output;
		},
	},
	
	"recover": {
		targeted: false,
		rolls: false,
		resolve: function (event) {
			event.actor_costs.stamina = -1;
			event.actor_effects.suppression = -event.actor.recovery();
		},
		
		print: function (event) {
			var output = "";
			
			output += event.actor.printName() +" recovers![i]";

			output += "\n"+ event.actor.name +" recieves "+
				rend.printList(event.actor_effects, { showAlways: ["suppression"] }) +".";
					
			// Invert stamina cost 'cause we're 'spending' it. 
			event.actor_costs.stamina *= -1;
			output += "\n"+ event.actor.name +" spends "+
				rend.printList(event.actor_costs, { showAlways: ["stamina"] }) +".";
			output += "[/i]";	
					
			return output;
		},
	},
	
	"rest": {
		targeted: false,
		rolls: false,
		resolve: function (event) {
			event.actor_effects.suppression = -1;
			event.actor_effects.stamina = 2;
		},
		print: function (event) {
			var output = "";
			
			output += event.actor.printName() +" rests!";
			output += "\n[i]"+ event.actor.name +" recieves "+
				rend.printList(event.actor_effects, { showAlways: ["suppression"] }) +
				".[/i]";
				
			return output;
		},
	},
}


rend.mods = [
	{
		name: "attack_weight",
		label: "attack weight",
	},{
		name: "defense_weight",
		label: "defense weight",
	},{
		name: "impact",
		effect: function impact (event, value){
			if (event.isHit){
				event.target_effects.suppression += value;
			}
		},
	},{
		key: "deflect",
		effect: function deflect (event, value){
			if (event.isHit){
				value = Math.min(value, event.target_effects.damage);
			
				event.target_effects.damage -= value;
				event.target_effects.suppression += value;
			}
		},
	},{
		name: "disperse",
		effect: function disperse (event, value){
			if (event.isHit){
				value = Math.min(
					value,
					event.target_effects.damage,
					Math.max(event.target.stamina - event.target_effects.stamina, 0)
				);
			
				event.target_effects.damage -= value;
				event.target_effects.stamina -= value;
			}
		},
	},{
		name: "kickback",
		effect: function kickback (event, value){
			if (event.isHit){
				event.actor_effects.suppression += value;
			}
		},
	},{
		name: "feedback",
		effect: function feedback (event, value){
			if (event.isHit){
				event.actor_effects.stamina -= value;
			}
		},
	},{
		name: "recoil",
		effect: function recoil (event, value){
			event.actor_costs.suppression += value;
		},
	},
];

