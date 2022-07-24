
let r=0.3;
let t=0;
let graphScale=2;
let z;
let g;


function setup() {
	c = createCanvas(windowWidth, windowHeight);
	normalizeCoords();

	slider_scale = createSlider(.2, 5, graphScale, .1);
	slider_scale.position(10,10);
	slider_scale.style('width', '200px')

	g=new Graph();
	g.screenCoords=[0,0,1,1];
	g.points=[new Point(0,0),new Point(0,.5),new Point(1,1)];

	z=new Cx([1,0]);
	rot=new Cx();
	rot.polar=[1,.01];

	
  }

function draw() {
	background(color(BKG));

	fill(color(WHITE));
	textSize(30);
	//text('mX:  '+str(mX),10, 100);
	//text('mY:  '+str(mY), 10, 150);
	normalizeCoords();

	

	graphScale=slider_scale.value();

	//g.scale=1/graphScale;
	g.update();
	g.drawPoint(z.cart,color(OLIVE));

	let graph_coords=g.transformCoords(mX,mY);
	//console.log(graph_coords);
	g.drawPoint([graph_coords.x,graph_coords.y],color(PURPLE));
	//g.drawBorder();
	g.draw();
	
	//image(g.c,-.5,-.5,1,1);
	
	z.mult(rot);


}

function mouseWheel(event) {
	g.scroll(event.delta);
	//uncomment to block page scrolling
	return false;
  }


function mousePressed(){
	g.pressed();
}

function mouseReleased(){
	g.released();
}
