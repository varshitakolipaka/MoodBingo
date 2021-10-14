/*
 ----------------------------------
 filename: client.js 
 ( main client-side js ) 
 ----------------------------------- 
 */

 //global variable declarations
const sock = io();
var userConfig = {}, dict = {};
let options, username, roomID, uID, timer;
let HighlightCardNumber = -1, TurnCardNumber = -1, winCard = -1;
let interval;

//setting up connection with the host
let socket = io.connect('/'); 

//debug statement to check the sock.id of a particular person
socket.on('connect', () => {
    console.log("socket id = " + socket.id); // an alphanumeric id
 });

 /*
---------------------------------------------------
	             Game Settings
---------------------------------------------------
*/

//creates a unique user ID
function getUID() {
	let uID = Math.floor(1000 + Math.random() * 9000);
	return uID;
}

//creates a unique room ID
function createRoomID() {
	var val = (Math.random().toString(36) + "00000000000000000").slice(2, 10);
	return val;
}

//passing the game details from client to server
function submitGameDetails() {
	row = userConfig["row"];
	optionc = userConfig["preset"];
	username = userConfig["username"];
	uID = userConfig["uID"];
	roomID = userConfig["roomID"];
	timer = userConfig["timer"];
	sock.emit("submitted", { row, optionc, uID, roomID, username, timer });
}

//sets the user configuration based on settings submitted
function setUserConfig(roomID) {
	var x = document.getElementById("frm1");
	row = x.elements[2].value;
	preset = x.elements[1].value;
	username = x.elements[0].value;
	timer = x.elements[3].value;
	uID = getUID();

	userConfig["row"] = row;
	userConfig["preset"] = preset;
	userConfig["username"] = username;
	userConfig["uID"] = uID;
	userConfig["roomID"] = roomID;
	userConfig["timer"] = timer;

	
	window.sessionStorage.setItem("userConfig", JSON.stringify(userConfig));
	setGlobalVariables();
}

//function to access and set global variables
function setGlobalVariables() {
	userConfigString = window.sessionStorage.getItem('userConfig');
	console.log(userConfigString);
	userConfig = JSON.parse(userConfigString);
	console.log(userConfig);
	
	//you don't need the if, because it will never happen that it's null
	if (userConfig) {
		username = userConfig["username"];
		roomID = userConfig["roomID"];
		uID = userConfig["uID"];
		console.log("user name is " + username);
		
	} 
	
	else {
		console.log("error in setting global variables!");
	}
}

 /*
---------------------------------------------------
	               Lobby
---------------------------------------------------
*/

//function to enter the lobby and display Lobby UI
function enterLobby(roomID, uID) {
	sock.emit("joinRoom", { roomID, uID, username });
	document.getElementById("lobby").style.display = "block";
	document.getElementById("GameUI").style.display = "block";
	document.getElementById("welcome").style.display = "none";
}

//function to create a new room
function createRoom() {
	roomID = createRoomID();
	setUserConfig(roomID);
	console.log("username:" + username);
	preset = userConfig["preset"];
	sock.emit("newGameCreated", roomID, preset,timer);
	enterLobby(roomID, uID);
}

//function to join a new room
function joinRoom() {
	var x = document.getElementById("join-form");
	var roomID = x.elements[0].value;
	setUserConfig(roomID);
	enterLobby(roomID, uID);
}

//to display the members who are part of the room
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

 /*
---------------------------------------------------
	            Message and ChatBox
---------------------------------------------------
*/

//to send a message
const onChatSubmitted = (sock) => (e) => {
	e.preventDefault();
	const input = document.querySelector("#chat");
	const text = input.value;
	input.value = "";
	sock.emit("message", { text, uID, roomID, username });
};

//when a message is recieved
const log = (text) => {
	const parent = document.querySelector("#events");
	const el = document.createElement("li");
	el.innerHTML = text;

	parent.appendChild(el);
	parent.scrollTop = parent.scrollHeight;
};

 /*
---------------------------------------------------
	            Game Voting Utilities
---------------------------------------------------
*/

//function to add a yes vote
function addVoteYes() {
	var vote = 1;
	sock.emit("add vote yes", { roomID, uID, vote, username });
}

//function to add a no vote
function addVoteNo() { 
	var vote = 0;
	sock.emit("add vote no", { roomID, uID, vote, username });
}

//function to begin voting round
function beginVoting(uID) {
	sock.emit("begin voting", { roomID, uID, username });
}

//function to begin voting round after raise hands
function raiseHand() {
	const text = "Raised hands!";
	sock.emit("message", { text, uID, roomID, username });

	document.getElementById(HighlightCardNumber).style.backgroundColor =
		"orange";
	beginVoting(uID);
}


//function to set timer during voting
const votingTimer = (raiseHanduID) => {
	var timer2 = timer;
	 
	interval = setInterval(function () {
		var countdown = document.getElementById("countdown");
		var timer = timer2.split(":");

		//by parsing integer, avoid all extra string processing
		var minutes = parseInt(timer[0], 10);
		var seconds = parseInt(timer[1], 10);
		--seconds;
		minutes = seconds < 0 ? --minutes : minutes;
		console.log(minutes, seconds);
		seconds = seconds < 0 ? 59 : seconds;
		seconds = seconds < 10 ? "0" + seconds : seconds;
		
		if (minutes < 0) {
			clearInterval(interval);
			if (uID === raiseHanduID) {
				TurnCardNumber = HighlightCardNumber;
				sock.emit("turnDone", {uID,HighlightCardNumber,roomID,username,});
			}
		} else {
			countdown.innerHTML = minutes + ":" + seconds;
			timer2 = minutes + ":" + seconds;
		}
	}, 1000);
};


//function to change Lobby UI on raise hand
const appendVoting = (raiseHanduID) => {

	if (uID != raiseHanduID) {
		document.getElementById("btnYes").style.display = "inline-block";
		document.getElementById("btnNo").style.display = "inline-block";
	}
	document.getElementById("handbtn").style.display = "none";
	document.getElementById("countdown").style.display = "inline-block";

	clearInterval(interval);
	votingTimer(raiseHanduID);
};

//function to diable voting after timer ends and change UI
function disableVoting() {
	document.getElementById("btnYes").style.display = "none";
	document.getElementById("btnNo").style.display = "none";
	document.getElementById("countdown").style.display = "none";
	document.getElementById("handbtn").style.display = "inline-block";
}


 /*
---------------------------------------------------
	                  Game
---------------------------------------------------
*/

//begins a new turn
function Turn(uID) {
	TurnCardNumber = HighlightCardNumber;
	console.log(HighlightCardNumber);
	disableVoting();
	
}

//function to start the next turn by getting next card
const getNextCard = (number) => {
	disableVoting();

	const parent = document.querySelector("#events");
	const el = document.createElement("li");
	console.log(dict);
	var text = "This round the card is: " + dict["cards"][number];
	el.innerHTML = text;
	numbertext = toString(number);
	
	if (HighlightCardNumber != -1) {
		document.getElementById(HighlightCardNumber).style.backgroundColor = "#b5838d"; //purple
	}
	if (HighlightCardNumber != -1 && HighlightCardNumber == TurnCardNumber && winCard == 1) {
		document.getElementById(TurnCardNumber).style.backgroundColor = "#e5989b"; //pink
		winCard = -1;
	}
	document.getElementById(number).style.backgroundColor = "#f6bd60"; //yellow

	parent.appendChild(el);
	parent.scrollTop = parent.scrollHeight;
	HighlightCardNumber = number;
	return false;
};

//turn completed
const onTurnDone = (sock) => (e) => {
	e.preventDefault(); 
	TurnCardNumber = HighlightCardNumber;
	console.log(HighlightCardNumber);
	document.getElementById(HighlightCardNumber).style.backgroundColor = "pink";
	disableVoting();
	sock.emit("turnDone", { uID, HighlightCardNumber, roomID, username });
	return false;
};

//function to render a new board and set up game UI
const renderEmptyBoard = (GameUIStatus) => {

	var text = "";
	var i = -1;
	var s = "";
	row = parseInt(GameUIStatus["row"], 10);
	optionc = GameUIStatus["option"];
	timer = GameUIStatus["timer"];
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

//function to highlight card pink if the card won by client
const highlightWinCard = (WinStatus) => {

	if( userConfig["uID"] == WinStatus["uID"] && WinStatus["status"] == 1){
		winCard = 1;
	}
		
};

 /*
---------------------------------------------------
	                  sock
---------------------------------------------------
*/

(() => {

	
	sock.on("makeEmptyBoard", renderEmptyBoard);
	sock.on("wonHighlighting", highlightWinCard);
	sock.on("mem", (roomDetails) => {
		memberMsg(roomDetails);
	});
	sock.on("nextTurnCard", getNextCard);
	sock.on("message", log);
	sock.on("append voting", appendVoting);
	sock.on("options", (server_options) => {
		options = server_options;
	});

	sock.on("turnNo", (number) => getNumber(number));
	document.querySelector('#chat-form').addEventListener('submit', onChatSubmitted(sock));

})();