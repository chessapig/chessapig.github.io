
let r=0.3;
let t=0;
let graphScale=1;
let mX,mY, pmX, pmY;

function setup() {
	c = createCanvas(windowWidth, windowHeight);
  }

function draw() {
	let background_color=color(BKG);
	background_color.setAlpha(200);
	background(background_color);
	
	textSize(32);
	text('word', 10, 30);
	fill(0, 102, 153);
	text('word', 10, 60);
	fill(0, 102, 153, 51);
	text('word', 10, 90);

	
	
	normalizeCoords();

	scale(1/this.c.height);
	textSize(64);
	fill(color(WHITE));
	text('word', 10, 90);
	scale(this.c.height);
	fill(255);
	//ellipse(0,0,.5,.5);
	
	text('word', 0, 0);
	
	
	

}
