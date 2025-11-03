let t;
let critPoints=[];
let zeros=[];
let randZeros=[];
let error=0.01;
let numPtsPlotFlowLines=2;
let degree=5;
let margin=2; //how much larger,precentagly, do we do calculations?

let k=5;
let kSlider;
let kValue;

let parent = "biran_sketch";
const BKG = '#2c2621'; //background color
const FRG = '#e6cfb3'; //foreground color
const zeroCol = '#59a855ff';
const critCol = '#b94a52ff';
const levelCol = '#827464ff'

let max=0;

function setup() {
	let elem = document.getElementById(parent);
	boundingRect = elem.getBoundingClientRect()
    let size = min(boundingRect.width, boundingRect.height); // square
	canvas=createCanvas(size,size);
    canvas.parent('biran_sketch');
	background(BKG);
	t=0;

    kValue = createSpan("k=10");
    kValue.parent('slider-wrap');
    kValue.style('width', '3em')
    kValue.style('font-size', '24px'); // 👈 make font larger
	
    kSlider = createSlider(1, 5, log(k)/log(2), 0.1);
    kSlider.parent('slider-wrap')
    kSlider.size(width/2);


	//noLoop();
	
	for(let i=0;i<degree;i++){
		zeros[i]=new Draggable(random(-1,1),random(-1,1));
        zeros[i].col=zeroCol;
	}
	
	
}

function draw() {
	
	let startTime = millis();
	
	background(BKG);
	scale(width/2,width/2);
	translate(1,1)
	scale(1,-1);

    k = pow(kSlider.value(),2);
    kValue.html("k= "+nf(pow(2,kSlider.value()), 1, 0)); // format to 1 decimal place

	

	critPoints=findCriticalPoints(critPoints);

	//place for optimization
	
    max = drawLevelSetsRho(max); 
    
	//noStroke();
	stroke(FRG);
	strokeWeight(0.02); 
	drawFlowLines();
	
	
	// stroke(FRG);
	// strokeWeight(0.03);
	// drawFlowLines();
	
	//draw reverse lines
	// stroke(133, 58, 162);
	// strokeWeight(0.005); 
	// drawFlowLines(-1);


	//plot decorative traces
    let traceCol=color(FRG);
    traceCol.setAlpha(255);
	stroke(traceCol);
	strokeWeight(0.001);
	//blendMode(MULTIPLY);
	let numDecorativeTraces=500;
	let res=2/sqrt(numDecorativeTraces);
	for(let i=-1;i<1;i+=res){
		for(let j=-1;j<1;j+=res){
			drawTrace(createVector(i+sin(100*i+200*j+3)*res,j+sin(40*i+600*j+10)*res),0.5)
		}
	}
	
	//plot critical points
	stroke(critCol);
	strokeWeight(0.05);
	for(let n=0;n<critPoints.length;n++){
		point(critPoints[n].x,critPoints[n].y)
	}
	
	
	

	for(let z of zeros){
		z.over();
		z.update();
		z.show();
	}
	
	//draw border
	noFill();
    stroke(FRG);
	strokeWeight(0.05);
	rect(-1,-1,2,2);


}

//choose function to be the norm squared of a complex polynomial
function rho(p){
    let poly=createVector(1,0); //this is our complex polynominal
    for(let i=0;i<zeros.length;i++){
    //multiply current polnyomomial by p-z for zero z.
    poly=complexMult(poly,createVector(p.x-zeros[i].x,p.y-zeros[i].y));
    }


    //let k= zoom*zeros.length * 1.5;//set the area of the symplectic form / the prequantum line bundle
    //return the norm squared, with the hermitian metric of P1
    //let metric = pow(1+p.magSq(),-k); // P^1 in affine chart
    let metric=0;
    if(k*p.magSq()<20){
        metric = exp(-k*p.magSq()); // C
    }
	//return poly.magSq()*metric;
	
	return log(poly.magSq()) - k * p.magSq();
	//return -k*p.magSq();
	//return exp(p)
}

//if flowDirection=-1, flow backwardss
function drawFlowLines(flowDirection=1){
	//plot stable manifolds
	//draw flowlines for reverse gradient flow, for a collection of points around the crticial poitns
	let numPlotPts=numPtsPlotFlowLines; 
	//plot up to 50 critical points. Need to do thsi because we add critical points during the loop.
	let maxCritPts=50;
	for(let n=0;n<maxCritPts;n++){
		if(n<critPoints.length){ //only draw point if well define
			if(!isLocalMax(critPoints[n])){ //only draw trace if it is a saddle point
				let v = getStableAxis(critPoints[n]); // get stable direction
				v.mult(error); //scale it to be length error
				if(flowDirection<0){
					v.rotate(PI/2); //rotate by pi/2 to get unstable direction, if we flow backwards.
				}
				for(let i=0;i<2;i++){
					let endFlow = drawTrace(
						critPoints[n].copy().add(v.rotate(PI*i)),
						flowDirection*200); //keep flowing until you hit the critical point, i dont care how long it takes
					
					addCritPoint(endFlow,critPoints);
				}
			} 
		}
	}
}

//takes in vector, and draws trace starting at that vector
//return endpoint of the trace
function drawTrace(p,time=1){
	let flowReverse=1;// negative means "do reverse flow"
	if(time<0){ //reverse flow if we input negative times
		time = abs(time);
		flowReverse = -1;
	}
	let oldP;
	let dt=0.1;  
	for(let t=0;t<time;t=t+dt){
		oldP=p.copy();
		let v=gradRho(p);
		if(v.mag()<error){ break;} //if we reach a crical point, stop flowing!
		
		if(v.mag()>0.5/error){ break;} //if the magniture explodes, stop flowing!
		
		if(abs(p.x)>margin || abs(p.y)>margin){ break;} //if we leave the screen, stop flowing!
		
		
		 p.add(v.mult(flowReverse*dt*0.1/sqrt(v.mag()))); //good for getting flowlines without too many steps, but its unstable
		
		//Interpolates between vector of magnitude sqrt(v) for small v (good for making it converge faster), and 1/v for large v (good for stability)
		 //p.add(v.mult(flowReverse*dt * (0.1) / ((sqrt(v.mag())* pow(1+v.magSq()/10,1/2))) )); //set step size according to the value of rho. Closer to the zeros, smaller step size.
		line(oldP.x,oldP.y,p.x,p.y);
	}
	return p;
}


function drawLevelSetsRho(max){
	let resolution=0.01;
	
	let newMax=-100;
	let delta=0.1;
	
	lightColor=color(BKG);
	darkColor=color(levelCol);
	
	strokeWeight(2*resolution);
	let f;
	for(let i=-1;i<1;i+=resolution){
		for(let j=-1;j<1;j+=resolution){
			f=rho(createVector(i,j));
			if(f>newMax){
				newMax=f;
			}
			
			if(max-f < 1){
				stroke(lerpColor(lightColor,darkColor,max-f))
				point(i,j);
			}
			// else if((max-f)%1<delta ){
            //     darkColor.setAlpha(pow(constrain((8-(max-f))/8,0,1),2)*255);
            //     stroke(darkColor,10)
			// 	//stroke(darkColor,pow(constrain((8-(max-f))/8,0,1),2)*255);
			// 	point(i,j);
            //     darkColor.setAlpha(255)
			// }
			
		}
	}
	
	return newMax
}



function gradRho(p){
	let d = 0.001;
	
	let delx = ( rho(p5.Vector.add(p,[d,0])) - rho(p5.Vector.add(p,[-d,0])) )/(2*d);
	let dely = ( rho(p5.Vector.add(p,[0,d]))  - rho(p5.Vector.add(p,[0,-d])) )/(2*d);
	
	// if(rho(p)< -100){
	// 	return createVector(0,0);
	// }
	
	return createVector(delx,dely);
}

//returns the second partials [[xx,xy,yy]] at point p
function secondPartialRho(p){
	let d = 0.001;
	
	let delxx = ( rho(p5.Vector.add(p,[d,0])) - 2*rho(p) + rho(p5.Vector.add(p,[-d,0])) )/(d*d);
	let delyy = ( rho(p5.Vector.add(p,[0,d])) - 2*rho(p) + rho(p5.Vector.add(p,[0,-d])) )/(d*d);
	let delxy = ( rho(p5.Vector.add(p,[d,d])) - rho(p5.Vector.add(p,[-d,d])) -
							  rho(p5.Vector.add(p,[d,-d]))+ rho(p5.Vector.add(p,[-d,-d])) )/(d*d);
	
	return [delxx,delxy,delyy];
}


//apply second partial derivative test.
function isLocalMax(p){
	if(gradRho(p).mag()>error){
		return false
	}
	
	let partials=secondPartialRho(p);
	let xx = partials[0];
	let xy = partials[1];
	let yy = partials[2];
	if(xx*yy-xy*xy>0){
		if(xx<0){
			return true; 
		}
	}
	return false;
}

//Computes e.vec of the hessian with largest eignevalue
//stolen from wolfram alpha

//I dont think this is right (it looks rotated slightly), but ah well
function getStableAxis(p){
	let partials=secondPartialRho(p);
	let a = partials[0];
	let b = partials[1];
	let c = partials[2];
	
	let v= createVector(a-c+ sqrt(a*a+4*b*b-2*a*c+c*c), 2*b);
	v.normalize();
	return v;
}

function complexMult(z,w){
	return createVector( z.x*w.x-z.y*w.y, z.x*w.y+z.y*w.x);
}

// ----mouse pressed --
function mousePressed() {
	handlePress()
}


function handlePress() {
    let didPress=false;
    for(let i=0;i<zeros.length;i++){
        didPressZero=zeros[i].pressed();
        if(didPressZero){
            didPress=true;
        }
    }
    return didPress;
}


//  ---- mouse released--- 
function mouseReleased() {
  handleRelease();
}


function handleRelease() {
	let newZeros=[];
	for(let i=0;i<zeros.length;i++){
		zeros[i].released();
		
		//make list of zeros within bounds
		if(!zeros[i].isOutsideScreen()){
			newZeros[newZeros.length]=zeros[i]
		}
	}
	
	zeros=newZeros;
	
}

//sets coordinates to get mouse
function getMouse(){
    return createVector(mouseX/width*2-1,-(mouseY/width*2-1))
}

function doubleClicked(){
    let mouse = getMouse();
	let doAddPoint=true;
	let newZeros=[];
	for(let i=0;i<zeros.length;i++){
		if(zeros[i].rollover){
			doAddPoint=false;
		} else {
			newZeros[newZeros.length]=zeros[i]; //delete double clicked points
		}
	} 
	zeros = newZeros;
	if(doAddPoint){
		let i=zeros.length;
		zeros[i]=new Draggable(mouse.x,mouse.y);
        zeros[i].col=zeroCol;
    }
}


function windowResized() {
  resize();
}

function resize(){
    let elem = document.getElementById(parent);
	boundingRect = elem.getBoundingClientRect()
    let size = min(boundingRect.width, boundingRect.height); // square
    resizeCanvas(size, size);
    
}
