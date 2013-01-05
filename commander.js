var _ = require('underscore'),
	acs = require('./lib/acs'),
	conf = require('./conf');


// var client = new acs.Client({
//     applicationkey: conf.acs.key,
//     oauthKey: conf.acs.oauth,
//     oauthSecret: conf.acs.secret
// });



var client = acs.createCocoafish('XNgsVvdtxRkuYudfzUYLpPszdRoGr58d');

/// List of accepted commands
var commands = "create update delete query search show".split(' ');
var objects = "photos places users chats acls".split(' ').sort(function(a,b){ if (a > b) return 1;if (b > a) return -1;return 0; });

/// Control variables
var executing = false;
var Status = {
	SUCCESS : 1,
	FAILED : 0
}

var Error = {
	INVALID_COMMAND : 0,
	INVALID_OBJECT : 1
}

Error.Message = {};
Error.Message[Error.INVALID_COMMAND] = "Invalid command entered";
Error.Message[Error.INVALID_OBJECT] = "Invalid object entered";

//var ERROR.

var Commander = function(rl){

	var self = this;

	/// Getting current console
	self.rl = rl;

	// if( self.rl ){
	// 	rl.on('line', function (line) {
	// 		if(executing){
	// 			console.log(line)
	// 		}
	// 	});
	// }

	self.getCommands = function(){
		return commands;
	}

	self.execute = function(cmd, callback){
		cmd = cmd.toLowerCase();
		if(!cmd || !callback){
			callback && callback(Status.FAILED, { error : "Missing command"});
			return false;
		}
		
		var command = parse(cmd);

		if( !command ){
			callback(Status.FAILED)
		} else if( command==Error.INVALID_COMMAND || command==Error.INVALID_OBJECT ){
			callback && callback(Status.FAILED, null, { code : command , message : Error.Message[command] || "Error."});
			return false;
		} else {
			executing = true;
			console.log(command);
			getExtras(cmd, function(extras){
				console.log("Got extras : "+JSON.stringify(extras));
				if( !extras.per_page )
					extras.per_page = conf.acs.per_page;
				console.log("Executing cmd");
				client.sendRequest(command.object + '/' + command.cmd + '.json', command.method, extras, function(e){
					//console.log(e);
					executing = false;
					if( e.meta.status=='fail' ){
						callback(Status.FAILED, null, e.meta);
					} else {
						callback(Status.SUCCESS, e.response[command.object], e.meta);
					}

					//{ meta: { status: 'fail', code: 400, message: 'Invalid request sent.' } }
					// { meta: 
					//    { code: 200,
					//      status: 'ok',
					//      method_name: 'queryPhoto',
					//      page: 1,
					//      per_page: 10,
					//      total_pages: 12,
					//      total_results: 113 },


					//executing = false;
					//callback && callback(STATUS.SUCCESS)
				});
				
			})
		}
	}

	/// Validates the command and the object entered
	function parse(cmd){
		var command = _.find(commands, function(c){
			return (cmd.indexOf(c)>=0);
		})
		if( !command ){
			return Error.INVALID_COMMAND;
		} else {

			var object = cmd.replace(command, '');
			console.log('obj : '+object + " > "+(objects.indexOf(object)));
			if( objects.indexOf(object)<0 ){
				return Error.INVALID_OBJECT;
			} else {
				/// We have a valid command/object pair
				var retValue = {};
				if( command == "query" || command == "show" || command == "search"){
					retValue.method = "GET";
				} else if( command=="create" || command=="update"){
					retValue.method = "POST";
				}
				retValue.cmd = command;
				retValue.object = object;
				return retValue;
			}
		}
		console.log("FOund? "+command);
		//if( commands.indexOf(command)==-1 ){
			/// Command not found
		//	return null;
		//}
	}

	function getExtras(cmd, callback){
		
		self.rl.setPrompt(cmd + '> ', (cmd.length+2));

		var params = [
			{ field : 'where', validation : 'object' },
			{ field : 'order' },
			{ field : 'per_page', validation : 'int' },
			{ field : 'page', validation : 'int' },
		]

		getParams(0);

		var extras = [];

		function getParams(index){
			if( index >= params.length ){
				/// Done getting extras
				callback(extras || []);
			} else {
				var field = params[index].field;
				self.rl.question( field + " : ", function(str){
					if(str && str.length > 0 ){
						console.log(field + " > "+str);

						if( params[index].validation ){
							switch(params[index].validation){
								case 'object':
									console.log("validating object");
									try {
										var _object = JSON.parse(str);
										var obj = {};
										extras[field] = _object;
										//.(obj);
										getParams(index+1);
									} catch (e){
										error(field + " must be a JSON object");
										getParams(index);
									}
								break;
								case 'int':
									if( !/^\d+$/.test(str) ){
										error(field + " must be a integer");
										getParams(index);
									} else {
										var obj = {};
										//obj[field] = Number(str);
										//extras.push(obj);
										extras[field] = Number(str);
										getParams(index+1);
									}
								break;
							}
						} else {
							var obj = {};
							extras[field] = str;
							getParams(index+1);
						}

						
					} else {
						getParams(index+1);
					}
					
				});
			}
		}
	}

}

module.exports = Commander;
module.exports.COMMAND_LIST = commands;
module.exports.OBJECT_LIST = objects;
module.exports.Status = Status;
module.exports.Error = Error;