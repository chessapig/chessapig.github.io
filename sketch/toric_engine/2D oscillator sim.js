
var lissajousWithGraph = function(p){

let pos_o2D = [-.5,-.5]; //2D osscilator base poisition
let pos_oX = [0,1]; //x-osscilaotor base position relative to 2D osscilator
let pos_gX = [0,2]; //x-osscilaotor graph base position
let pos_oY = [1,0]; //x-osscilaotor base position
let pos_gY = [2,0]; //x-osscilaotor graph base position

let slider_freqX;
let slider_freqY;

let res=500;
let xOffset=0;

let oSim4;
let background_color,
	time,
	pos_sliderX,
	pos_sliderY;

p.setup = function(){

	res=p.windowHeight;
	xOffset=(p.windowWidth-p.windowHeight)/2;
	var width = document.getElementById('lissajousWithGraph').offsetWidth;
		c = p.createCanvas(width, p.windowHeight);
		c.parent("lissajousWithGraph");
	normalizeCoords(p);

	
	oSim4=new Oscillator2D_sim(p,.5,0,3,.2,-.2,1);
	oSim4.pt.size=2;
	oSim4.timeScale=1;
	//oSim.doDrawOrbit=false;

	gX=new Graph(p); //graph of phase space in X-axis
	//gX.doMinorGrid=false;
	gX.minorGridScale=2;
	gX.resolution=500;
	gX.border_smoothness=10;
	gX.doBkg=false;
	//gX.bkg=color(BKG);
	//gX.xLabel="x";
	//gX.yLabel="p";
	gX.setup();

	gY=new Graph(p); //graph of phase space in X-axis
	//gY.doMinorGrid=false;
	gY.minorGridScale=2;
	gY.resolution=500;
	gY.border_smoothness=10;
	gY.doBkg=false;
	//gY.bkg=color(BKG);
	//gY.xLabel="x";
	//gY.yLabel="p";
	gY.setup();

	slider_freqX = p.createSlider(1, 5, oSim4.freqX, 1);
	slider_freqY = p.createSlider(1, 5, oSim4.freqY, 1);

	p.rotate(p.PI/2);
	pos_sliderX=[275/500*res+xOffset, 325/500*res];
	slider_freqX.position(pos_sliderX[0],pos_sliderX[1]);
	slider_freqX.style('width', '200px')

	pos_sliderY=[275/500*res+xOffset, 425/500*res];
	slider_freqY.position(pos_sliderY[0],pos_sliderY[1]);
	slider_freqY.style('width', '200px')

	background_color=p.color(BKG);
	background_color.setAlpha(200);
	time=0;
  }

  p.draw = function(){
	p.background(background_color);
	

	//update values of periods
	let freqX=slider_freqX.value();
	let freqY=slider_freqY.value();
	oSim4.freqX=freqX;//+.001;
	oSim4.freqY=freqY;

	p.push();
	p.textSize(18);
	p.fill(p.color(WHITE));
	p.text('freq. of X-oscillator: ', pos_sliderX[0], (pos_sliderX[1]-20));
	p.text('freq. of Y-oscillator: ', pos_sliderY[0], (pos_sliderY[1]-20));

	console.log(pos_sliderX);
	p.textSize(24);
	p.fill(p.color(YELLOW));
	p.text(p.str(freqX), pos_sliderX[0]+175, pos_sliderX[1]-20);
	p.text(p.str(freqY), pos_sliderY[0]+175, pos_sliderY[1]-20);
	p.pop();

	normalizeCoords(p);

	p.translate(pos_o2D[0],pos_o2D[1]);
	p.mX+=.5;
	p.mY+=.5;
	var rescale=0.5;
	p.scale(rescale);
	p.mX/=rescale;p.mY/=rescale;

	//draw many points along orbit
	// let Points=[];
	// let numPts=5;
	// for(let n=0;n<numPts;n++){
	// 	oSim.rotatePhase(1/numPts*2*PI);
	// 	oSim.p.draw();
	// 	Points.push(new Point(oSim.p.x,oSim.px));
	// 	//Points[n].draw();
	// }
	
	//draw X osscilator graph
	p.push();
		p.translate(pos_gX[0],pos_gX[1]);
		gX.update();
		// for(let n=0;n<numPts;n++){
		// 	gX.drawPoint(Points[n].x,Points[n].y*oSim.freqX,color(WHITE));
		// }
		gX.drawPoint([oSim4.x,oSim4.px*oSim4.freqX],p.color(WHITE));
		gX.drawBorder();
		p.image(gX.c,-1,-1,2,2);
	p.pop();

	//draw Y osscilator graph
	p.push();
		p.translate(pos_gY[0],pos_gY[1]);
		gY.c.push();
		gY.c.rotate(-p.PI/2);
		gY.update();
		gY.drawPoint([oSim4.y,oSim4.py*oSim4.freqY],p.color(WHITE));
		gY.drawBorder();
		gY.c.pop();
		p.image(gY.c,-1,-1,2,2);
	p.pop();

	
	for(let i=0;i<10;i++){ //update 10 times to improve accuracy
		oSim4.update();
	}
	p.push();
		//translate(pos_o2D[0],pos_o2D[1]);
		//mX-=0.5; mY-=0.5;
		oSim4.draw();
	p.pop();

		//draw X osscilator
	p.push();
		p.translate(pos_oX[0],pos_oX[1]);
		var newPoint = new Point(p,oSim4.x,0);
		drawSpring(p,newPoint,0,0,time,p.pow(3*oSim4.px**2,.2));
	p.pop();

	//draw Y osscilator
	p.push();
		p.translate(pos_oY[0],pos_oY[1]);
		var newPoint = new Point(p,0,oSim4.y);
		drawSpring(p,newPoint,0,0,time,p.pow(3*oSim4.py**2,.2));
	p.pop();

	time+=.02;
	oSim4.time=time;

}
	
p.mousePressed = function(){ oSim4.pt.pressed();}
p.mouseReleased= function() { oSim4.pt.released(); }

}
var myp5 = new p5(lissajousWithGraph,"lissajousWithGraph");
