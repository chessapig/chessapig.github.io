// Click and Drag an object
// Daniel Shiffman <http://www.shiffman.net>


//Forces selector points to have resolution 
class Draggable {
	constructor(x, y,res) {
		this.dragging = false; // Is the object being dragged?
		this.rollover = false; // Is the mouse over the ellipse?
		this.enabled = true; // is the object selection toggled?
		
		
		this.res=res;
		this.x = round(x*res)/res;
		this.y = round(y*res)/res;
		this.mouse=createVector(0,0);
		this.radius=0.03;
		this.selectRadius=this.radius*2;
		this.offsetX = 0;
		this.offsetY = 0;
	
	
	}

over() {
  // Is mouse over object
  this.mouse=createVector(mouseX/width*2-1,-(mouseY/height*2-1));
  if (dist(this.x,this.y,this.mouse.x,this.mouse.y)<this.selectRadius) {
    this.rollover = true;
  } else {
    this.rollover = false;
  }
}

update() {
  //give mouse location in screen coordinates

      // Adjust location if being dragged
	if (this.dragging) {
		let nextX = this.mouse.x + this.offsetX;
		let nextY = this.mouse.y + this.offsetY;
		nextX=round(nextX*res)/res;
		nextY=round(nextY*res)/res;

		if((this.x-nextX)!=0 || (this.y-nextY)!=0){
			this.didDrag=true;
		}

		this.x=nextX;
		this.y=nextY
  }
}
	
show() {


	let radius=this.selectRadius;
	if(!this.enabled){
		radius=radius/2;
	}

	
	stroke(255);
	strokeWeight(radius+0.01);
	point(this.x,this.y);
	
	strokeWeight(radius);
	if (this.dragging) {
		stroke(230, 237, 28);
	} else if (this.rollover) {
		stroke(162, 232, 23);
	} else {
		stroke(44, 125, 21);
		if(!this.enabled){
			stroke(0)
		}
	}
	
	point(this.x,this.y);

}

pressed() {
	// Did I click on the object?
	if(this.rollover){
		this.dragging = true;
		this.offsetX = this.x - this.mouse.x;
		this.offsetY = this.y - this.mouse.y;
		
		this.didDrag=false;
	}
}

released() {
	// Quit dragging
	this.dragging = false;
	if(this.rollover && !this.didDrag){
		this.enabled=!this.enabled;
	}
}

  
isOutsideScreen(){
	return abs(this.x)>1||abs(this.y)>1;
}
  
getPoint(){
	return createVector(this.x,this.y);
}
}