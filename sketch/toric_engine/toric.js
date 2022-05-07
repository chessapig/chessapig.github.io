
let n=1, 
	m=1,
	doLine=true,
	doGraph=false,
	doEvolve=false;
	doMarkPoint=true;
	perturb=-3;
	perturbAngle=0;
	perturbMin=-5,
	bkgOpactity=50,
	graphScale=3,
	resolution=30,
	markedVelocity=.5;
	perminantOffset=-0.25;

let os=[];
let c;

let maxSHOs=100;
	numSHOs=5;
	SHOslider=numSHOs;
	SHOmultiplier=1;


let fps=30;
	gifCapturing=false;
	gifFrames=0;
	fps=30,	//number of frames per second
	loopTime=5; //number of seconds in loop
	saveFormat="webm";


function setup(){
	c=createCanvas(windowWidth,windowHeight);

	bkg = color(11, 13, 31);
	color1=color(188, 182, 207);
	color2=color(87, 4, 99);
	color3=color(230, 247, 181);


	background(bkg);

	stroke(255);
	strokeWeight(.01);
	fill(255);
	t=0;
	x=0;
	y=0;

	



	for(var i = 0; i <= maxSHOs; i++){
		t=i/maxSHOs;
		col=color(255*(1-t*.8));
		os[i]=new DoubleOsscilator(
			1, 	sqrt(t*0.8),		perminantOffset,
			1,	sqrt((1-t)*0.8),	perminantOffset,
			lerpColor(color1,color2,t));
	} 
	updatePerturb();


	// o=new DoubleOsscilator(1,.5,0,1,.5,0);
	// o.x.dM=.001;


	// oX=new Osscilator(1,.5,0);
	// oY=new Osscilator(1,.5,0);

	settings = QuickSettings.create(10,10, "click / double tab to collapse")
		.addRange("number of osscilators",0,10,SHOslider,1,function(value){
			SHOslider=value;
			numSHOs = SHOslider*SHOmultiplier;
		})
		.addRange("multiply number of osscilators by 10?",0,1,0,1,function(value) {
			SHOmultiplier=value*9+1;
			numSHOs = SHOslider*SHOmultiplier;
		})
		.addRange("Mass X",-10,10,1,1,function(value) {
			for(var i = 0; i <= maxSHOs; i++){
				os[i].x.M = value;
			} })
		.addRange("Mass Y",-10,10,1,1,function(value) {
			for(var i = 0; i <= maxSHOs; i++){
				os[i].y.M = value;
			} })
		.addRange("perturb mass angle",0,1,perturbAngle,.01,function(value) {
			perturbAngle=value;
			updatePerturb();
			 })
		.addRange("perturb mass ammount",perturbMin,0.001,perturb,.01,function(value) {
		perturb=value;
		updatePerturb(perturb);
			})
		.addRange("X radius",0,1,.5,.01,function(value) {for(var i = 0; i <= maxSHOs; i++){
			os[i].x.r=value;
		}  })
		.addRange("Y radius",0,1,.5,.01,function(value) {
			for(var i = 0; i <= maxSHOs; i++){
				os[i].y.r=value;
			}  
		})
		.addRange("set reletive phase offset",-3,0.001,-3,.01,function(value) {
			offset=pow(10,value)-pow(10,-3);
			for(var i = 0; i <= maxSHOs; i++){
				t=i/maxSHOs;
				os[i].x.phaseOffset=t*offset-perminantOffset;
				os[i].y.phaseOffset=t*offset-perminantOffset;
			};
		})
		.addRange("background opactity",0,255,bkgOpactity,1,function(value) {bkgOpactity=value;})
		.addBoolean("draw lines?",doLine,function(value) {doLine = value;})
		.addBoolean("draw graph?",doGraph,function(value) {doGraph = value;})
		.addRange("graph scale",0,10,graphScale,.01,function(value) {graphScale = value; })
		.addRange("resolution",0,100,resolution,1,function(value) {resolution = value; })
		.addBoolean("Evolve around ?",doEvolve,function(value) {doEvolve = value;})
		.addBoolean("Mark a point?",doMarkPoint,function(value) {doMarkPoint = value;})
		.addRange("velocity of evolution",0,1,markedVelocity,.01,function(value) {markedVelocity = value; })
		.addButton("Save",function(){makeGif();});

	//setup gif encoder
	frameRate(fps)
	capturer = new CCapture( { 
		format: 'webm', 
		workersPath: 'js/', 
		framerate: fps,
		} );
	gifFrames=0; //track how many frames in gif saved so far
	console.log(capturer);


	settings.hideControl("X radius").hideControl("Y radius");
	settings.hideControl("graph scale").hideControl("draw graph?");
	// oY.dM=.001;

	setupGraph();
	
}

function updatePerturb(){
	let numP=pow(10,perturb)-pow(10,perturbMin);;
	for(var i = 0; i <= maxSHOs; i++){
		os[i].x.dM =  numP*cos(perturbAngle*PI/2);
		os[i].y.dM =  numP*sin(perturbAngle*PI/2);
	} 
}

function draw(){
	translate(width/2,height/2);
	scale(height/2);
	background(bkg,bkgOpactity);



	for(var i = 0; i <= maxSHOs; i++){
		os[i].drawOrbit(doDraw(i));
		// if(i%floor(maxSHOs/numSHOs)==0){

		// 	os[i].drawOrbit(doRender);
		// }
		
	}
	if(doMarkPoint){
		for(var i = 0; i <= maxSHOs; i++){
			if(doDraw(i)){
				os[i].drawPoint();
			}
		}
	}
	
	if(doGraph){
		updateGraph();
		image(graph,-1,-1,.5,.5);
	}
	
	//capture frame
	if(gifCapturing){
		console.log(gifFrames);
		capturer.capture(document.getElementById('defaultCanvas0'));
		gifFrames+=1;
		if(gifFrames>=loopTime*fps){
			capturer.stop();
			capturer.save();
			gifCapturing=false;
			gifFrames=0;
		}

		
	}
	
}

//decide wether or not the ith osscilator should actually be drawn
function doDraw(i){
	return i%floor(maxSHOs/numSHOs)==0 || i==maxSHOs;
}

function addPhaseOffest(p){
	for(var i = 0; i <= maxSHOs; i++){
		t=i/maxSHOs;
		os[i].move(t*p);
	}
}


class DoubleOsscilator{
	constructor(Mx,rx,px, My,ry,py,color){
		this.x=new Osscilator(Mx,rx,px);
		this.y=new Osscilator(My,ry,py);
		this.color=color;
		//this.pOffset=phaseOffset;
	}

	move(p){
		this.x.move(p);
		this.y.move(p);
	}

	draw(){ //allow different hcoice of canvas
		push();
		strokeWeight(.02);
		//let col = this.color;
		//col.setAlpha(40);
		stroke(this.color);
		if(doLine){
			line(this.x.q,this.y.q, this.x.qLast, this.y.qLast);
		}else {
			circle(this.x.q,this.y.q,0,0);
		}
		col.setAlpha(255);
		pop();
	}

	drawOrbit(doRender){
		for(let n=0;n<resolution;n++){
			this.x.move(1/resolution);
			this.y.move(1/resolution);
			if(doRender){
				this.draw();
			}
		}
		if(doEvolve){ //move a tiny bit extra
			let phaseVel = markedVelocity/200;
			this.x.move(phaseVel);
			this.y.move(phaseVel);
		}
	}

	drawPoint(){
		push();
		strokeWeight(.003);
		stroke(color3);
		fill(this.color);
		circle(this.x.q,this.y.q,.05,.05);
		pop();
	}
}




class Osscilator{
	constructor(M,r,phaseOffset){
		this.M=M
		this.r=r;
		this.phaseOffset=phaseOffset;
		this.phase=0;

		this.dM=0;

		this.q=0;
		this.qLast=0;

	}

	//Always repeates with period an integer divsor of 1
	move(t){ //eolve by time t
		//this.rLast=this.r;
		//this.phaseLast=this.phase;
		this.qLast=this.q;
		this.phase = this.phase + (this.M+this.dM)* t;
		this.q=this.r*sin((this.phase+this.phaseOffset)*2*PI);
	}

	getH(){
		return 4*pow(this.r,2)
	}
	getMass(){
		return this.M+this.dM;
	}

}


function updateGraph(){
	graph.push();
	//graph.rotate( atan2(o.y.getMass(),o.x.getMass()) );
	//graph.rotate( atan2(oYs[1].getMass(),oXs[1].getMass()) );
	let s=graphScale;
	drawGrid(graph,s);

	//graph.ellipse(o.x.getH()/s,o.y.getH()/s,.1,.1);
	for(var i = 0; i <= maxSHOs; i++){
		if(doDraw(i)){
			graph.fill(os[i].color);
			graph.ellipse(os[i].x.getH()/s,os[i].y.getH()/s,.1,.1);
		}
	}
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

function setupGraph(){
	graph = createGraphics(200,200);
	graph.translate(graph.width/2,graph.height/2);
	graph.scale(graph.height/2);
	graph.scale(1,-1); //set it so positive quadrent is positive
	graph.background(0);
	graph.stroke(255);
	graph.strokeWeight(.01);
}


//togge gui visibility
function keyPressed(){
	switch(key) {
		case 'h':
			settings.toggleVisibility();
			break;
  }  
}

function makeGif(){
	console.log("make gif");
	capturer.start();
	gifCapturing=true;

	console.log(gifFrames);
}
