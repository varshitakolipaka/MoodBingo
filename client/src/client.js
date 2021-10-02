// const { on } = require("node:stream");
// var randomWords = require('random-words');
// console.log(randomWords({ exactly: 3, join: '-' }));
const sock = io();
var userConfig = {};
let username;
let roomID;
let uID;
let dict = {};
let HighlightCardNumber = -1;
let TurnCardNumber = -1;
let interval;
let socket = io.connect('http://localhost:8080'); 

socket.on('connect', () => {
    console.log("socket id = " + socket.id); // an alphanumeric id...

 });

// console.log("SOCK ID = " + sock.id);
var options = [
	{
		uID: "school",

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

function myFunction(row, preset, uID, roomID, username) {
	sock.emit("submitted", { row, preset, uID, roomID, username });
}
// function setSocketID(){
// 	userConfigString = window.sessionStorage.getItem('userConfig');
// 	console.log(userConfigString);
// 	userConfig = JSON.parse(userConfigString);
// 	console.log(userConfig);
// 	var socketID = userConfig["socketID"];
// 	// if(socketID){
// 	if(!(sock.id))
// 		{sock.id = socketID;}
// 	console.log("sock.id : " + sock.id);
// 	// }
	

// }
const votingTimer = (raiseHanduID) => {
	var timer2 = "0:10";
	 
	interval = setInterval(function () {
		var countdown = document.getElementById("countdown");
		var timer = timer2.split(":");
		//by parsing integer, I avoid all extra string processing
		var minutes = parseInt(timer[0], 10);
		var seconds = parseInt(timer[1], 10);
		--seconds;
		minutes = seconds < 0 ? --minutes : minutes;
		console.log(minutes, seconds);
		seconds = seconds < 0 ? 59 : seconds;
		seconds = seconds < 10 ? "0" + seconds : seconds;
		//minutes = (minutes < 10) ?  minutes : minutes;
		if (minutes < 0) {
			clearInterval(interval);
			if (uID === raiseHanduID) {
				TurnCardNumber = HighlightCardNumber;
				sock.emit("turnDone", {
					uID,
					HighlightCardNumber,
					roomID,
					username,
				});
			}
		} else {
			countdown.innerHTML = minutes + ":" + seconds;
			timer2 = minutes + ":" + seconds;
		}
	}, 1000);
};

function renderEmptyBoard(row, optionc) {
	console.log("k");
	var text = "";
	var i = -1;
	var s = "";
	// (i = -1), (j = 0), (s = "");
	for (var i = 0; i < options.length; i++) {
		if (options[i]["uID"] == optionc) {
			dict = options[i];
		}
	}
	var cardno = 0;
	for (i = 0; i < parseInt(row, 10); i++) {
		s += '<div class="row">';
		for (j = 0; j < parseInt(row, 10); j++) {
			s +=
				'<button class="cell" id="' +
				cardno +
				'" onclick = "highlight(this.id)" >' +
				dict["cards"][cardno];
			cardno++;
		}

		s += "</div>";
	}
	document.getElementById("demo").innerHTML = s;

	btns = `<button class="gamebutton" id="handbtn" onclick="raiseHand()">Raise Hand</button>
	 <button class="gamebutton" id="btnYes" type="button" style="display:none" onClick="addVoteYes()">YES</button>
	 <button class="gamebutton" id="btnNo" type="button" style="display:none" onClick="addVoteNo()">NO</button>
	 <div id="countdown" style="display:none"></div>`;
	document.getElementById("voting").innerHTML += ``;

	document.getElementById("voting").innerHTML = btns;

	document.getElementById("startbtn").style.display = "none";

	document.getElementById("create-div").style.display = "none";
}



function setUserConfig(roomID) {
	var x = document.getElementById("frm1");
	row = x.elements[0].value;
	preset = x.elements[1].value;
	username = x.elements[2].value;

	
	uID = getUID();

	userConfig["row"] = row;
	userConfig["preset"] = preset;
	userConfig["username"] = username;
	userConfig["uID"] = uID;
	userConfig["roomID"] = roomID;

	
	window.sessionStorage.setItem("userConfig", JSON.stringify(userConfig));
}
function getUID() {
	let uID = Math.floor(1000 + Math.random() * 9000);
	return uID;
}

function setGlobalVariables() {
	console.log("hieeee");
	userConfigString = window.sessionStorage.getItem('userConfig');
	console.log(userConfigString);
	userConfig = JSON.parse(userConfigString);
	console.log(userConfig);
	// console.log(JSON.parse(userConfig));


	//you don't need the if, because it will never happen that it's null
	if (userConfig) {
		username = userConfig["username"];
		roomID = userConfig["roomID"];
		uID = userConfig["uID"];
		console.log("user name is " + username);
		
	} 
	
	else {
		console.log("poo, how did you land up here?");
	}
}

function createRoomID() {
	var val = (Math.random().toString(36) + "00000000000000000").slice(2, 10);
	return val;
}

function enterLobby(roomID, uID) {
	console.log("CAME HERE" + username);
	sock.emit("joinRoom", { roomID, uID, username });
}

function createRoom() {
	console.log("hieeeee");
	roomID = createRoomID();
	setUserConfig(roomID);
	console.log("username:" + username);
	sock.emit("newGameCreated", roomID);
	// enterLobby(roomID, uID);
}

function joinRoom() {
	var x = document.getElementById("frm1");
	var roomID = x.elements[2].value;
	setUserConfig();
	// enterLobby(roomID, uID);
}



function addVoteYes() {

	 
	var vote = 1;
	sock.emit("add vote yes", { roomID, uID, vote, username });
}
function addVoteNo() {

	 
	var vote = 0;
	sock.emit("add vote no", { roomID, uID, vote, username });
}
function beginVoting(uID) {


	sock.emit("begin voting", { roomID, uID });
}

const appendVoting = (raiseHanduID) => {
	console.log("hiee");
	 
	if (uID != raiseHanduID) {
		document.getElementById("btnYes").style.display = "inline-block";
		document.getElementById("btnNo").style.display = "inline-block";
	}
	document.getElementById("handbtn").style.display = "none";

	document.getElementById("countdown").style.display = "inline-block";

	clearInterval(interval);
	votingTimer(raiseHanduID);
};

function disableVoting() {
	document.getElementById("btnYes").style.display = "none";
	document.getElementById("btnNo").style.display = "none";
	document.getElementById("countdown").style.display = "none";
	document.getElementById("handbtn").style.display = "inline-block";
}

function Turn(uID) {
	TurnCardNumber = HighlightCardNumber;
	console.log(HighlightCardNumber);
	disableVoting();
	
}

const log = (text) => {
	console.log("IN LOG");
	const parent = document.querySelector("#events");
	const el = document.createElement("li");
	el.innerHTML = text;

	parent.appendChild(el);
	parent.scrollTop = parent.scrollHeight;
};

//make card purple
const getNextCard = (number) => {
	disableVoting();

	const parent = document.querySelector("#events");
	const el = document.createElement("li");
	console.log(dict);
	var text = "This round the card is: " + dict["cards"][number];
	el.innerHTML = text;
	numbertext = toString(number);
	if (HighlightCardNumber != -1) {
		document.getElementById(HighlightCardNumber).style.backgroundColor =
			"purple";
	}
	if (HighlightCardNumber != -1 && HighlightCardNumber == TurnCardNumber) {
		document.getElementById(TurnCardNumber).style.backgroundColor = "pink";
	}
	document.getElementById(number).style.backgroundColor = "yellow";
	parent.appendChild(el);
	parent.scrollTop = parent.scrollHeight;
	HighlightCardNumber = number;
	return false;
};
function msg() {
	var x = document.getElementById("frm1");

	 
	// console.log(uID);
	const input = document.querySelector("#chat");
	const text = input.value;
	input.value = "";
	sock.emit("message", { text, uID, roomID, username });
}
const onChatSubmitted = (sock) => (e) => {
	e.preventDefault();

	 

	const input = document.querySelector("#chat");
	const text = input.value;
	input.value = "";
	sock.emit("message", { text, uID, roomID, username });
};

const onTurnDone = (sock) => (e) => {
	e.preventDefault();
	console.log("here => 1");

	 
	TurnCardNumber = HighlightCardNumber;
	console.log(HighlightCardNumber);
	document.getElementById(HighlightCardNumber).style.backgroundColor = "pink";
	disableVoting();
	sock.emit("turnDone", { uID, HighlightCardNumber, roomID, username });
	return false;
};

function raiseHand() {

	 
	const text = "Raised hands!";
	sock.emit("message", { text, uID, roomID, username });

	document.getElementById(HighlightCardNumber).style.backgroundColor =
		"orange";
	beginVoting(uID);
}

const getClickCoordinates = (element, ev) => {
	const { top, left } = element.getBoundingClientRect();
	const { clientX, clientY } = ev;

	return {
		x: clientX - left,
		y: clientY - top,
	};
};

const getBoard = (canvas, numCells = 20) => {
	const ctx = canvas.getContext("2d");
	const cellSize = Math.floor(canvas.width / numCells);

	const fillCell = (x, y, color) => {
		ctx.fillStyle = color;
		ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
	};

	const drawGrid = () => {
		ctx.strokeStyle = "#333";
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
		renderBoard(board);
	};

	const getCellCoordinates = (x, y) => {
		return {
			x: Math.floor(x / cellSize),
			y: Math.floor(y / cellSize),
		};
	};

	return { fillCell, reset, getCellCoordinates };
};

const memberMsg = (Members) => {
	const parent = document.querySelector("#memdiv");
	parent.innerHTML = "Members Currently:";
	console.log("babushka");
	// for (var i = 0; i < roomDetails.length; i++) {
	// 	const el = document.createElement('li');
	// 	el.innerHTML = roomDetails[i];
	// 	parent.appendChild(el);
	// }
	Object.entries(Members).forEach(([k, v]) => {
		console.log("The key: ", k)
		const el = document.createElement("li");
		var member = v["name"];
		el.innerHTML = member;
		parent.appendChild(el);
	});

	// parent.scrollTop = parent.scrollHeight;
};

(() => {
	const canvas = document.querySelector("canvas");
	const { fillCell, reset, getCellCoordinates } = getBoard(canvas);

	const onClick = (e)  => {
		const { x, y } = getClickCoordinates(canvas, e);
		sock.emit("turn", getCellCoordinates(x, y));
	};

	sock.on("make empty board", ({ row, optionc, roomID }) =>
		renderEmptyBoard(row, optionc)
	);
	sock.on("mem", (roomDetails) => {
		console.log("GOT MEM");
	});
	sock.on("nextTurnCard", getNextCard);
	sock.on("board", reset);
	sock.on("message", log);

	sock.on("append voting", appendVoting);
	// sock.on('mem', members);
	sock.on("turn", ({ x, y, color }) => fillCell(x, y, color));
	sock.on("OMG",() => {
		console.log("JESUS");
	})

	sock.on("turnNo", (number) => getNumber(number));
	// document.querySelector('#chat-form').addEventListener('submit', onChatSubmitted(sock));
	// document.querySelector('#turn-form').addEventListener('submit', onTurnDone(sock));
	// document.querySelector('#turn-form').addEventListener('submit', getNextCard);
	// document.querySelector('#turnbtn').addEventListenser('click', turndone(sock));
	canvas.addEventListener("click", onClick);
})();

/*
1. send the "turn over" or something to server, one per cell. first one wins.
2. check whether server received it, let's do a printf and check
3. once the server receives it, we will make the variable "turn to play" false, also check if the player will win.
4. now we wait for the "poll" to get over (another major step, will have to break into smaller steps)
5. then we pick another random number from remaining ones, and repeat.
*/
// ---------------------------------------
