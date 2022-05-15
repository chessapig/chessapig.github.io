

let pos_o2D = [-.5,-.5]; //2D osscilator base poisition
let pos_oX = [0,1]; //x-osscilaotor base position relative to 2D osscilator
let pos_gX = [0,2]; //x-osscilaotor graph base position
let pos_oY = [1,0]; //x-osscilaotor base position
let pos_gY = [2,0]; //x-osscilaotor graph base position

let slider_massX;
let slider_massY;


function setup() {
	c = createCanvas(500, 500);
	//c = createCanvas(windowWidth, windowHeight);
	strokeWeight(.01);

	
	oSim=new Oscillator2D_sim(.2,0,1,.2,-.2,3);
	oSim.p.size=2;

	gX=new Graph(); //graph of phase space in X-axis
	//gX.doMinorGrid=false;
	gX.minorGridScale=2;
	gX.resolution=500;
	gX.border_smoothness=10;
	gX.doBkg=false;
	//gX.bkg=color(BKG);
	//gX.xLabel="x";
	//gX.yLabel="p";
	gX.setup();

	gY=new Graph(); //graph of phase space in X-axis
	//gY.doMinorGrid=false;
	gY.minorGridScale=2;
	gY.resolution=500;
	gY.border_smoothness=10;
	gY.doBkg=false;
	//gY.bkg=color(BKG);
	//gY.xLabel="x";
	//gY.yLabel="p";
	gY.setup();

	normalizeCoords();
	slider_massX = createSlider(1, 5, 1, 1);
	slider_massY = createSlider(1, 5, 1, 1);

	rotate(PI/2);
	slider_massX.position(275, 325);
	slider_massX.style('width', '200px')

	slider_massY.position(275, 425);
	slider_massY.style('width', '200px')
  }

function draw() {
	let background_color=color(BKG);
	background_color.setAlpha(200);
	background(background_color);

	//update values of masses
	let massX=slider_massX.value();
	let massY=slider_massY.value();
	oSim.massX=massX;
	oSim.massY=massY;

	push();
		textSize(18);
		fill(color(WHITE));
		text('Mass of X-oscillator: ', 275, 305);
		text('Mass of Y-oscillator: ', 275, 405);

		textSize(24);
		fill(color(YELLOW));
		text(str(massX), 450, 305);
		text(str(massY), 450, 405);
	pop();

	normalizeCoords();
	translate(pos_o2D[0],pos_o2D[1]);
	mX+=.5;
	mY+=.5;
	var rescale=0.5;
	scale(rescale);
	mX/=rescale;mY/=rescale;

	
	//draw X osscilator graph
	push();
		translate(pos_gX[0],pos_gX[1]);
		gX.update();
		gX.drawPoint(oSim.x,oSim.px/oSim.massX,color(WHITE));
		gX.drawBorder();
		image(gX.c,-1,-1,2,2);
	pop();

	//draw X osscilator graph
	push();
		translate(pos_gY[0],pos_gY[1]);
		gY.c.push();
		gY.c.rotate(-PI/2);
		gY.update();
		gY.drawPoint(oSim.y,oSim.py/oSim.massY/2,color(WHITE));
		gY.drawBorder();
		gY.c.pop();
		image(gY.c,-1,-1,2,2);
	pop();

	
	for(let i=0;i<10;i++){ //update 10 times to improve accuracy
		oSim.update();
	}
	push();
		//translate(pos_o2D[0],pos_o2D[1]);
		//mX-=0.5; mY-=0.5;
		oSim.draw();
	pop();

		//draw X osscilator
	push();
		translate(pos_oX[0],pos_oX[1]);
		var newPoint = new Point(oSim.x,0);
		drawSpring(newPoint,0,0);
	pop();

	//draw Y osscilator
	push();
	translate(pos_oY[0],pos_oY[1]);
		var newPoint = new Point(0,oSim.y);
		drawSpring(newPoint,0,0);
	pop();


}

function mousePressed(){
	oSim.p.pressed();
}

function mouseReleased(){
	oSim.p.released();
}

  