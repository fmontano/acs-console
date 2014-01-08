#! /usr/local/bin/node

/**
* CLI for Appcelerator Client Services (http://www.appcelerator.com/cloud/)
*
* Created by Freddy Montano
* freddymx@gmail.com
*
* ACS's web portal tends to be slow and sometime crashes. I needed a command line interface
* for a quick and dirty way to query ACS app data.
**/

var _ = require('underscore'),
	acs = require('./lib/acs-client'),
	conf = require('./conf'),
	Commander = require('./commander'),
	comp = require('./completions'),
	clc = require('cli-color'),
	readline = require('readline');

/// State variable
var executing = false;

/// Preparing the console
var stdin = process.openStdin(); 
process.stdin.setRawMode();

/// Keeping track of the last commands execute to allow users to access them by hitting UP arrow
var previousCommands = [];
var currentCommand;

/// TODO: Remove this. Reference only
/// up arrow {"name":"up","ctrl":false,"meta":false,"shift":false,"sequence":"\u001b[A","code":"[A"}
/// a {"name":"a","ctrl":false,"meta":false,"shift":false,"sequence":"a"}
/// ctrl + a {"name":"s","ctrl":true,"meta":false,"shift":false,"sequence":"\u0013"}

/// I need to know how many times the user have hit UP
var upArrowCounter = 0;
var lineStarted = false;
var showingDetails = false;
var dataset = {};

/// Declaring some function to keep handy
GLOBAL.error = function(msg){
	console.log(clc.red.bold("[Error] "+msg));
}
GLOBAL.warning = function(msg){
	console.log(clc.yellow.bold("[Warning] "+msg));
}
GLOBAL.info = function(msg){
	console.log(clc.green.bold("[Info] "+msg));
}

/// Listening to every key pressed
stdin.on('keypress', function (chunk, key) {

	if(key){
		if (key && key.ctrl && key.name == 'c') {
			/// User is about to exit. Put any critical statements here
			return true;
		}
		/// When user hit UP, we will load previous entered commands
		if( key.name == "up" ){
			/// Checking if we have some commands left in the stack
			if( upArrowCounter < previousCommands.length ){
				process.stdout.write(previousCommands[upArrowCounter]);
				upArrowCounter++;
			}
		/// If user hit down, we decrease the counter 
		} else if ( key.name == "down" ){
			upArrowCounter > 0 && upArrowCounter--;
		/// When user hit escape, we take him out of the current prompt, to the initial one (acs>)
		} else if( key.name == "escape" ){
			showingDetails = false;
			rl.setPrompt('acs> ', 5);
			rl.prompt();
		/// User started typing a command.
		} else {
			upArrowCounter = 0;
			lineStarted = true;
		}
	} else {
		lineStarted = true;
	}
	
  //process.stdout.write('Get Chunk: ' + chunk + '\n');
  //process.stdout.write('Get key: ' + JSON.stringify(key) + '\n');
  if (key && key.ctrl && key.name == 'c') process.exit();
});

/// Creating the CLI and assigning our function completer to handle 'Tab' to autocomplete
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer : completer
});

var commander = new Commander(rl);

/// Getting an array with all the possible commands users can execute on our CLI
var completions = comp.split(' ')
/// Getting the list of 
function completer(line) {
	if(executing)
		return "";
	/// Getting all the items that match what the user has typed so far when hitting TAB
  	var hits = completions.filter(function(c) { return c.toLowerCase().indexOf(line.toLowerCase()) == 0 })
  	// show nothing if not completions found
  	return [hits.length ? hits : "", line]
}

/// Initializing our prompt
rl.setPrompt('acs> ', 5);
rl.prompt();

/// Processing line entered when hitting enter
rl.on('line', function (cmd) {
	if(!executing && !showingDetails){
		console.log("Got line");
		lineStarted = false;
		executing = true;
	  	previousCommands.unshift(cmd);
	  	/// Delegating actions to Commander.js and getting the callback with results data
	  	commander.execute(cmd, function(status, data, meta, command){
	  		if(status==Commander.Status.SUCCESS){
	  			showingDetails = true;
	  			executing = false;
	  			dataset.data = data;
	  			dataset.meta = meta;
	  			currentCommand = command;
	  			presentData();
	  		} else {
	  			executing = false;
	  			meta && error(meta.message);
	  		}
	  		rl.prompt();
	  	});
	} else if(showingDetails){
		previousCommands.unshift(cmd);
		displayHelper(cmd);
	}
});

function presentData(){
	var header = "";
	showMeta();

	/// Showing the id's of the objects
	_.each(dataset.data, function(o, index){
		console.log(clc.cyan.bold((index+1)+": ")+o.id);
	})
}

function showMeta(){
	var header = "";
	_.each(dataset.meta, function(m, key){
		if( key!="status" && key!="method_name" )
			header+=clc.blue.bold(key+": ") + clc.cyan.bold(m)+' ';
	})
	console.log(clc.blue.bold(header));
}

function displayHelper(cmd){
	cmd = cmd.replace(/^\s+/,'').replace(/\s+$/,'').toLowerCase();
	if( cmd=="" ){
		error("Missing command");
		rl.prompt();
		return;
	}
	var cmdArr = cmd.split(' ');

	if( cmdArr[0]=="show" ){
		if( cmdArr.length==1 ){
			error("Missing index to show")
		} else {
			if( cmdArr[1]=="meta" ){
				showMeta();
			} else if( cmdArr[1]=="all" ){
				presentData();
			} else if( !isNaN(cmdArr[1]) ){
				if( cmdArr[1]>dataset.data.length ){
					error("Index out of bounds");
				} else {
					/// Checking if there are some filters set
					if( cmdArr.length>2 ){
						var _object = {};
						for(var i=2; i<cmdArr.length;i++){
							dataset.data[cmdArr[1]-1][cmdArr[i]] && (_object[cmdArr[i]] = dataset.data[cmdArr[1]-1][cmdArr[i]]);	
						}
						console.log(_object);
					} else {
						console.log(dataset.data[cmdArr[1]-1]);
					}
					
				}
				
			} else {
				error("Invalid index");
			}
		}
		//rl.prompt();
	} else if( cmdArr[0]=="find" ){
		if( cmdArr.length<2 ){
			error("Enter fields to filter by (ex. find first_name:john last_name:doe)");
		} else {
			var filters = [];
			for(var i=1; i<cmdArr.length;i++){
				var pair = cmdArr[i].split(":");
				if( pair.length==2 ){
					filters.push({
						field : pair[0],
						value : pair[1]
					});
				}
			}
			var results = _.filter(dataset.data, function(obj){
				var valid = true;
				_.each(filters, function(filter){
					if( !obj[filter.field] || obj[filter.field].toLowerCase()!=filter.value ){
						valid = false;
					} 
				})
				return valid;
			});
			if( results.length==0 ){
				info("No results found.");
			} else {
				info(results.length + " result(s) found.");
				console.log(results);
			}
			
		}
		//rl.prompt();
	} else if( cmdArr[0]=="list" ){
		presentData();
		//rl.prompt();
	} else if( cmdArr[0]=="copy" ){
		var cmdArr = cmd.split(' ');
		console.log(cmdArr.length);
		if( cmdArr.length==1 ){
			error("Missing index to show. Use 'copy all' to copy all records to clipboard")
		} else {
			if(cmdArr[1]=="all"){
				console.log(dataset.data[cmdArr[1]-1]);
				require('child_process').exec('echo "'+JSON.stringify(dataset.data)+'" | pbcopy');
				info("Object copied to clipboard");
			} else {
				if(!isNaN(cmdArr[1])){
					require('child_process').exec('echo "'+JSON.stringify(dataset.data[cmdArr[1]-1])+'" | pbcopy');
					info("Object copied to clipboard");
				} else {
					error("Enter a valid number between 1 and "+dataset.data.length);
				}
			}
		}
		
	} else {
		error("Invalid command")
	}
	rl.prompt();
}


