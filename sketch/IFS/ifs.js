let fractalDepth = 50; //set fractal depth
let ptsPerFrame = 10000;
let fractalPts=[];

const BKG = '#2c2621'; //background color
//const BKG = '#000000'; //background color
const FRG = '#e6cfb3'; //foreground color

const colors=['#519D30','#F197B3','#98200B',FRG,BKG]; //colors of points 
const colorRatio=0.2;  //controls whether the first block is colored, or if the colors mix more evenly



//Parent in file is "ifs_sketch"
let parent = "ifs_sketch";

//schedule a reset for the start of NEXT frame
let scheduleReset=false;
let hidePoints=false;
let dragMode=true;

function setup() {
	createCanvas(windowWidth, windowHeight);
	colorMode(RGB,100)
	
	
	fractalPts = [new Draggable(-0.75,-0.5),
				  new Draggable(0.75,-0.5),
				  new Draggable(0,-0.7990381056)];
	
	for(let i=0;i<fractalPts.length;i++){
		let pt=fractalPts[i]
		pt.angle=floor(random(0,PI/2)*8)/8-PI/4;
		pt.color=color(colors[i]);
		pt.magnitude=random(0.4,0.7);
	}
	
	background(BKG);
	
}

function draw() {
	push();
	changeCoords();

	let ptsPerThisFrame=ptsPerFrame;
	if(scheduleReset){
		background(BKG);
		scheduleReset=false;
		ptsPerThisFrame*=2;
	}
	
	let anyRollOver=false;
	for(i=0;i<fractalPts.length;i++){
		if(fractalPts[i].dragging || fractalPts[i].reparam || fractalPts[i].scrolling){
			reset();
		}
		if(fractalPts[i].rollover){
			anyRollOver=true;
		}
	}


	//only scroll if no points can be rolled over
	if(anyRollOver){ 
		disableScroll();
	} else {
		enableScroll();
	}



	
	if(scheduleReset){
		strokeWeight(0.005);
		ptsPerThisFrame=ptsPerThisFrame/5;
	} else {
		strokeWeight(0.001);
	}
	
	stroke(FRG);

	if(fractalPts.length>0){

		let randomFractalPt=fractalPts[floor(random(fractalPts.length))];
		let col = randomFractalPt.color;
		let pt=createVector(randomFractalPt.x,randomFractalPt.y);
		let control;
		for (j = 0; j < ptsPerThisFrame+fractalDepth; j++) {
			

			control=getRandomControl(fractalPts);
			pt=applyTransform(pt,control);

			if(j>fractalDepth){
				col=lerpColor(col, control.color, colorRatio);
				stroke(col);
				circle(-pt.x,-pt.y,0);
			}
					
		}
	}

	for(let i=0;i<fractalPts.length;i++){
		fractalPts[i].update();
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

//chooses one control point from the list, according to their area
function getRandomControl(controls){
	let totalArea=0;
	for(let i=0;i<controls.length;i++){
		totalArea+=pow(controls[i].magnitude,2);
	}
	let p=random(0,totalArea); //random value
	let control; 
	for(let i=0;i<controls.length;i++){
		p=p-pow(controls[i].magnitude,2);
		if(p<=0){
			control = controls[i];	
			break;
		}
	}

	return control;
}

//applies transform on pt assocaited to control point 
function applyTransform(pt,control){
	let s= control.magnitude;
	let a= control.angle;

	
	//apply matrix which rotates by angle a, scales by s, with fixed point of pt.

	//first translate control point to origin
	pt=affineTransform(pt,1,0,0,1,control.x,control.y); 

	//then apply scale
	pt=affineTransform(pt,s,0,0,s,0,0);
	
	//then rotate
	pt=affineTransform(pt,cos(a),-sin(a),
				sin(a),cos(a),0,0); 
	
	//then translate back to control point
	pt=affineTransform(pt,1,0,0,1,-control.x,-control.y);

	return pt;
}


//takes vector p, multiplies by matrix [[a,b],[c,d]], then adds [e,f]
function affineTransform(p,a,b,c,d,e,f){
	return createVector( a*p.x + b* p.y + e , c*p.x + d*p.y + f);
}


//every time i call reset, I say "didReset =true". I reverse this at the end of each draw. 
function reset(){
	//background(BKG);
	scheduleReset=true;
}


//go through and call the fractal points "pressed" function
function mousePressed() {
	for(let i=0;i<fractalPts.length;i++){
		fractalPts[i].pressed();
	}
}

//when mouse is released, make each draggable "released", and delete them if outside of screen.
function mouseReleased() {
	let newFractalPoints=[];
	for(let i=0;i<fractalPts.length;i++){
		fractalPts[i].released();
		//make list of zeros within bounds
		if(!fractalPts[i].isOutsideScreen()){
			newFractalPoints[newFractalPoints.length]=fractalPts[i]
		} else {
			reset(); //clear page if any left outside screen
		}
	}
	
	fractalPts=newFractalPoints;
	
}


function doubleClicked(){
	let mouse = getCoords(mouseX,mouseY);
	let doAddPoint=true;
	let newFractalPts=[];
	for(let i=0;i<fractalPts.length;i++){
		if(fractalPts[i].rollover){
			doAddPoint=false;
		} else {
			newFractalPts[newFractalPts.length]=fractalPts[i]; //delete double clicked points
		}
	} 
	fractalPts = newFractalPts;
	if(doAddPoint){
		let i=fractalPts.length;
		fractalPts[i]=new Draggable(mouse.x,mouse.y);
		fractalPts[i].color=getColor(i);
		
	}
}


// function getMouse(){
// 	return createVector(mouseX/height*2-1,mouseY/height*2-1)
// }

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
	for(let i=0;i<fractalPts.length;i++){
		fractalPts[i].scroll(event.delta);
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

//chooses a random color
//for more and more points, make the colors darker
function getColor(n){
	let colIndex=floor(random(0,colors.length));
	let lightness=floor(n/colors.length);


	return lerpColor(color(BKG) , color(colors[colIndex]),  pow(0.3,lightness) );
}
