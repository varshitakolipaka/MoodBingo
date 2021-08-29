const sock = io();
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

// cardcount{
// 	{
// 		person: freyam;
// 		cards{
// 			1,2,3
// 		}
// 	}
// }
function myFunction() {
	var x = document.getElementById("frm1");
	var row = x.elements[0].value;
	var optionc = x.elements[1].value;
	var name = x.elements[2].value;

	if (optionc == "") {
		optionc = "school"
	}
	sock.emit('submitted', { row, optionc,name });
}
function renderEmptyBoard(row, optionc) {

	var text = "";
	var i = -1;
	var s = "";
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
			s += '<button class="cell" id="' + cardno + '" onclick = "highlight(this.id)" >' + dict["cards"][cardno];
			cardno++;
		}

		s += "</div>";
	}
	document.getElementById("demo").innerHTML = s;
}

var HighlightCardNumber = -1;
var TurnCardNumber = -1;
// function getNumber(number) {
//   console.log(number);
//   HighlightCardNumber = number;
//   // console.log("i am here");
//   // HighlightCardNumber = number;
//   // document.style.backgroundColor = 'black';
//   // colorj.style.backgroundColor = "purple";
// }

// var marked = -1;
// s
// function highlight(clicked_id){
//   console.log(clicked_id);
//   console.log("hi");
//   if(document.getElementById(clicked_id).style.backgroundColor != "yellow" && marked == -1 && document.getElementById(clicked_id).style.backgroundColor != "purple" )
//   {
//     console.log("not Y");
//     document.getElementById(clicked_id).style.backgroundColor = "yellow";
//     marked = clicked_id;
//   }
//   else if(document.getElementById(clicked_id).style.backgroundColor == "yellow") 
//   {
//     console.log("Y");
//     document.getElementById(clicked_id).style.backgroundColor = "lightblue";
//     marked = -1;
//   }
// };

const log = (text) => {
	const parent = document.querySelector('#events');
	const el = document.createElement('li');
	el.innerHTML = text;

	parent.appendChild(el);
	parent.scrollTop = parent.scrollHeight;
};

//make card purple
const getNextCard = (number) => {
	const parent = document.querySelector('#events');
	const el = document.createElement('li');
	var text = "This round the card is: " + dict["cards"][number]
	el.innerHTML = text;
	numbertext = toString(number);
	if(HighlightCardNumber != -1)
	{document.getElementById(HighlightCardNumber).style.backgroundColor = "purple";}
	if(HighlightCardNumber != -1 && HighlightCardNumber == TurnCardNumber)
	{document.getElementById(TurnCardNumber).style.backgroundColor = "pink";}
	document.getElementById(number).style.backgroundColor = "yellow";
	parent.appendChild(el);
	parent.scrollTop = parent.scrollHeight;
	HighlightCardNumber = number;
};

const onChatSubmitted = (sock) => (e) => {
	e.preventDefault();
  var x = document.getElementById("frm1");
	var name = x.elements[2].value;
	
	const input = document.querySelector('#chat');
	const text = input.value;
	input.value = '';
	sock.emit('message', {text,name});
};

const onTurnDone = (sock) => (e) => {
	e.preventDefault();
    var x = document.getElementById("frm1");
	
	var name = x.elements[2].value;
	TurnCardNumber = HighlightCardNumber;
	console.log(HighlightCardNumber);
	document.getElementById(HighlightCardNumber).style.backgroundColor = "pink";
	sock.emit('turnDone',{name,HighlightCardNumber});
	
};

const getClickCoordinates = (element, ev) => {
	const { top, left } = element.getBoundingClientRect();
	const { clientX, clientY } = ev;

	return {
		x: clientX - left,
		y: clientY - top
	};
	
};

const getBoard = (canvas, numCells = 20) => {

	const ctx = canvas.getContext('2d');
	const cellSize = Math.floor(canvas.width / numCells);

	const fillCell = (x, y, color) => {
		ctx.fillStyle = color;
		ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
	};

	const drawGrid = () => {

		ctx.strokeStyle = '#333';
		ctx.beginPath();

		for (let i = 0; i < numCells + 1; i++) {
			ctx.moveTo(i * cellSize, 0);
			ctx.lineTo(i * cellSize, cellSize * numCells);

			ctx.moveTo(0, i * cellSize);
			ctx.lineTo(cellSize * numCells, i * cellSize);
		}

		ctx.stroke();
	};

	const clear = () => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	};

	const renderBoard = (board = []) => {
		board.forEach((row, y) => {
			row.forEach((color, x) => {
				color && fillCell(x, y, color);
			});
		});
	};

	const reset = (board) => {
		clear();
		drawGrid();
		renderBoard(board)
	};

	const getCellCoordinates = (x, y) => {
		return {
			x: Math.floor(x / cellSize),
			y: Math.floor(y / cellSize)
		};
	};

	return { fillCell, reset, getCellCoordinates };
};

(() => {

	const canvas = document.querySelector('canvas');
	const { fillCell, reset, getCellCoordinates } = getBoard(canvas);



	const onClick = (e) => {
		const { x, y } = getClickCoordinates(canvas, e);
		sock.emit('turn', getCellCoordinates(x, y));
	};



	sock.on('board', reset);
	sock.on('message', log);
	sock.on('nextTurnCard', getNextCard);
	sock.on('turn', ({ x, y, color }) => fillCell(x, y, color));
	sock.on('make empty board', ({ row, optionc }) => renderEmptyBoard(row, optionc));
	sock.on('turnNo', (number) => getNumber(number));
	document.querySelector('#chat-form').addEventListener('submit', onChatSubmitted(sock));
	document.querySelector('#turn-form').addEventListener('submit', onTurnDone(sock));
	document.querySelector('#turn-form').addEventListener('submit', getNextCard);
	// document.querySelector('#turnbtn').addEventListenser('click', turndone(sock));
	canvas.addEventListener('click', onClick);


})();

/*
1. send the "turn over" or something to server, one per cell. first one wins.
2. check whether server received it, let's do a printf and check
3. once the server receives it, we will make the variable "turn to play" false, also check if the player will win.
4. now we wait for the "poll" to get over (another major step, will have to break into smaller steps)
5. then we pick another random number from remaining ones, and repeat.
*/
// ---------------------------------------

