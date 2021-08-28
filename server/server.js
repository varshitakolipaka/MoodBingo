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
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

var TEST, number,status;
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
	sock.on('submitted', () =>{
		TEST = [...Array(9).keys()]
		console.log(TEST)
		shuffleArray(TEST);
		console.log(TEST);
		io.emit('make board');
	})
  sock.on('turnDone', () => {
	
	if(TEST.length){
		number = TEST[(TEST.length) - 1];
		TEST.pop();
		console.log(number);
		io.emit('nextTurnCard', number);
	}
	else{
	    //   status = "Game Over!";
		//   io.emit('message', status);	
	}
	
    // var number = Math.floor(Math.random() * (8 - 0 + 1) + 0);
    // var turnAnnoucement = "Next turn has begun! The card number is: " + number;
    });

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


// $(document).ready(function () {
// 	$(".cell").click(function () {
// 		$(this).addClass("vistedCell");
// 	});
// });