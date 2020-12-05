

var settings;
var v;
var presets;
var params;

var myText


function preload(){
	// var json = loadJSON('settings.txt');
	presets=json.presets;
	params=json.params
}

function setup() {
	print(presets);


	createCanvas(displayWidth, displayHeight);
	frameRate(30);

	// test_controls = QuickSettings.create(0, 0, "test"); 
	// 	allGUI.addGUI("test",test_controls);

	v=Object.assign({},presets["grey"]); //make copy, so to not edit the presets
	settings=new MyGUI(params,v);
	

	makeJSONField(settings,"test1");
	makePresetField(settings,"test1",presets);

	// var json={presets,params};
	// saveJSON(json,'settings.txt');
}





function draw() {
	background(v.myColor);
	fill(0);
	textSize(60);
	text("MyNumber2: "+ v.myNumber2,200,200);
	//print(v.preset);
}





// check for keyboard events
function keyPressed(){
	switch(key) {
		case 'p':
		print(v);
		break;
  }  
  
}







// window.onload = function() {
// 	var canvas = document.getElementById("canvas"),
// 		context = canvas.getContext("2d"),
// 		width = canvas.width = window.innerWidth,
// 		height = canvas.height = window.innerHeight;

// 	var choiceList = ["one", "two", "three"];

// 	var circle = {
// 		radius: 50,
// 		startAngle: 0,
// 		endAngle: Math.PI * 2,
// 		fill: false,
// 		fillStyle: "#ffff00",
// 		text: "hello",
// 		choice: {index: 0, value:"one"}
// 	};


// 	var settings = QuickSettings.create();
// 	settings.setGlobalChangeHandler(draw);
// 	settings.bindRange("radius", 0, 100, 50, 1, circle);
// 	settings.bindRange("startAngle", 0, Math.PI * 2, 0, 0.01, circle);
// 	settings.bindRange("endAngle", 0, Math.PI * 2, Math.PI * 2, 0.01, circle);
// 	settings.bindBoolean("fill", false, circle);
// 	settings.bindColor("fillStyle", "#ffff00", circle);
// 	settings.bindText("text", "hello", circle);
// 	settings.bindDropDown("choice", choiceList, circle);


// 	draw();

// 	function draw() {
// 		context.fillStyle = circle.fillStyle;
// 		context.lineWidth = 10;
// 		context.clearRect(0, 0, width, height);
// 		context.beginPath();
// 		context.arc(width / 2, height / 2, circle.radius, circle.startAngle, circle.endAngle);
// 		if(circle.fill) {
// 			context.fill();
// 		}
// 		context.stroke();

// 		context.fillStyle = "#000000";
// 		context.fillText(circle.text, width / 2, height / 2);
// 		context.fillText(circle.choice, width / 2, height / 2 + 20);
// 	}


// 	// check for keyboard events
// document.addEventListener("keypress", function(event) {
// 	//console.log((settings.getValue("choice")));
// 	console.log(circle.choice);
// 	settings.setValue("choice",1)

// 	console.log(circle.choice);
// 	var i =choiceList.findIndex((element) => element =="two");
// 	console.log(i);
// 	circle.choice={value:circle.choice, index:choiceList.findIndex((element) => element==circle.choice)};
// 	console.log(circle);

// 	settings.setValue("choice",circle.choice);
// 	circle.choice={value:circle.choice, index:choiceList.findIndex((element) => element==circle.choice)};
// 	console.log(circle.choice);
// });

// }
