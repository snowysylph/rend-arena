rend-arena
==========

Lightweight RP dueling app!


====== v0.0.2 ======
TODO: Add display stuff back in!

====== v0.0.1 ======
Pushed: 3/28/14

---- STRUCTURE ----
- Renamed rend.html to index.html


---- MECHANICS ----
- Stun now works off a 'stun_threshold' value instead of max stamina. This is a misc mod. Base value is cfg.scale.

- Since stamina cost is now an action mod, items can modify it!


---- UTILITY ----
- Modified rend.stack() to stack all numerical properties if not given a keys array, and to take a single source object without it needing to be in an array.

- Added linkPath to the config file (for use with rend.linkItem(), etc). It currently defaults to location.pathname, but now you can change it!

- Stun and restoration rating now work on the Player.isStunned() and Player.restore() methods rather than waiting for Player.update() to set them.

---- PRINTING AND DISPLAY ----
- GOT RID OF EXISTING ELEMENT-PRINTING FUNCTIONS 'cause I can do 'em better.

- Added cfg.printColors (with options for "suppression," "stamina," "damage" and "alert") so these are no longer hard-coded into print functions!

- Added cfg.bbColors to list valid BBCode colors! Will use this for an eventual color-picker.

- Added an update_display() method to the Player prototype, which updates stats in a div to their current values.

- Added rend.printValues() method to output some color-coded values from an object because I was writing the same kind of thing a lot in action .print() functions.


---- ACTIONS ----
- Broke actions out of the Player prototype into their own object, and split into declare(), resolve(), and print() functions. Executing actions looks something like this:

	declare(actor) -> resolve(event) -> print(event) -> output string;

Splitting printing out from resolution just makes sense, while he seperate declare() function (which handles rolling and gathering modifiers) lets me eventually set up some kind of simultaneous declaration structure without too much refactoring on that end.

Currently the RESTORE and REST actions don't return a roll result (which resolution order would use).

- Renamed "attack" and "defense" mods to "action" and "reaction" mods.

- Added 'actor costs' to attack resolution and printing, to report voluntary costs separately from counterattack effects. (Spending Stamina on an action and taking Stamina damage from Feedback shouldn't look the same!)

- Added 'stamina_cost' to action mods, to work with the 'actor costs' change. Base value in the Player prototype is 1.



====== v0.0.0 ======
Pushed: 3/27/14

...wrote the damn thing? Game logic exists! Printing exists! Stuff displays but not very well!
