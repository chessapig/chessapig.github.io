
const BODY_BG="#2c2621";
const DARK="#443b33";
const MID="#8e7b6b";
const LIGHT="#d9d3cd";
const BODY_COLOR="#e6cfb3";

const PRIMARY = "#E56B6F";
const SECONDARY = "#6ed38e";		
const BOLDED = "#f34d41";
const TERTIARY = "#9f79dd";
const SUCCESS = "#63a4ca";


let numSlots = 5;
let boxWidth=100;
let boxMargin=20;
let boxes = [];

let score=0;
let twoPowerScore=0;
let scoreTime=0; // this variable measures time since the score increment
let scoreTimeDecayRate=0.9;
let twoPowerTime=0;
let twoPowerTimeDecayRate=0.9;
let baseTextSize=64;
let timer=0, timerUnit=.01;
let gameEndTime;
let isFirstTime=false``;

let time_spacing=100;
let waitTime=700;
let doShowReset=false;


// gamestates:  "play",  "bind",  "win", "hold"
let gameState="hold";

let synth;
// potentail choises: "celesta" , "marimba", "music_box", "kalimba", "electric_bass_finger", "slap_bass_2", "tinkle_bell", 
// For mess up sounds: "orchestra_hit", "woodblock", "guitar_fret_noise", "gunshot" 
let keys_default = [71,70,68,83,65];
var leadSound ="electric_bass_finger";
var failSound = "woodblock";
let chords = [

	[1,5,8,12,15], //c9 major
	[1,4,8,11,15] //c9 minot
	//[0,4,7,10,13] //c7 b9
	]
let baseNoteRange = [55,67]


function preload(){
	ctx = getAudioContext();
	lead = Soundfont.instrument(ctx, leadSound);
	fail = Soundfont.instrument(ctx, failSound);
}

function setup() {
	let canvasDiv = document.getElementById("binary_game");
	let w = canvasDiv.offsetWidth;
	// console.log(w,600);
	var canvas = createCanvas(w, 600);
	canvas.parent("binary_game");
	background(BODY_BG);
	textSize(64);
	
	
	for(var i=0;i<numSlots;i++){
		boxes[i] = new Box(i,keys_default[i]);
	}
	
	gameState="hold";
	setInterval(incrementTimer, timerUnit*1000);

	resetGame();
	//bind();


	amplitude = new p5.Amplitude();
	lead.then(function (inst) {
        inst.connect(amplitude)
	});

	
}



function draw() {	
	//evaluate current binary state
	let eval=0;
	for(i=0;i<numSlots;i++){
		if(boxes[i].on){
			eval+=pow(2,boxes[i].bit)
		}
	} 
	
	if(eval==1 && gameState=="hold"){
		gameState="play";
		scoreIncrement();
		//boxes[0].select=true;
	}
	if(eval==score && gameState=="play"){ scoreIncrement();}	
	
	scoreTime *=scoreTimeDecayRate;
	twoPowerTime *= twoPowerTimeDecayRate;
	
	//gameWinAnimation();
	
	background(BODY_BG);
  fill(BODY_COLOR);

	if(gameState=="play" || gameState=="win"){
		drawScore();
		drawTimer();
	} else if(gameState=="hold"){
		drawHold();
	}else if(gameState=="bind"){
		drawBind();
	}
	

	//text(round(timer, 1), width/2, height/2+150);
	
	//First draw the bursts
	push();
	translate(width/2,height/2);
	translate((boxWidth+boxMargin)*(numSlots-1)/2,0 );
	for(i=0;i<numSlots;i++){
		boxes[i].drawBursts();
		translate(-boxWidth,0);
		translate(-boxMargin,0);
	}
	pop();
		
	//then draw the boxes
	push();
	translate(width/2,height/2);
	translate((boxWidth+boxMargin)*(numSlots-1)/2,0 );
	for(i=0;i<numSlots;i++){
		if(gameState=="play" || gameState=="hold"){
			boxes[i].checkKey();
		}
		boxes[i].draw();
		translate(-boxWidth,0);
		translate(-boxMargin,0);
	}
	pop();

}


function bind(){
	gameState="bind";
	for(i=0;i<numSlots;i++){
		boxes[i].interactive=false;
		boxes[i].on=false;
		boxes[i].select=false;
		boxes[i].binding=true;
		boxes[i].key="";
	}
	boxes[0].select=true;
}

function setKeyBind(keyCode){
	if(gameState="bind"){

		//find first index which is selected, using hacky break out of for loop.
		for(i=0;i<numSlots;i++){
			if(boxes[i].select){
				break;
			}
		}

		boxes[i].key=keyCode;

		boxes[i].interactive=false;
		boxes[i].on=true;
		boxes[i].select=false;
		boxes[i].addBurst(1);

		if( i+1<numSlots){
				boxes[i+1].interactive=true;
				boxes[i+1].select=true;
		} 
		if( i+1==numSlots){
				resetGame();
		}
	}
}


function gameWin(){
	gameState="win";
	isFirstTime=false;
	gameEndTime= millis();
	for(i=0;i<numSlots;i++){
		boxes[i].on=true;
		setWinAnim(i);
		}
	setTimeout(function() {
	 doShowReset=true;
 	}, time_spacing*numSlots + waitTime + 1200);
	
}

function setWinAnim(i){
	setTimeout(function() {
	 boxes[i].select=true;
 	}, time_spacing*i + waitTime);
	setTimeout(function() {
	 boxes[i].select=false;
	 boxes[i].addBurst(i);
 	}, time_spacing*(i+1) + waitTime);
}


function scoreIncrement(){
		let oldScore=score-1;
		let oldScoreBin = oldScore.toString(2).padStart(numSlots,"0").split("");
		score+=1
		scoreTime = 1;
	
		if((score.toString(2).split("1").length - 1)==1 && score != 1){
			twoPowerScore=score;
			twoPowerTime=1;
			twoPowerTimeDecayRate=0.98-0.08*(1-log(twoPowerScore,2)/numSlots) ;
		}
		
		let scoreBin = score.toString(2).padStart(numSlots,"0").split("");
		for(i=0;i<numSlots;i++){
			if(scoreBin[scoreBin.length-1-i]=="1"){
					boxes[i].select = true;
			} else {boxes[i].select = false;}
			
			
			if(boxes[i].on && oldScoreBin[oldScoreBin.length-1-i]=="0"){
						boxes[i].addBurst(i);
					}
		}
	
	if(score==pow(2,numSlots)){
		gameWin();
	}
}


function incrementTimer(){
	if(gameState=="play"){
		timer+=timerUnit;
	}
}

function drawTimer(){
	push();
	textAlign(CENTER, BOTTOM);
	fill(MID);
	textSize(32);
	text("Timer:", width/2, height/2+150);
	
	textAlign(CENTER, TOP);
	fill(BODY_COLOR);
	textSize(60);
	if(gameState=="play" || gameState=="hold"){
		textAlign(CENTER, TOP);
		text(timer.toFixed(1), width/2, height/2+150);
	} else if (gameState=="win"){
		fill(SECONDARY);
		text(timer.toFixed(2), width/2, height/2+150);
		if(doShowReset){ //Only show reset after a second of losing
			fill(MID);
			textSize(32);
			text("Press space to reset", width/2, height/2+230);
	} else if (gameState=="bind"){
		drawBind();
	}
		
		
	}
	pop();
}

function drawScore(){
	
	push();
	translate(width/2,height/2-200);
	
	textAlign(CENTER, BOTTOM);
	fill(MID);
	textSize(32);
	//text("Score:", 0, 0);
	
	textAlign(CENTER, TOP);
	textSize(baseTextSize + scoreTime*10+score);
	col1=color(BODY_COLOR);
	col2=color(PRIMARY);
	fill(lerpColor(col1,col2,score/pow(2,numSlots)));
	textStyle(NORMAL);

	
	//Burst if the score is a power of two
	if(twoPowerTime>0.05){ 
		push();
		let order = log(twoPowerScore,2)/numSlots;
		textSize(baseTextSize + (1-twoPowerTime*twoPowerTime)*(10 + 90*order+score) ); //make it according to log power of two 
		col2.setAlpha(twoPowerTime*(180+30*order));
		translate(0,-(-exp(-(1-twoPowerTime)*3)+1)*50);
		fill(col2);
		textStyle(BOLD);
		text(twoPowerScore, 0,0);
		pop();
	} 
	
	let shakeScale=10;
	let shakieness=3;
	translate(
		(2*noise(scoreTime*shakieness+score)-1)*scoreTime*scoreTime*shakeScale,
		(2*noise(scoreTime*shakieness+score+10)-1)*scoreTime*scoreTime*shakeScale)

	let rotateScale=0.1; //ammount it rotates total, in radiens?
	rotate(
		(2*noise(scoreTime*shakieness+score-10)-1)*scoreTime*scoreTime*rotateScale);
	text(score, 0,0);
	
	pop();
	
}

function drawHold(){
	push();
	textAlign(CENTER, BOTTOM);
	fill(BODY_COLOR);
	textSize(32);
	text("Count up to 32!", width/2, height/2-150);
	if(!isFirstTime){
		text("Press Shift to set keys", width/2, height/2+150);
	}
	pop();
}

function drawBind(){
	push();
	textAlign(CENTER, BOTTOM);
	fill(BODY_COLOR);
	textSize(32);
	text("Press any key to bind to selected bit", width/2, height/2-150);
	pop();
}



function resetGame(){
	timer=0;
	score=1;
	twoPowerScore=0;
	scoreTime=0;
	doShowReset=false;
	gameState="hold";
	for(i=0;i<numSlots;i++){
		boxes[i].bursts=[];
		boxes[i].interactive=true;
		boxes[i].on=false;
		boxes[i].select=false;
		boxes[i].binding=false;
	}
	boxes[0].select=true;

	randomizeNotes();
}

function playMIDI(midinote,type="success",time=3) {
	if(type=="success"){
		lead.then(function (inst) {
			inst.play(midinote + 24, 1, {
				loop: false,
				gain: 4
			});
		});
	} else if (type=="fail"){
		fail.then(function (inst) {
			inst.play(midinote + 24, 1, {
				loop: false,
				gain: 1.5
			});
		});
	}

}


function randomizeNotes(){

	let basenote = floor((random()*(baseNoteRange[1]-baseNoteRange[0]))) + baseNoteRange[0];
	let chord = chords[floor((random()*chords.length))];

	for(var i=0;i<numSlots;i++){
		boxes[i].note= basenote + chord[i];
	}
	
}


function keyPressed() {
	userStartAudio();
	
	//Only allow resets when game is not bound
	if (keyCode === 32) {
		if(gameState!="bind"){
			resetGame();
		}
	} else if (keyCode === 16){
		if(gameState=="hold"){
			bind();
		}
	} else if(gameState=="bind"){
		let doBind=true;
			for(i=0;i<numSlots;i++){
				if(keyCode==boxes[i].key){
					doBind=false; //if key is already pressed, do not include it
				}
			}
			if(doBind){
				setKeyBind(keyCode);
			}
		
		//if (keyCode != 48 && keyCode<= 90) {}
	}
}