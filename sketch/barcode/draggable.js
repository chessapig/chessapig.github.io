// Click and Drag an object
// based on class by Daniel Shiffman <http://www.shiffman.net>

class Draggable {


	constructor(x, y) {
		this.dragging = false; // Is the object being dragged?
		this.rollover = false; // Is the mouse over the object?
		this.reparam=false; //are we in the mode of setting the parameters?
		this.scrolling=false;

		this.color= lerpColor(color(BKG),color(FRG),sqrt(random(0.1,1)));
		  
  
		this.mouse=createVector(0,0);
	  	this.x = x;
	  	this.y = y;
	  	this.radius=0.1;
		  
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

	
	this.show();
  }
	  
  show() {
	  
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
	
	//fill in inside circle
	stroke(FRG)
	strokeWeight(3);
	fill(c)
	circle(0,0,drawRad);

	pop();
  
  }
  
  pressed() {
	  // Did I click on the object?
	  if (dist(this.x,this.y,this.mouse.x,this.mouse.y)<this.selectRadius) {
		  this.dragging = true;
		  this.offsetX = this.x - this.mouse.x;
		  this.offsetY = this.y - this.mouse.y;
	  } 
  }
  
  released() {
	// Quit dragging
	this.dragging = false;
  }
	  
  
	  
  scroll(delta){
	  if(this.rollover){
		  if(delta!=0){
			this.magnitude =  this.constrainMagnitude(this.magnitude+ delta/1000) ;
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
	if(this.x<topLeft.x || this.y<-topLeft.y){
		outside=true;
	} else if (this.x>bottomRight.x || this.y>-bottomRight.y){
		outside=true;
	}

	return outside;
  }
	  
  constrainMagnitude(x){
	  return constrain(x,0.1,0.99);
  }
	
  }