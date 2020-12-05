



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
	createCanvas(windowWidth, windowHeight);
	frameRate(params.ani.frameRate);
	center=createVector(width/2,height/2);
	


	v=Object.assign({},presets["default"]); //make copy, so to not edit the presets
	settings=new MyGUI(params,v);
	makePresetField(settings,"master",presets);
	makeJSONField(settings,"master");
	settings.controls.master.expand();
	settings.setGUIFromValues(presets["default"]);


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
	var bgOpacity= constrain(interpolate(v.bgOpacity,params.style.bgOpacity)-1,0,255);
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
	doShowPoints=v.doShowPoints;
	Object.assign(noiseOptions,{
		type:v.noiseType, 
		doMove:v.doMoveNoise, 
		radius:v.noiseRadius, 
		//velocity: v.noiseCenterVelocity,
		scale: interpolate(v.noiseScale,params.noise.noiseScale),
		velocity: interpolate(v.noiseCenterVelocity,params.noise.noiseCenterVelocity),
	});
	

	
	var strokeOpacity= constrain(interpolate(v.strokeOpacity,params.style.strokeOpacity)-1,0,255);
	var strokeColorStart=this.color(setAlpha(v.strokeColorStart,strokeOpacity));
	var strokeColorEnd=this.color(setAlpha(v.strokeColorEnd,strokeOpacity));

	var fillOpacity= constrain(interpolate(v.fillOpacity,params.style.fillOpacity)-1,0,255);
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
		case 'h':
			settings.toggleVisibility();
			break;
  
  }  
  
}

//takes input of a hex string, returns color
function setAlpha(color,alpha){
	return this.color(colorToArray(color)[0],colorToArray(color)[1],colorToArray(color)[2],alpha);
}


function windowResized() {
 resizeCanvas(windowWidth, windowHeight);
 center=createVector(width/2,height/2);
}

function interpolate(value,valueParams){
	switch(valueParams.interpolateType){
		case 'exp':
			value = map(value,valueParams.min,valueParams.max,0,1);
			value = pow(10,map(value,0,1,valueParams.minValue,valueParams.maxValue));
			
			break;

		case "lin":
			value = map(value,valueParams.min,valueParams.max,valueParams.minValue,valueParams.maxValue);
			break;
	}

	return value;
}

