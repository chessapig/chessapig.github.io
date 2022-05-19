let BKG = '#2c2621';
//let BKG = '#ffffff';
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
	constructor(x,px,freqX,y,py,freqY){
		this.x=x;
		this.y=y;
		this.px=px;
		this.py=py;
		this.freqX=freqX;
		this.freqY=freqY;
		this.timeScale=1;

		this.p = new Point(x,y);

		this.doDrawOrbit=true;
		this.doDrawSpring=true;
		this.resolution=100;
		this.doRotateEvolve=false;
	}

	update(){
		this.p.over();
		let maxFreq=max(this.freqX,this.freqY);
		let dt=.005*this.timeScale/maxFreq; 
		

		let fX = -this.x;
		let fY = -this.y;
		let damp=1;
		if(this.p.dragging){
			let mouseF=20;
			fX = mouseF*maxFreq/this.freqX*(mX-this.x);
			fY = mouseF*maxFreq/this.freqY*(mY-this.y);
			damp=0.98;
		} 
		this.px = damp*(this.px+fX*dt);
		this.py = damp*(this.py+fY*dt);

		this.x += this.px*this.freqX**2 * dt;
		this.y += this.py*this.freqY**2 * dt;
		 
		this.p.moveTo(this.x,this.y);

		//this.makeTrueOscillator();
	}

	draw(){
		if(this.doDrawOrbit){
			this.drawOrbit();
		}
		if(this.doDrawSpring){
			drawSpring(this.p,0,0);
		}
		this.p.draw();
	}


	drawOrbit(){
		for(let n=0;n<this.resolution;n++){
			this.rotatePhase(1/this.resolution*2*PI);
			stroke(color(WHITE));
			line(this.x,this.y, this.xLast, this.yLast);
			if(n%10==1){
				//this.p.draw();
			}
		}
	}

	//calculate the phase and radius, increase the phse by t, then calculate the position and momenta again
	rotatePhase(t){
		this.xLast=this.x;
		this.yLast=this.y;
		this.makeActionAngleCoords();
		this.phaseX+=t*this.freqX;
		this.phaseY+=t*this.freqY;
		this.makePhysicalCoords();
		//this.x+=t*.1;
		//console.log(this);
		//noLoop();

	}

	makeActionAngleCoords(){

		var pXscaled=this.px*this.freqX;
		var pYscaled=this.py*this.freqY;

		//radii of each
		this.rX=sqrt(this.x**2+pXscaled**2);
		this.rY=sqrt(this.y**2+pYscaled**2);

		//phase of each
		this.phaseX=atan2(this.x,pXscaled);
		this.phaseY=atan2(this.y,pYscaled);

	}

	makePhysicalCoords(){
		this.x=this.rX*sin(this.phaseX);
		this.px=this.rX*cos(this.phaseX)/this.freqX;

		this.y=this.rY*sin(this.phaseY);
		this.py=this.rY*cos(this.phaseY)/this.freqY;
		this.p.moveTo(this.x,this.y);
	}





}


class Oscillator1D_sim extends Oscillator2D_sim{
	constructor(x,px,freq){
		super(x,px,freq,0,0,1);
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
		this.doEvolve=false;
		this.evolutionRate=5;
		this.resolution=10;
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

	drawOrbit(){
		for(let n=0;n<this.resolution;n++){
			this.x.move(1/this.resolution);
			this.y.move(1/this.resolution);
			line(this.x.q,this.y.q, this.x.qLast, this.y.qLast);
		}
		if(this.doEvolve){ //move a tiny bit extra
			let phaseVel = evolutionRate/200;
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
		

		this.center=createVector(0,0); //set center of the image in graph coords

		

		this.doMajorGrid=true;
		this.doMinorGrid=true;
		this.minorGridScale=1;

		this.border_smoothness=5;
		this.resolution=300;

		this.xLabel="";
		this.yLabel="";

		this.doBkg=true;

		this.points=[];

		this.setup();
	}

	//p is [[center_x,center_y,width,height]]
	set screenCoords(p){
		this.screen_x=p[0];
		this.screen_y=p[1];
		this.screen_width=p[2];
		this.screen_height=p[3];
	}



	draw(){
		
		//this.update();
		if(this.rollover){
			this.drawHighlight();
		}

		this.c.push();
		this.c.scale(this.scale);
		for(let i=0;i<this.points.length;i++){
			this.points[i].draw();
		}
		this.c.pop();


		image(this.c,
			this.screen_x-this.screen_width/2,this.screen_y-this.screen_height/2,
			this.screen_width,this.screen_height);

		
	}

	
	//turn x,y from screen coordinates to graph coordinates 
	transformCoords(x,y){
		let xNew=(x-this.screen_x)/(this.screen_width/2)/this.scale;
		let yNew=(y-this.screen_y)/(this.screen_height/2)/this.scale;
		yNew = -yNew; //needed to make positive orthant in top right
		let newCoords = createVector(xNew,yNew);
		return newCoords;
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

		this.update();
	}

	update() {
		this.c.push();
		this.c.translate(this.center.x,this.center.y);
			this.c.clear();
			if(this.doBkg){
				this.c.background(this.bkg);
			}
			this.drawGrid();
			this.drawBorder();
		this.c.pop();

		this.over();
		this.drag();
	}

	addPoint(p,col){
		this.points.append(new Point)
	}

	drawPoint(p,col){
		let x=p[0];
		let y=p[1];
		this.c.push();
		this.c.scale(this.scale);
		//this.c.stroke(color(WHITE));
		this.c.fill(col);
		let rad=.1/this.scale;
		this.c.strokeWeight(0.01/this.scale);
		this.c.ellipse(x,y,rad,rad);
		this.c.pop();
	}

	drawGrid(){

		this.c.push();
		this.c.scale(this.scale);
		//this.c.strokeWeight(0.01/this.scale);
		
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

		this.c.pop();

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
		this.c.push();
		this.c.scale(this.scale);
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
		this.c.pop();
	}

	drawHighlight(){
		this.c.push();
		this.c.scale(this.scale);
		
		this.c.strokeWeight(.05/this.scale);
		this.c.stroke(OLIVE);

		let mag=1/this.scale;
		this.c.line(mag,mag,mag,-mag);
		this.c.line(mag,-mag,-mag,-mag);
		this.c.line(-mag,-mag,-mag,mag);
		this.c.line(-mag,mag,mag,mag);
		this.c.pop();
	}


	//Reuquires normalized mouse coordinates mX, mY
	over(){
		let mouse_cords=this.transformCoords(mX,mY);
		let lim=1/this.scale;
		if(mouse_cords.x<=lim  && mouse_cords.x>=-lim && mouse_cords.y<=lim  && mouse_cords.y>=-lim ){
			this.rollover = true;
		} else { this.rollover=false;}
	}

	drag() {
		// Adjust location if being dragged
		if(this.dragging){
			let mouse_cords=this.transformCoords(mX,mY);
			
			//this.center=mouse_cords.sub(this.startDrag);
		}
	  }

	pressed(){
		if(this.rollover){
			this.dragging = true;
			this.startDrag=this.transformCoords(mX,mY);
		}
	}

	released() {
		// Quit dragging
		this.dragging = false;
	}

	scroll(delta){

		let newScale = this.scale+delta/1000;
		if(newScale>=.1 && newScale<=2){
			this.scale=newScale;
		}
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



class Cx{
	constructor(p=[0,0]){
		this.cart=p;
	}

	set cart(p){
		this.x=p[0];
		this.y=p[1];
		this.makePolar();
	}
	get cart(){
		return [this.x,this.y];
	}

	set polar(p){
		this.r=p[0];
		this.t=p[1];
		this.makeCart();
	}
	get polar(){
		return [this.r,this.t];
	}

	makePolar(){
		this.t = -atan2(this.y,this.x);
		this.r=sqrt(this.x**2+this.y**2);
	}

	makeCart(){
		this.x=this.r*cos(-this.t);
		this.y=this.r*sin(-this.t);
	}

	mult(z){
		this.r*=z.r;
		this.t+=z.t;
		this.makeCart();
	}

	static mult(z1,z2){
		let z1_ = Cx.copy(z1);
		z1_.mult(z2);
		return z1_;
	}	

	add(z){
		this.cart=[this.x+z.x,this.y+z.y];
	}

	static add(z1,z2){
		let z1_ = copy(z1);
		return z1_.add(z2);
	}	

	static copy(z){
		return new Cx([z.x,z.y]);
	}


}

// class Oscillator2D_sim{
// 	constructor(x,px,massX,y,py,massY){
// 		this.x=x;
// 		this.y=y;
// 		this.px=px;
// 		this.py=py;
// 		this.massX=massX;
// 		this.massY=massY;

// 		this.p = new Point(x,y);
// 		this.k=1;

// 		this.doDrawOrbit=true;
// 		this.doDrawSpring=true;
// 		this.resolution=100;
// 		this.doRotateEvolve=false;

// 		this.freqX = sqrt(this.k/this.massX);
// 		this.freqY = sqrt(this.k/this.massY);
// 	}

// 	update(){
// 		this.p.over();
// 		let dt=.005; 

// 		if(!this.doRotateEvolve){
// 			let fX = -this.k*this.x;
// 			let fY = -this.k*this.y;
// 			let mouseF=20;
// 			let damp=1;
// 			if(this.p.dragging){
// 				fX = mouseF*(mX-this.x);
// 				fY = mouseF*(mY-this.y);
// 				damp=0.98;
// 			} 
// 			this.px = damp*(this.px+fX*dt);
// 			this.py = damp*(this.py+fY*dt);

// 			this.x += this.px/this.massX * dt;
// 			this.y += this.py/this.massY * dt;
// 		} else {
// 			if(this.p.dragging){
// 				let fX = -this.k*this.x;
// 				let fY = -this.k*this.y;
// 				let mouseF=20;
// 				let damp=1;
// 					fX = mouseF*(mX-this.x);
// 					fY = mouseF*(mY-this.y);
// 					damp=0.98;

// 				this.px = damp*(this.px-fX*dt);
// 				this.py = damp*(this.py-fY*dt);
	
// 				this.x += -this.px/this.massX * dt;
// 				this.y += -this.py/this.massY * dt;
// 				// this.x += -this.px/this.massX * dt;
// 				// this.y += -this.py/this.massY * dt;
// 			} else {
// 				this.rotatePhase(-.001);
// 			}
// 		}
		 
// 		this.p.moveTo(this.x,this.y);

// 		//this.makeTrueOscillator();
// 	}

// 	draw(){
// 		if(this.doDrawOrbit){
// 			this.drawOrbit();
// 		}
// 		if(this.doDrawSpring){
// 			drawSpring(this.p,0,0);
// 		}
// 		this.p.draw();
// 	}


// 	drawOrbit(){
// 		for(let n=0;n<this.resolution;n++){
// 			this.rotatePhase(1/this.resolution);
// 			line(this.x,this.y, this.xLast, this.yLast);
// 		}
// 	}

// 	//calculate the phase and radius, increase the phse by t, then calculate the position and momenta again
// 	rotatePhase(t){
// 		this.xLast=this.x;
// 		this.yLast=this.y;
// 		this.makeActionAngleCoords();
// 		this.phaseX+=t*2*PI;
// 		this.phaseY+=t*2*PI;
// 		this.makePhysicalCoords();
// 		//this.x+=t*.1;
// 		//console.log(this);
// 		//noLoop();

// 	}

// 	makeActionAngleCoords(){
// 		//radii of each
// 		this.rX=sqrt(this.x**2+this.px**2);
// 		this.rY=sqrt(this.y**2+this.py**2);

// 		//phase of each
// 		this.phaseX=atan2(this.x,this.px);
// 		this.phaseY=atan2(this.y,this.py);

// 		//hamiltonian of each
// 		this.HX = this.rX*this.massX;
// 		this.HY = this.rY*this.massY;
// 	}

// 	makePhysicalCoords(){
// 		this.x=this.rX*sin(this.phaseX);
// 		this.px=this.rX*cos(this.phaseX);

// 		this.y=this.rY*sin(this.phaseY);
// 		this.py=this.rY*cos(this.phaseY);
// 	}





// }
