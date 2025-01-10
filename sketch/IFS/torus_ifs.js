let fractalDepth = 50; //set fractal depth
let ptsPerThisFrame = 10000;

function setup(){
	createCanvas(700, 700);
	background(230,230,230);
}

function draw(){
	scale(width);
	stroke(0);
	strokeWeight(0.001);
	fill(0);
	let pt=createVector(random(),random());
	for (j = 0; j < ptsPerThisFrame+fractalDepth; j++) {

		pt=applyIFS(pt);

		if(j>fractalDepth){
			circle(pt.x,pt.y,0);
		}
				
	}
}

//takes in vector, outputs new vetcor
function applyIFS(pt){


	let p=floor(random(3));
	let control=createVector(random(),random());


	let xAngle=pt.x*2*PI;
	let yAngle=pt.y*2*PI;

	let scale=0.5;
	if(p==0){

		xAngle+=sin(yAngle+2*PI/4)*scale;
		yAngle+=sin(xAngle+2*PI/4)*scale;

	} else if (p==1){
		xAngle+=sin(xAngle-2*PI/4)*scale;
		yAngle+=sin(yAngle-2*PI/4)*scale;

	} else if (p==2){
		xAngle+=sin(yAngle+1*PI/4)*scale;
		yAngle+=sin(-xAngle-1*PI/4)*scale;
	}

	pt.x=xAngle/(2*PI);
	pt.y=yAngle/(2*PI);
	pt=periodic(pt);
	return pt;
}

//takes vector p, multiplies by matrix [[a,b],[c,d]], then adds [e,f]
function affineTransform(p,a,b,c,d,e,f){

	return createVector( a*p.x + b* p.y + e , c*p.x + d*p.y + f);
}

//range of 0,1
function periodic(p){
	p.x=p.x-floor(p.x);
	p.y=p.y-floor(p.y);
	return p
}