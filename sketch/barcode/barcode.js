
let controlPts=[];
const num=15; //maximum number of allowed points
let Shader;

const BKG = '#2c2621'; //background color
//const BKG = '#000000'; //background color
const FRG = '#e6cfb3'; //foreground color

const colors=['#519D30','#F197B3','#98200B',FRG,BKG]; //colors of points 

let hidePoints=false;
let dragMode=false;

function preload(){
	Shader=getShader(this._renderer);
  }

function setup() {
	
	createCanvas(windowWidth, windowHeight,WEBGL);

	levelSets = createFramebuffer();
	
	
	controlPts = [new Draggable(-0.75,-0.5),
				  new Draggable(0.75,-0.5),
				  new Draggable(0,-0.7990381056)];
	
	for(let i=0;i<controlPts.length;i++){
		let pt=controlPts[i]
		pt.color=color(colors[0]);
		pt.magnitude=random(0.4,0.7);
	}
	
	background(BKG);
	
}

function draw() {
 
	//establish shader
	charges=[];
	for(let i=0;i<num;i++){
		if(i<controlPts.length){
			c=controlPts[i];
			charges.push(c.x,c.y,c.magnitude);
		}
	}
	levelSets.begin();
	shader(Shader);
	Shader.setUniform("charges",charges);
	noStroke();
	plane(width, height);
	levelSets.end();

	//background(BKG);
	push();

	changeCoords();
	//imageMode(CENTER) 
	image(levelSets,0,0,2,2);
	
	


	//draw border
	noFill();
	stroke(FRG);
	strokeWeight(10);
	rect(-1,-1,2,2);

	let anyRollOver=false;
	for(i=0;i<controlPts.length;i++){
		if(controlPts[i].rollover){
			anyRollOver=true;
		}
	}
	//only scroll if no points can be rolled over
	if(anyRollOver){ 
		disableScroll();
	} else {
		enableScroll();
	}
	
	
	stroke(FRG);

	

	for(let i=0;i<controlPts.length;i++){
		controlPts[i].update();
		if(!hidePoints){
			controlPts[i].show();
		}
	}

	

	pop();

	
}




//every time i call reset, I say "didReset =true". I reverse this at the end of each draw. 
function reset(){
	//background(BKG);
	scheduleReset=true;
}


//go through and call the fractal points "pressed" function
function mousePressed() {
	for(let i=0;i<controlPts.length;i++){
		controlPts[i].pressed();
	}
}

//when mouse is released, make each draggable "released", and delete them if outside of screen.
function mouseReleased() {
	let newFractalPoints=[];
	for(let i=0;i<controlPts.length;i++){
		controlPts[i].released();
		//make list of zeros within bounds
		if(!controlPts[i].isOutsideScreen()){
			newFractalPoints[newFractalPoints.length]=controlPts[i]
		} else {
			reset(); //clear page if any left outside screen
		}
	}
	
	controlPts=newFractalPoints;
	
}


function doubleClicked(){
	let mouse = getCoords(mouseX,mouseY);
	let doAddPoint=true;
	let newControlPts=[];
	for(let i=0;i<controlPts.length;i++){
		if(controlPts[i].rollover){
			doAddPoint=false;
		} else {
			newControlPts[newControlPts.length]=controlPts[i]; //delete double clicked points
		}
	} 
	controlPts = newControlPts;
	if(doAddPoint){
		let i=controlPts.length;
		controlPts[i]=new Draggable(mouse.x,mouse.y);
		controlPts[i].color=colors[0];
		
	}
}


//takes in  x,y of screen coordinates, and returns vector of world coordinates
function getCoords(x,y){
	let s = min(width, height) / 2;

	// center the mouse coords around (0,0)
	let newX = (x - width/2) / s;
	let newY = (height/2 - y) / s; // flip y so up is +
	return createVector(newX,newY);
}

//changes coordinates from screen coordinates to world coordinates
function changeCoords(){
	//translate(height/2, width/2);
	let s = min(width, height) / 2;
	scale(s, -s);
}

function mouseWheel(event) {
	for(let i=0;i<controlPts.length;i++){
		controlPts[i].scroll(event.delta);
	}
}

function keyPressed() {
	// for(let i=0;i<controlPts.length;i++){
		
	// 	//if shift pressed, leave drag mode
	// 	if (keyCode === SHIFT){ 
	// 		controlPts[i].dragMode = false;
	// 	} 
			
	// }	

	if (key == 'h'){
		hidePoints=!hidePoints;
		reset();
	}

	if (keyCode === SHIFT){ 
		dragMode = false;
	}

		
}

function keyReleased() {
	if (keyCode === SHIFT){ 
		dragMode = true;
	}

}


function getShader(_renderer) {
	const vert = `
		precision highp float;
		attribute vec3 aPosition;
		attribute vec2 aTexCoord;
		varying vec2 vTexCoord;
		void main() {
			vTexCoord = aTexCoord;
			vec4 positionVec4=vec4(aPosition,1.);
			positionVec4.xy=positionVec4.xy*2.-1.; 
			gl_Position = positionVec4;
		}
	`;
	
	const frag = `
		precision highp float;
		varying vec2 vTexCoord;
		
		uniform vec3 charges[${num}];


		void main() {
			float x=vTexCoord.x*2.-1.;
			float y=vTexCoord.y*2.-1.;
			float v = 0.0;
			
			for (int i = 0; i < ${num}; i++) {
				vec3 charge = charges[i];
				float dx = charge.x - x;
				float dy = charge.y - y;
				float c = charge.z;
				v += c * log(dx * dx + dy * dy);
			}
			if (fract(v*1.)<0.1){
				gl_FragColor = vec4(1.,1.,1., 1.0);
			} else gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
		}
	`;

	return new p5.Shader(_renderer, vert, frag);
}