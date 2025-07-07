let ls= new Array(4);
let parent = "four-string-sketch";

function setup() {

	let target = document.getElementById(parent);
	let w = target.offsetWidth;
	let h = w; // square canvas, or use a different aspect ratio
  
	let canvas = createCanvas(w, h, WEBGL);

	angleMode(RADIANS);
	colorMode(HSB,100);
	background(color('#2c2621'));
	perspective(1, 1, 100, 10000)


	createLines();
	let button = createButton('Regenerate Lines');
	button.position(10, 10);
	button.mousePressed(createLines);
	button.class("btn");

	// Position the canvas and button
	canvas.parent(parent);  // Optional: attach canvas to a specific div
	button.parent(parent);  // Ensure button is in the same DOM container

	// Offset the button from the canvas top-left (HTML coordinates, not WEBGL)
	//canvas.position(100, 100);   // Move canvas to (100px, 100px)
	button.position(canvas.x + 10, canvas.y + 10);  // Position button relative to canvas
		
}

function draw() {
		background(color('#2c2621'));
		orbitControl();
		//ortho();
		scale(windowWidth);
		drawAxis();
		renderLines(ls);
}

function drawBorder(){
	stroke(color("#e6cfb3"));
	noFill();
	strokeWeight(30);
	rect(0,0,0.1,0.1);
}

//draws a central box to keep our bearings
function drawAxis(){
	let axisLength=0.2;
	strokeWeight(10);
	fill(lerpColor(color("#e6cfb3"), color("#2c2621"),0.6));
	stroke(color("#63a4ca"))
	box(axisLength*0.2);
}

function createLines(){
	//populate ls with 4 random lines, each an array of starting position and direction
	let range=0.2;
	for(let i=0;i<ls.length;i++){
		ls[i] = [createVector(random(-1,1),random(-1,1),random(-1,1)).mult(range),
						createVector(random(-1,1),random(-1,1),random(-1,1)).normalize()];
	}
}

function renderLines(ls){
	let fromColor=color("#e6cfb3");
	let toColor=color("#f34d41")
	stroke(color("#e6cfb3"));
	strokeWeight(20);
	let p;
	let v;
	let length=10;
	for(let i=0;i<ls.length;i++){
		
		stroke(lerpColor(fromColor, toColor, i/ls.length));
		p=ls[i][0].copy();
		v=ls[i][1].copy();
		
		//plots line from t=-length to t=length
		line(p.x-length*v.x,p.y-length*v.y,p.z-length*v.z,p.x+length*v.x,p.y+length*v.y,p.z+length*v.z)
		
		
	}
}

function windowResized() {
	let target = document.getElementById(parent);
	let w = target.offsetWidth;
	let h = w;
	resizeCanvas(w, h);
  }