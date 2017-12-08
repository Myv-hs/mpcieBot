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
const profiles_DATAloc = 'data/profiles.json';
const SD2DkeyList = 'data/keys.txt';

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
	console.log("-=- Disconnect from Discord -- code: ", code, " -- erMsg: ", erMsg, " -=-")
	connected = false;
});

/*	Ceci est la fonction qui repere les commandes parmis les messages pour 
	ensuite les decomposer et les dechifrer 
	Cote sythax, bot.on(evenement, fonction) est une fonction qui attends
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
	let command = inputC.split(" ")[0];							// on prends le premier mot pour titre de commande
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
		case "PROFILE":
		case "PROFIL":
			Profile(args);
			break;
		case "SD2D_KEY":
			GiveSD2DKey();
			break;
		case "SUB":
			GamePing(args)
		default:
			break;
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

function Help () {
	if(input.guild.name=="groupeSept") input.reply('Bonjour :)');
	else input.reply("Hello I'm RNGzeus!");
	input.channel.send('  ::roll 	pour rouler un Dé\n::Hello 	helloWorld\n::sd2d_Key 	pour avoir une clef steam pour Space Drifters 2D');
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

function addSub (role, mem) {
	mem.addRole(role).catch(console.error);
	input.channel.send("role added");
}

function rmSub (role, mem) {
	mem.removeRole(role).catch(console.error);
	input.channel.send("role removed");
}

function GamePing (args) {
	let rm = modePrefix+"R";
	if(args.length==0) return input.channel.send("need more args");
	let member = input.member;
	let rmmode = args.indexOf(rm); rmmode++;
	let goodroles = require('./gameroles.js').roles;
	for(var i=0;i<args.length;i++) {
		for(var j=0;j<goodroles.length;j++) {
			if(args[i]==rm) continue;
			if(args[i].toLowerCase()==goodroles[j]) {
				let role = input.guild.roles.find("name", args[i].toLowerCase());
				if(!rmmode) addSub(role,member);
				else rmSub(role,member);
				break;
			}
			if(j+1==goodroles.length) input.channel.send("invalid role: "+args[i]);
		}
	}
}

function Profile (args) {
	var profileFields = ["email", "website", "youtube", "github", "link", "bio"];
	if (args.length == 0){
		return input.channel.send("::profil Nom ~web ~yt ~git ~lnk ~bio");
	} else if (args.length == 1) {
		ProfileLoad(args[0], [profileFields[0], profileFields[1], profileFields[2], profileFields[3], profileFields[4], profileFields[5]]);
	} else if (args.length > 1) {
		var singleLinks = args.slice(1);
		var badSingleLinks = 0; 
		for (var i=0;i<singleLinks.length; i++) {
			
			/*	Je pense que ces else if pourraient etre remplaces par un
				switch */

			if (singleLinks[i] == modePrefix+"EML"){
				singleLinks[i] = profileFields[0];
				//correctSingleLinks ++;
			} else if (singleLinks[i] == modePrefix+"WEB") {
				singleLinks[i] = profileFields[1];
				//correctSingleLinks ++;
			} else if (singleLinks[i] == modePrefix+"YT") {
				singleLinks[i] = profileFields[2];
				//correctSingleLinks ++;
			} else if (singleLinks[i] == modePrefix+"GIT") {
				singleLinks[i] = profileFields[3];
			} else if (singleLinks[i] == modePrefix+"LNK") {
				singleLinks[i] = profileFields[4];
			} else if (singleLinks[i] == modePrefix+"BIO") {
				singleLinks[i] = profileFields[5];
			} else {
				input.channel.send("Invalid LinkType: "+singleLinks[i]);
				singleLinks[i] = "skip";
				badSingleLinks++;
			}
		}

		if (badSingleLinks == 0 || singleLinks.length != 0){
			ProfileLoad(args[0], singleLinks);
		}
		/*var correctSingleLinksARR = [];
		for (var i = 0; i<correctSingleLinks; i++) {
			outText += singleLinks[i]
		};*/
	}
}

function ProfileLoad (linkgroup, singleLinks) {
	// var name = "Matthew";
	// var singleLink = "youtube";
	fs.readFile(profiles_DATAloc, 'utf8', function (err, data) {
		if (err) throw err;
		var links_DATA = JSON.parse(data);

		if (links_DATA[linkgroup] == undefined) {
			return input.channel.send(`no such LinkGroup: ${linkgroup} does not exist`);
		}

		var outText = "";
		for (var i=0;i<singleLinks.length; i++) {
			if (!singleLinks[i] != "skip") {
				var linkToReturn = links_DATA[linkgroup][singleLinks[i]];
				if (linkToReturn != undefined) {
					outText += linkToReturn;
					//console.log("adding Link");
					if (i<singleLinks.length-1){
						outText +="\n";
						//console.log("line break");
					}
				}
			}
		}
		input.channel.send(outText);
	});
}

function GiveSD2DKey () {
	var user = input.author.id;
	fs.open(SD2DkeyList, r, (err, fd) =>{
		if (err) {
			return console.error(err);
		}
		fs.read(fd, buf,0,buf.length,0,(err,bytes)=>{
			if (err) {
				return console.error(err);
			}
			var stream = buf.slice(0,bytes).toString();
			var linesArray = stream.split("\n");
			var keysArray = new Array();
			for(i=0;i<linesArray.length;i++) {
				//for (j=0;j<=1;j++) {
					//keysArray[i][j] = linesArray.split(" ")[j];
				//}
				keysArray[i] = linesArray[i].split(" ");
			}
			var usrIndex = index2D(keysArray,1,user);
			var freeIndex = index2D(keysArray,1,'n');
			if (usrIndex < 0) {
				if (freeIndex < 0) {
					input.reply("No availiable keys sorry.")
				} else {
					keysArray[freeIndex][1] = user;
					input.reply(keysArray[freeIndex][0]);
					var newStream = "";
					for (i=0;i<keysArray.length;i++) {
						for (j=0;j<=1;j++) {
							newStream += keysArray[i][j];
							if (j==0) {
								newStream += " ";
							}
						}
						if (i!= keysArray.length-1){
							newStream += "\n";
						}
					}
					fs.write(fd, newStream, 0, (err, written, string) => {
						if (err) return console.error(err);
						fs.close(fd, (err)=> {
							if (err) return console.error(err);
						});
					});
				}
			} else input.reply(keysArray[usrIndex][0]);
		});
	});
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