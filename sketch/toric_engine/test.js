
let t=0,
	r=0;

function setup(){
	createCanvas(windowWidth, windowHeight);
	c=createGraphics(windowWidth, windowHeight);

	background(0);
	c.background(0);

	gui = createGui();
    b = createButton("Button", 50, 50);
}

  
function draw() {
	

	c.translate(width/2,height/2);
	c.scale(height/2);
	//c.background(255);
	c.fill(120);

	c.circle(r*sin(t),r*cos(t),1,1)

	t+=.03;

	//image(c,0,0,width,height)

	drawGui();
	if(b.isPressed) {
		print(b.label + " is pressed.");
	}
}
  