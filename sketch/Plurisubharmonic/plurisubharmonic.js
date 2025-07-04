
let pts=[];

const BKG = '#2c2621'; //background color
//const BKG = '#000000'; //background color
const FRG = '#e6cfb3'; //foreground color



//Parent in file is "ifs_sketch"
let parent = "ifs_sketch";

let hidePoints=false;
let dragMode=true;

function setup() {
	createCanvas(windowWidth, windowHeight);
	colorMode(RGB,100)
	
	
	pts = [new Draggable(-0.75,-0.5),
				  new Draggable(0.75,-0.5),
				  new Draggable(0,-0.7990381056)];
	
	for(let i=0;i<pts.length;i++){
		let pt=pts[i]
		pt.angle=floor(random(0,PI/2)*8)/8-PI/4;
		pt.color=color(FRG);
		pt.magnitude=random(0.4,0.7);
	}
	
	background(BKG);
	
}

function draw() {
	push();
	changeCoords();

	background(BKG);

	let anyRollOver=false;
	for(i=0;i<pts.length;i++){
		if(pts[i].rollover){
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

	

	for(let i=0;i<pts.length;i++){
		pts[i].update();
	}

	pop();

	//draw border
	noFill();
	if(dragMode){
		stroke(FRG);
	} else {
		stroke(colors[1]);
	}
	strokeWeight(10);
	rect(0,0,width,height);
}



//go through and call the fractal points "pressed" function
function mousePressed() {
	for(let i=0;i<pts.length;i++){
		pts[i].pressed();
	}
}

//when mouse is released, make each draggable "released", and delete them if outside of screen.
function mouseReleased() {
	let newFractalPoints=[];
	for(let i=0;i<pts.length;i++){
		pts[i].released();
		//make list of zeros within bounds
		if(!pts[i].isOutsideScreen()){
			newFractalPoints[newFractalPoints.length]=pts[i]
		} 
	}
	
	pts=newFractalPoints;
	
}


function doubleClicked(){
	let mouse = getCoords(mouseX,mouseY);
	let doAddPoint=true;
	let newFractalPts=[];
	for(let i=0;i<pts.length;i++){
		if(pts[i].rollover){
			doAddPoint=false;
		} else {
			newFractalPts[newFractalPts.length]=pts[i]; //delete double clicked points
		}
	} 
	pts = newFractalPts;
	if(doAddPoint){
		let i=pts.length;
		pts[i]=new Draggable(mouse.x,mouse.y);
		pts[i].color=color(FRG);
		
	}
}



//takes in  x,y of screen coordinates, and returns vector of world coordinates
function getCoords(x,y){
	//first translate 0,0 to center	 of screen
	let newX = x-height/2;
	let newY = y-width/2;

	//next scale so that the height is 1
	newX=newX/(height/2);
	newY=newY/(height/2);

	return createVector(newX,newY);
}

//changes coordinates from screen coordinates to world coordinates
function changeCoords(){
	translate(height/2, width/2);
	scale(height / 2, height / 2);
}

function mouseWheel(event) {
	for(let i=0;i<pts.length;i++){
		pts[i].scroll(event.delta);
	}
}

function keyPressed() {
	// for(let i=0;i<fractalPts.length;i++){
		
	// 	//if shift pressed, leave drag mode
	// 	if (keyCode === SHIFT){ 
	// 		fractalPts[i].dragMode = false;
	// 	} 
			
	// }	

	if (key == 'h'){
		hidePoints=!hidePoints;

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
