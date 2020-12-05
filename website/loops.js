



var doShowPoints;
var noiseOptions;

var settings;
var v;
var presets;
var params;

var center;
var loops;

function preload(){
	// var json = loadJSON('settings.txt');
	presets=json.presets;
	params=json.params
}

function setup() {
	createCanvas(displayWidth, displayHeight);
	frameRate(params.ani.frameRate);
	center=createVector(width/2,height/2);
	


	v=Object.assign({},presets["default"]); //make copy, so to not edit the presets
	settings=new MyGUI(params,v);
	makeJSONField(settings,"master");
	makePresetField(settings,"master",presets);
	

	noiseOptions={
		seed: 12345,
		radius: v.noiseRadius,
		center: 0,
	}

	createLoop({
		duration: params.ani.loopDuration, 
		noise:{
			radius: noiseOptions.radius,
			seed: 	noiseOptions.seed,
			},
		gif:false
		//gif:true,
		//gifFileName:image.gif,
		//gifRender:false,
		//gifOpen:true 
		});
  
	//print(v);
	loops=[];
	this.update();

}




function draw() {
	var bgOpacity= constrain(Math.pow(16*v.bgOpacity,2), 0,255);
	var bgColor=this.color(setAlpha(v.bgColor,bgOpacity));
	background(bgColor);
  
	this.update();

	for(var i=0;i<loops.length;i++){
		var perturbedLoop = loops[i].getCopy();
		perturbedLoop.perturbRadial(noiseOptions);
		perturbedLoop.display();
	}
}



function update(){
	print(v);
	
	doShowPoints=v.doShowPoints;
	Object.assign(noiseOptions,{
		type:v.noiseType, 
		doLoop:v.doLoopNoise, 
		radius:v.noiseRadius, 
		//velocity: v.noiseCenterVelocity,
		scale: pow(10,map(v.noiseScale,0,1,
			params.noise.noiseScale.minOrderMag,
			params.noise.noiseScale.maxOrderMag)),
		velocity: pow(10,map(v.noiseCenterVelocity,0,1,
			params.noise.noiseCenterVelocity.minOrderMag,
			params.noise.noiseCenterVelocity.maxOrderMag)),
	});
	

	
	var strokeOpacity= constrain(Math.pow(16*v.strokeOpacity,2), 0,255);
	var strokeColorStart=this.color(setAlpha(v.strokeColorStart,strokeOpacity));
	var strokeColorEnd=this.color(setAlpha(v.strokeColorEnd,strokeOpacity));

	var fillOpacity= constrain(Math.pow(16*v.fillOpacity,2), 0,255);
	var fillColorStart=this.color(setAlpha(v.fillColorStart,fillOpacity));
	var fillColorEnd=this.color(setAlpha(v.fillColorEnd,fillOpacity));


	for(var i=0;i<v.numLoops;i++){
		var strokeColor =     lerpColor(strokeColorStart,strokeColorEnd,map(i,0,v.numLoops,0,1));
		var fillColor =       lerpColor(fillColorStart,fillColorEnd,map(i,0,v.numLoops,0,1)); //no fill
		var strokeThickness = lerp(v.strokeThicknessStart,v.strokeThicknessEnd,map(i,0,v.numLoops,0,1));
		//var center =        center;
		var randomScale =     lerp(v.randomScaleStart,v.randomScaleEnd,map(i,0,v.numLoops,0,1));
		var radius =          lerp(v.radiusStart,v.radiusEnd,map(i,0,v.numLoops,0,1));
		var numPoints =       floor(lerp(v.numPointsStart,v.numPointsEnd,map(i,0,v.numLoops,0,1)));    


		//lets me use same code for making / updating the thing
		if(i<loops.length){
			loops[i].update(strokeColor,fillColor,randomScale, center, radius, numPoints,strokeThickness);
		}
		else{ 
			loops.push(new Circle(strokeColor,fillColor,randomScale, center, radius, numPoints,strokeThickness));
		}
	}
	if(v.numLoops<loops.length){
		loops=loops.slice(0,v.numLoops);
	}

}




// check for keyboard events
function keyPressed(){
	switch(key) {
  
  }  
  
}

//takes input of a hex string, returns color
function setAlpha(color,alpha){
	return this.color(colorToArray(color)[0],colorToArray(color)[1],colorToArray(color)[2],alpha);
}


//function windowResized() {
//  resizeCanvas(windowWidth, windowHeight);
//  center=createVector(width/2,height/2);
//}




