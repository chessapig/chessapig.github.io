
let r=0.3;
let t=0;
let graphScale=1;
let mX,mY, pmX, pmY;

function setup() {
	c = createCanvas(windowWidth, windowHeight);
	oSim=new Oscillator1D_sim(.6,0,4);
	g=new Graph();
	g.doMinorGrid=false;
	g.resolution=500;
	g.border_smoothness=10;
	g.bkg=color(BKG);
	g.xLabel="x";
	g.yLabel="p";
	g.setup();
  }
  



function draw() {


	normalizeCoords();
	let background_color=color(BKG);
	background_color.setAlpha(200);
	background(background_color);

	
	
	for(let i=0;i<10;i++){ //update 10 times to improve accuracy
		oSim.update();
	}

	g.drawGrid();
	//g.drawPoint(0,0,color(WHITE));
	g.drawPoint([oSim.x,oSim.px/oSim.massX],color(WHITE));
	g.drawBorder();
	image(g.c,-1,-1,2,2);

	push();
		//translate(0,-0.5);
		oSim.draw();
	pop();

	


}

function mousePressed(){
	oSim.p.pressed();
}

function mouseReleased(){
	oSim.p.released();
}
