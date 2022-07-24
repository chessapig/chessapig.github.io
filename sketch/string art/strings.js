
let N=1000;
let	NBorder=500;
let	pts=[];
let	doPoints=false;
let	randScaleBorder=3;
let randScaleDiffeo=3;
let	offsetScale=0;
let	multiplier=2;
let	phase=0;
let	mBorder=1;
let	phaseVelocity=0;
let	doBorder=true;
let	doHyperbolic=true;
let	diffeoParam=0.5;
let	ani=0.3;
let	aniVelocity=0;
let maxLines=3000;
let	NLines=1000;
let	NSlider=1;
	

let borderName="Epicycloid",
	diffeoName="mobius";


function setup() {
	canvas=createCanvas(windowWidth, windowHeight);
	canvas.mouseWheel(e => Controls.zoom(controls).worldZoom(e)); //Controls from libraries/zoom
	controls.enabled=false;
	colorMode(HSB, 100)
	
	NIters=1;
	NPoints=1000;


	//parameters for this program
	settings = QuickSettings.create((width+10)%windowWidth,10, "Diffeomorphism control")
		.addDropDown("Circle diffeo",["mobius","multiply","noise","logistic","cosine","Arnold Tounges"], function(value){diffeoName=value.value;})
		.addRange("diffeo multiplier",1,10,multiplier,1,function(value) {multiplier = value;})
		.addRange("diffeo parameter",0,1,diffeoParam,.001,function(value) {diffeoParam = value;})
		.addDropDown("Border shape",["Epicycloid","Random","Ellipse"], function(value){borderName=value.value;})
		.addRange("border modifier (integer)",1,10,mBorder,1,function(value) {mBorder = value;})
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
		.addBoolean("draw border?",doBorder,function(value) {doBorder = value;})
		.addBoolean("draw hyperbolic geodesics?",doHyperbolic,function(value) {doHyperbolic = value;})
		.addBoolean("pan and zoom?",false,function(value) {controls.enabled=value;});

	borderSettings = QuickSettings.create((width+430)%windowWidth,10, "Border control")
		.addDropDown("Border shape",["Epicycloid","Random","Ellipse"], function(value){borderName=value.value;})
		.addRange("Border perturbation strength",0,500,offsetScale,1,function(value) {offsetScale = value;})
		.addRange("border modifier (integer)",1,10,mBorder,1,function(value) {mBorder = value;})
		.addRange("Randomness scale",0,4,randScaleBorder,.001,function(value) {randScaleBorder = value;})
		.collapse();
}

function updatePtsAndITers(){
	NPoints = floor(pow(NLines,NSlider));
	NIters = floor(pow(NLines,1-NSlider));
	graphicsSettings.setValue("Number of points",NPoints);
	graphicsSettings.setValue("Number of iterations",NIters);
}


function draw() {
	blendMode(BLEND);
	background(0,20,10);
	blendMode(ADD);


	// let oldNIterVal=NIterSlider;
	// let oldNPointsVal=NPointSlider;
	// graphicsSettings.setValue("point_slider",oldNIterVal);
	// graphicsSettings.setValue("iter_slider",oldNPointsVal);
	
	push();
	translate(controls.view.x, controls.view.y);
	scale(controls.view.zoom);
	translate(width/2,height/2);
	

	//initialize points
	for(i=0;i<N;i++){
		pts[i]=border(i/N);
	}
		

	if(doBorder){
		push();
		stroke(255);
		strokeWeight(1);
		for(i=0;i<N;i++){
			if(i>0){
				line(pts[i-1].x,pts[i-1].y,pts[i].x,pts[i].y)
			} else {
				line(pts[0].x,pts[0].y,pts[N-1].x,pts[N-1].y)
			}
		}
		pop();
	}

	push();

	strokeWeight(100/(NLines));
	//NIters=floor(NLines/NPoints)+1;
	let x=0,
		xNew=0;
	for(i=0;i<NPoints;i++){

		x=i/NPoints;
		xNew=0;
		xNew=diffeo(x,diffeoName)
		//stroke(colorMap(xNew)); //When this is selected, colors each path consistantly

		for(iter=0;iter<NIters;iter++){
			xNew=diffeo(x,diffeoName)
			stroke(colorMap(xNew));

			pt=border(diffeo(x,diffeoName));
			endPt=border(diffeo(xNew,diffeoName));

			if(doHyperbolic){
				drawStringHyperbolic(pt,endPt); 
			} else {
				line(pt.x,pt.y,endPt.x,endPt.y);
			}

			x=xNew;
		}
	}



	// if(doSingleOrbit){
	// 	//strokeWeight(1);
	// 	let x=ani,
	// 		xNew=0;
	// 	for(i=0;i<N;i++){
	// 		xNew=diffeo(x,diffeoName)
	// 		stroke(colorMap(xNew));

	// 		pt=border(diffeo(x,diffeoName));
	// 		endPt=border(diffeo(xNew,diffeoName));

	// 		if(doHyperbolic){
	// 			drawStringHyperbolic(pt,endPt); 
	// 		} else {
	// 			line(pt.x,pt.y,endPt.x,endPt.y);
	// 		}

	// 		x=xNew;

	// 	}
	
	// } else {
		
	// 	for(i=0;i<N;i++){
	// 		stroke(colorMap(i/N));
	// 		endPt=border(diffeo(i/N,diffeoName));
			
	// 		if(doHyperbolic){
	// 			drawStringHyperbolic(pts[i],endPt); 
	// 		} else {
	// 			line(pts[i].x,pts[i].y,endPt.x,endPt.y);
	// 		}
	// 	}
	// }
	pop();
	

	phase=(phase+.01*phaseVelocity)%1;
	settings.setValue("phase",phase);
	ani=(ani+.012345*aniVelocity)%1;
	
  }




  //parametrically define a path, based off parameter x in [0,1]
  function border(x){
	let offset=createVector(0,0);
	let R=250;
	switch(borderName){
		case "Epicycloid":
			offset=createVector(cos(2*PI*x*(mBorder+1)),sin(2*PI*x*(mBorder+1)));
			offset.y-=1/(mBorder+1); //recorrect to keep it centered
			R-=offsetScale;
			break;
		case "Random":
			offset=createVector(noise(randScaleBorder*x)+noise(randScaleBorder*(1-x))-1,noise(randScaleBorder*x+5)+noise(randScaleBorder*(1-x)+5)-1);
			break;
		case "Ellipse":
			offset=createVector(cos(2*PI*x),0);
			break;
	}

	offset.mult(offsetScale);
	
	
	let circle=createVector(cos(2*PI*x),sin(2*PI*x)).mult(R);
	
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
		let a=1, b=1, c=1, d=diffeoParam; 
		return mobius(x,a,b,c,d);
	case "Arnold Tounges":
		return (x+phase+diffeoParam*sin(x*2*PI*multiplier));
	default:
		return 1*x;
}

}

function mobius(x,a,b,c,d){
	let vec=createVector(cos(x*2*PI),sin(x*2*PI));
	vec=createVector(a*vec.x+b*vec.y,c*vec.x+d*vec.y); //matrix multiply, since i cant do that in p5js for some reason
	return mod(atan2(vec.y,vec.x)/(2*PI));  //renormalize to 0,1

}

function mod(x){
	return (x%1+1)%1;
}

function periodicNoise(x,r=1,seed=0){
	return noise(r*cos(x*2*PI)+seed,r*sin(x*2*PI));
}
  
  
  function colorMap(x){
	return color(x*100,70,90);
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
			settings.toggleVisibility();
			break;
  }  
}

