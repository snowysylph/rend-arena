
var rend = {};

rend.state = {
	active: [],
	roster: [],
};

rend.init = function init (){
	var fragment = location.hash.slice(1);
	
	for (key in rend.gear){
		rend.gear[key].key = key;
	}
	
	if (fragment){
		$('body').append(rend.showItem(rend.gear[fragment]));
	}
};





// Utility Functions

rend.roll = function roll (sides){
	return Math.ceil(Math.random() * sides);
};

rend.has = function has (container, item){
	return (container.indexOf(item) >= 0);
};

rend.print = function print (string){
	$("#log").append($("<p>").append(rend.bbParse(string)));
	$("#output").text(string);
};

rend.hasValues = function hasValues (object){
	for (key in object){
		if (object[key]) return true;
	}
	return false;
};

rend.stack = function stack (target, sources, keys){
	if (!Array.isArray(sources)) sources = [sources];
	
	sources.forEach(function (source){
		if (!(source && rend.hasValues(source))) return;
		
		if (!keys){
			for (key in source){
				if (typeof source[key] == "number"){
					target[key] = (target[key] || 0) + (source[key]);
				}
			}
		} else {
			keys.forEach(function (key){
				if (typeof source[key] == "number"){
					target[key] = (target[key] || 0) + (source[key]);
				}
			})
		}
	})
};

rend.arrayWrap = function arrayWrap (value){
	if (Array.isArray(value)) return value;
	else return [value];
}




// Formatting Functions

rend.bbColor = function bbColor (value){
	return "[color="+ cfg.printColors[value] +"]";
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

rend.capitalize = function capitalize (string){
	return string && string.charAt(0).toUpperCase() + string.slice(1);
};

rend.linkItem = function itemLink (item){
	return "[url="+ cfg.linkPath +"#"+ item.key +"]"+ item.name +"[/url]";
};

rend.mod = function mod (value){
	if (value >= 0) return "+"+ value;
	else return "-"+ Math.abs(value);
};

rend.printValues = function printValues (object, options){
	var count = 0,
			output = "";
			
	options = options || {};		
	options.showAlways = rend.arrayWrap(options.showAlways);
	options.keys = options.keys || cfg.core_stats;
	options.separator = options.separator || ", ";
	
	options.keys.forEach(function(key){
		if (!(object[key] || rend.has(options.showAlways, key))) return;
		count ++
		if (count > 1) output += options.separator;

		output += rend.bbColor(key) + (object[key] || 0) +" "+ 
			rend.capitalize(key) +"[/color]";
	})
	
	return output;
};

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







rend.Player = function Player (name, job){
	if (name) this.name = name;
	this.job = job || this.job;
	
	this.gear = {};
	this.passives = { vs_types: {} };
	
	this.update();
}; rend.Player.prototype = {
	name: "Player",
	job: "pilot",
	
	doing: undefined,
	using: undefined,
	
	suppression: 1,
	suppression_min: 1,
	stun_threshold: cfg.scale,
	
	stamina: cfg.scale,
	stamina_max: cfg.scale,
	damage: 0,
	
	recovery: function (){
		return this.stamina - this.damage;
	},
	isStunned: function (){
		return this.suppresion > this.stun_threshold;
	},
	
	execute: function execute (actionName){
		var action = rend.actions[actionName],
				event;
				
		if (action.targeted) event = action.declare(this, this.target);
		else event = action.declare(this);
		
		action.resolve(event);
		return action.print(event);
	},
	
	init: function init (){
		this.suppression = this.suppression_min;
		this.stamina = this.stamina_max;
		this.damage = 0;
		
		this.doing = undefined;
		this.using = undefined;
		this.stunned = false;
	},
	
	ready: function ready (){
		// Apply Bleed!
		if (this.recovery < 0){
			this.suppression -= this.recovery;
		}
		
		this.doing = undefined;
		this.using = undefined;
	},
	
	update: function update (){
		// Reset passive mods...
		this.passives = {
			vs_types: {},
		};
		
		//...then pull in passive mods in from equipped gear!
		for (item in this.gear){
			var mods = this.gear[item].passive;
			if (!mods) continue;
		
			rend.stack(this.passives, mods, cfg.all_mods);
			
			for (type in mods.vs_types){
				this.passives.vs_types[type] = this.passives.vs_types[type] || {};
				rend.stack(this.passives.vs_types[type], mods.vs_types[type], cfg.all_mods);
			};
		}
		
		// Calculate max stamina and stun threshold.
		this.stun_threshold = cfg.scale + (this.passives.stun_threshold || 0);
		this.stamina_max = cfg.scale + (this.passives.stamina_max || 0);
		
		// Make sure suppression and stamina respect their minimums.
		this.suppression = Math.max(this.suppression, this.suppression_min);
		this.stamina = Math.max(this.stamina, 0);
	},
	
	update_display: function update_display (div){
		$(div).find('.value-suppression').text(this.suppression);
		$(div).find('.value-suppression_max').text(this.suppression_max);
		$(div).find('.value-stamina').text(this.stamina);
		$(div).find('.value-stamina_max').text(this.stamina_max);
		
		$(div).find('.value-recovery').text(this.recovery);
		// TODO: Bleed and stun!
		
		// TODO: Passives, once displaying mods is rewritten!
		// TODO: Enable/disable action buttons!
	},
	
	printName: function printName (){
		var output = "";
		
		if (this.color) output += "[color="+ this.color +"]";
		output += "[user]"+ this.name +"[/user]";
		if (this.color) output += "[/color]";
		
		return output;
	},
	
	printStatus: function printStatus (){
		var output = "";
				
	
		output += this.printName();
	
		output += " - "+ rend.bbColor("suppression") +"Suppression "+ 
			this.suppression +"/"+ this.stun_threshold +"[/color]";
		
		if (this.isStunned()) output += " ("+ rend.bbColor("alert")+ "STUNNED![/color])";
	
		output += " | "+ rend.bbColor("stamina") +"Stamina "+ this.stamina +
			"/"+ this.stamina_max +"[/color]";
		
		output += " | "+rend.bbColor("damage")+ "Damage "+ this.damage +"[/color]";
	
		if (this.recovery() >= 0){
			output += " ("+ rend.bbColor("suppression") +"Recovers "+ this.recovery() +
				"[/color])";
		} else {
			output += " ("+ rend.bbColor("alert")+ "BLEEDING "+ (-this.recovery()) +
				"![/color])";
		}
	
		output += "\n [i]Action: ";
	
		output += (rend.capitalize(this.doing) || "(IDLE)");
		
		var action = this.using && this.using[this.doing];
	
		if (this.using){
			output += " with "+ rend.linkItem(this.using);
			if (action && action.type){
				output += " - "+ rend.capitalize(action.type);
			}
		}
	
		output += "[/i]";
	
		return output;
	}
}
