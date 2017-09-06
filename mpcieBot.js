const Discord = require('discord.js');
const fs = require('fs');

const bot = new Discord.Client();
const prefix = "::";
const modePrefix = "~";
const modName = "botteam";
var input;
var connected = false;

const r = "r+";
var buf = new Buffer(1024);

if (!connected) {
	LogOn();
}

bot.on('ready', ready =>{
	connected = true;
	console.log("Hello World");
});

bot.on('disconnect', (erMsg, code) =>{
	console.log("-=- Disconnect from Discord -- code: ", code, " -- erMsg: ", erMsg, " -=-")
	connected = false;
});

bot.on('message', message => {
	let modRole = message.guild.roles.find("name", modName);
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix));

	input = message;
	let inputC = message.content.toUpperCase();
	let command = inputC.split(" ")[0];
	command = command.slice(prefix.length);
	let args = inputC.split(" ").slice(1);

	switch (command) {
		case "HELLO":
			SayHello();
			break;
		case "ROLL":
			DiceRoll(args);
			break;
		case "HELP":
			Help(args);
			break;
		default:
			break;
	}
});

function Help () {
	input.reply('Bonjour, je suis mpcieBot.\nenvois ::roll pour rouler un Dé');
}

function SayHello () {
	var greetings = ["Hello", "Hi", "Hey", "Howdy"];
	var greetingNum = Math.floor(Math.random()*greetings.length);
	var greeting = greetings[greetingNum];
	input.reply(greeting);
}

function DiceRoll (args) {
	var roll=0;
	//var diceSize=6;
	//var diceNum=1;
	
	if ((args[0] > 9999 || args[1] > 9999)) { // && args[2] != modePrefix+"F"
		var forcer = modePrefix+"F";
		var forcerIndex = args.indexOf(forcer);
		if (forcerIndex != -1) {
			input.reply("you've forced large numbers...\nif you're using lots of dice, prepare to wait");
			args.splice(forcerIndex,1);
		} else return input.reply("please use smaller/fewer dice.");	
	}

	if (args.length==0){
		roll = Dice(6);
	} else if (args.length==1) {
		roll = Dice(args[0]);
	} else if (args.length==2) {
		for (var i=0;i<args[1];i++) {
			roll += Dice(args[0]);
		}
	}

	input.reply(" rolled "+roll);
};

function Dice (arg) {
	if (arg > 1) {
		var rng = Math.floor(Math.random()*arg)+1;
		return rng;
	} else if (arg == 1) {
		var rng = (Math.round(Math.random()*1000))/1000;
		return rng;
	} else if (arg == "BINARY" || arg == (modePrefix+"B")) {
		var rng = Math.round(Math.random());
		return rng;
	} else {
		input.channel.send("Please use int for dice amount and quantity");
	}		
};

function LogOn () {
	bot.login('');
}