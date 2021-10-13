
var points=[];
var numPts =50;
let gui,
	capturer,
	gifCapturing=false,
	numIter=10,			//default
	noiseScale=1.3,		//default
	noiseRadiusSlider=0.5,	//default
	noiseVelocity=0,	//default
	doMoveNoise=false,	//default
	doShowLines=false,	//default
	noiseRadius=0;
	gifFrames=0;
	fps=30,	//number of frames per second
	loopTime=1; //number of seconds in loop

let smallCanvas=true;
function setup(){


	if(smallCanvas){createCanvas(500, 500)}
	else {createCanvas(windowWidth, windowHeight);}
	background(21, 8, 50);
	stroke(255,100);
	strokeWeight(1);
	for(var i = 0; i < numPts; i++){
		points[i] = new Point();
	}


	//setup gif encoder
	frameRate(fps)
	capturer = new CCapture( { 
		format: 'gif', 
		workersPath: 'js/', 
		framerate: fps,
		} );
	gifFrames=0; //track how many frames in gif saved so far
	console.log(capturer);


	//setup gui
	let x=0;
	settings = QuickSettings.create(510,10, "Variables")
		.addRange("Number of Iterations per frame",1,20,numIter,1,function(value) {numIter = value;})
		.addRange("Noise Scale",0.5,1.5,noiseScale,0.01,function(value) {noiseScale = value;})
		.addRange("Radius of Noise loop",0,1,noiseRadiusSlider,0.01,function(value) {noiseRadiusSlider = value;})
		.addBoolean("Move noise center?",doMoveNoise,function(value) {doMoveNoise = value;})
		.addRange("Velocity of center of noise loop",-1,1,noiseVelocity,0.01,function(value) {noiseVelocity = value;})
		.addBoolean("draw lines?",doShowLines,function(value) {doShowLines = value;})
		.addButton("Make Gif",function(){makeGif()})
	

	//setup noise loop
	noiseCenter=0;

	noiseOptions={
		seed: 12346,
		radius: noiseRadius,
		center: noiseCenter,
	}

	createLoop({
		duration: loopTime, 
		noiseOptions,
		gif: false,
		});

	
}

function draw(){
	background(21, 8, 50);
	smooth();

	//set scale and raidus
	//noiseScale = pow(10,map(p.noiseScale,0,1,-1,0.5)) //sets range of scales, from 10^-2 to 10^1 
	//noiseScale = noiseScale;
	noiseRadius = pow(10,map(noiseRadiusSlider,0,1,-2,0))-0.01//subtract to get log scale, but starting at zero
	
	
	//puts points back at origional position
	for(i = 0; i < numPts; i++){
		points[i].resetPos();
	} 

	//Creates picture
	for(var n=0; n<numIter;n++){
		var alpha = exp(map(n,0,numIter,0,log(100)));
		stroke(255,255,255,exp(map(n,0,numIter,log(10),log(30))));
		for(i = 0; i < numPts; i++){
			var radius = map(i,0,numPts,1,10);

			//fill(69,33,124,alpha);
			points[i].setAlpha(alpha);
			points[i].move();
			points[i].display();
		}  
	}
	

	//capture frame
	if(gifCapturing){
		capturer.capture(document.getElementById('defaultCanvas0'));
		gifFrames+=1;
		if(gifFrames>=loopTime*fps){
			capturer.stop();
			//capturer.save();
			gifCapturing=false;
		}
	}


	//update noise settings
	Object.assign(noiseOptions,{
		radius:	noiseRadius,  //normalize to loop duration
		// duration: loopTime,
	});

	//move noise center
	if(doMoveNoise){
		noiseCenter+= noiseVelocity*noiseScale/fps;
	}
}


class Point{
	constructor(){
		this.startPos = createVector(random(width),random(height));
		this.pos = this.startPos.copy();
    this.radius = random(1, 15);
		
		
		switch(floor(3*random())) {
			case 0: 
			this.color=color(69,33,124,10)
				break;
			case 1: 
			this.color=color(7,153,242,10)
				break;
			case 2:
				this.color=color(255,255,255,10)
				break;
		}
		this.color=color(7,153,242,10);
		//this.color=color(255,255,255);
	}
	
	move(){
		var lastPos = this.pos.copy();

		// get random x from (x,y)
		this.pos.x = width/2*(1+
			animLoop.noise2D(
				noiseCenter+lastPos.x/width*noiseScale,   //x coord inpiut
				lastPos.y/height*noiseScale,	//y coord input
				noiseOptions));


		//get ranom y from (x,y)
		this.pos.y = height/2*(1+
			animLoop.noise2D(
				noiseCenter+lastPos.x/width*noiseScale,  
				(2+lastPos.y/height)*noiseScale, //+1 to keep x and y uncorrelated
				noiseOptions));


		 //this.pos.x = width*noise((lastPos.x)/noiseScale, (lastPos.y)/noiseScale, frameCount*t);
		 //this.pos.y = height*noise((lastPos.x+10*noiseScale)/noiseScale, (lastPos.y+10*noiseScale)/noiseScale, frameCount*t);
		stroke(this.color);
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
