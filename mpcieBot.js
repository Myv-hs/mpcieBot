/***********************

mpcieBot by Myv.hs


comments are in french

************************/

/*	Ceci est engros la partie #include.
 	discord.js est surtout utiliser comme le iostream, mais aussi pour
 	ce connecter le bot au serveur.
 	fs est comme un iostream mais pour des fichiers, et un peu plus 
 	complique.
 	On a aussi des liens locaux vers des fichiers .txt .json et c'est la 
 	qu'on stocke des donnes a long terme. */
"use strict";

const Discord = require('discord.js');
const Token = require('./t.js');
const fs = require('fs');

/*	Ici on decalre des valeurs fondamenteaux.
	bot est un class qui va attendre les evenements de Discord via node.
	Les trois autres const sont les flags pour distinger les messages, 
	les options, et les utiliseurs a privileges.
	input est la varialbe globale qui contien tout l'information du
	message.
	r et buf sont des elements utilises par fs */

const bot = new Discord.Client();
const prefix = "::";
const modePrefix = "~";
const modName = "botteam";
var input;
var connected = false;

const r = "r+";
var buf = new Buffer(1024);

if (!connected) {
	LogOn(Token.token);
}

/*	console.log affiche sur la ligne de commande de la machine sur laquel
	tourne ce script. Vu qu'il n'y a pas vraiement de fenaitre de console
	overt, il serra mis dans un fichier nohup.out */

bot.on('ready', ready =>{
	connected = true;
	console.log("Hello World");
});

bot.on('disconnect', (erMsg, code) =>{
	console.log("-=- Disconnect from Discord -- code: ", code, " -- erMsg: ", erMsg, " -=-");
	connected = false;
});

/*	Ceci est la fonction qui repere les commandes parmis les messages

	bot.on(evenement, fonction) est une fonction qui attends
	un evenement puis execute un autre fonction.
	Ici la fonction quel execute a aussi une sythaxe particuliere au js.
	Au lieu de l'ecrire:
	fonction truc (parametres) { faire des trucs }
	
	on peux racoursir un peu:
	(parametres) => { faire des trucs } 

	*/

bot.on('message', message => {
	let modRole = message.guild.roles.find("name", modName);
	if (message.author.bot) return;								// si un message est ecrit par un bot on l'ignore 
	if (!message.content.startsWith(prefix));					// si un message commence pas avec les prefix des commandes idem

	input = message;
	let inputC = message.content.toUpperCase();					// pOuR evItER LeS PRobLemEs
	let command = inputC.split(" ")[0].toUpperCase();				// on prends le premier mot pour titre de commande
	command = command.slice(prefix.length);						
	let args = inputC.split(" ").slice(1);						// les arguments des commandes sont dans le message-{la commande}

	/*	Et voici la partie qui prends la commande et l'execute.
		switch est plus propre de else if, et en js on peu l'utiliser sur 
		le type string */

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
		case "SUB":
			SubPing(args);
			break;
		default:
			break;
	}
});

const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

bot.on('raw', async event => {
	if (!events.hasOwnProperty(event.t)) return;

	const { d: data } = event;
	const user = bot.users.get(data.user_id);
	const channel = bot.channels.get(data.channel_id) || await user.createDM();

	if (channel.messages.has(data.message_id)) return;

	const message = await channel.fetchMessage(data.message_id);
	const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
	let reaction = message.reactions.get(emojiKey);

	if (!reaction) {
		const emoji = new Discord.Emoji(bot.guilds.get(data.guild_id), data.emoji);
		reaction = new Discord.MessageReaction(message, emoji, 1, data.user_id === bot.user.id);
	}

	bot.emit(events[event.t], reaction, user);
});

bot.on('messageReactionAdd', async (reaction, user) =>{
	//console.log("reactionAdded");
	let messageID = reaction.message.id;
	let mem = await reaction.message.guild.fetchMember(user);
	let roles = reaction.message.guild.roles;

	if(messageID == '465561275523661824'){ //message d'inscription
		console.log(mem.user.name+" Reacted to Incription Post");
		if(reaction.emoji.name==="1⃣") mem.addRole(roles.find("name","L1")).catch(console.error);
		else if(reaction.emoji.name==="2⃣") mem.addRole(roles.find("name","L2")).catch(console.error);
		else if(reaction.emoji.name==="3⃣") mem.addRole(roles.find("name","L3")).catch(console.error);
	}
});


/*	Ici on toute la fonctionalite du Bot, et c'est ci-dessous que vous
	pouvez ajouter vos fonctions.
	le cout vers l'utilisateur de la commande est 
	input.reply('votre reponse') mais vous pouvez aussi repondre sans @
	la personne avec input.channel.send('votre message') 
	
	La majorite de mes commentaires sont les parties obsoletes de mon code.
	Je pense que mon code devrais s'expliquer tout seul, ducoups je vous
	laisse dechiffrer apartir d'ici, mais n'hesitez pas de me demmander. */

function Sorry () {
	input.channel.send("Sorry function disabled // Desole fonction desactive");
}

function Help () {
	let HelpTxt = require('./data/help.js').txt;
	if(input.guild.name=="groupeSept") input.reply('Bonjour :)');
	else input.reply("Hello I'm MPCIEbot!");
	input.channel.send(HelpTxt);
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

function createSub (role) {
	console.log("\ncreating "+role+"\n");
	
	let userroles = Array.from(input.member.roles.values());
	for(var i=0;i<userroles.length;i++) userroles[i]=userroles[i].name;
	if(userroles.indexOf("mkTags")<0) return input.reply("You do not have permissions");
	
	if(getLCRolesString().indexOf(role)<0) {
		input.channel.send("creating "+role);
		input.guild.createRole({
			name: role,
			permissions: [],
			mentionable: true
		});
	} else input.channel.send("Role Exists");
}

function addSub (role, mem) {
	console.log("adding "+role+" to "+mem.id);
	mem.addRole(role).catch(console.error);

}

function rmSub (role, mem) {
	console.log("removing "+role+" from "+mem.id);
	mem.removeRole(role).catch(console.error);
}

function listSub () {
	input.channel.send(getLCRolesString());
}

function getLCRolesString () {
	let lcroles = new Array;
	let allRoles = Array.from(input.guild.roles.values());
	for(var i=0;i<allRoles.length;i++){
		let testedRole = allRoles[i].name;
		if(testedRole == testedRole.toLowerCase()){
			if(testedRole != "@everyone") lcroles.push(testedRole);
		}
	}
	return lcroles;
}

function SubPing (args) {
	console.log("\nSubPing is called")
	let rolechangeint = 0;

	let rm = modePrefix+"rm";
	let cr = modePrefix+"new";
	let ls = modePrefix+"ls";
	
	let rmmode = args.indexOf(rm); rmmode++;
	let crmode = args.indexOf(cr); crmode++;
	let lsmode = args.indexOf(ls); lsmode++;

	let member = input.member;
	
	if(args.length==0||(args.length==1&&(rmmode||crmode))) return input.channel.send("need more args");
	if(rmmode && crmode) return input.channel.send("incompatible options");
	
	if(lsmode) return listSub();
	
	if(crmode) {
		let game = args.slice(crmode);
		game = game[0].toLowerCase();
		return createSub(game);
	}
	let goodroles = getLCRolesString();
	for(var i=0;i<args.length;i++) {
		for(var j=0;j<goodroles.length;j++) {
			if(args[i]==rm) continue;
			if(args[i].toLowerCase()==goodroles[j]) {
				let role = input.guild.roles.find("name", args[i].toLowerCase());
				rolechangeint ++;
				if(!rmmode) addSub(role,member);
				else rmSub(role,member);
				break;
			}
			if(j+1==goodroles.length) input.channel.send("invalid role: "+args[i]);
		}
	}
	let reply = rolechangeint+" roles ";
	if(!rmmode) reply += "added";
	else reply += "removed";
	input.reply(reply);
}

function index2D (array2D, datanum, datacheck) {
	for (i=0;i<array2D.length;i++) {
		if (array2D[i][datanum] == datacheck) return i;
	}
	return -1;
}

function LogOn (token) {
	bot.login(token);
}