
var _ = require('underscore');

var commands = "query search create update show".split(' ');
var objects = "photos places users chats acls".split(' ');

var completions = "";
_.each(commands, function(cmd){
	_.each(objects, function(obj){
		completions += cmd+obj.charAt(0).toUpperCase() + obj.slice(1) + " ";
	})
})

module.exports = completions.replace(/\s+$/,'');;