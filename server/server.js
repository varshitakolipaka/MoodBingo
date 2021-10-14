/*
 ----------------------------------
 filename: server.js 
 ( main server-side js ) 
 ----------------------------------- 
 */


/*
--------------------------------------------------------
	importing required modules and setting up variables 
---------------------------------------------------------
*/


//socketUrl
const socketUrl = '/';

//modules
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const randomColor = require("randomcolor");
const handlebars = require('express-handlebars');
const fs = require("fs")

//utilitiy user-defined modules 
const shuffleArray = require("./server_utility/shuffle_array");
const addAndSort = require("./server_utility/add_sort");
const declareWinner = require("./server_utility/check_winner");

//express
const app = express();

//global variables
var cardcount = {};
var Norow;
var roomData = {};
var TEST, number, status;
var server_options;


/*
 --------------------------- 
    setting up the game  
 --------------------------- 
 */


//setting view engine (using handlebars)
app.set('view engine', 'hbs');

app.engine('hbs', handlebars({
	layoutsDir: __dirname + '/../client',
	extname: '.hbs',
	partialsDir: __dirname + '/views'
}));

//Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
app.get('/', (req, res) => {
	res.render('main', { layout: 'index' });
});

//reading options from json file
fs.readFile("./data/game_options.json", "utf8", (err, jsonString) => {
	if (err) {
		console.log("Error reading file from disk:", err);
		return;
	}
	try {
		server_options = JSON.parse(jsonString);
	} catch (err) {
		console.log("Error parsing JSON string:", err);
	}
})

//seting static directory
app.use(express.static(`${__dirname}/../client`));


const server = http.createServer(app);
const io = socketio(server);


/*
 -------------------------------------
   vote manupilation utility functions 
 --------------------------------------
 */


//function to intialize votes before every turn
function voteInitialize(roomID) {
	roomData[roomID]["total_votes"] = 0;
	roomData[roomID]["yes_votes"] = 0;
	Object.entries(((roomData[roomID])["members"])).forEach(([k, v]) => {
		v["voting_status"] = -1;
	});
}

//function to calculate votes after every turn
function voteCalculation(roomID) {
	roomData[roomID]["total_votes"] = 0;
	roomData[roomID]["yes_votes"] = 0;
	Object.entries(((roomData[roomID])["members"])).forEach(([k, v]) => {
		var member_vote = v["voting_status"];
		if (member_vote != -1) {
			roomData[roomID]["total_votes"] += 1;
			roomData[roomID]["yes_votes"] += member_vote;
		}
	});
}

//function to modify votes after a user presses yes/no
function modifyVotes(vote, roomID, uID) {
	vote = parseInt(vote, 10);
	((roomData[roomID])["members"][uID])["voting_status"] = vote;

}

//function called at beginning of voting round
function initVotes(roomID, uID, username) {
	roomData[roomID]["yes_votes"] = 0;
	roomData[roomID]["total_votes"] = 0;
	voteInitialize(roomID);
	message = username + " has begun voting round has begun! <3  :)"
	io.to(roomID).emit("message", message);
	io.to(roomID).emit("append voting", uID)
}

const connect = () => {
	socket = io(socketUrl, {
		autoConnect: false,
	});
}

io.sockets.on('connect', function (sock) {
	console.log(sock.id);
/*
 ------------------------------------------
                   Game
 (creating, in-game and post-game functions)
 -------------------------------------------
*/

	/* ----    new game created     ---- */

	//initalise the game and store details
	sock.on('newGameCreated', (roomID, preset, timer) => {

		roomData[roomID] = {};
		(roomData[roomID])["members"] = {};
		(roomData[roomID])["yes_votes"] = 0;
		(roomData[roomID])["total_votes"] = 0;
		(roomData[roomID])["join"] = 1;
		(roomData[roomID])["preset"] = preset;
		(roomData[roomID])["timer"] = timer;

	});
	
	/* ----    join a game    ---- */

	//join the game and store details

	sock.on("joinRoom", function ({ roomID, uID, username }) {

		if (roomID in roomData && roomData[roomID]["join"] == 1) {
			(roomData[roomID])["members"][uID] = {};
			roomData[roomID]["members"][uID]["name"] = username;
			((roomData[roomID])["members"][uID])["voting_status"] = -1;
			cardcount[uID] = [];
			sock.join(roomID);
			
			show_message = "Hi " + username + "! Welcome to room " + roomID + "<br> You can chill in the lobby and chat till we start the game! :)";
			io.to(roomID).emit('mem', roomData[roomID]["members"]);
			io.to(roomID).emit('options', server_options);
			io.to(roomID).emit("message", show_message);
		}

		else {
			console.log("room closed or does not exist! Please type again!");
		}
	});

	/* ----     game utilities      ---- */

	//function to add a yes vote
	sock.on("add vote yes", ({ roomID, uID, vote, username }) => {
		show_message = username + " voted yes.";
		io.to(roomID).emit("message", show_message);
		modifyVotes(vote, roomID, uID);

	});

	//function to add a no vote
	sock.on("add vote no", ({ roomID, uID, vote, username }) => {
		show_message = username + " voted no.";
		io.to(roomID).emit("message", show_message);
		modifyVotes(vote, roomID, uID);
	});

	//function to begin voting round
	sock.on("begin voting", ({ roomID, uID, username }) => {
		initVotes(roomID, uID, username);
	});

	
	/* ----------- message ------------*/

	//function to recieve message from a client and emit it to everyone else in the room
	sock.on("message", ({ text, uID, roomID, username }) => {
		show_message = username + ": " + text;
		io.to(roomID).emit("message", show_message);
	});

	/* ----------- game turn and winner ------*/

	//function when a request for starting a game is issued
	sock.on("submitted", ({ row, optionc, uID, roomID, username,timer}) => {
		console.log("roomID: " + roomID);
		if (roomID in roomData) {
			roomData[roomID]["join"] = 0;
			row = parseInt(row, 10);
			TEST = [...Array(row * row).keys()];
	
			
			shuffleArray(TEST);
			if (TEST.length) {
				number = TEST[TEST.length - 1];
				TEST.pop();
				
				io.to(roomID).emit("nextTurnCard", number);
			} else {
				status = "Game Over!";
				io.to(roomID).emit("message", status);
			}

			let GameUIStatus = {};
			GameUIStatus["row"] = row;
			GameUIStatus["option"] = (roomData[roomID])["preset"];
			GameUIStatus["timer"] = (roomData[roomID])["timer"];
			io.to(roomID).emit("makeEmptyBoard", GameUIStatus);
			io.to(roomID).emit("nextTurnCard", number);
			Norow = row;
			
			joined = username + " started the game!";
			cardcount[uID] = [];
			console.log(cardcount);
			io.to(roomID).emit("message", joined);
		}
		else {
			console.log("no room exists!");
		}
	}
	);

	//function to calculate game winning status after a turn is completed
	sock.on("turnDone", ({ uID, HighlightCardNumber, roomID, username }) => {

		joined = username + " chose this card " + HighlightCardNumber;
		voteCalculation(roomID);
		yesVotes = parseInt(roomData[roomID]["yes_votes"]);
		majorityVotes = Math.ceil(0.75 * parseInt(roomData[roomID]["total_votes"]));

		let WinStatus = {};
		WinStatus["uID"] = uID;
		WinStatus["status"] = 0;

		if (yesVotes >= majorityVotes && majorityVotes != 0) {
			addAndSort(cardcount[uID], HighlightCardNumber);
			let message = username + " won the card!";
			WinStatus["status"] = 1;

			io.to(roomID).emit("wonHighlighting", WinStatus);
			io.to(roomID).emit("message", message);


			let winstat;
			message = username + " won using ";
			winstat = declareWinner(cardcount[uID], Norow);
			switch (winstat) {
				case 0:
					message += "rows";
					io.to(roomID).emit("message", message);
					break;
				case 1:
					message += "columns";
					io.to(roomID).emit("message", message);
					break;
				case 2:
					message += " the primary diagonal.";
					io.to(roomID).emit("message", message);
					break;
				case 3:
					message += " the non primary diagonal";
					io.to(roomID).emit("message", message);
					break;
				default:
			}

		}

		else {
			message = username + " lost the card! Majority did not vote yes! :(";
			io.to(roomID).emit("message", message);
		}

		if (TEST.length) {
			number = TEST[TEST.length - 1];
			TEST.pop();
			voteInitialize(roomID);
			io.to(roomID).emit("nextTurnCard", number);
		} else {
			status = "Game Over!";
			io.to(roomID).emit("message", status);
		}

	});


    //to add custom propmpts
	sock.on("write custom preset", (jsonw) =>{
		server_options.push(jsonw);
		console.log(server_options);
		json_write = JSON.stringify(server_options);
		fs.writeFile("./data/game_options.json",json_write, (err) =>{
			if(err) {console.log(err);}
	    });
	})

});

/* -------  server ------------*/

server.on("error", (err) => {
	console.error(err);
});

server.listen(process.env.PORT || 8080, () => {
	console.log("server is ready");
});