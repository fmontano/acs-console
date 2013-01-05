#! /usr/local/bin/node

var _ = require('underscore'),
	acs = require('./lib/acs-client'),
	conf = require('./conf'),
	Commander = require('./commander'),
	comp = require('./completions'),
	clc = require('cli-color'),
	readline = require('readline');

var executing = false;

var stdin = process.openStdin(); 
process.stdin.setRawMode();

var previousCommands = [];

/// up arrow {"name":"up","ctrl":false,"meta":false,"shift":false,"sequence":"\u001b[A","code":"[A"}
/// a {"name":"a","ctrl":false,"meta":false,"shift":false,"sequence":"a"}
/// ctrl + a {"name":"s","ctrl":true,"meta":false,"shift":false,"sequence":"\u0013"}

var upArrowCounter = 0;
var lineStarted = false;
var showingDetails = false;
var dataset = {};

GLOBAL.error = function(msg){
	console.log(clc.red.bold("[Error] "+msg));
}
GLOBAL.warning = function(msg){
	console.log(clc.yellow.bold("[Warning] "+msg));
}

stdin.on('keypress', function (chunk, key) {
	//process.stdout.write('Get key: ' + JSON.stringify(key) + '\n');
	if( lineStarted==true ){
		return;
	}
	if(key){
		if (key && key.ctrl && key.name == 'c') {console.log("tomo?"); return false;};
		if( key.name == "up" ){
			if( upArrowCounter < previousCommands.length ){
				process.stdout.write(previousCommands[upArrowCounter]);
				upArrowCounter++;
			}
		} else if ( key.name == "down" ){
			upArrowCounter > 0 && upArrowCounter--;
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

/// Used to catch single chars
// stdin.on('keypress', function (chunk, key) {
//   process.stdout.write('Get Chunk: ' + chunk + '\n');
//   process.stdout.write('Get key: ' + JSON.stringify(key) + '\n');
//   if (key && key.ctrl && key.name == 'c') process.exit();
// });

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer : completer
});

var commander = new Commander(rl);

function completer(line) {
	if(executing)
		return "";
  	var completions = comp.split(' ')
  	var hits = completions.filter(function(c) { return c.toLowerCase().indexOf(line.toLowerCase()) == 0 })
  	// show nothing if not completions found
  	return [hits.length ? hits : "", line]
}

rl.setPrompt('acs> ', 5);

rl.prompt();

rl.on('line', function (cmd) {
	if(!executing){
		console.log("Got line");
		lineStarted = false;
	  	previousCommands.unshift(cmd);
	  	executing = true;
	  	commander.execute(cmd, function(status, data, meta){
	  		if(status==Commander.Status.SUCCESS){
	  			showingDetails = true;
	  			dataset.data = data;
	  			dataset.meta = meta;
	  			presentData();
	  		} else {
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
	_.each(dataset.meta, function(m, key){
		if( key!="status" && key!="method_name" )
			header+=clc.cyan.bold(key+": ") + m+' ';
	})
	console.log(clc.cyan.bold(header));

	/// Showing the id's of the objects
	_.each(dataset.data, function(o, index){
		console.log(clc.cyan.bold((index+1)+": ")+o.id);
	})
}

function displayHelper(cmd){
	cmd = cmd.replace(/^\s+/,'').replace(/\s+$/,'');
	if( cmd.indexOf('expand')==0 ){
		var cmdArr = cmd.split(' ');
		console.log(cmdArr.length);
		if( cmdArr.length==1 ){
			error("Missing index to expand")
		} else {
			console.log(dataset.data[cmdArr[1]-1]);
		}
		rl.prompt();
	} else if( cmd.indexOf('show')==0 ){
		presentData();
		rl.prompt();
	} else if( cmd.indexOf('copy')==0 ){
		var cmdArr = cmd.split(' ');
		console.log(cmdArr.length);
		if( cmdArr.length==1 ){
			error("Missing index to expand. Use 'copy all' to copy all records to clipboard")
		} else {
			if(cmdArr[1]=="all"){
				console.log(dataset.data[cmdArr[1]-1]);
				require('child_process').exec('echo "'+JSON.stringify(dataset.data)+'" | pbcopy');
			} else {
				if(!isNaN(cmdArr[1])){
					require('child_process').exec('echo "'+JSON.stringify(dataset.data[cmdArr[1]-1])+'" | pbcopy');
				} else {
					error("Enter a valid number between 1 and "+dataset.data.length);
				}
			}
			
		}
		rl.prompt();
	} else {
		error("Invalid command")
		rl.prompt();
	}
}

/// Copying to clipboard ("OSX only")
// require('child_process').exec(
//     'echo "test foo bar" | pbcopy',

//     function(err, stdout, stderr) {
//         console.log(stdout); // to confirm the application has been run
//     }
// );

// GLOBAL.client = new acs.Client({
//     applicationkey: conf.acs.key,
//     oauthKey: conf.acs.oauth,
//     oauthSecret: conf.acs.secret
// });

// client.doQueryPhotos({
// 	where : JSON.stringify({
// 		user_id : '50d5b7d5222b3a0513049652',
// 		title : { "$exists" : true }
// 	})
// }, function(data){
// 	_.each(data.response.photos, function(photo, num){
// 		console.log((num+1)+": "+photo.title)
// 	})
// })