#! /usr/local/bin/node

var _ = require('underscore'),
	acs = require('./lib/acs-client'),
	conf = require('./conf'),
	comp = require('./completions'),
	readline = require('readline');

var stdin = process.openStdin(); 
process.stdin.setRawMode();

var previousCommands = [];

/// up arrow {"name":"up","ctrl":false,"meta":false,"shift":false,"sequence":"\u001b[A","code":"[A"}
/// a {"name":"a","ctrl":false,"meta":false,"shift":false,"sequence":"a"}
/// ctrl + a {"name":"s","ctrl":true,"meta":false,"shift":false,"sequence":"\u0013"}

var upArrowCounter = 0;
var lineStarted = false;

stdin.on('keypress', function (chunk, key) {
	//process.stdout.write('Get key: ' + JSON.stringify(key) + '\n');
	if( lineStarted==true ){
		return;
	}
	if(key){
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

function completer(line) {
  var completions = comp.split(' ')
  var hits = completions.filter(function(c) { return c.toLowerCase().indexOf(line.toLowerCase()) == 0 })
  // show nothing if not completions found
  return [hits.length ? hits : "", line]
}

rl.setPrompt('acs> ', 5);

rl.prompt();

rl.on('line', function (cmd) {
	lineStarted = false;
  	previousCommands.unshift(cmd);
  	rl.prompt();
});

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