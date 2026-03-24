const BKG = '#E6CFB3'; //background color
const FRG = '#2c2621'; //foreground color


let parent = "elliptic_sketch";


let E;
let ellipticRender;
let ellipticUI;
let ellipticUI2;
let windows = [];
let canvasSize;

let sliderTorsion ;

const defaultUIState = {

};

const uiState = defaultUIState;


function setup() {
	let elem = document.getElementById(parent);
	boundingRect = elem.getBoundingClientRect();
	canvas = createCanvas(boundingRect.width, boundingRect.width/2 , WEBGL);
	canvasSize =boundingRect.width/2; //sets size of canvas.
	canvas.parent(parent);

	sliderTorsion = select("#sliderTorsion");
	sliderTorsion.input(() => {
			E.torsion = sliderTorsion.value();
			E.didUpdate=true;
		});


	E = new EllipticCurve({
		torsion: sliderTorsion.value(),
		thetaResolution: 3,
	});

	ellipticUI = new EllipticCurveUI({
		ellipticCurve: E,
		pixels: canvasSize,
		x: -2, y: -1, width: 2
	});

	ellipticRender = new EllipticCurveRenderer(E,{
		pixels: canvasSize,
		x: 0, y: -1, width: 2});

	// THIS HAS TO BE THE ORDER. 
	// If ellipticUI updates before elliptic render, it clears the elliptic curve didUpdate function 
	// needed to sync with the slider
	windows = [ellipticRender, ellipticUI]; 


}



function draw() {
	scale(height / 2, -height / 2, height / 2) //recale to a box [-1,1]times [-1,1]
	background(BKG);

	container = document.getElementById("torsionLabel");
	container.innerHTML = E.torsion+""  ;

	for (let w of windows) {
		w.update();
		w.render();
		w.draw();
	}
}


/////////////////////////
// MOUSE INTERACTION
/////////////////////////


function mouseWheel(event) {
	let didScroll = false;
	for (let w of windows) {
		didScroll = didScroll || w.scroll(event.delta);
	}

	if (didScroll) {
		event.preventDefault();
	}
}

function mousePressed() {
	for (let w of windows) {
		w.pressed();
	}
}

function mouseReleased() {
	for (let w of windows) {
		w.released();
	}
}

function mouseDragged() {
	for (let w of windows) {
		w.dragged(mouseX, mouseY, pmouseX, pmouseY);
	}

}

