
var N=1000;
var	NBorder=500;
var	pts=[];
var	doPoints=false;
var	randScaleBorder=3;
var randScaleDiffeo=3;
var	offsetScale=0;
var	multiplier=2;
var	phase=0;
var	mBorder=1;
var	phaseVelocity=0;
var	doBorder=true,
	doHyperbolic=false,
	doRandomize=true,
	doAccumulate=false;
	doAddLines=false;
var	diffeoParam=0.5;
var	ani=0.3;
var	aniVelocity=0;
var maxLines=3000;
var	NLines=1000;
var	NSlider=1;
var lineDiamModifier=10;

const radius=250; //radius of starting circle

var [mobiusA,mobiusB,mobiusC,mobiusD] = [0.1,0,0,0.1],
	doTanScaleMobius=true;
	

var borderName="Epicycloid",
	diffeoName="test";

var diffeoSettings,
	graphicsSettings,
	borderSettings,
	mobiusSettings;


function setup() {
	canvas=createCanvas(windowWidth, windowHeight,P2D);
	canvas.mouseWheel(e => Controls.zoom(controls).worldZoom(e)); //Controls from libraries/zoom
	controls.enabled=false;
	colorMode(HSB, 100)
	smooth();
	
	NIters=1;
	NPoints=1000;


	//parameters for this program
	diffeoSettings = QuickSettings.create((width+10)%windowWidth,10, "Diffeomorphism control")
		.addDropDown("Circle diffeo",["test","mobius+square","mobius","multiply","noise","logistic","cosine","Arnold Tounges","zero"], function(value){
			diffeoName=value.value;
			if(diffeoName=="mobius" || diffeoName == "mobius+square"){
				mobiusSettings.show();
			} else {
				mobiusSettings.hide();
			}
		})
		.addRange("diffeo multiplier",1,10,multiplier,1,function(value) {multiplier = value;})
		.addRange("diffeo parameter",0,1,diffeoParam,.001,function(value) {diffeoParam = value;})
		//.addDropDown("Border shape",["Epicycloid","Random","Ellipse"], function(value){borderName=value.value;})
		//.addRange("border modifier (integer)",1,10,mBorder,1,function(value) {mBorder = value;})
		.addRange("Randomness scale",0,4,randScaleDiffeo,.001,function(value) {randScaleDiffeo = value;})
		.addRange("phase",0,1,phase,.01,function(value) {phase = value;})
		.addRange("Velocity of phase change",0,1,phaseVelocity,.01,function(value) {phaseVelocity = value;})
		.addRange("Velocity of animated parameter",0,1,aniVelocity,.01,function(value) {aniVelocity = value;})
		//.addRange("Number of iterations",1,200,NIters,1,function(value) {NIters = value;})
		

	

	graphicsSettings = QuickSettings.create((width+220)%windowWidth,10, "Graphics")
		.addRange("Number of lines",20,maxLines,NLines,1,function(value) {
			NLines = value;
			updatePtsAndITers();
		})
		.addRange("point_slider",0,1,NSlider,.001,function(value) {
			NSlider=value;
			updatePtsAndITers();
			
		}).hideTitle("point_slider")
		.addHTML("Number of points",NPoints)
		.addHTML("Number of iterations",NIters)
		.addBoolean("Sample randomly?",doRandomize,function(value){doRandomize=value;})
		.addBoolean("draw border?",doBorder,function(value) {doBorder = value;})
		.addBoolean("draw hyperbolic geodesics?",doHyperbolic,function(value) {doHyperbolic = value;})
		.addBoolean("pan and zoom?",false,function(value) {controls.enabled=value;})
		.addBoolean("accumulate (press space)",false, function(value){
			doAccumulate=value;
			graphicsSettings.setValue("pan and zoom?",false);
		})

	borderSettings = QuickSettings.create((width+430)%windowWidth,10, "Border control")
		.addDropDown("Border shape",["Epicycloid","Random","Ellipse"], function(value){borderName=value.value;})
		.addRange("Border perturbation strength",0,radius,offsetScale,1,function(value) {offsetScale = value;})
		.addRange("border modifier (integer)",1,10,mBorder,1,function(value) {mBorder = value;})
		.addRange("Randomness scale",0,4,randScaleBorder,.001,function(value) {randScaleBorder = value;})
		.collapse();

	mobiusSettings = QuickSettings.create((width+640)%windowWidth,10, "Mobius settings")
		.addHTML("Mobius transforms","mobius transform is f(x)=(ax+b)/(cx+d). If you check the box below, The sliders are maps from -infinity to infinity.")
		.addBoolean("Use full scale?",doTanScaleMobius,function(value){
			doTanScaleMobius=value;
			mobiusSettings.setValue("a",1);
		})
		.addRange("a",-2,2,mobiusA,.01,function(value) {
			if(doTanScaleMobius){
				mobiusA = tan(value/2*PI/2);
			} else {
				mobiusA = value
			}
		})
		.addRange("b",-2,2,mobiusB,.01,function(value) {
			if(doTanScaleMobius){
				mobiusB = tan(value/2*PI/2);
			} else {
				mobiusB = value
			}
		})
		.addRange("c",-2,2,mobiusC,.01,function(value) {
			if(doTanScaleMobius){
				mobiusC = tan(value/2*PI/2);
			} else {
				mobiusC = value
			}
		})
		.addRange("d",-2,2,mobiusD,.01,function(value) {
			if(doTanScaleMobius){
				mobiusD = tan(value/2*PI/2);
			} else {
				mobiusD = value
			}
		})
		//.hide();

	
	settings = [diffeoSettings,graphicsSettings,borderSettings,mobiusSettings];

	// randomSettings = QuickSettings.create((width+640)%windowWidth,10, "Random diffeomorphism settings")
	// .addHTML("Applies a diffeomorphism derived from periodic perlin noise")
	// .hide();
}

function updatePtsAndITers(){
	NPoints = floor(pow(NLines,NSlider));
	NIters = floor(pow(NLines,1-NSlider));
	graphicsSettings.setValue("Number of points",NPoints);
	graphicsSettings.setValue("Number of iterations",NIters);
}




function draw() {
	window.mousePressed = e => Controls.move(controls).mousePressed(e)
	window.mouseMoved = e => Controls.move(controls).mouseMoved(e);
	window.mouseReleased = e => Controls.move(controls).mouseReleased(e)
	window.mouseWheel = e => Controls.zoom(controls).worldZoom(e)

	if(!doAccumulate){
		blendMode(BLEND);
		background('#2c2621');
	}
	blendMode(ADD);


	// let oldNIterVal=NIterSlider;
	// let oldNPointsVal=NPointSlider;
	// graphicsSettings.setValue("point_slider",oldNIterVal);
	// graphicsSettings.setValue("iter_slider",oldNPointsVal);
	
	push();
	translate(controls.view.x, controls.view.y);
	scale(controls.view.zoom);
	translate(width/2,height/2);
	
	if(doAccumulate){
		strokeWeight(100/(NLines)/20);
	} else if(!doAccumulate){
		strokeWeight(100/(NLines)*lineDiamModifier);		
	
		//initialize points
		for(i=0;i<N;i++){
			pts[i]=border(i/N);
		}
			

		//Draw the border circle, by going around the outside points
		if(doBorder){ 
			drawBorder();
			if(diffeoName=="mobius"){
				//drawTransformedCircle(mobiusA,mobiusB,mobiusC,mobiusD);
			}
		}
	}

	push();

	//strokeWeight(100/(NLines));
	//NIters=floor(NLines/NPoints)+1;
	let x=0,
		xNew=0;
	for(i=0;i<NPoints;i++){


		if(doAccumulate && doAddLines){
			x=random();
		} else if(!doAccumulate && doRandomize){
			x=rand(i); //lil deterministic pseudorandom function
		} else if (!doRandomize){
			x=i/NPoints;
		}
		
		xNew=0;
		//xNew=diffeo(x,diffeoName)
		//stroke(colorMap(xNew)); //When this is selected, colors each path consistantly

		for(iter=0;iter<NIters;iter++){
			xNew=diffeo(x,diffeoName)
			stroke(colorMap(x)); //Color by the starting point location

			pt=border(x);
			endPt=border(xNew);

			if(doHyperbolic){
				drawStringHyperbolic(pt,endPt); 
			} else {
				line(pt.x,pt.y,endPt.x,endPt.y);
			}

			x=xNew;
		}
	}
	

	pop();
	

	phase=(phase+.01*phaseVelocity)%1;
	diffeoSettings.setValue("phase",phase);
	ani=(ani+.012345*aniVelocity)%1;
	
  }

function drawBorder(){
	push();

	strokeWeight(lineDiamModifier);

	//start with rainbow circle
	for(i=0;i<N;i++){
		stroke(colorMap(i/N));
		if(i>0){
			line(pts[i-1].x,pts[i-1].y,pts[i].x,pts[i].y)
		} else {
			line(pts[0].x,pts[0].y,pts[N-1].x,pts[N-1].y)
		}
	}

	//lighten it a little bit
	// stroke(100,10);
	// strokeWeight(1);
	// for(i=0;i<N;i++){
		
	// 	if(i>0){
	// 		line(pts[i-1].x,pts[i-1].y,pts[i].x,pts[i].y)
	// 	} else {
	// 		line(pts[0].x,pts[0].y,pts[N-1].x,pts[N-1].y)
	// 	}
	// }
	pop();
}



  //parametrically define a path, based off parameter x in [0,1]
function border(x){

	let offset=createVector(0,0),
		thisRad=radius;
	switch(borderName){
		case "Epicycloid":
			offset=createVector(cos(2*PI*x*(mBorder+1)),sin(2*PI*x*(mBorder+1)));
			offset.y-=1/(mBorder+1); //recorrect to keep it centered
			thisRad-=offsetScale;
			break;
		case "Random":
			offset=createVector(noise(randScaleBorder*x)+noise(randScaleBorder*(1-x))-1,noise(randScaleBorder*x+5)+noise(randScaleBorder*(1-x)+5)-1);
			break;
		case "Ellipse":
			offset=createVector(cos(2*PI*x),0);
			break;
	}

	offset.mult(offsetScale);
	
	let circle=createVector(cos(2*PI*(x)),sin(2*PI*(x))).mult(radius);
	return circle.add(offset);
}
  

function diffeo(x){
switch(diffeoName){
	case "multiply":
		return (x*multiplier+phase)%1;
	case "noise":
		return (phase+x+periodicNoise(x,randScaleDiffeo/5,10)*3*diffeoParam)%1;
		//return noise(rDensity*(x+phase)+10)+noise(rDensity*(1-(x+phase))+10)-1;
	case "logistic":
		return ((3+diffeoParam)*x*(1-x))%1;
	case "cosine":
		return (cos((x+phase*2)*PI*multiplier)+1)/2;
	case "mobius": //construct a real mobius transform
		return mobius(x,mobiusA,mobiusB,mobiusC,mobiusD);
	case "Arnold Tounges":
		return (x+phase+diffeoParam*sin(x*2*PI*multiplier));
	case "zero":
		return diffeoParam;
	case "mobius+square":
		for(let j=0;j<multiplier;j++){
			x=fract(2*(x+phase));
			x=mobius(x,mobiusA,mobiusB,mobiusC,mobiusD);
			
		}
		// x=mobius(x,mobiusA,mobiusB,mobiusC,mobiusD);
		// x=fract(2*x);
		return x;
	case "test":
		return fract(exp(5*x+3));
	default:
		return 1*x;
}

}

function mobius(x,a,b,c,d){
	let vec=createVector(cos(x*PI),sin(x*PI));  //ONLY PI around, as to not double count RP1

	let T=SL2Exponential(a,b,c); //Construct transformation matrix
	T=[[a,b],[c,d]];
	vec=createVector(T[0][0]*vec.x+T[1][0]*vec.y,T[0][1]*vec.x+T[1][1]*vec.y); //matrix multiply, since i cant do that in p5js for some reason
	
	return fract(atan2(vec.y,vec.x)/(PI)) ;  //renormalize to 0,1
	//to compinsate for the the dividing by two in the first angle, we need to multiply x by 2 here. Hence, it only really goes from 0,.5
}

function drawTransformedCircle(a,b,c,d){
	let T=SL2Exponential(a,b,c); 
	T=[[a,b],[c,d]];
	push();
	applyMatrix(T[0][0],T[1][0],T[0][1],T[1][1],0,0); //Note: Very confusing order, c before b
	drawBorder();
	pop();
}




//Outputs a 2 by 2 matrix given by the matrix exponential of an element of the lie algebra. Specifically,
//A = [[ 1  ,  0 ]
//     [ 0  ,  -1] ]  This squashes the circle
//
//B = [[ 0  ,  1 ]
//     [ 0 ,  0 ] ]   
//
//C = [[ 0  ,  0 ]
//     [ 1  ,  0 ]  
// exp( [[a,b],[c,-a]])
//taken from http://dsbaero.engin.umich.edu/wp-content/uploads/sites/441/2019/06/ExponentialExplicitSoTAC1993.pdf
function SL2Exponential(a,b,c){
	
	//Encode the basis above
	// let a=A;
	// let b=C+B;
	// let c=C-B; 

	let det = (a**2+b*c);
	let delta=sqrt(abs(det));
	if(det>=0){
		return [[cosh(delta)+a*sinh(delta)/delta,
				b*sinh(delta)/delta],
				[c*sinh(delta)/delta,
				cosh(delta)-a*sinh(delta)/delta]];
	} else {
		return [[cos(delta)+a*sin(delta)/delta,
			b*sin(delta)/delta],
			[c*sin(delta)/delta,
			cos(delta)-a*sin(delta)/delta]];
	}
}

function sinh(x){
	return (exp(x)-exp(-x))/2
}
function cosh(x){
	return (exp(x)+exp(-x))/2
}



function fract(x){
	return (x%1+1)%1;
}

//deterministic random number generator
function rand(seed){
	return fract(sin(seed*78.233) * 43758.5453);
}

function periodicNoise(x,r=1,seed=0){
	return noise(r*cos(x*2*PI)+seed,r*sin(x*2*PI));
}
  
  
  function colorMap(x){
	return color(x*100,70,90,200/lineDiamModifier);
  }


//take in 2 points, and draw a line between them
function drawStringEuclidean(v1,v2){
	line(v1.x,v1.y,v2.x,v2.y);
}

//take in 2 points on the boundary of a circle, and the center of the circle, and 
//draw the hyperbolic geodesic in the poincare model
//(assume circle centered at 0,0)
function drawStringHyperbolic(v1,v2){
	//calculate the coordinates
	let theta = abs(v1.angleBetween(v2)/2);
	let r0=sqrt(v1.mag()*v2.mag()); //our guess for radius of the circle
	let r1 =  r0*tan(theta); //radius of new circle
	let c = v1.copy().add(v2).normalize().mult(sqrt(r0**2+r1**2));//center of new circle

	//draw it now
	push();
	noFill();
	//if(r1>10000){line(v1.x,v1.y,v2.x,v2.y);}
	circle(c.x,c.y,r1*2); //DIAMETER, not radius
	pop();
}


function testHyperbolic(){
	blendMode(BLEND);
	background(0);
	strokeWeight(1);
	let R=200;
	circle(0,0,2*R); //DIAMETER, not radius grrr
	v1=createVector(R,0).rotate(random()*2*PI);
	v2=createVector(R,0).rotate(random()*2*PI);
	drawStringHyperbolic(v1,v2);
	
	
	noLoop();
  }


function windowResized() {
	resizeCanvas(windowWidth, windowHeight)
   }

//togge gui visibility
function keyPressed(){
	switch(key) {
		case 'h':
			for(i=0;i<settings.length;i++){
				settings[i].toggleVisibility();
			}
			
			break;
		
		case ' ':
			doAddLines=true;
			break;
  }  
}

function keyReleased(){
	switch(key) {
		
		case ' ':
			doAddLines=false;
			break;
  }  
}

doAddLines
