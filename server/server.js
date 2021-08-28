const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const randomColor = require('randomcolor');
const createBoard = require('./create-board');
const createCooldown = require('./create-cooldown');

const app = express();

app.use(express.static(`${__dirname}/../client`));
user_board = [2, 4, 5];

const server = http.createServer(app);
const io = socketio(server);
const { clear, getBoard, makeTurn } = createBoard(20);

io.on('connection', (sock) => {
	const color = randomColor();
	const cooldown = createCooldown(2000);

	// sock.on('turndone', () => io.emit('message', "number"));
	//   sock.on('turndone',() => {

	//   makePurple();
	//  	  io.emit('received');
	//     io.emit('message', number);
	//   });
	// sock.emit('turnNo',(number));
	// sock.on('nextTurn', (number) => io.emit('message', text));
	sock.on('message', (text) => io.emit('message', text));
  sock.on('turnDone', () => {
    var number = Math.floor(Math.random() * (8 - 0 + 1) + 0);
    // var turnAnnoucement = "Next turn has begun! The card number is: " + number;
    io.emit('nextTurnCard', number)});

	sock.on('chutiye', (shit) => io.emit('message', shit))
	// sock.on('turndone',(marked) => io.emit('message', marked));
	sock.on('turn', ({ x, y }) => {
		if (cooldown()) {
			const playerWon = makeTurn(x, y, color);
			io.emit('turn', { x, y, color });

			if (playerWon) {
				sock.emit('message', 'You Won!');
				io.emit('message', 'New Round');
				clear();
				io.emit('board');
			}
		}
	});
});

server.on('error', (err) => {
	console.error(err);
});

server.listen(8080, () => {
	console.log('server is ready');
});

// const box = {
//     id: "id",
//     boolticked: "Doe",
//   whoallticked: [,,,,,,],
// }; 
// div id = eachBox
// text = "i ahev gone to jail"

// if boolticked == yes:
// eachBox.style.color = "green"

var options = [
	{
		name: "school",

		cards: [
			"bunked class",
			"got detention",
			"brought alcohol",
			"eaten in class",
			"skipped homework",
			"gotten hit",
			"suspended",
			"been called dumb",
			"been at the top of class",
			"written on my shirt",
			"lied for my friends",
		],
		type: "default",
	},
];

function myFunction() {
	var x = document.getElementById("frm1");
	var row = x.elements[0].value;
	var optionc = x.elements[1].value;
	var text = "";
	var i = -1;
	var s = "";
	var dict = {};
	// (i = -1), (j = 0), (s = "");
	for (var i = 0; i < options.length; i++) {
		if (options[i]["name"] == optionc) {
			dict = options[i];
		}
	}
	var cardno = 0;
	for (i = 0; i < parseInt(row, 10); i++) {
		s += '<div class="row">';
		for (j = 0; j < parseInt(row, 10); j++) {
			s +=
				'<div class="cell" id="' +
				cardno +
				'">' +
				dict["cards"][cardno] +
				"</div>";
			cardno++;
		}

		s += "</div>";
	}
	document.getElementById("demo").innerHTML = s;
}

// $(document).ready(function () {
// 	$(".cell").click(function () {
// 		$(this).addClass("vistedCell");
// 	});
// });