
var rend = {};

rend.state = {
	players: [],
	active_player: 0,
};

rend.init = function init (){
	for (key in rend.gear){
		rend.gear[key].ID = key;
	}
};

rend.die = function die (sides){
	return Math.ceil(Math.random() * sides);
};

rend.print = function print (string){
	$("#log").append($("<p>").append(rend.bbParse(string)));
	$("#output").text(string);
};

rend.capitalize = function capitalize (string){
	return string && string.charAt(0).toUpperCase() + string.slice(1);
};

rend.itemLink = function itemLink (item){
	return "[url=http://www.google.com/#q="+ item.ID +"]"+ item.name +"[/url]";
};

rend.stack = function stack (target, sources, map){
	
	sources.forEach(function (source){
		if (!source) return;
		
		map.forEach(function (key){
			target[key] = (target[key] || 0) + (source[key] || 0);
		})
	})
};

rend.mod = function mod (value){
	if (value >= 0) return "+"+ value;
	else return "-"+ Math.abs(value);
};

rend.bbParse = function bbParse(string){
	var regTag, regExp;
	
	string = string || "";
	
	for (tag in cfg.bbTags){
		regTag = tag.replace( /\[/g , "\\[").replace( /\]/g , "\\]");
		regExp = new RegExp(regTag, "gi");

		string = string.replace(regExp, cfg.bbTags[tag]);
	}
	
	return string;
};

rend.Player = function Player (name){
	if (name) this.name = name;
	
	this.gear = {};
	this.passives = { vs_types: {} };
	
	this.update();
}; rend.Player.prototype = {
	name: "Player",
	
	suppression: 1,
	stamina: cfg.scale,
	stamina_max: cfg.scale,
	damage: 0,
	
	recover_rating: cfg.scale,
	doing: undefined,
	using: undefined,
	stunned: false,
	
	show_portrait: false,
	
	label: function label (){
		var output = "";
		
		if (this.color) output += "[color="+ this.color +"]";
		output += "[user]"+ this.name +"[/user]";
		if (this.color) output += "[/color]";
		
		return output;
	},
	
	update: function update (){
		
		// Pull in passive mods!
		this.passives = { vs_types: {} };
		
		for (item in this.gear){
		
			rend.stack(this.passives, [this.gear[item].passive], cfg.all_mods);
			
			for (type in this.gear[item].passive.vs_types){
				this.passives.vs_types[type] = this.passives.vs_types[type] || {};
				rend.stack(this.passives.vs_types[type], [
					this.gear[item].passive.vs_types[type]
				], cfg.all_mods);
			};
		}
	
		this.suppression = Math.max(this.suppression, 1);
		
		this.stamina_max = cfg.scale + (this.passives.stamina_max || 0);
		
		this.stamina = Math.min(this.stamina, this.stamina_max);
		this.recovery_rating = this.stamina - this.damage;
		
		// Arbitrate Stun!
		if (this.suppression > this.stamina_max){
			this.stunned = true;
		} else { this.stunned = false; }
		
	},
	
	init: function init (){
		this.suppression = 1;
		this.stamina = this.stamina_max;
		this.damage = 0;
		
		this.doing = undefined;
		this.using = undefined;
		this.stunned = false;
	},
	
	ready: function ready (){
	
		// Apply Bleed!
		if (this.recovery_rating < 0){
			this.suppression -= this.recovery_rating;
		}
	},
	
	status: function status (){
		var output = "",
				action = this.using && this.using[this.doing];
		
		output += this.label();
		
		output += " - [color=blue]Suppression "+ this.suppression +"[/color]";
		if (this.stunned) output += " ([color=red]STUNNED![/color])";
		
		output += " | ";
		
		output += "[color=green]Stamina "+ this.stamina + "/"+ this.stamina_max +
			"[/color]";
			
		output += " | ";	
			
		output += "[color=orange]Damage "+ this.damage +"[/color]";
		
		if (this.recovery_rating < 0){
			output += " ([color=red]BLEEDING "+ (-this.recovery_rating) +
				"![/color])";
		} else {
			output += " ([color=blue]Recovers "+ this.recovery_rating +
				"[/color])";
		}
		
		output += "\n [i]Action: ";
		
		output += (rend.capitalize(this.doing) || "(IDLE)");
		
		if (this.using){
			output += " with "+ rend.itemLink(this.using);
			if (action && action.type){
				output += " ("+ rend.capitalize(action.type) +")";
			}
		}
		
		output += "[/i]";
		
		return output;
	},
	
	edit_div: function element (){
		var div = "<div>",
				name = "<input type='text' class='name'></input>";
				
		return div;
	},

	attack: function attack (target){
		var roll, weight, result,
				mods = {},
				
				attack = this.using && this.using[this.doing] || {},
				defense = target.using && target.using[target.doing] || {},
				
				effect = { damage: 0, suppression: 0, stamina: 0 },
				reflex = { damage: 0, suppression: 0, stamina: 0 },
				
				output = "";
			
		// Make and modify the roll!
		roll = rend.die(cfg.scale);	
		
		// Grab attack modifiers...
		rend.stack(mods, [
			attack, 
			attack.vs_types && attack.vs_types[defense.type],
			this.passives,
			this.passives.vs_types[defense.type],
		], cfg.attack_mods);
		
		//...ad defense modifiers...
		rend.stack(mods, [
			defense, 
			defense.vs_types && defense.vs_types[attack.type],
			target.passives,
			target.passives.vs_types[attack.type],
		], cfg.defense_mods);
		
		//...apply weight...
		weight = mods.attack_weight - mods.defense_weight;
		result = roll + weight;
		
		//...and report the result.
		output += this.label() +" attacks with "+ rend.itemLink(this.using);
		output += " ([color=orange]"+ roll +""+ rend.mod(weight) +"="+ result +
			"[/color])";
		


		// Roll component is above, resolution is below. //
		// Split here if these are to be decoupled! //
		
		
		// Now that we've got the roll, actually resolve the attack!
		if (result > target.suppression){
		// If we missed, increase suppression!
			target.suppression = result;
			
			output += " and [color=blue][i]misses![/i][/color]";
			output += "\n [i]"+ target.name +"'s [color=blue]Suppression increased to "+ 
				result + "[/color][/i].";
			
		} else {
		// If we hit, handle hitting!
		
			//Suppress and reduce damage for a glancing hit!
			if (result == target.suppression){
				effect.damage = 1;
				effect.suppression = 1;
				output += " and scores a [color=orange][i]glancing hit![/i][/color]";
			} else {
				effect.damage = result;
				output += " and [color=red][i]hits![/i][/color]";
			}
			
			effect.suppression += mods.concussive || 0;
			effect.stamina += mods.disruptive || 0;
			
			effect.suppression += Math.min(mods.deflection || 0, effect.damage);
			effect.damage -= Math.min(mods.deflection || 0, effect.damage);
			
			effect.stamina += Math.min(mods.toughness || 0, effect.damage);
			effect.damage -= Math.min(mods.toughness || 0, effect.damage);
			
			reflex.suppression += mods.recoil || 0;
			reflex.suppression += mods.kickback || 0;
			reflex.stamina += mods.feedback || 0;
			
			output += "\n [i]"+ target.name +" receives";
			
			
			// Apply effects to the target!
			// Apply damage (always show this)
			target.damage += effect.damage;
			output += " [color=orange]"+ rend.mod(effect.damage) +" Damage[/color]";
			// ...suppression damage...
			if (effect.suppression){
				target.suppression += effect.suppression;
				output += " [color=blue]"+ rend.mod(effect.suppression) +
					" Suppression[/color]";
			}
			// ...stamina damage...
			if (effect.stamina){
				target.stamina -= effect.stamina;
				output += " [color=green]"+ rend.mod(-effect.stamina) +
					" Stamina[/color]";
			}
			
			output += "[/i]";
			
			//...and apply reflex effects to the attacker!
			
			if (reflex.damage || reflex.suppression || reflex.stamina){
				output += "\n [i]"+ this.name +" receives";
				// Apply damage...
				if (reflex.damage){
					this.damage += reflex.damage;
					output += " [color=orange]"+ rend.mod(reflex.damage) +" Damage[/color]";
				}
				// ...suppression damage...
				if (reflex.suppression){
					this.suppression += reflex.suppression;
					output += " [color=blue]"+ rend.mod(reflex.suppression) +
						" Suppression[/color]";
				}
				// ...stamina damage...
				if (reflex.stamina){
					this.stamina -= reflex.stamina;
					output += " [color=green]"+ rend.mod(-reflex.stamina) +
						" Stamina[/color]";
				}
				output += "[/i]"
			};
			
			//...and we're done!
			
		}
		
		this.stamina -= 1;
		
		this.update();
		target.update();
		
		return output
	},
	
	defend: function defend (){
		this.suppression -= this.recover_rating;
		this.stamina -= 1;
		this.update();
	},
	
	rest: function rest (){
		this.suppression -= 1;
		this.stamina += 2;
		this.update();
	},
}
