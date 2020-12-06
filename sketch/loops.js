



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
	
	// background(0);
	// var start="amoeba";
	
	var start="default";
	v=Object.assign({},presets[start]); //make copy, so to not edit the presets
	settings=new MyGUI(params,v);
	makePresetField(settings,"master",presets);
	makeJSONField(settings,"master");
	settings.controls.master.expand();
	settings.controls.master.addHTML("TIPS",
	"<li>double click collapse, click+drag to move</li>"+
	"<li>press 'h' to hide GUI</li>"+
	 "<li>presets are pretty, but try iterating on them further!</li>"+
	 "<li>use <u>generate JSON</u> to send pretty parameters to your friends and/or me (I can add them as a preset!)</li>"+
	 "<li><u>bgOpacity</u> is probably the most significant field...</li></ul>")
	settings.setGUIFromValues(presets[start]);
	//settings.toggleVisibility();


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
		// gif:true,
		// gifFileName:image.gif,
		// gifRender:false,
		// gifOpen:true 
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

	push();
	var mode;
	if(v.blendMode.value!=null){mode=v.blendMode.value;}
	else{mode=v.blendMode}
	if(params.style.blendMode.lookup[mode]!=null){mode= params.style.blendMode.lookup[mode]};
	blendMode(mode);
	
	for(var i=0;i<loops.length;i++){
		var perturbedLoop = loops[i].getCopy();
		perturbedLoop.perturbRadial(noiseOptions);
		perturbedLoop.display();
	}
	pop();
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

