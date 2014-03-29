rend.actions = {};

rend.actions.attack = {

	targeted: true,
	
	"declare": function attack_declare (actor, target){
		var event = {
					actor: actor,
					target: target,
				},
				action = actor.using && event.actor.using[actor.doing] || {},
				reaction = actor.using && event.target.using[target.doing] || {};
		
		event.roll = rend.roll(cfg.scale);
	
		// Grab attack modifiers...
		rend.stack(event, [
			action,
			actor.passives,
			action.vs_types && action.vs_types[reaction.type],
			actor.passives.vs_types[reaction.type],
		], cfg.action_mods);
		
		//...and defense modifiers.
		rend.stack(event, [
			reaction, 
			target.passives,
			reaction.vs_types && reaction.vs_types[action.type],
			target.passives.vs_types[action.type],
		], cfg.reaction_mods);
		
		event.weight = event.attack_weight || 0 - event.defense_weight || 0;
		event.roll_weighted = event.roll + event.weight;
		
		return event;
	},
	
	"resolve": function attack_resolve (event){
		
		event.target_effects = { damage: 0 };
		event.actor_effects = {};
		event.actor_costs = {
			stamina: cfg.defaults.stamina_cost,
		};
		
		if (event.roll_weighted > event.target.suppression){
		// Resolve misses!
			event.result = "miss";
			rend.stack(event.target_effects, {
				suppression: event.roll_weighted - event.target.suppression,
			});
		} else {
		// Resolve hits!
			
			if (event.roll_weighted == event.target.suppression){
			// Use reduced damage and suppression for a glancing hit.
				event.result = "glancing_hit";
				rend.stack(event.target_effects, {
					damage: 1,
					suppression: 1,
				});
			} else {
			// Use full damage for a clean hit!
				event.result = "hit";
				rend.stack(event.target_effects, {
					damage: event.roll_weighted,
				});
			}
			
			// Add bonus effects...
			rend.stack(event.target_effects, {
				suppression: event.concussive,
				stamina: event.disruptive,
			});
			
			// Apply damage mitigation (in order!)
			// Deflection: converts damage to suppression!
			var deflection = Math.min(
				event.deflection || 0,
				event.target_effects.damage
			);
			rend.stack(event.target_effects, {
				damage: -deflection,
				suppression: deflection,
			})
			
			// Deflection: converts damage to stamina drain!
			var toughness = Math.min(
				event.toughness || 0,
				event.target_effects.damage,
				// Pre-emptively check stamina damage to make sure we aren't spending
				// more stamina than we (will) have.
				Math.max(event.target.stamina - event.target_effects.stamina, 0)
			);
			rend.stack(event.target_effects, {
				damage: -toughness,
				stamina: -toughness,
			});
			
			
			// Counterattack effects!
			rend.stack(event.actor_effects, {
				suppression: event.kickback,
				stamina: event.feedback,
			})
		}
		
		rend.stack(event.actor_costs, {
			suppression: event.recoil,
			stamina: event.stamina_cost,
		})
		
		// ...and apply the results to the participants!
		rend.stack(event.target, event.target_effects);
		rend.stack(event.actor, event.actor_effects);
		rend.stack(event.actor, event.actor_costs);
		
		return event;
	},
	
	"print": function attack_print (event){
		var output = "";
		
		output += event.actor.printName() +" attacks";
		if (event.actor.using) output += " with "+ rend.linkItem(event.actor.using);
		// Maybe add something mentioning the defense item here?	
			
		// Print out deets on our roll!
		output += " ([color="+ cfg.printColors.damage +"]"+
			event.roll + rend.mod(event.weight) +"="+ event.roll_weighted +"[/color])";
		
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
			// Eh, throw in a default error message just in case.
			default:
				output += rend.bbColor("alert") +"apparently forgot to set event.result!"+
					"[/color]";
				break;
		};
		
		// Report on what the attack actually did!
		output += "[i]";
		if (event.result == "miss"){
			// Prints 'increased to' instead of the delta for clarity about what misses
			// actually do.
			output += "\n"+ event.target.name +"'s " +rend.bbColor("suppression") +
				"Suppression increased to "+ event.target.suppression +".[/color]";
		} else {
		
			// Report target effects (always show 'damage,' even if we didn't do any!)
			output += "\n"+ event.target.name +" recieves " +
				rend.printValues(event.target_effects, {showAlways: "damage"}) +".";
			
			// Report actor effects, if any.
			if (rend.hasValues(event.actor_effects)){
				output += "\n"+ event.actor.name +" recieves "+
					rend.printValues(event.actor_effects) +"."
			};
		};
		
		// Invert stamina cost, since you're 'spending' it.
		event.actor_costs.stamina *= -1;
		
		//Report actor costs. Always show stamina, even if the action was free.
		output += "\n"+ event.actor.name +" spends "+
			rend.printValues(event.actor_costs, {
				showAlways: "stamina",
				noMod: true,
			}) +"."
		
		output += "[/i]";
		
		return output;
	},
}

rend.actions.defend = {
	targeted: false,
	"declare": function defend_declare (actor){
		var event = { actor: actor },
				action = actor.using && actor.using[actor.doing];
		
		// Grab attack modifiers...
		rend.stack(event, [
			action,
			actor.passives,
		], cfg.action_mods);
		
		// Note: this doesn't actually return a roll result yet. I may have to put
		// one in if we go simultaneous.
		
		return event
	},
	
	"resolve": function defend_resolve (event){
		
		event.actor_effects = { suppression: 0};
		event.actor_costs = {
			stamina: cfg.defaults.stamina_cost,
		};
		
		if (event.actor.recovery() > 0){
			// Basic effect! Reduce Suppression by recovery rating.
			rend.stack(event.actor_effects, {
				suppression: -1 * Math.min(
					event.actor.recovery(), 
					event.actor.suppression - 1
				)
			});
		}
		
		// Use standard actor cost stuff, just in case.
		rend.stack(event.actor_costs, [{
			suppression: event.recoil,
			stamina: -event.stamina_cost,
		}])
		
		// Apply effects!
		rend.stack(event.actor, event.actor_effects);
		rend.stack(event.actor, event.actor_cost);
		
		return event;
	},
	
	"print": function defend_print (event){
		var output = "";
		
		output += event.actor.printName() +" defends"
		if (event.actor.using) output += " with "+ rend.linkItem(event.actor.using);
		output += "!"
		
		// Invert suppression 'cause we're "recovering" it...
		event.actor_effects.suppression *= -1;
		
		output += "[i]";
		// Report actor effects.
		output += "\n"+ event.actor.name +" recovers "+
			rend.printValues(event.actor_effects, {
				showAlways: "suppression",
				noMod: true,
			}) +"."
		
		// Invert stamina cost, since we're "spending" it.
		event.actor_costs.stamina *= -1;
		
		//Report actor costs. Always show stamina, even if the action was free.
		output += "\n"+ event.actor.name +" spends "+
			rend.printValues(event.actor_costs, {
				showAlways: "stamina",
				noMod: true,
			}) +"."
		
		output += "[/i]";
		
		return output;
	},
};

rend.actions.rest = {
	targeted: false,
	
	"declare": function rest_declare (actor){
		var event = { actor: actor },
				action = actor.using && actor.using[actor.doing];
		
		// Grab attack modifiers...
		rend.stack(event, [
			action,
			actor.passives,
		], cfg.action_mods);
		
		return event;
	},
	
	"resolve": function rest_resolve (event){
		event.actor_effects = {
			suppression: cfg.defaults.rest_suppression,
			stamina: cfg.defaults.rest_stamina,
		};
		
		event.actor_effects.suppression = Math.max(
			event.actor_effects.suppression,
			-(event.actor.suppression - event.actor.suppression_min)
		)
		
		event.actor_effects.stamina = Math.min(
			event.actor_effects.stamina,
			event.actor.stamina_max - event.actor.stamina
		)
		
		rend.stack(event.actor, event.actor_effects);
		return event;
	},
	
	"print": function rest_print (event){
		var output = "";
		
		output += event.actor.printName() +" rests";
		if (event.actor.using) output += " with "+ rend.linkItem(event.actor.using);
		output += "!";
		
		// Invert suppression 'cause we're "recovering" it...
		event.actor_effects.suppression *= -1;
		
		output += "\n[i]"+ event.actor.name +" recovers "+
			rend.printValues(event.actor_effects, {
				showAlways: ["suppression", "stamina"],
				noMod: true,
			}) +".[/i]"
		
		return output;
	},
};
