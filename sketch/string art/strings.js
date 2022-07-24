
let N=1000,
	NBorder=500;
	pts=[],
	doPoints=false,
	rDensity=3,
	offsetScale=0,
	multiplier=2,
	phase=0,
	mBorder=1,
	phaseVelocity=0,
	doBorder=true,
	doHyperbolic=true,
	doSingleOrbit=false;
	diffeoParam=0.5,
	ani=0.3,
	aniVelocity=0; //animated variable
	

let borderName="Epicycloid",
	diffeoName="multiply";


function setup() {
	canvas=createCanvas(windowWidth, windowHeight);
	canvas.mouseWheel(e => Controls.zoom(controls).worldZoom(e)); //Controls from libraries/zoom
	controls.enabled=false;
	colorMode(HSB, 100)


	//parameters for this program
	settings = QuickSettings.create((width+10)%windowWidth,10, "Parameters")
		.addDropDown("Circle diffeo",["multiply","noise","logistic","cosine"], function(value){diffeoName=value.value;})
		.addRange("diffeo multiplier",1,10,multiplier,1,function(value) {multiplier = value;})
		.addRange("diffeo parameter",0,1,diffeoParam,.001,function(value) {diffeoParam = value;})
		.addDropDown("Border shape",["Epicycloid","Random","Ellipse"], function(value){borderName=value.value;})
		.addRange("Border perturbation strength",0,500,offsetScale,1,function(value) {offsetScale = value;})
		.addRange("border modifier (integer)",1,10,mBorder,1,function(value) {mBorder = value;})
		.addRange("Randomness scale",0,4,rDensity,.001,function(value) {rDensity = value;})
		.addRange("phase",0,1,phase,.01,function(value) {phase = value;})
		.addRange("Velocity of phase change",0,1,phaseVelocity,.01,function(value) {phaseVelocity = value;})
		.addRange("Velocity of animated parameter",0,1,aniVelocity,.01,function(value) {aniVelocity = value;})
		.addRange("Number of lines",20,3000,N,1,function(value) {N = value;})
		.addBoolean("draw border?",doBorder,function(value) {doBorder = value;})
		.addBoolean("draw hyperbolic geodesics?",doHyperbolic,function(value) {doHyperbolic = value;})
		.addBoolean("single orbit",doSingleOrbit,function(value) {doSingleOrbit = value;})
		.addBoolean("pan and zoom?",false,function(value) {controls.enabled=value;})

}



function draw() {
	blendMode(BLEND);
	background(0,20,10);
	blendMode(ADD);
	
	push();
	translate(controls.view.x, controls.view.y);
	scale(controls.view.zoom);
	translate(width/2,height/2);
	strokeWeight(100/N);
	

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
	if(doSingleOrbit){
		//strokeWeight(1);
		let x=ani,
			xNew=0;
		for(i=0;i<N;i++){
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
	
	} else {
		
		for(i=0;i<N;i++){
			stroke(colorMap(i/N));
			endPt=border(diffeo(i/N,diffeoName));
			
			if(doHyperbolic){
				drawStringHyperbolic(pts[i],endPt); 
			} else {
				line(pts[i].x,pts[i].y,endPt.x,endPt.y);
			}
		}
	}
	pop();
	

	//phase=(time()*phaseVelocity)%1;
	phase=(phase+.01*phaseVelocity)%1;
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
			offset=createVector(noise(rDensity*x)+noise(rDensity*(1-x))-1,noise(rDensity*x+5)+noise(rDensity*(1-x)+5)-1);
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
		return (phase+x+periodicNoise(x,rDensity/5,10)*3)%1;
		//return noise(rDensity*(x+phase)+10)+noise(rDensity*(1-(x+phase))+10)-1;
	case "logistic":
		return ((3+diffeoParam)*x*(1-x))%1;
	case "cosine":
		return (cos((x+phase*2)*PI*multiplier)+1)/2;
	default:
		return 1*x;
}

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

