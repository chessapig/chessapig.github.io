


function setup() {
	//c = createCanvas(500, 500);
	c = createCanvas(windowWidth, windowHeight);
	strokeWeight(.01);

	
	oSim=new Oscillator2D_sim(.2,0,1,0,.4,1);
	//oSim.doDrawOrbit=false;
	//oSim.doDrawSpring=false;

	background(color(BKG))
  }

function draw() {
	let background_color=color(BKG);
	background_color.setAlpha(200);
	background(background_color);

	normalizeCoords();
	
	for(let i=0;i<10;i++){ //update 10 times to improve accuracy
		oSim.update();
	}

	oSim.draw();

}

function mousePressed(){
	oSim.p.pressed();
}

function mouseReleased(){
	oSim.p.released();
}
