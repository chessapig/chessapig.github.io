let sketchSeed=0;
let c;
let res=100;
let frame=0;
let doDrawBackground=true;

let curves;

function setup() {
	colorMode(HSB, 100);
	createCanvas(700, 700);
	sketchSeed=random(0,1); //change the seed each time i run
	c = new FlowerCurve(res);

	curves = new isoperemetricCollection(100); // 100 curves
}

function draw() {

	let bord=0.01;
	background("#F7EBE0");
	//set coords to [-1,1] times [-1,1]
	translate(width/2,height/2); 
	scale(height/2,-height/2);
	scale(1);
	

	//set coordinates to [0,1]times[0,1]
	translate(-1,-1);
	scale(2);
	
	
	
	//translate(0.5,0.5);
	
	let regionScale=0.5;
	curves.perRange = 3*regionScale;
	curves.areaRange = 0.5*regionScale*regionScale;

	
	curves.perStart = 0;
	curves.areaStart = 0;



	curves.update();
	if(doDrawBackground){
		curves.drawBackground();
	}
	stroke(0);
	curves.drawCollection();

	
	noFill();
	strokeWeight(bord);
	rect(-bord/2,-bord/2,1+bord/2,1+bord/2);

	


	//draw single curve
	// stroke(0);
	// strokeWeight(0.01);
	// translate(0.5,0.5);
	// scale(0.3);
	// c.draw();


	

	// if(frame%10==1){
	// 	c = new FlowerCurve(res);
	// 	c.update();
	// 	plotCurve(c);
	// }
	
	frame+=1;
}

function mouseClicked() {
  //c = new FlowerCurve(res); 
  doDrawBackground = !doDrawBackground;
}