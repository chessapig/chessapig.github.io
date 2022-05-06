
var points=[];
var numPtsMax = 500;
let gui,
	capturer,
	gifCapturing=false,
	numPts=30,
	numIter=100,			//default
	noiseRadiusSlider=0,	//default
	noiseVelocity=0,	//default
	doMoveNoise=false,	//default
	doShowLines=false,	//default
	doRotate=true,
	perturbationStrSlider=0.69,
	perturbationStr=1,
	gifFrames=0;
	fps=30,	//number of frames per second
	loopTime=5; //number of seconds in loop
	saveFormat="webm";

let smallCanvas=true;

let angle;
var doAccumulate=true;
let perturb;

let n={
	"periodic": false,
	"loop":false,
	"scale": 1.5,
	"radius":0,
	"center":0,
	"randomGradient": true
}


function setup(){


	if(smallCanvas){createCanvas(500, 500)}
	else {createCanvas(windowWidth, windowHeight);}
	background(21, 8, 50);
	stroke(255,100);


	//setup noise
	n.obj = new OpenSimplexNoise(Date.now());



	//initialize points
	for(var i = 0; i < numPtsMax; i++){
		points[i] = new Point(i);
	} //make the number of points array extra big



	//setup gui
	let x=0;
	settings = QuickSettings.create(10,10, "click / double tab to collapse")
		.addRange("Number of points",1,numPtsMax,numPts,1,function(value) {numPts = value;})
		.addRange("Number of Iterations per frame",1,200,numIter,1,function(value) {numIter = value;})
		.addRange("Noise Scale",0.5,3,n.scale,0.001,function(value) {
			n.scale = value;
			reset();})
		.addRange("Radius of Noise loop",0,1,noiseRadiusSlider,0.001,function(value) {
			noiseRadiusSlider = value;
			n.radius = pow(10,map(noiseRadiusSlider,0,1,-2,0))-0.01;
		})
		.addBoolean("noise loop?",n.loop,function(value) {n.loop = value;})
		.addBoolean("Move noise center?",doMoveNoise,function(value) {doMoveNoise = value;})
		.addRange("Velocity of center of noise loop",-1,1,noiseVelocity,0.001,function(value) {noiseVelocity = value;})
		.addBoolean("draw lines?",doShowLines,function(value) {doShowLines = value;})
		.addBoolean("do rotate",doRotate,function(value) {
			doRotate = value; 
			//reset();
		})
		.addBoolean("do accumulate?",doAccumulate,function(value) {
			doAccumulate = value; 
			reset();})	
		.addRange("Perturbation strength (log scale)",0,1,perturbationStrSlider,0.001,function(value) {
			perturbationStrSlider = value;
			//reset();
		})//clear screen
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

	


	
}

function draw(){
	translate(width/2,height/2);
	scale(height/2);
	background(21, 8, 50,10);
	if(!doAccumulate){
		reset();
	} 
	
	smooth();

	//set scale and raidus
	//=noiseScale = pow(10,map(p.noiseScale,0,1,-1,0.5)) //sets range of scales, from 10^-2 to 10^1 
	//noiseScale = noiseScale;
	
	


	let minOrder=-7;
	perturbationStr=pow(10,map(perturbationStrSlider,0,1,minOrder,1))-Math.pow(10,minOrder);

	angle=frameCount/fps/loopTime;
	
	

	//Creates picture
	if(doAccumulate){
		for(k=0;k<numIter;k++){
			for(i = 0; i < numPts; i++){
				points[i].move();
				points[i].display();
			}
		}
	} else {
		for(var k=0; k<numIter;k++){
			var alpha = exp(map(k,0,numIter,log(10),log(200)));
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
		n.center =  n.center+noiseVelocity*n.scale/fps;
	}
}


class Point{
	constructor(i){
		//default
		//let pos=createVector( random(-1,1),random(-1,1));

		let doRational=floor(random()*2);
		
		let dist=0;
		let numRational=60;

		let alpha=100;
		
		if(doRational==0){
			dist=Math.pow(random(0,1),.5);
			this.color=lerpColor(color(255,255,255,alpha),color(83, 194, 23,alpha),dist);
		} else {
			dist=floor(random(0,1)*numRational)/numRational;

			//dist=Math.sqrt(dist+1/4)+1/2; //make it so that resulting distances are rational rotations for logistic rescaling.

			this.color=lerpColor(color(255,255,255,alpha),color(209, 15, 115,alpha),dist);
		}

		this.startPos = createVector(dist,0);
		this.lastPos=this.startPos;
		this.pos = this.startPos.copy();
		this.radius = .015;
		this.crossing=false; //flags when it crosses the border


		this.minDist=1; //record how close it ever got to the start
		this.denominator=0;
		//this.color=color(255,255,255);
	}
	
	move(){
		this.lastPos = this.pos.copy();

		if(doRotate){
			//map that matters

			//let angle=Math.pow((this.pos.mag()-.5),2)-.25; //logistic


			this.pos.rotate(this.startPos.mag()*PI*2);

		}
		


		// //-----Add Perturbation----
		n.periodic=true;
		perturb = noiseVector(this.lastPos.x,this.lastPos.y,angle,n);
		perturb.mult(perturbationStr);
		perturb.rotate(PI/2);

		this.pos= this.pos.add(perturb);
		if(this.pos.x<-1){this.pos.x+=2; this.crossing=true;};
		if(this.pos.x>1){this.pos.x-=2;this.crossing=true;};

		if(this.pos.y<-1){this.pos.y+=2;this.crossing=true;};
		if(this.pos.y>1){this.pos.y-=2;this.crossing=true;};

		let distFromStart = dist(this.pos,this.startPos);
		if(this.minDis>distFromStart){
			this.minDist=distFromStart; 
			this.denominator}
	}
	
	display(){
	
		noStroke();
		fill(this.color);
		ellipse(this.pos.x,this.pos.y,this.radius,this.radius);
		

		stroke(color(red(this.color),green(this.color),blue(this.color),30));
		strokeWeight(.005);
		if(doShowLines && !this.crossing){
			line(this.lastPos.x,this.lastPos.y,this.pos.x,this.pos.y); //draw line between last 2 points
		}
		this.crossing=false;
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
