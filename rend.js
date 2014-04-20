
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
	if (!Array.isArray(container)) return false;
	return (container.indexOf(item) >= 0);
};

rend.hasValues = function hasValues (object, ignore){
	for (key in object){
		if (object[key] && !rend.has(ignore, key)) return true;
	}
	return false;
};

rend.print = function print (string){
	$("#log").append($("<p>").append(bb.parse(string)));
	$("#output").text(string);
};

rend.stack = function stack (target, sources){
	if (!Array.isArray(sources)) sources = [sources];
	
	sources.forEach(function (source){
		if (!source) return;
		
		for (key in source){
			if (source[key] && typeof source[key] == "number"){
				target[key] = (target[key] || 0) + (source[key]);
			}
		}
	})
};


// Formatting Functions

rend.bbColor = function bbColor (value){
	return "[color="+ cfg.printColors[value] +"]";
};

rend.capWord = function capWord (string){
	return string && string.charAt(0).toUpperCase() + string.slice(1);
};

rend.linkItem = function itemLink (item){
	return "[url="+ cfg.linkPath +"#"+ item.key +"]"+ item.name +"[/url]";
};

rend.prefix = function prefix (value){
	if (value >= 0) return "+"+ value;
	else return "-"+ Math.abs(value);
};

rend.printList = function printList (object, options){
	var count = 0,
			output = "",
			keys;
	
	keys = options.keys || Object.keys(object).sort();
	options.separator = options.separator || ", ";
	
	keys.forEach(function (key){
		if (!(object[key] || rend.has(options.showAlways, key))) return;
		if (rend.has(options.showNever, key)) return;
		
		count ++;
		if (count > 1) output += options.separator;
		
		output += rend.bbColor(key) + (object[key] || 0) +" "+
			rend.capWord(key) +"[/color]";
	});
	
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
	
	this.talents = {};
	
	this.update();
}; rend.Player.prototype = {
	name: "Player",
	
	doing: undefined,
	using: undefined,
	
	suppression: 1,
	suppression_min: 1,
	stun_threshold: cfg.scale,
	
	stamina: cfg.scale,
	stamina_max: cfg.scale,
	damage: 0,
	
	action: function (type){
		var output = {},
				action = this.using && this.using[this.doing];
	
		if (typeof type != "undefined"){
			rend.stack(output, [
				action,
			])
		} else {
			rend.stack(output, [
				action && action._vs && action._vs[type],
			])
		}
		
		return;
	},
	
	defense: function (type){
		var output = {},
				defense = this.using && this.using["defense"];
	
		if (typeof type != "undefined"){
			rend.stack(output, [
				defense,
				this.passives.defense,
			])
		} else {
			rend.stack(output, [
				action && action._vs && action._vs[type],
				this.passives.defense._vs[type],
			])
		}
		
		return;
	},
	
	recovery: function (){
		return this.stamina - this.damage;
	},
	
	isStunned: function (){
		return this.suppression > this.stun_threshold;
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
		
		// Calculate max stamina and stun threshold.
		this.stun_threshold = cfg.scale;
		this.stamina_max = cfg.scale;
		
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
	
		/*
		output += "\n [i]Action: " + (rend.capWord(this.doing) || "(IDLE)")
		
		if (this.using){
			output += " with "+ rend.linkItem(this.using);
			if (this.action && this.action.type){
				output += " - "+ rend.capWord(this.action.type);
			}
		}
		output += "[/i]";
		*/
		return output;
	}
}
