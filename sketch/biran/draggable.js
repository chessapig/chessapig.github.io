// Click and Drag an object
// Daniel Shiffman <http://www.shiffman.net>

class Draggable {
  constructor(x, y) {
    this.dragging = false; // Is the object being dragged?
    this.rollover = false; // Is the mouse over the ellipse?
    this.x = x;
    this.y = y;
    this.mouse=createVector(0,0);
    this.radius=0.03;
		this.selectRadius=this.radius*2;
    this.offsetX = 0;
    this.offsetY = 0;

    this.col = "#FFFFFF" 
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
  }
}
	
show() {

  stroke(0);
  strokeWeight(this.selectRadius);
  if (this.dragging) {
     stroke(lerpColor(this.col,color("#FFFFFF"),0.5));
  } else if (this.rollover) {
     stroke(lerpColor(this.col,color("#FFFFFF"),0.5));
  } else {
     stroke(this.col);
  }
  

  circle(this.x,this.y,0.01);

}

pressed() {
  let didPress=false;
  // Did I click on the rectangle?
  if (dist(this.x,this.y,this.mouse.x,this.mouse.y)<this.selectRadius) {
    this.dragging = true;
    this.offsetX = this.x - this.mouse.x;
    this.offsetY = this.y - this.mouse.y;
    didPress=true;
  }
  return didPress;
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
