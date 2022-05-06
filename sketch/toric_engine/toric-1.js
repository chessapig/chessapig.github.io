
let n=1, 
	m=1,
	doLine=true,
	perturb=0;
	perturbMin=-5,
	bkgOpactity=50,
	graphScale=2;

var o;

function setup(){
	createCanvas(windowWidth, windowHeight);

	background(21, 8, 50);

	stroke(255);
	strokeWeight(.01);
	fill(255);
	t=0;
	x=0;
	y=0;

	oX=new Osscilator(1,.5,0);
	oY=new Osscilator(1,.5,0);

	settings = QuickSettings.create(10,10, "click / double tab to collapse")
		.addRange("Mass X",-10,10,1,1,function(value) {oX.M = value; })
		.addRange("Mass Y",-10,10,1,1,function(value) {oY.M = value; })
		.addRange("Mass X perturb",perturbMin,0.001,perturbMin,.01,function(value) {oX.dM = pow(10,value)-pow(10,perturbMin); })
		.addRange("Mass Y perturb",perturbMin,0.001,perturbMin,.01,function(value) {oY.dM = pow(10,value)-pow(10,perturbMin); })
		.addRange("X radius",0,1,.5,.01,function(value) {oX.r = value; })
		.addRange("Y radius",0,1,.5,.01,function(value) {oY.r = value; })
		.addRange("background opactity",0,255,bkgOpactity,1,function(value) {bkgOpactity=value;})
		.addBoolean("draw line?",doLine,function(value) {doLine = value;})
		.addRange("graph scale",0,10,graphScale,.01,function(value) {graphScale = value; })



	graph = createGraphics(200,200);
	graph.translate(graph.width/2,graph.height/2);
	graph.scale(graph.height/2);
	graph.scale(1,-1); //set it so positive quadrent is positive
	graph.background(0);
	graph.stroke(255);
	graph.strokeWeight(.01);
}


function draw(){
	translate(width/2,height/2);
	scale(height/2);
	background(21, 8, 50,bkgOpactity);



	for(let i=0;i<1000;i++){
		oX.move();
		oY.move();
		//circle(oX.q,oY.q,0,0)

		xLast=x;
		yLast=y;

		x=oX.q;
		y=oY.q;

		if(doLine){line(x,y,xLast,yLast);}
		else{circle(x,y,0,0)}
	}




	updateGraph()
	image(graph,0,-1,.5,.5)
}

function updateGraph(){
	graph.push();
	graph.rotate( atan2(oY.getMass(),oX.getMass()) );
	let s=graphScale;
	drawGrid(graph,s);

	graph.fill(255,0,0);
	graph.ellipse(oX.getH()/s,oY.getH()/s,.1,.1)
	graph.pop();
}

function drawGrid(g,scale){
	g.background(0);
	g.strokeWeight(0.01);
	g.stroke(255,100);

	//minor grid
	for(let n=0; n<2*scale; n=n+0.5){

		push();

		//x
		g.line(n/scale ,-2,n/scale,2);
		g.line(-n/scale ,-2,-n/scale,2);

		//y
		g.line(-2,n/scale,2,n/scale);
		g.line(-2,-n/scale,2,-n/scale);

		pop();
	}
	
	//coordinate axes
	g.strokeWeight(0.01);
	g.stroke(255);
	g.line(0,-2,0,2);
	g.line(-2,0,2,0);
	
}

class Osscilator{
	constructor(M,r,phase){
		this.M=M
		this.r=r;
		this.phase=phase;

		this.dM=0;


		this.step=.01;
	}

	move(){
		this.phase = this.phase + (this.M+this.dM)* this.step;
		this.q=this.r*sin(this.phase);
	}

	getH(){
		return 4*pow(this.r,2)
	}

	getMass(){
		return this.M+this.dM;
	}


}


// class Point{
// 	constructor(pos){
// 		this.q=pos;
// 		this.qLast=pos;
// 		this.p=createVector(0,0);
// 	}
	
// 	move(){
// 		this.qLast = this.q.copy();


		


// 		if(doRotate){
// 			//map that matters

// 			//let angle=Math.pow((this.pos.mag()-.5),2)-.25; //logistic


// 			this.pos.rotate(this.startPos.mag()*PI*2);

// 		}
		


// 		// //-----Add Perturbation----
// 		n.periodic=true;
// 		perturb = noiseVector(this.lastPos.x,this.lastPos.y,angle,n);
// 		perturb.mult(perturbationStr);
// 		perturb.rotate(PI/2);

// 		this.pos= this.pos.add(perturb);
// 		if(this.pos.x<-1){this.pos.x+=2; this.crossing=true;};
// 		if(this.pos.x>1){this.pos.x-=2;this.crossing=true;};

// 		if(this.pos.y<-1){this.pos.y+=2;this.crossing=true;};
// 		if(this.pos.y>1){this.pos.y-=2;this.crossing=true;};

// 		let distFromStart = dist(this.pos,this.startPos);
// 		if(this.minDis>distFromStart){
// 			this.minDist=distFromStart; 
// 			this.denominator}
// 	}
	
// 	display(){
	
// 		noStroke();
// 		fill(this.color);
// 		ellipse(this.pos.x,this.pos.y,this.radius,this.radius);
		

// 		stroke(color(red(this.color),green(this.color),blue(this.color),30));
// 		strokeWeight(.005);
// 		if(doShowLines && !this.crossing){
// 			line(this.lastPos.x,this.lastPos.y,this.pos.x,this.pos.y); //draw line between last 2 points
// 		}
// 		this.crossing=false;
// 	}
	
// 	setAlpha(alpha){
// 		this.color=color(red(this.color),green(this.color),blue(this.color),alpha);
// 	}
	
// 	resetPos(){
// 		this.pos=this.startPos.copy();
// 	}
// }