
var rend = {};

rend.state = {
	players: [],
	active_index: 0,
	active_player: undefined,
	
	advance: function advance (){
		this.active_index ++;
		if (this.active_index >= this.players.length) this.active_index = 0;
		
		this.active_player = this.players[this.active_index];
		this.active_player && this.active_player.ready();
	},
	
	update: function update (){
		this.active_player = this.players[this.active_index];
	}
};

rend.init = function init (){
	var fragment = location.hash.slice(1);
	
	for (key in rend.gear){
		rend.gear[key].ID = key;
	}
	
	if (fragment){
		$('body').append(rend.showItem(rend.gear[fragment]));
	}
};





// Utility Functions

rend.die = function die (sides){
	return Math.ceil(Math.random() * sides);
};

rend.has = function has (container, item){
	return (container.indexOf(item) >= 0);
};

rend.print = function print (string){
	$("#log").append($("<p>").append(rend.bbParse(string)));
	$("#output").text(string);
};

rend.stack = function stack (target, sources, map){
	
	sources.forEach(function (source){
		if (!source) return;
		
		map.forEach(function (key){
			target[key] = (target[key] || 0) + (source[key] || 0);
		})
	})
};






// Formatting Functions

rend.action_button = function action_button (item, action, player){
	var button = $("<button class='action-button'>"+ action +"</button>")
	
	// Not tooltipping for now! Because the types explanation is really long and
	// it seems a little weird.
	if (item){
		button.append("<div class='action-type'>").append(
			$("<div>"+ item[action].type +"</div>").addClass('action-type'));
	}
	
	button.on('click', function (event){
		var output = "\n";
		
		player.using = item;
		player.doing = action;
		
		output += player[action]();
		rend.state.advance();
		
		output += "\n\n--------------\n\n";
		
		rend.state.players.forEach(function (player){
			output += rend.printStatus(player) + "\n";
		})
		
		rend.print(output);
	})
	
	if (!(player && player.isActive())){
		button.prop("disabled", true);
	}
	
	return button;
}

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

rend.capitalize = function capitalize (string){
	return string && string.charAt(0).toUpperCase() + string.slice(1);
};

rend.itemLink = function itemLink (item){
	return "[url="+ location.pathname +"#"+ item.ID +"]"+ item.name +"[/url]";
};

rend.mod = function mod (value){
	if (value >= 0) return "+"+ value;
	else return "-"+ Math.abs(value);
};

rend.printStatus = function printStatus (player){
	var output = "",
			action = player.using && player.using[player.doing];
	
	output += player.label();
	
	output += " - [color=blue]Suppression "+ player.suppression +"[/color]";
	if (player.stunned) output += " ([color=red]STUNNED![/color])";
	
	output += " | [color=green]Stamina "+ player.stamina + "/"+ player.stamina_max +
		"[/color]";
		
	output += " | [color=orange]Damage "+ player.damage +"[/color]";
	
	if (player.recovery_rating < 0){
		output += " ([color=red]BLEEDING "+ (-player.recovery_rating) +
			"![/color])";
	} else {
		output += " ([color=blue]Recovers "+ player.recovery_rating +
			"[/color])";
	}
	
	output += "\n [i]Action: ";
	
	output += (rend.capitalize(player.doing) || "(IDLE)");
	
	if (player.using){
		output += " with "+ rend.itemLink(player.using);
		if (action && action.type){
			output += " - "+ rend.capitalize(action.type);
		}
	}
	
	output += "[/i]";
	
	return output;
}

rend.showItem = function showItem (item, player, hide){
	var div = $("<div class='item'>"),
			header = $("<div class='item-name'>"+ item.name +"</div>"),
			content = $("<div class='item-content'>"),
			table = $("<table class='action-table'>"),
			row;
			
	div.append(header);
	header.on("click", function (event){
		content.toggle('blind');
		div.toggleClass('item-collapsed', 'fade');
	})
	
	div.append(content);
	
	if (hide){ 
		content.hide();
		div.addClass('item-collapsed');
	}
	
	content.append("<div class='item-category'>"+item.job +" - "+
		item.category +"</div>");
	content.append("<div class='item-desc'>"+ item.desc +"</div>");
	
	if (item.passive){
		content.append(rend.showMods(item.passive).addClass('passive-mods'));
	}
	
	content.append(table);
	if (item.attack){
		row = $("<tr class='action-row'>")
		table.append(row);
		row.append($("<td>").append(rend.action_button(item, "attack", player)));
		row.append($("<td>").append(rend.showMods(item.attack).addClass('action-mods')));
	}
	if (item.defend){
		row = $("<tr class='action-row'>")
		table.append(row);
		row.append($("<td>").append(rend.action_button(item, "defend", player)));
		row.append($("<td>").append(rend.showMods(item.defend).addClass('action-mods')));
	}
	
	if (item.rest){
		row = $("<tr class='action-row'>")
		table.append(row);
		row.append($("<td>").append(rend.action_button(item, "rest", player)));
		row.append($("<td>").append(rend.showMods(item.rest).addClass('action-mods')));
	}
	
	return div;
};

rend.showMods = function showMods (object){
	var div = $("<div class='mod-group'>"),
			mods = [];
	
	if (!object) return div;
	
	for (key in object){
		if (rend.has(cfg.all_mods, key)){
			mods.push({name: key, value: object[key]});
		}
	};
	
	mods.sort(function (a, b){
		return cfg.all_mods.indexOf(a.name) - cfg.all_mods.indexOf(b.name)
	});
	
	mods.forEach(function (mod){
		if (!mod.value) return;
		var name = rend.toolTip(mod.name.replace("_", " "), mod.name);
		div.append($("<div class='mod-entry'>"+ rend.mod(mod.value) +
			" </div>").append(name));
	});
	
	if (object.vs_types){
		for (type in object.vs_types){
			div.append(rend.showMods(object.vs_types[type]).addClass("type-mods").append(
				"<div class='type-label'> vs "+ rend.capitalize(type) +"</div>"));
		};
	}
	
	return div;
};

rend.showPlayer = function showPlayer (player){
var div = $("<div class='player-display'>"),
		content = $("<div class='player-content'>"),
		gear = $("<div class='player-gear'>");
	
	div.append(content, gear);
	
	content.append("<div class='player-name'>"+ player.name +"</div>");
	content.append("<div class='player-job'>"+ player.job +"</div>");
	
	content.append("<div class='stat player-suppression'>Suppression: "+
		"<span class='stat-suppression'>"+ player.suppression +"</span></div>");
		
	content.append("<div class='stat player-stamina'>Stamina: "+
		"<span class='stat-stamina'>"+ player.stamina +"</span>/"+
		"<span class='stat-stamina_max'>"+ player.stamina_max +"</span></div>");
		
	content.append("<div class='stat player-damage'>Damage: "+
		"<span class='stat-damage'>"+ player.damage +"</span></div>");
		
	content.append("<div class='stat player-recover'>Recovery: "+
		"<span class='stat-recovery'>"+ player.recovery_rating +"</span></div>");	
	
	content.append(rend.showMods(player.passives));
	
	Object.keys(player.gear).forEach(function (key){
		gear.append(rend.showItem(player.gear[key], player, true));
	})
	
	return div;
}

rend.toolTip = function toolTip (string, ref){
	ref = ref || string;
	
	var span = $("<span class='has-toolTip'>"+ 
		string +"</span>");
	span.tooltip({ 
		content: cfg.toolTips[ref],
		show: { delay: 500 },
		items: "span",
	});
	
	return span;
};












rend.Player = function Player (name){
	if (name) this.name = name;
	
	this.gear = {};
	this.passives = { vs_types: {} };
	
	this.update();
}; rend.Player.prototype = {
	name: "Player",
	job: "pilot",
	
	suppression: 1,
	stamina: cfg.scale,
	stamina_max: cfg.scale,
	damage: 0,
	
	recover_rating: cfg.scale,
	doing: undefined,
	using: undefined,
	stunned: false,
	
	label: function label (){
		var output = "";
		
		if (this.color) output += "[color="+ this.color +"]";
		output += "[user]"+ this.name +"[/user]";
		if (this.color) output += "[/color]";
		
		return output;
	},
	
	isActive: function isActive (){
		return rend.state.active_player == this;
	},
	
	update: function update (){
		
		// Pull in passive mods!
		this.passives = { vs_types: {} };
		
		for (item in this.gear){
			if (!this.gear[item].passive) continue;
		
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
		
		this.doing = undefined;
		this.using = undefined;
		
		this.update();
	},

	attack: function attack (){
		var roll, weight, result,
				mods = {},
				
				target = this.target;
				
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
		
		//...add defense modifiers...
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
		// If we missed, increase the target's suppression!
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
		var effect = Math.max(this.recover_rating, 0);
		this.suppression -= effect;
		this.stamina -= 1;
		this.update();
		
		return this.label() +" defends with "+ rend.itemLink(this.using) +"!"+
			"\n[i]"+ this.name +"'s [color=blue]Suppression reduced by "+ effect +
			"[/color].[/i]";
	},
	
	rest: function rest (){
		this.suppression -= 1;
		this.stamina += 2;
		this.update();
	},
}
