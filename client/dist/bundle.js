(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// const { on } = require("node:stream");
var randomWords = require('random-words');
console.log(randomWords({ exactly: 3, join: '-' }));
const sock = io();
var x = document.getElementById("frm1");
var name = x.elements[2].value;
let roomID;
let dict = {};
let HighlightCardNumber = -1;
let TurnCardNumber = -1;
let interval;
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
	var name = x.elements[2].value;

	if (optionc == "") {
		optionc = "school"
	}
	sock.emit('submitted', { row, optionc, name, roomID });
}


const votingTimer = (raiseHandName) => {

	var timer2 = "0:10";
	var x = document.getElementById("frm1");
	var name = x.elements[2].value;
	interval = setInterval(function () {

		var countdown = document.getElementById("countdown");
		var timer = timer2.split(':');
		//by parsing integer, I avoid all extra string processing
		var minutes = parseInt(timer[0], 10);
		var seconds = parseInt(timer[1], 10);
		--seconds;
		minutes = (seconds < 0) ? --minutes : minutes;
		console.log(minutes, seconds);
		seconds = (seconds < 0) ? 59 : seconds;
		seconds = (seconds < 10) ? '0' + seconds : seconds;
		//minutes = (minutes < 10) ?  minutes : minutes;
		if (minutes < 0) {
			clearInterval(interval);
			if (name === raiseHandName) {
				TurnCardNumber = HighlightCardNumber;
				sock.emit('turnDone', { name, HighlightCardNumber, roomID });
			}


		} else {
			countdown.innerHTML = minutes + ':' + seconds;
			timer2 = minutes + ':' + seconds;
		}
	}, 1000);

}


function renderEmptyBoard(row, optionc) {
	console.log("k");
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

	btns =
		`<button class="gamebutton" id="handbtn" onclick="raiseHand()">Raise Hand</button>
	 <button class="gamebutton" id="btnYes" type="button" style="display:none" onClick="addVoteYes()">YES</button>
	 <button class="gamebutton" id="btnNo" type="button" style="display:none" onClick="addVoteNo()">NO</button>
	 <div id="countdown" style="display:none"></div>`;
	document.getElementById("voting").innerHTML += ``;


	document.getElementById("voting").innerHTML = btns;

	document.getElementById("startbtn").style.display = "none";



	document.getElementById('create-div').style.display = "none";




}


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
function createRoom() {
	// var val = randomWords({ exactly: 4, join: '-' })
	var val = (Math.random().toString(36)+'00000000000000000').slice(2, 10)
	var name = x.elements[2].value;
	// console.log(roomID);
	//append to the div this random roomID
	document.getElementById('create-div').innerHTML = "Here's Your Room: " + val + "<br>Send the room id to your friends and enjoy! :)"
	roomID = val;
	sock.emit('newGameCreated', val);
	enterLobby(val, name);

	// sock.emit('create room',{val});
}
function joinRoom() {
	var x = document.getElementById("join-form");
	var y = document.getElementById("frm1");
	var name = y.elements[2].value;
	roomID = x.elements[0].value; // get room-id
	enterLobby(roomID, name);
}


function enterLobby(roomID, name) {
	//append to the div this random val

	console.log(roomID);
	var uID = Math.floor(1000 + Math.random() * 9000);
	sock.emit('joinRoom', { roomID, name });
	document.getElementById('msgbox').style.display = "inline-block";
	document.getElementById('startbtn').style.display = "inline-block";
	document.getElementById('newgamebtn').style.display = "inline-block";
	document.getElementById('createbtn').style.display = "none";
	document.getElementById("joinbtn").style.display = "none";
	document.getElementById("join-form").style.display = "none";
	document.getElementById("frm1").style.display = "none";

	// sock.emit('create room',{val});
}

// SocketID: uer will havr to enter this server.js, roomID: [awfwesgwrsgh,wseDGrsg]
// join: 
// 5678, SocketID: roomID; [(3456,1iskghfnkajsdg)(3257, osildhgfnwk)()]
// sock.on('begin voting', function(){
// document.getElementById("voting").innerHTML = " ";

// });

// function votingStatus(vote){

// 	status += vote; 
// 	return status;

// }

function addVoteYes() {
	var x = document.getElementById("frm1");
	var name = x.elements[2].value;
	var vote = 1;
	sock.emit('add vote yes', { roomID, name, vote });	
}
function addVoteNo() {
	var x = document.getElementById("frm1");
	var name = x.elements[2].value;
	var vote = 0;
	sock.emit('add vote no', { roomID, name, vote });
}
function beginVoting(name) {
	// document.getElementById("btnYes").style.display = "inline-block";
	// document.getElementById("btnNo").style.display = "inline-block";

	sock.emit('begin voting', { roomID, name });

}

const appendVoting = (raiseHandName) => {
	console.log("hiee")
	var name = x.elements[2].value;
	let roomID;

	if(name != raiseHandName){
		document.getElementById("btnYes").style.display = "inline-block";
		document.getElementById("btnNo").style.display = "inline-block";
	}
	document.getElementById("handbtn").style.display = "none";

	
	document.getElementById("countdown").style.display = "inline-block";

	clearInterval(interval);
	votingTimer(raiseHandName);


}


function disableVoting() {
	document.getElementById("btnYes").style.display = "none";
	document.getElementById("btnNo").style.display = "none";
	document.getElementById("countdown").style.display = "none";
	document.getElementById("handbtn").style.display = "inline-block";

}

function Turn(name) {

	// onTurnDone(sock);
	TurnCardNumber = HighlightCardNumber;
	console.log(HighlightCardNumber);
	// document.getElementById(HighlightCardNumber).style.backgroundColor = "pink";
	disableVoting();
	// sock.emit('turnDone', { name, HighlightCardNumber, roomID });
	// return false;
}

const log = (text) => {
	const parent = document.querySelector('#events');
	const el = document.createElement('li');
	el.innerHTML = text;

	parent.appendChild(el);
	parent.scrollTop = parent.scrollHeight;
};

//make card purple
const getNextCard = (number) => {

	disableVoting();
	
	const parent = document.querySelector('#events');
	const el = document.createElement('li');
	console.log(dict);
	var text = "This round the card is: " + dict["cards"][number]
	el.innerHTML = text;
	numbertext = toString(number);
	if (HighlightCardNumber != -1) { document.getElementById(HighlightCardNumber).style.backgroundColor = "purple"; }
	if (HighlightCardNumber != -1 && HighlightCardNumber == TurnCardNumber) { document.getElementById(TurnCardNumber).style.backgroundColor = "pink"; }
	document.getElementById(number).style.backgroundColor = "yellow";
	parent.appendChild(el);
	parent.scrollTop = parent.scrollHeight;
	HighlightCardNumber = number;
	return false;
};
function msg() {
	var x = document.getElementById("frm1");
	var name = x.elements[2].value;
	// console.log(name);
	const input = document.querySelector('#chat');
	const text = input.value;
	input.value = '';
	sock.emit('message', { text, name, roomID });
};
const onChatSubmitted = (sock) => (e) => {
	e.preventDefault();
	var x = document.getElementById("frm1");
	var name = x.elements[2].value;

	const input = document.querySelector('#chat');
	const text = input.value;
	input.value = '';
	sock.emit('message', { text, name, roomID });
};



const onTurnDone = (sock) => (e) => {
	e.preventDefault();
	console.log("here => 1")
	var x = document.getElementById("frm1");

	var name = x.elements[2].value;
	TurnCardNumber = HighlightCardNumber;
	console.log(HighlightCardNumber);
	document.getElementById(HighlightCardNumber).style.backgroundColor = "pink";
	disableVoting();
	sock.emit('turnDone', { name, HighlightCardNumber, roomID });
	return false;
};

function raiseHand() {

	var x = document.getElementById("frm1");
	var name = x.elements[2].value;
	const text = "Raised hands!";
	sock.emit('message', { text, name, roomID });

	document.getElementById(HighlightCardNumber).style.backgroundColor = "orange";
	beginVoting(name);

}


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

const memberMsg = (roomDetails) => {
	const parent = document.querySelector('#memdiv');
	parent.innerHTML = "Members Currently:"
	for (var i = 0; i < roomDetails.length; i++) {
		const el = document.createElement('li');
		el.innerHTML = roomDetails[i];
		parent.appendChild(el);
	}



	// parent.scrollTop = parent.scrollHeight;
};


(() => {

	const canvas = document.querySelector('canvas');
	const { fillCell, reset, getCellCoordinates } = getBoard(canvas);



	const onClick = (e) => {
		const { x, y } = getClickCoordinates(canvas, e);
		sock.emit('turn', getCellCoordinates(x, y));
	};


	sock.on('make empty board', ({ row, optionc, roomID }) => renderEmptyBoard(row, optionc));
	sock.on('mem', memberMsg);
	sock.on('nextTurnCard', getNextCard);
	sock.on('board', reset);
	sock.on('message', log);

	sock.on('append voting', appendVoting);
	// sock.on('mem', members);
	sock.on('turn', ({ x, y, color }) => fillCell(x, y, color));

	sock.on('turnNo', (number) => getNumber(number));
	// document.querySelector('#chat-form').addEventListener('submit', onChatSubmitted(sock));
	// document.querySelector('#turn-form').addEventListener('submit', onTurnDone(sock));
	// document.querySelector('#turn-form').addEventListener('submit', getNextCard);
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




},{"random-words":2}],2:[function(require,module,exports){
var wordList = [
  // Borrowed from xkcd password generator which borrowed it from wherever
  "ability","able","aboard","about","above","accept","accident","according",
  "account","accurate","acres","across","act","action","active","activity",
  "actual","actually","add","addition","additional","adjective","adult","adventure",
  "advice","affect","afraid","after","afternoon","again","against","age",
  "ago","agree","ahead","aid","air","airplane","alike","alive",
  "all","allow","almost","alone","along","aloud","alphabet","already",
  "also","although","am","among","amount","ancient","angle","angry",
  "animal","announced","another","answer","ants","any","anybody","anyone",
  "anything","anyway","anywhere","apart","apartment","appearance","apple","applied",
  "appropriate","are","area","arm","army","around","arrange","arrangement",
  "arrive","arrow","art","article","as","aside","ask","asleep",
  "at","ate","atmosphere","atom","atomic","attached","attack","attempt",
  "attention","audience","author","automobile","available","average","avoid","aware",
  "away","baby","back","bad","badly","bag","balance","ball",
  "balloon","band","bank","bar","bare","bark","barn","base",
  "baseball","basic","basis","basket","bat","battle","be","bean",
  "bear","beat","beautiful","beauty","became","because","become","becoming",
  "bee","been","before","began","beginning","begun","behavior","behind",
  "being","believed","bell","belong","below","belt","bend","beneath",
  "bent","beside","best","bet","better","between","beyond","bicycle",
  "bigger","biggest","bill","birds","birth","birthday","bit","bite",
  "black","blank","blanket","blew","blind","block","blood","blow",
  "blue","board","boat","body","bone","book","border","born",
  "both","bottle","bottom","bound","bow","bowl","box","boy",
  "brain","branch","brass","brave","bread","break","breakfast","breath",
  "breathe","breathing","breeze","brick","bridge","brief","bright","bring",
  "broad","broke","broken","brother","brought","brown","brush","buffalo",
  "build","building","built","buried","burn","burst","bus","bush",
  "business","busy","but","butter","buy","by","cabin","cage",
  "cake","call","calm","came","camera","camp","can","canal",
  "cannot","cap","capital","captain","captured","car","carbon","card",
  "care","careful","carefully","carried","carry","case","cast","castle",
  "cat","catch","cattle","caught","cause","cave","cell","cent",
  "center","central","century","certain","certainly","chain","chair","chamber",
  "chance","change","changing","chapter","character","characteristic","charge","chart",
  "check","cheese","chemical","chest","chicken","chief","child","children",
  "choice","choose","chose","chosen","church","circle","circus","citizen",
  "city","class","classroom","claws","clay","clean","clear","clearly",
  "climate","climb","clock","close","closely","closer","cloth","clothes",
  "clothing","cloud","club","coach","coal","coast","coat","coffee",
  "cold","collect","college","colony","color","column","combination","combine",
  "come","comfortable","coming","command","common","community","company","compare",
  "compass","complete","completely","complex","composed","composition","compound","concerned",
  "condition","congress","connected","consider","consist","consonant","constantly","construction",
  "contain","continent","continued","contrast","control","conversation","cook","cookies",
  "cool","copper","copy","corn","corner","correct","correctly","cost",
  "cotton","could","count","country","couple","courage","course","court",
  "cover","cow","cowboy","crack","cream","create","creature","crew",
  "crop","cross","crowd","cry","cup","curious","current","curve",
  "customs","cut","cutting","daily","damage","dance","danger","dangerous",
  "dark","darkness","date","daughter","dawn","day","dead","deal",
  "dear","death","decide","declared","deep","deeply","deer","definition",
  "degree","depend","depth","describe","desert","design","desk","detail",
  "determine","develop","development","diagram","diameter","did","die","differ",
  "difference","different","difficult","difficulty","dig","dinner","direct","direction",
  "directly","dirt","dirty","disappear","discover","discovery","discuss","discussion",
  "disease","dish","distance","distant","divide","division","do","doctor",
  "does","dog","doing","doll","dollar","done","donkey","door",
  "dot","double","doubt","down","dozen","draw","drawn","dream",
  "dress","drew","dried","drink","drive","driven","driver","driving",
  "drop","dropped","drove","dry","duck","due","dug","dull",
  "during","dust","duty","each","eager","ear","earlier","early",
  "earn","earth","easier","easily","east","easy","eat","eaten",
  "edge","education","effect","effort","egg","eight","either","electric",
  "electricity","element","elephant","eleven","else","empty","end","enemy",
  "energy","engine","engineer","enjoy","enough","enter","entire","entirely",
  "environment","equal","equally","equator","equipment","escape","especially","essential",
  "establish","even","evening","event","eventually","ever","every","everybody",
  "everyone","everything","everywhere","evidence","exact","exactly","examine","example",
  "excellent","except","exchange","excited","excitement","exciting","exclaimed","exercise",
  "exist","expect","experience","experiment","explain","explanation","explore","express",
  "expression","extra","eye","face","facing","fact","factor","factory",
  "failed","fair","fairly","fall","fallen","familiar","family","famous",
  "far","farm","farmer","farther","fast","fastened","faster","fat",
  "father","favorite","fear","feathers","feature","fed","feed","feel",
  "feet","fell","fellow","felt","fence","few","fewer","field",
  "fierce","fifteen","fifth","fifty","fight","fighting","figure","fill",
  "film","final","finally","find","fine","finest","finger","finish",
  "fire","fireplace","firm","first","fish","five","fix","flag",
  "flame","flat","flew","flies","flight","floating","floor","flow",
  "flower","fly","fog","folks","follow","food","foot","football",
  "for","force","foreign","forest","forget","forgot","forgotten","form",
  "former","fort","forth","forty","forward","fought","found","four",
  "fourth","fox","frame","free","freedom","frequently","fresh","friend",
  "friendly","frighten","frog","from","front","frozen","fruit","fuel",
  "full","fully","fun","function","funny","fur","furniture","further",
  "future","gain","game","garage","garden","gas","gasoline","gate",
  "gather","gave","general","generally","gentle","gently","get","getting",
  "giant","gift","girl","give","given","giving","glad","glass",
  "globe","go","goes","gold","golden","gone","good","goose",
  "got","government","grabbed","grade","gradually","grain","grandfather","grandmother",
  "graph","grass","gravity","gray","great","greater","greatest","greatly",
  "green","grew","ground","group","grow","grown","growth","guard",
  "guess","guide","gulf","gun","habit","had","hair","half",
  "halfway","hall","hand","handle","handsome","hang","happen","happened",
  "happily","happy","harbor","hard","harder","hardly","has","hat",
  "have","having","hay","he","headed","heading","health","heard",
  "hearing","heart","heat","heavy","height","held","hello","help",
  "helpful","her","herd","here","herself","hidden","hide","high",
  "higher","highest","highway","hill","him","himself","his","history",
  "hit","hold","hole","hollow","home","honor","hope","horn",
  "horse","hospital","hot","hour","house","how","however","huge",
  "human","hundred","hung","hungry","hunt","hunter","hurried","hurry",
  "hurt","husband","ice","idea","identity","if","ill","image",
  "imagine","immediately","importance","important","impossible","improve","in","inch",
  "include","including","income","increase","indeed","independent","indicate","individual",
  "industrial","industry","influence","information","inside","instance","instant","instead",
  "instrument","interest","interior","into","introduced","invented","involved","iron",
  "is","island","it","its","itself","jack","jar","jet",
  "job","join","joined","journey","joy","judge","jump","jungle",
  "just","keep","kept","key","kids","kill","kind","kitchen",
  "knew","knife","know","knowledge","known","label","labor","lack",
  "lady","laid","lake","lamp","land","language","large","larger",
  "largest","last","late","later","laugh","law","lay","layers",
  "lead","leader","leaf","learn","least","leather","leave","leaving",
  "led","left","leg","length","lesson","let","letter","level",
  "library","lie","life","lift","light","like","likely","limited",
  "line","lion","lips","liquid","list","listen","little","live",
  "living","load","local","locate","location","log","lonely","long",
  "longer","look","loose","lose","loss","lost","lot","loud",
  "love","lovely","low","lower","luck","lucky","lunch","lungs",
  "lying","machine","machinery","mad","made","magic","magnet","mail",
  "main","mainly","major","make","making","man","managed","manner",
  "manufacturing","many","map","mark","market","married","mass","massage",
  "master","material","mathematics","matter","may","maybe","me","meal",
  "mean","means","meant","measure","meat","medicine","meet","melted",
  "member","memory","men","mental","merely","met","metal","method",
  "mice","middle","might","mighty","mile","military","milk","mill",
  "mind","mine","minerals","minute","mirror","missing","mission","mistake",
  "mix","mixture","model","modern","molecular","moment","money","monkey",
  "month","mood","moon","more","morning","most","mostly","mother",
  "motion","motor","mountain","mouse","mouth","move","movement","movie",
  "moving","mud","muscle","music","musical","must","my","myself",
  "mysterious","nails","name","nation","national","native","natural","naturally",
  "nature","near","nearby","nearer","nearest","nearly","necessary","neck",
  "needed","needle","needs","negative","neighbor","neighborhood","nervous","nest",
  "never","new","news","newspaper","next","nice","night","nine",
  "no","nobody","nodded","noise","none","noon","nor","north",
  "nose","not","note","noted","nothing","notice","noun","now",
  "number","numeral","nuts","object","observe","obtain","occasionally","occur",
  "ocean","of","off","offer","office","officer","official","oil",
  "old","older","oldest","on","once","one","only","onto",
  "open","operation","opinion","opportunity","opposite","or","orange","orbit",
  "order","ordinary","organization","organized","origin","original","other","ought",
  "our","ourselves","out","outer","outline","outside","over","own",
  "owner","oxygen","pack","package","page","paid","pain","paint",
  "pair","palace","pale","pan","paper","paragraph","parallel","parent",
  "park","part","particles","particular","particularly","partly","parts","party",
  "pass","passage","past","path","pattern","pay","peace","pen",
  "pencil","people","per","percent","perfect","perfectly","perhaps","period",
  "person","personal","pet","phrase","physical","piano","pick","picture",
  "pictured","pie","piece","pig","pile","pilot","pine","pink",
  "pipe","pitch","place","plain","plan","plane","planet","planned",
  "planning","plant","plastic","plate","plates","play","pleasant","please",
  "pleasure","plenty","plural","plus","pocket","poem","poet","poetry",
  "point","pole","police","policeman","political","pond","pony","pool",
  "poor","popular","population","porch","port","position","positive","possible",
  "possibly","post","pot","potatoes","pound","pour","powder","power",
  "powerful","practical","practice","prepare","present","president","press","pressure",
  "pretty","prevent","previous","price","pride","primitive","principal","principle",
  "printed","private","prize","probably","problem","process","produce","product",
  "production","program","progress","promised","proper","properly","property","protection",
  "proud","prove","provide","public","pull","pupil","pure","purple",
  "purpose","push","put","putting","quarter","queen","question","quick",
  "quickly","quiet","quietly","quite","rabbit","race","radio","railroad",
  "rain","raise","ran","ranch","range","rapidly","rate","rather",
  "raw","rays","reach","read","reader","ready","real","realize",
  "rear","reason","recall","receive","recent","recently","recognize","record",
  "red","refer","refused","region","regular","related","relationship","religious",
  "remain","remarkable","remember","remove","repeat","replace","replied","report",
  "represent","require","research","respect","rest","result","return","review",
  "rhyme","rhythm","rice","rich","ride","riding","right","ring",
  "rise","rising","river","road","roar","rock","rocket","rocky",
  "rod","roll","roof","room","root","rope","rose","rough",
  "round","route","row","rubbed","rubber","rule","ruler","run",
  "running","rush","sad","saddle","safe","safety","said","sail",
  "sale","salmon","salt","same","sand","sang","sat","satellites",
  "satisfied","save","saved","saw","say","scale","scared","scene",
  "school","science","scientific","scientist","score","screen","sea","search",
  "season","seat","second","secret","section","see","seed","seeing",
  "seems","seen","seldom","select","selection","sell","send","sense",
  "sent","sentence","separate","series","serious","serve","service","sets",
  "setting","settle","settlers","seven","several","shade","shadow","shake",
  "shaking","shall","shallow","shape","share","sharp","she","sheep",
  "sheet","shelf","shells","shelter","shine","shinning","ship","shirt",
  "shoe","shoot","shop","shore","short","shorter","shot","should",
  "shoulder","shout","show","shown","shut","sick","sides","sight",
  "sign","signal","silence","silent","silk","silly","silver","similar",
  "simple","simplest","simply","since","sing","single","sink","sister",
  "sit","sitting","situation","six","size","skill","skin","sky",
  "slabs","slave","sleep","slept","slide","slight","slightly","slip",
  "slipped","slope","slow","slowly","small","smaller","smallest","smell",
  "smile","smoke","smooth","snake","snow","so","soap","social",
  "society","soft","softly","soil","solar","sold","soldier","solid",
  "solution","solve","some","somebody","somehow","someone","something","sometime",
  "somewhere","son","song","soon","sort","sound","source","south",
  "southern","space","speak","special","species","specific","speech","speed",
  "spell","spend","spent","spider","spin","spirit","spite","split",
  "spoken","sport","spread","spring","square","stage","stairs","stand",
  "standard","star","stared","start","state","statement","station","stay",
  "steady","steam","steel","steep","stems","step","stepped","stick",
  "stiff","still","stock","stomach","stone","stood","stop","stopped",
  "store","storm","story","stove","straight","strange","stranger","straw",
  "stream","street","strength","stretch","strike","string","strip","strong",
  "stronger","struck","structure","struggle","stuck","student","studied","studying",
  "subject","substance","success","successful","such","sudden","suddenly","sugar",
  "suggest","suit","sum","summer","sun","sunlight","supper","supply",
  "support","suppose","sure","surface","surprise","surrounded","swam","sweet",
  "swept","swim","swimming","swing","swung","syllable","symbol","system",
  "table","tail","take","taken","tales","talk","tall","tank",
  "tape","task","taste","taught","tax","tea","teach","teacher",
  "team","tears","teeth","telephone","television","tell","temperature","ten",
  "tent","term","terrible","test","than","thank","that","thee",
  "them","themselves","then","theory","there","therefore","these","they",
  "thick","thin","thing","think","third","thirty","this","those",
  "thou","though","thought","thousand","thread","three","threw","throat",
  "through","throughout","throw","thrown","thumb","thus","thy","tide",
  "tie","tight","tightly","till","time","tin","tiny","tip",
  "tired","title","to","tobacco","today","together","told","tomorrow",
  "tone","tongue","tonight","too","took","tool","top","topic",
  "torn","total","touch","toward","tower","town","toy","trace",
  "track","trade","traffic","trail","train","transportation","trap","travel",
  "treated","tree","triangle","tribe","trick","tried","trip","troops",
  "tropical","trouble","truck","trunk","truth","try","tube","tune",
  "turn","twelve","twenty","twice","two","type","typical","uncle",
  "under","underline","understanding","unhappy","union","unit","universe","unknown",
  "unless","until","unusual","up","upon","upper","upward","us",
  "use","useful","using","usual","usually","valley","valuable","value",
  "vapor","variety","various","vast","vegetable","verb","vertical","very",
  "vessels","victory","view","village","visit","visitor","voice","volume",
  "vote","vowel","voyage","wagon","wait","walk","wall","want",
  "war","warm","warn","was","wash","waste","watch","water",
  "wave","way","we","weak","wealth","wear","weather","week",
  "weigh","weight","welcome","well","went","were","west","western",
  "wet","whale","what","whatever","wheat","wheel","when","whenever",
  "where","wherever","whether","which","while","whispered","whistle","white",
  "who","whole","whom","whose","why","wide","widely","wife",
  "wild","will","willing","win","wind","window","wing","winter",
  "wire","wise","wish","with","within","without","wolf","women",
  "won","wonder","wonderful","wood","wooden","wool","word","wore",
  "work","worker","world","worried","worry","worse","worth","would",
  "wrapped","write","writer","writing","written","wrong","wrote","yard",
  "year","yellow","yes","yesterday","yet","you","young","younger",
  "your","yourself","youth","zero","zebra","zipper","zoo","zulu"
];

function words(options) {

  function word() {
    if (options && options.maxLength > 1) {
      return generateWordWithMaxLength();
    } else {
      return generateRandomWord();
    }
  }

  function generateWordWithMaxLength() {
    var rightSize = false;
    var wordUsed;
    while (!rightSize) {  
      wordUsed = generateRandomWord();
      if(wordUsed.length <= options.maxLength) {
        rightSize = true;
      }

    }
    return wordUsed;
  }

  function generateRandomWord() {
    return wordList[randInt(wordList.length)];
  }

  function randInt(lessThan) {
    return Math.floor(Math.random() * lessThan);
  }

  // No arguments = generate one word
  if (typeof(options) === 'undefined') {
    return word();
  }

  // Just a number = return that many words
  if (typeof(options) === 'number') {
    options = { exactly: options };
  }

  // options supported: exactly, min, max, join
  if (options.exactly) {
    options.min = options.exactly;
    options.max = options.exactly;
  }
  
  // not a number = one word par string
  if (typeof(options.wordsPerString) !== 'number') {
    options.wordsPerString = 1;
  }

  //not a function = returns the raw word
  if (typeof(options.formatter) !== 'function') {
    options.formatter = (word) => word;
  }

  //not a string = separator is a space
  if (typeof(options.separator) !== 'string') {
    options.separator = ' ';
  }

  var total = options.min + randInt(options.max + 1 - options.min);
  var results = [];
  var token = '';
  var relativeIndex = 0;

  for (var i = 0; (i < total * options.wordsPerString); i++) {
    if (relativeIndex === options.wordsPerString - 1) {
      token += options.formatter(word(), relativeIndex);
    }
    else {
      token += options.formatter(word(), relativeIndex) + options.separator;
    }
    relativeIndex++;
    if ((i + 1) % options.wordsPerString === 0) {
      results.push(token);
      token = ''; 
      relativeIndex = 0;
    }
   
  }
  if (typeof options.join === 'string') {
    results = results.join(options.join);
  }

  return results;
}

module.exports = words;
// Export the word list as it is often useful
words.wordList = wordList;

},{}]},{},[1]);
