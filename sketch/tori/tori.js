
var points=[];
var numPtsMax = 500;
let gui,
	capturer,
	gifCapturing=false,
	numIter=30,			//default
	noiseScale=1.1,		//default
	noiseRadiusSlider=0,	//default
	noiseVelocity=0,	//default
	doMoveNoise=false,	//default
	doLoop=false;
	doShowLines=false,	//default
	noiseRadius=0,
	perturbationStrSlider=0,
	perturbationStr=1,
	numPts=50;
	gifFrames=0;
	fps=30,	//number of frames per second
	loopTime=5; //number of seconds in loop
	saveFormat="webm";

let smallCanvas=false;

let angle;
var doAccumulate=true;

function setup(){


	if(smallCanvas){createCanvas(500, 500)}
	else {createCanvas(windowWidth, windowHeight);}
	background(21, 8, 50);
	stroke(255,100);

	//initialize points
	for(var i = 0; i < numPtsMax; i++){
		points[i] = new Point(i);
	} //make the number of points array extra big


	noise = new OpenSimplexNoise(Date.now());


	//setup gui
	let x=0;
	settings = QuickSettings.create(10,10, "click / double tab to collapse")
		.addRange("Number of points",1,numPtsMax,numPts,1,function(value) {numPts = value;})
		.addRange("Number of Iterations per frame",1,200,numIter,1,function(value) {numIter = value;})
		.addRange("Noise Scale",0.5,1.5,noiseScale,0.001,function(value) {
			noiseScale = value;
			reset();})
		.addRange("Radius of Noise loop",0,1,noiseRadiusSlider,0.001,function(value) {noiseRadiusSlider = value;})
		.addBoolean("noise loop?",doLoop,function(value) {doLoop = value;})
		.addBoolean("Move noise center?",doMoveNoise,function(value) {doMoveNoise = value;})
		.addRange("Velocity of center of noise loop",-1,1,noiseVelocity,0.001,function(value) {noiseVelocity = value;})
		.addBoolean("draw lines?",doShowLines,function(value) {doShowLines = value;})
		.addRange("Perturbation strength (log scale)",0,1,perturbationStrSlider,0.001,function(value) {
			perturbationStrSlider = value;
			reset();})//clear screen
		.addButton("Save",function(){makeGif()});
		//.addDropDown("Save format", ["gif", "webm", "png"], function(value) {saveFormat=value});
	
	//setup gif encoder
	frameRate(fps)
	capturer = new CCapture( { 
		format: 'webm', 
		workersPath: 'js/', 
		framerate: fps,
		} );
	gifFrames=0; //track how many frames in gif saved so far
	console.log(capturer);

	//setup noise loop
	noiseCenter=0;



	
}

function draw(){
	translate(width/2,height/2);
	scale(height/2);
	background(21, 8, 50,4);
	if(!doAccumulate){
		reset();
	} 
	
	
	
	smooth();


	//set scale and raidus
	//=noiseScale = pow(10,map(p.noiseScale,0,1,-1,0.5)) //sets range of scales, from 10^-2 to 10^1 
	//noiseScale = noiseScale;
	noiseRadius = pow(10,map(noiseRadiusSlider,0,1,-2,0))-0.01;//subtract to get log scale, but starting at zero
	perturbationStr=pow(10,map(perturbationStrSlider,0,1,-5,1))-.00001;

	angle=frameCount/fps/loopTime*2*PI;
	

	//Creates picture
	if(doAccumulate){
		for(n=0;n<numIter;n++){
			for(i = 0; i < numPts; i++){
				points[i].move();
				points[i].display();
			}
		}
	} else {
		for(var n=0; n<numIter;n++){
			var alpha = exp(map(n,0,numIter,log(10),log(200)));
			for(i = 0; i < numPts; i++){
				this.radius = map(i,0,numPts,1,5*height/500);

				//fill(69,33,124,alpha);
				//points[i].setAlpha(alpha);

				points[i].color = lerpColor(
					color(7,153,242,alpha), 	//from
					color(255,255,255,alpha),	//to
					n/numIter)
				points[i].move();
				points[i].display();
			}  
		}
	}
	

	//capture frame
	if(gifCapturing){
		capturer.capture(document.getElementById('defaultCanvas0'));
		gifFrames+=1;
		if(gifFrames>=loopTime*fps){
			capturer.stop();
			capturer.save();
			gifCapturing=false;
			gifFrames=0;
		}
	}




	//move noise center
	if(doMoveNoise){
		noiseCenter+= noiseVelocity*noiseScale/fps;
	}
}


class Point{
	constructor(i){
		//default
		//let pos=createVector( random(-1,1),random(-1,1));

		let doRational=floor(random()*2);
		
		let dist=0;
		let numRational=120;

		let alpha=100;
		
		if(doRational==0){
			dist=Math.pow(random(0,1),.5);
			this.color=lerpColor(color(255,255,255,alpha),color(83, 194, 23,alpha),dist);
			console.log(this.color);
		} else {
			dist=floor(random(0,1)*numRational)/numRational;
			this.color=lerpColor(color(255,255,255,alpha),color(209, 15, 115,alpha),dist);
		}

		this.startPos = createVector(dist,0);
		this.pos = this.startPos.copy();
		this.radius = .01;
		//this.color=color(255,255,255);
	}
	
	move(){
		var lastPos = this.pos.copy();

		//map that matters
		this.pos.rotate(this.pos.mag()*PI*2);

		//-----Add Perturbation----
		if(doLoop){

			// get random x from (x,y)
			this.pos.x += perturbationStr* (
				noiseLoop(noise,
					noiseCenter+noiseRadius+lastPos.x*noiseScale,   //x coord inpiut //add noiseRadius s.t it always passes through at least one of the same point
					lastPos.y*noiseScale,	//y coord input
					angle,
					noiseScale,noiseRadius));
			//this.pos.x = (this.pos.x+1) % 2-1;
			

			//get ranom y from (x,y)
			this.pos.y += perturbationStr*(
				noiseLoop(noise,
					noiseCenter+noiseRadius+lastPos.x*noiseScale,   //x coord inpiut //add noiseRadius s.t it always passes through at least one of the same point
					(2+lastPos.y)*noiseScale,	//y coord input
					angle,
					noiseScale,noiseRadius));
			//this.pos.y = (this.pos.y+1) % 2-1;

		} else {
			// get random x from (x,y)
			this.pos.x += perturbationStr* (
				noiseMove(noise,
					noiseCenter+noiseRadius+lastPos.x*noiseScale,   //x coord inpiut //add noiseRadius s.t it always passes through at least one of the same point
					lastPos.y*noiseScale,	//y coord input
					angle,
					noiseScale,noiseRadius));
		//this.pos.x = (this.pos.x+1) % 2-1;
		

		//get ranom y from (x,y)
		this.pos.y += perturbationStr*(
			noiseMove(noise,
				noiseCenter+noiseRadius+lastPos.x*noiseScale,   //x coord inpiut //add noiseRadius s.t it always passes through at least one of the same point
				(2+lastPos.y)*noiseScale,	//y coord input
				angle,
				noiseScale,noiseRadius));
		//this.pos.y = (this.pos.y+1) % 2-1;
		}

		
		

		stroke(color(red(this.color),green(this.color),blue(this.color),30));
		strokeWeight(.005);
		if(doShowLines){
			line(lastPos.x,lastPos.y,this.pos.x,this.pos.y); //draw line between last 2 points
		}
	}
	
	display(){
		push();
		noStroke();
		fill(this.color);
		ellipse(this.pos.x,this.pos.y,this.radius,this.radius);
		pop();
	}
	
	setAlpha(alpha){
		this.color=color(red(this.color),green(this.color),blue(this.color),alpha);
	}
	
	resetPos(){
		this.pos=this.startPos.copy();
	}
}

function reset(){
	background(21, 8, 50)
	for(i = 0; i < numPts; i++){
		points[i].resetPos();
	} 
}

function windowResized() {
	if(!smallCanvas){
		resizeCanvas(windowWidth, windowHeight)
	}

   }

//togge gui visibility
function keyPressed(){
	switch(key) {
		case 'h':
			settings.toggleVisibility();
			break;
  }  
}

function makeGif(){
	console.log("make gif");
	capturer.start();
	gifCapturing=true;
}
