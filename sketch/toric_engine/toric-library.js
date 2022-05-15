let BKG = '#2c2621';
let DARK = '#1b1613';
let WHITE = '#e6cfb3';
let OLIVE = '#806D30';
let PURPLE = '#543b90';
let GREEN = '#207363';
let YELLOW = '#ebc401';
let BLUE = '#4aa3cb';




function normalizeCoords(){
	strokeWeight(.01);
	translate(width/2,height/2);
	scale(height/2);

	mX=(mouseX-width/2)/ (height/2);
	mY=(mouseY-height/2)/ (height/2);

	pmX=(pmouseX-width/2)/ (height/2);
	pmY=(pmouseY-height/2)/ (height/2);
}

//takes a point as input
function drawSpring(point,x0,y0){
	push();
	let d=dist(point.x,point.y,x0,y0);
	strokeWeight(.01/(d+.2)*point.size);
	stroke(lerpColor(color(WHITE),color(YELLOW),d));
	line(point.x,point.y,x0,y0)
	pop();

	point.draw();
}

class Oscillator2D_sim{
	constructor(x,px,massX,y,py,massY){
		this.x=x;
		this.y=y;
		this.px=px;
		this.py=py;
		this.massX=massX;
		this.massY=massY;

		this.p = new Point(x,y);
		this.k=2;
	}

	update(){
		this.p.over();
		let dt=.005; 

		let fX = -this.k*this.x;
		let fY = -this.k*this.y;
		let mouseF=20;
		let damp=1;
		if(this.p.dragging){
			fX = mouseF*(mX-this.x);
			fY = mouseF*(mY-this.y);
			damp=0.98;
		}

		this.px = damp*(this.px-fX*dt);
		this.py = damp*(this.py-fY*dt);

		this.x += -this.px/this.massX * dt;
		this.y += -this.py/this.massY * dt;


		this.p.moveTo(this.x,this.y);
		
	}

	draw(){
		drawSpring(this.p,0,0);
		 this.p.draw();
	}


}


class Oscillator1D_sim extends Oscillator2D_sim{
	constructor(x,px,massX){
		super(x,px,massX,0,0,1);
	}

	update(){
		super.update();
		this.y=0;
		this.py=0;
	}
}



class Oscillator2D{
	constructor(Mx,rx,px, My,ry,py){
		this.x=new Oscillator(Mx,rx,px);
		this.y=new Oscillator(My,ry,py);
		this.color=color;

		this.p=new Point(this.x.q,this.y.q);
		//this.pOffset=phaseOffset;
	}

	move(p){
		this.x.move(p);
		this.y.move(p);

		this.p.moveTo(this.x.q,this.y.q);
	}

	draw(){
		this.p.draw();
	}


	// draw(){ //allow different hcoice of canvas
	// 	push();
	// 	strokeWeight(.02);
	// 	//let col = this.color;
	// 	//col.setAlpha(40);
	// 	stroke(this.color);
	// 	if(doLine){
	// 		line(this.x.q,this.y.q, this.x.qLast, this.y.qLast);
	// 	}else {
	// 		circle(this.x.q,this.y.q,0,0);
	// 	}
	// 	col.setAlpha(255);
	// 	pop();
	// }

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

}




class Oscillator{
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


class Graph{
	constructor(){
		this.bkg=color(DARK);
		this.lineMajor=color(WHITE);
		this.lineMinor=color(WHITE);
		this.lineMinor.setAlpha(100);

		this.scale=1;

		

		this.doMajorGrid=true;
		this.doMinorGrid=true;
		this.minorGridScale=1;

		this.border_smoothness=5;
		this.resolution=300;

		this.xLabel="";
		this.yLabel="";

		this.doBkg=true;

		this.setup();
	}

	setScale(scale){
		this.c.scale(scale/this.scale);
		this.scale=scale;
	}

	setup(){
		this.c = createGraphics(this.resolution,this.resolution);
		this.c.translate(this.c.width/2,this.c.height/2);
		this.c.scale(this.c.height/2);
		this.c.scale(1,-1); //set it so positive quadrent is positive
		this.c.background(this.bkg);
		this.c.stroke(color(WHITE));
		this.c.strokeWeight(.01);

		this.drawGrid();
	}

	update() {
		this.c.push();
		this.c.clear();
		if(this.doBkg){
			this.c.background(this.bkg);
		}
		this.drawGrid();
		this.c.pop();
	}

	drawPoint(x,y,col){
		this.c.push();
		//this.c.stroke(color(WHITE));
		this.c.fill(col);
		let rad=.1/this.scale;
		this.c.strokeWeight(0.01);
		this.c.ellipse(x,y,rad,rad);
		this.c.pop();
	}

	drawGrid(){
		this.c.strokeWeight(0.01/this.scale);
		
		let mag=2/this.scale;
		if(this.doMinorGrid){
			//minor grid
			this.c.stroke(this.lineMinor);
			for(let n=0; n<mag; n=n+0.5/this.minorGridScale){
				//x
				this.c.line(n ,-mag,n,mag);
				this.c.line(-n ,-mag,-n,mag);

				//y
				this.c.line(-mag,n,mag,n);
				this.c.line(-mag,-n,mag,-n);

			}
		}		

		if(this.doMajorGrid){
			//coordinate axes
			this.c.stroke(this.lineMajor);
			this.c.strokeWeight(0.01/this.scale);
			this.c.stroke(255);
			this.c.line(0,-mag,0,mag);
			this.c.line(-mag,0,mag,0);
		}

		this.c.push();
		this.c.scale(1/this.resolution);
		this.c.scale(1,-1);
		this.c.textSize(64);
		this.c.fill(color(WHITE));
		this.c.text(this.yLabel, 10, -this.resolution*0.7);
		this.c.text(this.xLabel, -this.resolution*0.7, -15);
		this.c.pop();

	}

	drawBorder(){
		push();
		var numBorder=this.border_smoothness;
		for(var i=0;i<numBorder;i++){
			this.c.strokeWeight(0.5*i/numBorder/this.scale);
			var bkg_border = color(BKG);
			bkg_border.setAlpha(100);
			this.c.stroke(bkg_border);

			let mag=1/this.scale;
			this.c.line(mag,mag,mag,-mag);
			this.c.line(mag,-mag,-mag,-mag);
			this.c.line(-mag,-mag,-mag,mag);
			this.c.line(-mag,mag,mag,mag);
		}
		pop();
	}




}

class Point{
	constructor(x,y){
		this.x=x;
		this.y=y;
		this.moveTo(x,y);
		

		this.size=1;
		this.detectionRadius=1;

		this.rollover=false; //is the mouse over the object?
		this.dragging=false; //is the object being dragged?

		// this.doTrail=true;
		// this.trail= createGraphics(300,300);
		// this.trail.translate(this.trail.width/2,this.trail.height/2);
		// this.trail.scale(this.trail.height/2);
		// this.trail.stroke(color(PURPLE));
		// this.trail.strokeWeight(.01);
		// this.trail.fill(color(PURPLE));
		//this.trail.background(color(BKG));
	}

	moveTo(x,y){
		this.xlast=this.x;
		this.x=x;

		this.ylast=this.y;
		this.y=y;
	}

	easeTo(x,y){
		let ease=.9;
		let easeX=(this.x-x)*ease+x;
		let easeY=(this.y-y)*ease+y;
		this.moveTo(easeX,easeY);
	}


	draw(){
		push();
		fill(color(GREEN));
		stroke(color(WHITE));

		//this.doMouseOver();
		if(this.rollover){stroke(color(YELLOW));}
		if(this.dragging){fill(color(YELLOW));}

		circle(this.x,this.y,0.1*this.size)
		pop();


		// if (this.doTrail){
		// 	let bkg_color = color(BKG);
		// 	bkg_color.setAlpha(30);
		// 	this.trail.line(this.x,this.y,this.xlast,this.ylast);
		// 	//this.trail.circle(this.x,this.y,this.radius/2);
		// 	this.trail.background(bkg_color);
		// }

	}

	//Reuquires normalized mouse coordinates mX, mY
	over(){
		if(dist(this.x,this.y,mX,mY)>this.detectionRadius){
			this.rollover = false;
		} else { this.rollover=true;}
	}

	update() {
		// Adjust location if being dragged
		if(this.dragging){
			this.easeTo(mX,mY);
		}
	  }

	pressed(){
		//this.dragging = true;
		if(dist(this.x,this.y,mX,mY)<this.detectionRadius){
			this.dragging = true;
			
		}
	}

	released() {
		// Quit dragging
		this.dragging = false;

		//this.dx= mX-pmX;
		//this.dy= mY-pmY;
	}
}