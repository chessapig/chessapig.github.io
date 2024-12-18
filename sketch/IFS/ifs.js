let fractalDepth = 50; //set fractal depth
let ptsPerFrame = 10000;
let fractalPts=[];

let BKG = '#2c2621'; //background color
let FRG = '#e6cfb3'; //foreground color



//Parent in file is "ifs_sketch"
let parent = "ifs_sketch";

//schedule a reset for the start of NEXT frame
let scheduleReset=false;

function setup() {
	createCanvas(windowWidth, windowHeight);
	colorMode(HSL,100)
	
	//fractalPts = [createVector(1,0),createVector(0,1),createVector(0,0),createVector(0,0.5)];
	fractalPts = [new Draggable(-0.75,+0.5),
								new Draggable(0.75,+0.5),
								new Draggable(0,-0.7990381056)];
	
	background(BKG);
	
}

function draw() {
	scale(height / 2, height / 2);
	translate(1, 1);

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

			//pt=applyIFS(pt,fractalPts);
			if(j>fractalDepth){
				col=lerpColor(col, control.color, 0.2);
				stroke(col);
				circle(-pt.x,-pt.y,0);
			}
					
		}
	}

	for(let i=0;i<fractalPts.length;i++){
		fractalPts[i].update();
	}
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

//applies a random function from controls to a point pt
function applyIFS(pt,controls){
	if (controls.length != 0){//if i endterd no points, do nothing
		
		//choose random transform
		//pick proportional to area, which is magnitude squared. 
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
}

//takes vector p, multiplies by matrix [[a,b],[c,d]], then adds [e,f]
function affineTransform(p,a,b,c,d,e,f){
	return createVector( a*p.x + b* p.y + e , c*p.x + d*p.y + f);
}


//every time i call reset, I say "didReset =true". I reverse this at the end of each draw. 
function reset(){
	background(BKG);
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
	let mouse = getMouse();
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
		fractalPts[fractalPts.length]=new Draggable(mouse.x,mouse.y)
	}
}


function getMouse(){
	return createVector(mouseX/height*2-1,mouseY/height*2-1)
}

function mouseWheel(event) {
	for(let i=0;i<fractalPts.length;i++){
		fractalPts[i].scroll(event.delta);
	}
}

function keyPressed() {
	for(let i=0;i<fractalPts.length;i++){
		
		//if space pressed, leave drag mode
			if (key == ' '){ 
				fractalPts[i].dragMode = false;
			}
			
		}	
 
}

function keyReleased() {
	for(let i=0;i<fractalPts.length;i++){
		
		//if space released, enter drag mode
			if (key == ' '){ 
				fractalPts[i].dragMode = true;
			}
			
		}	
 
}


//takes in a uniform distrabution on R and returns the radial distrabution of a gaussian
function radialDist(x){
	return pow(x,1.3);
}

