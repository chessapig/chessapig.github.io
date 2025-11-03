let t;
let critPoints=[];
let zeros=[];
let randZeros=[];
let error=0.01;
let numPtsPlotFlowLines=2;
let degree=5;
let zoom=1;
let margin=2; //how much larger,precentagly, do we do calculations?
let max=0;

let parent = "segal_sketch";
let canvas;

const BKG = '#2c2621'; //background color
const FRG = '#e6cfb3'; //foreground color
const col = '#59a855ff';
const levelCol = '#553652ff'

function setup() {
    let elem = document.getElementById(parent);
	boundingRect = elem.getBoundingClientRect()
    let size = min(boundingRect.width, boundingRect.height); // square
	canvas=createCanvas(size,size);
    canvas.parent('segal_sketch');

	background(BKG);
	t=0;
	
	//noLoop();
	
	for(let i=0;i<degree;i++){
		let boxScale=0.9/zoom;
		zeros[i]=new Draggable(random(-1,1),random(-1,1));
        zeros[i].col = col
	}
	
	
}

function draw() {
	
	let startTime = millis();
	
	background(BKG);
	scale(width/2,width/2);
	translate(1,1)
	scale(1,-1);


    // if(touches.length>0){
    //     zeros=touches
    //     for(let i=0;i<zeros.length;i++){
    //         zeros[i] = new Draggable(touches[i].x/width*2-1 , -(touches[i].y/width*2-1))
    //     }
    // }

	

	//critPoints=findCriticalPoints(critPoints);

	
	stroke(0);
	strokeWeight(0.01); 
	
	max=drawLevelSetsRho(max);
	
	
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
	let k= zoom*4 * 1.5
	
	//return the norm squared, with the hermitian metric of P1
	//let metric = pow(1+p.magSq(),-k); // P^1 in affine chart
	//let metric = exp(-k*p.magSq()); // C
	//return poly.magSq()*metric;
	
	return log(poly.magSq()) - k * p.magSq();
	//return log(poly.magSq())
}


function drawLevelSetsRho(max){
	let resolution=0.01;
	
	let newMax=-100;
	let delta=0.1;
	
	lightColor=color(FRG);
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
			else if((max-f)%1<delta ){
                darkColor.setAlpha(pow(constrain((8-(max-f))/8,0,1),2)*255);
                stroke(darkColor,10)
				//stroke(darkColor,pow(constrain((8-(max-f))/8,0,1),2)*255);
				point(i,j);
                darkColor.setAlpha(255)
			}
			
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
        zeros[i].col=col;
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
