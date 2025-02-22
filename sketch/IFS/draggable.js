// Click and Drag an object
// based on class by Daniel Shiffman <http://www.shiffman.net>

class Draggable {


	constructor(x, y) {
		this.dragging = false; // Is the object being dragged?
		this.rollover = false; // Is the mouse over the object?
		this.reparam=false; //are we in the mode of setting the parameters?
		this.scrolling=false;

		this.color= lerpColor(color(BKG),color(FRG),sqrt(random(0.1,1)));
		  
  
		//if true, then when we click and drag, we move the pieces.
		//if false, then when we click and drag, we scale/rotate things.
		this.dragMode=true; 
		  
		this.mouse=createVector(0,0);
	  	this.x = x;
	  	this.y = y;
	  	this.radius=0.05;
    	this.angle=0; 
		this.doHide=false;
		  
		this.selectRadius=this.radius;
	  	this.offsetX = 0;
		this.offsetY = 0;
		this.magnitude=0.5;


		reset();
	}
  
  over() {
	// Is mouse over object
	this.mouse=getCoords(mouseX,mouseY);
	
	; //get mouse in coordinates [-1,1]^2
	if (dist(this.x,this.y,this.mouse.x,this.mouse.y)<this.selectRadius) {
	  this.rollover = true;
	} else {
	  this.rollover = false;
	}
  }
  
  update() {
	this.doHide=hidePoints; //gets hidepoints from main
	this.dragMode=dragMode;
	this.scrolling=false;
	  this.selectRadius=this.radius*2;
	  // Adjust location if being dragged
	  this.over();
	if (this.dragging) {
	  this.x = this.mouse.x + this.offsetX;
	  this.y = this.mouse.y + this.offsetY;
	}

	//this.color = color(FRG)
	//this.color= lerpColor(FRG,color(FRG),sqrt(this.magnitude));
	  
	if(this.reparam) {
		let p1 = createVector(this.x,this.y);
		let p2 = createVector(this.mouse.x + this.offsetX,  this.mouse.y + this.offsetY);
		p1.sub(p2);
		//this.magnitude = this.constrainMagnitude(p1.mag());
		this.angleOffset = p1.heading()-PI/2;
		this.angle=this.startAngle+this.angleOffset;
		
		this.magnitude=this.constrainMagnitude(p1.mag());
	}
	
	
	this.show();
  }
	  
  show() {
	  
	if(!this.doHide){
		let c=this.color;
		let bkg=color(BKG);
		let frg=color("#FFFFFF");
		if (this.dragging) {
		c=lerpColor(c,bkg,0.3);
		} else if (this.rollover) {
		c=lerpColor(c,frg,0.6)
		} 
		
		push();
		translate(this.x,this.y);
		scale(this.radius);
		
		let drawRad=sqrt(this.magnitude);

		if (this.dragging || this.rollover){
			noStroke();
			fill(BKG);
			circle(0,0,1.2);
		}
		//fill in outside circle
		stroke(0);
		strokeWeight(0.08);
		fill(FRG);
		circle(0,0,1);
		
		//fill in inside circle
		fill(c)
		circle(0,0,drawRad);
		
		//draw line from outside to inside circle 
		//line(0,-drawRad/2,0,-1/2);
		
		//draw rotated line
		push();
			rotate(this.angle);
			line(0,0,0,-1/2);
		pop();
	
		pop();
	}
  
  }
  
  pressed() {
	  // Did I click on the object?
	  if (dist(this.x,this.y,this.mouse.x,this.mouse.y)<this.selectRadius) {
		  //if we are in drag mode, move the object
		  if (this.dragMode) {
			  this.dragging = true;
		  }else {
			  this.reparam=true;
			  this.startAngle=this.angle;
			  this.angleOffset=0;
		  }
		  this.offsetX = this.x - this.mouse.x;
		  this.offsetY = this.y - this.mouse.y;
	  } 
  }
  
  released() {
	// Quit dragging
	this.dragging = false;
	  this.reparam=false;
  }
	  
  
	  
  scroll(delta){
	  if(this.rollover){
		  if(delta!=0){
			  
			  if(!this.dragMode){
				  this.angle+= delta/1000; //change angles while reparamertizing
			  } else {
				  this.magnitude =  this.constrainMagnitude(this.magnitude+ delta/1000) ;
			  
			  }
			  reset();
			  this.scrolling=true;
		  }
	  } else {
		this.scrolling=false;
	  }
  }
	
  isOutsideScreen(){
	let outside=false;
	//if beyond top left
	let topLeft=getCoords(0,0);
	let bottomRight=getCoords(width,height);
	if(this.x<topLeft.x || this.y<topLeft.y){
		outside=true;
	} else if (this.x>bottomRight.x || this.y>bottomRight.y){
		outside=true;
	}

	return outside;
  }
	  
  constrainMagnitude(x){
	  return constrain(x,0.1,0.99);
  }
	
  }