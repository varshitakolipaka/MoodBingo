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

$(document).ready(function () {
	$(".cell").click(function () {
		$(this).addClass("vistedCell");
	});
});
