var cfg = {};

cfg.scale = 6;
cfg.stamina_cost = 1;
cfg.linkPath = location.pathname;

cfg.defaults = {
	stamina_cost: -1,
	rest_suppression: -1,
	rest_stamina: 2,
}

cfg.core_stats = [
	"suppression",
	"stamina",
	"damage",
];

cfg.attack_types = [
	"area",
	"direct",
	"guided",
	"melee",
];
// Modifiers that apply when you perform an action!
cfg.action_mods = [
	"attack_weight", 
	"concussive",
	"disruptive",
	"recoil",
	"stamina_cost",
];

cfg.defense_types = [
	"block",
	"evade",
	"hazard",
	"parry",
];

// Modifiers that apply when someone targets you with an action!
cfg.reaction_mods = [
	"defense_weight", 
	"deflection", 
	"toughness", 
	"kickback", 
	"feedback",
];

// Modifiers that apply outside of actions (updates, etc).
cfg.misc_mods = [
	"stun_threshold",
	"max_stamina",
];

// Keeps 'em in order!
cfg.all_mods = [].concat(cfg.action_mods, cfg.reaction_mods, cfg.misc_mods);

cfg.printColors = {
	suppression: "blue",
	stamina: "green",
	damage: "orange",
	alert: "red",
};

cfg.bbTags = {
	"[b]": "<b>",
	"[/b]": "</b>",
	"[i]": "<i>",
	"[/i]": "</i>",
	"[u]": "<u>",
	"[/u]": "</u>",
	"\n": "<br>",
	"[url=.+?]": function url (match){
		var href = match.slice(5, -1);
		return "<a href='"+ href +"' target='blank'>";
	},
	"[/url]": "</a>",
	"[color=.+?]": function color (match){
		var color = match.slice(7, -1);
		return "<span style='color: "+ color +"'>";
	},
	"[/color]": "</span>",
	"[user].+?[/user]": function (match){
		var name = match.slice(6, -7),
				nameURI = encodeURIComponent(name.toLowerCase());
				
		return "<a href='https://www.f-list.net/c/"+ nameURI +"' target='blank'>"+
			name +"</a>";
	},
	"[icon].+?[/icon]": function (match){
		var name = match.slice(6, -7),
				nameURI = encodeURIComponent(name.toLowerCase());
	
		return "<a href='https://www.f-list.net/c/"+ nameURI +"' target='blank'>"+ 
			"<img src='https://static.f-list.net/images/avatar/"+ nameURI +".png'"+
			"class='portrait_link'>"+
			"</a>";
	},
};

// Valid BBCode Colors!
cfg.bbColors = [
	"red",
	"orange",
	"yellow",
	"blue",
	"purple",
	"pink",
	"white",
	"gray",
	//"black" is disabled because a) everyone'll choose it and b) nobody'll see it. 
];

cfg.toolTips = {

	suppression: "You’ll block any attack that rolls above your Suppression. Keep this low to keep your guard up!",
	stunned: "Your Suppression is higher than your max Stamina! You may not attack until you reduce it.",
	stamina: "Fighting takes a lot of energy! Most actions cost a point of Stamina, and the higher this is the faster you can reduce Suppression. Restore this with the Rest action.",
	damage: "You’ve been injured! Damage makes it harder to reduce Suppression.",
	recovery_rating: "This is how much Suppression you restore with the Defend action! Try to keep your Stamina high and your Damage low.",
	bleed: "You’re hurt and exhausted! Your Suppression will increase at the beginning of your turn until you get your Stamina back above your Damage.",

	type: "Action types don't do anything on their own, but many items alter their effects based on what type of action your opponent last used! For example, the Minigun can provide covering fire against 'Direct' attacks, and the Impact Hammer hits harder against 'Block' defenses.",

	attack_weight: "(Attack Mod) This value is added to your attack rolls.",
	concussive: "(Attack Mod) Increases the target’s Suppression on a hit.",
	disruptive: "(Attack Mod) Drains the target’s Stamina on a hit.",
	recoil: "(Attack Mod) Your own Suppression increases when you attack.",
	
	defense_weight: "(Defense Mod) This value is subtracted from attack rolls against you.",
	deflection: "(Defense Mod) Converts incoming damage to a Suppression increase.",
	toughness: "(Defense Mod) Converts incoming damage to Stamina drain.",
	kickback: "(Defense Mod) Increases the attacker’s Suppression when you’re hit.",
	feedback: "(Defense Mod) Drains the attacker’s Stamina when you’re hit.",
};
