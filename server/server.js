const socketUrl = 'http://localhost:8080';
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const randomColor = require("randomcolor");
const handlebars = require('express-handlebars');
const fs = require("fs")

const shuffleArray = require("./server_utility/shuffle_array");
const addAndSort = require("./server_utility/add_sort");
const declareWinner = require("./server_utility/check_winner");

const app = express();
var cardcount = {};
var Norow;
var roomIDArr = {};
var TEST, number, status;
var server_options;

app.set('view engine', 'hbs');

app.engine('hbs', handlebars({
	layoutsDir: __dirname + '/../client',
	extname: '.hbs',
	partialsDir: __dirname + '/views'
}));

fs.readFile("./data/game_options.json", "utf8", (err, jsonString) => {
	if (err) {
	  console.log("Error reading file from disk:", err);
	  return;
	}
	try {
		server_options = JSON.parse(jsonString);
	//   console.log("Customer address is:", options[0]["uID"]); // => "Customer address is: Infinity Loop Drive"
	} catch (err) {
	  console.log("Error parsing JSON string:", err);
	}
 })

app.use(express.static(`${__dirname}/../client`));
user_board = [2, 4, 5];

const server = http.createServer(app);
const io = socketio(server);

// const connection = () => {
// 	socket = io(socketUrl, {
// 	  autoConnect: false,
// 	});

// function shuffleArray(array) {
// 	for (var i = array.length - 1; i > 0; i--) {
// 		var j = Math.floor(Math.random() * (i + 1));
// 		var temp = array[i];
// 		array[i] = array[j];
// 		array[j] = temp;
// 	}
// }




var isSquare = function (n) {
	return Math.sqrt(n) % 1 === 0;
};






function modifyVotes(vote, roomID) {
	vote = parseInt(vote, 10);
	roomIDArr[roomID]["yes_votes"] += vote;
	roomIDArr[roomID]["total_votes"] += 1;
	console.log(roomIDArr[roomID]);

}


function initVotes(roomID, uID, username) {
	roomIDArr[roomID]["yes_votes"] = 0;
	roomIDArr[roomID]["total_votes"] = 0;
	// ((roomIDArr[roomID])["members"][uID])["voting_status"] = -1;
	message = username + "has begun voting round has begun! <3  :)"
	io.to(roomID).emit("message", message);
	io.to(roomID).emit("append voting", uID)
}
const connect = () => {
	socket = io(socketUrl, {
		autoConnect: false,
	});
}



app.get('/', (req, res) => {
	//Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
	res.render('main', { layout: 'index' });
	//res.render('main', { layout: 'index' });
});
io.sockets.on('connect', function (sock) {
	console.log('In Connect with msg: hi');
	console.log(sock.id);
	//const cooldown = test;
	//sock.on('newGameCreated', cooldown);
	//console.log(cooldown);
	sock.on('newGameCreated', (roomID) => {

		roomIDArr[roomID] = {};
		(roomIDArr[roomID])["members"] = {};
		(roomIDArr[roomID])["yes_votes"] = 0;
		(roomIDArr[roomID])["total_votes"] = 0;
		(roomIDArr[roomID])["join"] = 1;
		console.log("created room: " + roomID + roomIDArr[roomID] + (roomIDArr[roomID])["join"]);

	});

	sock.on("joinRoom", function ({ roomID, uID, username }) {

		// console.log("created room: " + roomID + (roomIDArr[roomID])["join"] );

			//Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"

		
		console.log("created roomID: " + roomID);
		console.log("created uID: " + uID);
		console.log("created name: " + username);
		console.log("server says: " + sock.id);
		if (roomID in roomIDArr && roomIDArr[roomID]["join"] == 1) {
			(roomIDArr[roomID])["members"][uID] = {};
			roomIDArr[roomID]["members"][uID]["name"] = username;
			((roomIDArr[roomID])["members"][uID])["voting_status"] = -1;
			cardcount[uID] = [];
			sock.join(roomID);
			console.log(roomID);
			var roomDetails = roomIDArr[roomID]["members"];
			console.log("ROOM DETAILS, HERE GOES: " + roomDetails);
			show_message = "Hi " + username + "! Welcome to room " + roomID + "<br> You can chill in the lobby and chat till we start the game! :)";
			io.to(roomID).emit('mem', roomIDArr[roomID]["members"]);
			io.to(roomID).emit('options', server_options);
			io.to(roomID).emit("message", show_message);
			io.emit("OMG");
		}

		else {
			console.log("room closed or does not exist! Please type again!");
			// io.to(roomID).emit("message", show_message);
		}
	});

	sock.on("message", ({ text, uID, roomID, username }) => {
		show_message = username + ": " + text;
		io.to(roomID).emit("message", show_message);
	});
	// sock.emit('begin voting',{roomID})

	sock.on("add vote yes", ({ roomID, uID, vote, username }) => {
		show_message = username + " voted yes.";
		console.log(vote);
		io.to(roomID).emit("message", show_message);
		modifyVotes(vote, roomID);

	});

	sock.on("add vote no", ({ roomID, uID, vote, username }) => {
		show_message = username + " voted no.";
		console.log(vote);
		io.to(roomID).emit("message", show_message);
		modifyVotes(vote, roomID);
	});

	sock.on("begin voting", ({ roomID, uID, username }) => {
		initVotes(roomID, uID, username);
	});

	sock.on("submitted", ({ row, optionc, uID, roomID, username }) => {
		console.log(roomID);
		if (roomID in roomIDArr) {
			roomIDArr[roomID]["join"] = 0;
			row = parseInt(row, 10);
			TEST = [...Array(row * row).keys()];
			console.log(row);
			console.log("ARRAY IS:" + TEST);
			shuffleArray(TEST);
			if (TEST.length) {
				number = TEST[TEST.length - 1];
				TEST.pop();
				console.log(number);
				io.to(roomID).emit("nextTurnCard", number);
			} else {
				status = "Game Over!";
				io.to(roomID).emit("message", status);
			}
			let GameUIStatus = {};
			GameUIStatus["row"] = row;
			GameUIStatus["option"] = optionc;
			console.log(GameUIStatus);
			io.to(roomID).emit("makeEmptyBoard", GameUIStatus);
			io.to(roomID).emit("nextTurnCard", number);
			Norow = row;
			console.log(row);
			console.log(optionc);
			console.log(uID);
			joined = username + " started the game!";
			cardcount[uID] = [];
			console.log(cardcount);
			io.to(roomID).emit("message", joined);
		}
		else {
			console.log("no room exists!");
		}


		console.log(roomIDArr[roomID]);
	}
);

	sock.on("turnDone", ({ uID, HighlightCardNumber, roomID, username }) => {

		joined = username + " chose this card " + HighlightCardNumber;
		yesVotes = parseInt(roomIDArr[roomID]["yes_votes"]);
		majorityVotes = Math.ceil(0.75 * parseInt(roomIDArr[roomID]["total_votes"]));
		console.log("MAJORITY = " + majorityVotes);
		if (yesVotes >= majorityVotes && majorityVotes != 0) {
			addAndSort(cardcount[uID], HighlightCardNumber);
			let message = username + " won the card!";
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
				// io.to(roomID).emit("begin voting")
			}

		}

		else {
			message = username + " lost the card! Majority did not vote yes! :(";
			io.to(roomID).emit("message", message);

		}


		console.log(cardcount);
		if (TEST.length) {
			number = TEST[TEST.length - 1];
			TEST.pop();
			console.log(number);
			io.to(roomID).emit("nextTurnCard", number);
		} else {
			status = "Game Over!";
			io.to(roomID).emit("message", status);
		}

	});

});


server.on("error", (err) => {
	console.error(err);
});

server.listen(8080, () => {
	console.log("server is ready");
});



