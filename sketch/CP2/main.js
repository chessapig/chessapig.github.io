const BKG = '#E6CFB3'; //background color
const FRG = '#2c2621'; //foreground color
const PRIMARY = "hsl(0, 76%, 31%)";
const SECONDARY =  "hsl(108, 60%, 33%)";
const TERTIARY =  "hsla(34, 78%, 40%, 1.00)";

const PROJECTION_MODES = ["REAL", "REAL_3D", "REAL_TORIC","TORIC","TORIC_3D", "STELLAR","STELLAR3D"];
const POINT_MODES = ["random","starscape"];
const STARSCAPE_DISPLAY_MODES = ["uniform","discriminant","supremum"];


//Parent in file is "ifs_sketch"
let parent = "CP2_sketch";



let curveRender; //layer for rendering points on curve :)
let ellipticUI;
let ellipticRender; //layer for rendering the torsion points
let curveUI;
let windows = [];
let HDRender; //layer for hD render
let canvasSize;
let degree=3;

const defaultUIState = {
	realCoefs: true,
	degree: 3,
	enableRealCurve: false,
	projectionMode: PROJECTION_MODES[0],
	symmetrize: false,
	pointMode: POINT_MODES[0]
};

const uiState = defaultUIState;


function setup() {
	let elem = document.getElementById(parent);
	boundingRect = elem.getBoundingClientRect();
	canvas=createCanvas(boundingRect.width, boundingRect.width/2,WEBGL);
	canvas.parent(parent);
	canvasSize = min(width, height); //sets size of canvas.


	curveUI = new CP2CurveSelectorUI({
		pixels: canvasSize,
		x:-2, y:-1, width:2, canvasMode: WEBGL,
		degree:3
	})

	curveRender = new CurveRenderer(curveUI.curve,{
		pixels: canvasSize,
	 	x:0, y:-1, width:2,
		projectionMode:defaultUIState.projectionMode
	});

	windows=[curveUI, curveRender];

	setupUI();
}


function draw() {
	scale(height / 2, -height / 2, height / 2) //recale to a box [-1,1]times [-1,1]
	background(BKG);
	
	for(let w of windows){
		w.update();
		w.render();
		w.draw();
	}

	katex.render(curveUI.curve.display(), document.getElementById("curveEquation"));

	
	// ellitpicUI.render();
	// ellitpicUI.draw();

	//draw point renderer
	// r.render(); //draw points to internal image
	// r.draw();

	if(HDRender){
		HDRender.render();
		HDRender.draw();

		console.log(HDRender.numPts/HDRender.maxPts);

		if(HDRender.numPts>= HDRender.maxPts){
			print("done rendering");
			save(HDRender.g,"HD_Render.jpg");
			noLoop();
		}
	}
}


function setProjection(render, mode, options){
	switch(mode){
		case "REAL":
			render.projection = new CP2RealProjection();
			break;

		case "REAL_3D":
			render.projection = new CP23DProjection(options);
			break;

		case "REAL_TORIC":
			render.projection = new realToricProjection(options);
			break;

		case "TORIC":
			render.projection = new toricProjection(options);
			break;

		case "TORIC_3D":
			render.projection = new toric3DProjection(options);
			break;
	}
	render.projection.setup(render,{currentProjectionMode: render.projectionMode});
	render.projectionMode=mode;
	render.reset();
}

function setupUI(){
	// Left panel controls
	const inputCoefs = document.getElementById('inputCoefs');
	const realCoefs = document.getElementById('realCoefs');
	const degreeSlider = document.getElementById('degreeSlider');
	const enableRealCurve = document.getElementById('realCurve');
	const projectionMode = document.getElementById('projectionMode');
	const symmetrize = document.getElementById('symmetrize');
	const pointMode = document.getElementById('pointMode');


	realCoefs.checked = defaultUIState.realCoefs;
	degreeSlider.value = defaultUIState.degree;
	enableRealCurve.checked = defaultUIState.enableRealCurve;
	projectionMode.value = defaultUIState.projectionMode;
	symmetrize.value = defaultUIState.symmetrize;
	pointMode.value = defaultUIState.pointMode;

	//input for your own curve form
	// inputCoefs.addEventListener('change', () => {
	// 		curveUI.curve.parseFromString(inputCoefs.value)
	// 		console.log(curveUI.curve.display());
	// 		console.log("change)"+inputCoefs.value);
	// 	});

	// Real coefficients checkbox
	realCoefs.addEventListener("change", function() {
		uiState.realCoefs = this.checked;

		disableRealCheckbox(!uiState.realCoefs);
	});

	// Update state when controls change
	realCoefs.addEventListener('change', () => {
		uiState.realCoefs = realCoefs.checked;
		if(uiState.realCoefs){
			curveUI.setSelectorType("REAL");
		} else {
			curveUI.setSelectorType("COMPLEX");
		}
	});

	degreeSlider.addEventListener('input', () => {
		degree = parseInt(degreeSlider.value);
  		degreeValue.textContent = degree;
		uiState.degree = degree;
		curveUI.setDegree(degree);
	});

	enableRealCurve.addEventListener('change', () => {
		uiState.enableRealCurve = enableRealCurve.checked;
		curveRender.enableRealCurve = uiState.enableRealCurve;
	 	curveRender.scheduleReset=true;
	});

	projectionMode.addEventListener('change', () => {
		uiState.projectionMode = projectionMode.value;
		setProjection(curveRender,uiState.projectionMode,{triCoord: curveUI.triCoord});
	});

	symmetrize.addEventListener('change', () => {
		uiState.symmetrize = symmetrize.checked;
		curveUI.doSymmetrize =uiState.symmetrize;
	});

	pointMode.addEventListener('change', () => {
		uiState.pointMode = pointMode.value;
		r.setPointMode(uiState.pointMode)
		disableRealCheckbox(uiState.pointMode=="starscape");

	});

}

function disableRealCheckbox(doDisable){
	let isDisabled = uiState.realCoefs && uiState.pointMode!="starscape";
	// Show/hide real curve checkbox
	document.getElementById("realCurveContainer").style.display =
		isDisabled?   "block" : "none";

	// If disabled, uncheck real curve
	if (doDisable) {
		document.getElementById("realCurve").checked = false;
		uiState.enableRealCurve=false;
		// r.enableRealCurve = uiState.enableRealCurve;
		// r.scheduleReset=true;
	}
}



function keyPressed() {
    if (keyCode === SHIFT) {
		curveUI.setScrollMode("ANGLE");
		curveRender.camera.dragMode  =  "PAN";
    } else if (key == "r"){
		HDRender = r.hDRender(2000);
	}
}

function keyReleased() {
    if (keyCode === SHIFT) {
		curveUI.setScrollMode("SCALE");
		curveRender.camera.dragMode  = "ROTATE";
    }
}

function mouseWheel(event) {
	let didScroll=false;
	for(let w of windows){
		didScroll = didScroll || w.scroll(event.delta);
	}

	if(didScroll){
		event.preventDefault();
	}
}

function mousePressed() {
	for(let w of windows){
		w.pressed();
	}
}

function mouseReleased() {
	for(let w of windows){
		w.released();
	}
}

//when mouse is released, make each draggable "released", and delete them if outside of screen.
function mouseDragged() {
	for(let w of windows){
		w.dragged(mouseX,mouseY,pmouseX,pmouseY);
	}
    
}
