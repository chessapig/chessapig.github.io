
function setup() {
	c = createCanvas(windowWidth, windowHeight);


	strokeWeight(.01);

	
	oSim=new Oscillator2D_sim(.2,0,1,.2,-.2,1);
	gX=new Graph(); //graph of phase space in X-axis
	gY=new Graph(); //graph of phase space in X-axis

  }

function change(){
	console.log("test");
}
  

function normalizeCoords(){
	translate(width/2,height/2);
	scale(height/2);

	mX=(mouseX-width/2)/ (height/2);
	mY=(mouseY-height/2)/ (height/2);

	pmX=(pmouseX-width/2)/ (height/2);
	pmY=(pmouseY-height/2)/ (height/2);
}

function draw() {
	normalizeCoords();
	let background_color=color(BKG);
	background_color.setAlpha(200);
	background(background_color);

	gX.update();
	gX.drawPoint(1,0,color(WHITE));
	gX.drawBorder();
	image(gX.c,-1,-1,2,2);


	//image(oSim.p.trail,-1,-1,2,2);
	for(let i=0;i<10;i++){ //update 10 times to improve accuracy
		oSim.update();
	}
	oSim.draw();

	push();
	translate(0,0.5);
	drawSpring(oSim.x,0,0,0);
	pop();

	push();
	translate(0.5,0);
	drawSpring(0,oSim.y,0,0);
	pop();

	

}

function mousePressed(){
	oSim.p.pressed();
}

function mouseReleased(){
	oSim.p.released();
}

  