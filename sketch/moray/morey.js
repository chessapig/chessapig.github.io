let coords=[];
let d;
let t;
let gui,
	capturer,
	gifCapturing=false,
	noiseScale=1.1,		//default
	noiseRadiusSlider=0.5,	//default
	noiseVelocity=0,	//default
	doMoveNoise=false,	//default
	noiseRadius=0,
	gifFrames=0,
	fps=30,	//number of frames per second
	loopTime=5; //number of seconds in loop
	saveFormat="webm";

let morayDensity=100,
	dt=0.01,
	speed=1,
	vectFieldName="rotate",
	diffeoName="sin",
	pause=true,
	doNewton=true,
	phase=0;
	phaseSpeed=0,
	doMoray=true;


let smallCanvas=true;

function setup() {
	d=1;
	pixelDensity(d);
	if(smallCanvas){createCanvas(500, 500)}
	else {createCanvas(windowWidth, windowHeight);}
	background(100);
	for(x=0; x<width; x++){
		coords[x]=[];
		for(y=0; y<height; y++){
			coords[x][y]=[];
			coords[x][y][0]=x/width;
			coords[x][y][1]=y/height;
		}
	}

	t=0;
	

	//parameters for this program
	settings = QuickSettings.create((width+10)%windowWidth,10, "Parameters")
		.addBoolean("Moray patterns?",doMoray,function(value) {doMoray = value;})
		.addBoolean("Pause",pause,function(value) {pause = value;})
		.addRange("number of lines",20,3000,morayDensity,1,function(value) {morayDensity = value;})
		.addRange("speed of vector field",-5,5,speed,0.001,function(value) {speed = value;})
		.addRange("phase speed",-3,3,phaseSpeed,1,function(value) {phaseSpeed=value;})
		.addDropDown("Type of modification", ["Vector field","diffeomorphism"], function(value) { 
			switch(value.index){ 
				case 1: doNewton=true; settings.showControl("Vector field name");  settings.hideControl("Diffeomorphism name"); 
				case 2: doNewton=false; settings.showControl("Diffeomorphism name"); settings.hideControl("Vector field name"); 
			}
		})
		.addDropDown("Vector field name", [ "rotate", "parabola","skew","noise"], function(value) { vectFieldName=value.value})
		.addDropDown("Diffeomorphism name", ["sin","noise"], function(value) {diffeoName=value.value});

	settings.hideControl("Diffeomorphism name");

	//global settings, apply to any program
	noiseSettings = QuickSettings.create((width+220)%windowWidth,10, "Noise settings")
		.addRange("Noise Scale",0.5,1.5,noiseScale,0.001,function(value) {
			noiseScale = value;
			if(pause){pause=false;draw();pause=true;}
		})
		.addRange("Radius of Noise loop",0,1,noiseRadiusSlider,0.001,function(value) {noiseRadiusSlider = value;})
		.addBoolean("Move noise center?",doMoveNoise,function(value) {doMoveNoise = value;})
		.addRange("Velocity of center of noise loop",-1,1,noiseVelocity,0.001,function(value) {noiseVelocity = value;})
		.addButton("Save",function(){makeGif()});

	
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

	noiseOptions={
		seed: floor(random()*10000),
		radius: noiseRadius,
		center: noiseCenter,
	}

	createLoop({
		duration: loopTime, 
		noiseOptions,
		gif: false,
		});
}

function draw() {
	loadPixels();
	for(x=0; x<width; x++){
		for(y=0; y<height; y++){
			index = 4*(y*width  +x);
			x0=x/width;
			y0=y/height;

			x1=coords[x][y][0];
			y1=coords[x][y][1];
			//Apply newtons method with vector field
			// x1= x1 + ((y1-1/2)**2 + y1)*speed*dt;
			// y1= y1 + (0)*speed*dt;

			step=0;
			if(!pause){
			if(doNewton){ //newtons method
				step = speed*dt;
				x1=x1+getVectField(2*x1-1,2*y1-1,vectFieldName).x*step;
				y1=y1+getVectField(2*x1-1,2*y1-1,vectFieldName).y*step;
			} else {
				x1=diffeo(x0,y0,t,diffeoName).x;
				y1=diffeo(x0,y0,t,diffeoName).y;
			} }
			

			//periodic boundary conditions
			// x1=x1%1;
			// y1=y1%1;

			coords[x][y][0]=x1;
			coords[x][y][1]=y1;


			value0x=map(sin(2*PI*(x0*morayDensity)),-1,1,0,1); //assigns starting value
			value0y=map(sin(2*PI*(y0*morayDensity)),-1,1,0,1); //assigns starting value

			value1x = map(sin(2*PI*(x1*morayDensity + phase)),-1,1,0,1);
			value1y = map(sin(2*PI*(y1*morayDensity + phase)),-1,1,0,1);
			valueX=1-(1-value0x)*(1-value1x); //multiply starting an ending
			valueY=1-(1-value0y)*(1-value1y);
			//valueX=valueY;
			pixels[index] = valueX*255;
			pixels[index+1] = valueY*255;
			pixels[index+2] = 255;
			pixels[index+3] = 255;

			if(doMoray){value=1-(1-value0x)*(1-value1x)}
			else {value=value1x}
			pixels[index] = value*255;
			pixels[index+1] = value*255;
			pixels[index+2] = value*255;
		}
	}
	updatePixels();
	if(!pause){
		t+=dt*speed; 
	}
	phase += phaseSpeed/(loopTime*fps) //make it so phase returns to 1 after full loop
	
	

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

//vector fields
function getVectField(x,y,name){ //x,y from -1 to 1
	vX=0;
	vY=0;

	switch(name){
		case "rotate":
			vX=y;
			vY=-x;
			break;
		case "parabola":
			vX=y**2
			vY=0;
			break;
		case "skew":
			vX= (x-y);
			vY=(x+y);
			break;
		case "noise":
			x-=0.5;
			y-=0.5;
			vX = noise(
				noiseCenter+noiseRadius+x*noiseScale,   //x coord inpiut //add noiseRadius s.t it always passes through at least one of the same point
				y*noiseScale);	//y coord input
			vY = noise(
				noiseCenter+noiseRadius+x*noiseScale,  
				(2+y)*noiseScale); //+1 to keep x and y uncorrelated
			break;
	}

	return createVector(vX,vY);
}


//diffeomorphisms
function diffeo(x,y,t,name){ //map x,y from [0,1]^2 to [0,1]^2
	x1=x;
	y1=y;

	switch(name){
		case "sin":
			x1=(sin(2*PI*(y+x*t))+1)/2;
			y1=(cos(2*PI*(x-y*t))+1)/2;
			break;

		case "noise":
			x-=0.5;
			y-=0.5;
			x1=animLoop.noise2D(
				noiseCenter+noiseRadius+x*noiseScale,   //x coord inpiut //add noiseRadius s.t it always passes through at least one of the same point
				y*noiseScale,	//y coord input
				noiseOptions);
			y1=animLoop.noise2D(
				noiseCenter+noiseRadius+x*noiseScale,  
				(2+y)*noiseScale, //+1 to keep x and y uncorrelated
				noiseOptions);
	}

	return createVector(x1,y1);
}