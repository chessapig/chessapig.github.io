// Click and Drag an object
// Daniel Shiffman <http://www.shiffman.net>

class Draggable {
  constructor(x, y) {
    this.dragging = false; // Is the object being dragged?
    this.rollover = false; // Is the mouse over the ellipse?
    this.x = x;
    this.y = y;
    this.mouse=createVector(0,0);
    this.radius=0.05;
	this.selectRadius=this.radius*1.5;
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
    this.x = this.mouse.x + this.offsetX;
    this.y = this.mouse.y + this.offsetY;

	this.x=constrain(this.x,-1,1);
	this.y=constrain(this.y,-1,1);
  }
}
	
show() {
	stroke(255);
	strokeWeight(2);
	if (this.dragging) {
		fill(212, 63, 235);
	} else if (this.rollover) {
		fill(176, 107, 237);
	} else {
		fill(47, 39, 54);
	}

	circle(this.x,this.y,this.radius);

}

pressed() {
  // Did I click on the rectangle?
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
  
isOutsideScreen(){
	return abs(this.x)>1||abs(this.y)>1;
}
  
getPoint(){
	return createVector(this.x,this.y);
}
}