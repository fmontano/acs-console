
var _ = require('underscore');


/// Getting all available commands
var commandList = require('./commander').COMMAND_LIST;
/// Getting all objects
var objectList = require('./commander').OBJECT_LIST;

var completions = "";
_.each(commandList, function(cmd){
	_.each(objectList, function(obj){
		completions += cmd+obj.charAt(0).toUpperCase() + obj.slice(1) + " ";
	})
})

module.exports = completions.replace(/\s+$/,'');;