const sock = io();
var userConfig = {};
var options;
let username, roomID, uID;
let dict = {};
let HighlightCardNumber = -1;
let TurnCardNumber = -1;
let interval;

let socket = io.connect('http://localhost:8080'); 

socket.on('connect', () => {
    console.log("socket id = " + socket.id); // an alphanumeric id...
 });




function myFunction() {
	row = userConfig["row"];
	optionc = userConfig["preset"];
	username = userConfig["username"];
	uID = userConfig["uID"];
	roomID = userConfig["roomID"];
	sock.emit("submitted", { row, optionc, uID, roomID, username });
}

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

function setUserConfig(roomID) {
	var x = document.getElementById("frm1");
	row = x.elements[2].value;
	preset = x.elements[1].value;
	username = x.elements[0].value;

	
	uID = getUID();

	userConfig["row"] = row;
	userConfig["preset"] = preset;
	userConfig["username"] = username;
	userConfig["uID"] = uID;
	userConfig["roomID"] = roomID;

	
	window.sessionStorage.setItem("userConfig", JSON.stringify(userConfig));
	setGlobalVariables();
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
	document.getElementById("lobby").style.display = "block";
	document.getElementById("GameUI").style.display = "block";
	document.getElementById("welcome").style.display = "none";
}

function createRoom() {
	console.log("hieeeee");
	roomID = createRoomID();
	setUserConfig(roomID);
	console.log("username:" + username);
	sock.emit("newGameCreated", roomID);
	enterLobby(roomID, uID);
}

function joinRoom() {
	var x = document.getElementById("join-form");
	var roomID = x.elements[0].value;
	console.log("ola joinRoom client: " + roomID);
	setUserConfig(roomID);
	console.log("ola1 joinRoom client: " + roomID);
	enterLobby(roomID, uID);
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


	sock.emit("begin voting", { roomID, uID, username });
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
	var x = document.getElementById("chat-form");

	 
	// console.log(uID);
	const input = document.querySelector("#chat");
	const text = input.value;
	console.log("message " + text);
	input.value = "";
	sock.emit("message", { text, uID, roomID, username });
}

const onChatSubmitted = (sock) => (e) => {
	e.preventDefault();
	const input = document.querySelector("#chat");
	const text = input.value;
	input.value = "";
	console.log("text: " + text);
	console.log("uID: " + uID);
	console.log("roomID: " + roomID);
	console.log("name: " + username);
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

const memberMsg = (Members) => {
	const parent = document.querySelector("#memdiv");
	parent.innerHTML = "Members Currently:";
	Object.entries(Members).forEach(([k, v]) => {
		console.log("The key: ", k)
		const el = document.createElement("li");
		var member = v["name"];
		el.innerHTML = member;
		parent.appendChild(el);
	});
};

const renderEmptyBoard = (GameUIStatus) => {

	//alert("ola test");
	//alert(GameUIStatus["row"]);

	var text = "";
	var i = -1;
	var s = "";
	row = parseInt(GameUIStatus["row"], 10);
	optionc = GameUIStatus["option"]

	//alert(row + " olaaa " + optionc);
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
				'<button type="button" class="btn btn-outline-dark cell" id="' +
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
};

(() => {

	sock.on("makeEmptyBoard", renderEmptyBoard);
	
	sock.on("mem", (roomDetails) => {
		memberMsg(roomDetails);
	});
	sock.on("nextTurnCard", getNextCard);
	sock.on("message", log);

	sock.on("append voting", appendVoting);
	sock.on("options", (server_options) => {
		options = server_options;
		//alert("sop" + server_options);
	});


	sock.on("turnNo", (number) => getNumber(number));
	document.querySelector('#chat-form').addEventListener('submit', onChatSubmitted(sock));
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
