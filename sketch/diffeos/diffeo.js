var points=[];
var nums =50;
var noiseScale;
var t=1/300; //speed of map change

var settings;
var v;
var presets;
var params;

var doShowPoints;
var noiseOptions;


var i; var n;

function preload(){
	// var json = loadJSON('settings.txt');
	presets=json.presets;
	params=json.params;

}

function setup(){
	createCanvas(windowWidth, windowHeight);
	noiseScale=width;
	background(21, 8, 50);
	stroke(255,5);
	strokeWeight(1);
	for(var i = 0; i < nums; i++){
		points[i] = new Point();
	}

	

	
	//get presets from objects
	v=Object.assign({},presets[""]); //make copy, so to not edit the presets

	settings=new MyGUI(params,v);
	makePresetField(settings,"master",presets);
	makeJSONField(settings,"master");
	settings.controls.master.expand();
	settings.controls.master.addHTML("TIPS",
	"<li>double click to collapse, click+drag to move</li>"+
	"<li>press 'h' to hide GUI</li>"+
	 "<li>presets are pretty, but try iterating on them further!</li>"+
	 "<li>use <u>generate JSON</u> to send pretty parameters to your friends and/or me (I can add them as a preset!)</li>"+
	 "<li><u>bgOpacity</u> is probably the most significant field...</li></ul>")
	settings.setGUIFromValues(presets[""]);


	noiseOptions={
		seed: 12346,
		radius: v.noiseRadius,
		center: 0,
	}

	frameRate(30)
	createLoop({
		duration: params.ani.loopDuration, 
		noise:{
			radius: noiseOptions.radius,
			seed: 	noiseOptions.seed,
			},
		gif:false
		// gif:true,
		// gifFileName:image.gif,
		// gifRender:false,
		// gifOpen:true 
		});
	
	this.update();
}

function draw(){
	var bgOpacity= constrain(interpolate(v.bgOpacity,params.style.bgOpacity)-1,0,255);
	var bgColor=color(setAlpha(v.bgColor,bgOpacity));
	background(bgColor);



	//background(21, 8, 50);
	smooth();


	noiseScale = v.noiseScale*width;

	push();
	var mode;
	if(v.blendMode.value!=null){mode=v.blendMode.value;}
	else{mode=v.blendMode}
	if(params.style.blendMode.lookup[mode]!=null){mode= params.style.blendMode.lookup[mode]};
	blendMode(mode);


	//Actual content:
	var numIter=10;
	for(var n=0; n<numIter;n++){
		var alpha = exp(map(n,0,numIter,0,log(150)));
		stroke(255,255,255,exp(map(n,0,numIter,log(5),log(10))));
		for(i = 0; i < nums; i++){
			var radius = map(i,0,nums,1,10);

			points[i].setAlpha(alpha);
			points[i].move();
			points[i].display();
		}  
	}
	
	for(i = 0; i < nums; i++){
			points[i].resetPos();
	}
	
	pop();

	this.update();
}

function update(){ //update variables
	doShowPoints=v.doShowPoints;
	Object.assign(noiseOptions,{
		type:v.noiseType, 
		doMove:v.doMoveNoise, 
		doPerturbCenter:v.doPerturbCenter,
		radius:v.noiseRadius/params.ani.loopDuration*5,  //normalize to loop duration
		scale: interpolate(v.noiseScale,params.noise.noiseScale)/width,
		velocity: interpolate(v.noiseCenterVelocity,params.noise.noiseCenterVelocity),
		randomScale2D: params.noise.randomScale2D,
	});
	

	
	var strokeOpacity= constrain(interpolate(v.strokeOpacity,params.style.strokeOpacity)-1,0,255);
	var strokeColorStart=this.color(setAlpha(v.strokeColorStart,strokeOpacity));
	var strokeColorEnd=this.color(setAlpha(v.strokeColorEnd,strokeOpacity));

	var fillOpacity= constrain(interpolate(v.fillOpacity,params.style.fillOpacity)-1,0,255);
	var fillColorStart=this.color(setAlpha(v.fillColorStart,fillOpacity));
	var fillColorEnd=this.color(setAlpha(v.fillColorEnd,fillOpacity));

}


class Point{
	constructor(){
		this.startPos = createVector(random(width),random(height));
		this.pos = this.startPos.copy();
    this.radius = random(1, 10);
		
		this.color=color(255,255,255,10);
		switch(floor(3*random())) {
			case 0: 
				color(69,33,124,10)
				break;
			case 1: 
				color(7,153,242,10)
				break;
			case 2:
				color(255,255,255,10)
				break;
		}
		
	}
	
	move(){ //apply a diffeomorphism
		var lastPos = this.pos.copy();

		// get random x from (x,y)
		this.pos.x = width/2*(1+
			animLoop.noise2D(
				noiseOptions.center+lastPos.x/width*noiseOptions.scale,  
				lastPos.y/height*noiseOptions.scale,
				noiseOptions));

		//get ranom y from (x,y)
		this.pos.y = width/2*(1+
			animLoop.noise2D(
				noiseOptions.center+lastPos.x*width*noiseOptions.scale, 
				lastPos.y*height*(noiseOptions.scale + 2), //+2 used to get x and y uncorrelated
				noiseOptions));

		//this.pos.x = width*noise((lastPos.x)/noiseScale, (lastPos.y)/noiseScale, frameCount*t);
		//this.pos.y = height*noise((lastPos.x+10*noiseScale)/noiseScale, (lastPos.y+10*noiseScale)/noiseScale, frameCount*t);
		line(lastPos.x,lastPos.y,this.pos.x,this.pos.y); //draw line between last 2 points
	}
	
	display(){
		push();
		noStroke();
		fill(this.color);
		ellipse(this.pos.x,this.pos.y,this.radius,this.radius);
		pop();
	}
	
	setAlpha(alpha){
		this.color=color(red(this.color),blue(this.color),green(this.color),alpha);
	}
	
	resetPos(){
		this.pos=this.startPos.copy();
	}

}


// check for keyboard events
function keyPressed(){
	switch(key) {
		case 'h':
			settings.toggleVisibility();
			break;
  
  }  
  
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
   }