var bb = {};

bb.parse = function bbParse(string){
	var regTag, regExp;
	
	string = string || "";
	
	for (tag in bb.tags){
		regTag = tag.replace( /\[/g , "\\[").replace( /\]/g , "\\]");
		regExp = new RegExp(regTag, "gi");

		string = string.replace(regExp, bb.tags[tag]);
	}
	
	return string;
};

bb.tags = {
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
