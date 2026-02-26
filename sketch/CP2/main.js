const BKG = '#E6CFB3'; //background color
const FRG = '#2c2621'; //foreground color
const PRIMARY = "hsl(0, 76%, 31%)";
const SECONDARY =  "hsl(108, 60%, 33%)";
const TERTIARY =  "hsla(34, 78%, 40%, 1.00)";

const MODES = ["TORIC","REAL", "REAL3D", "STELLAR","STELLAR3D"];

//Parent in file is "ifs_sketch"
let parent = "CP2_sketch";



let ui; // layer for selecting polynomials
let r; //layer for rendering points on curve :)
let canvasSize;
let degree=3;
let shiftDown=false;

const defaultUIState = {
	realCoefs: true,
	degree: 3,
	enableRealCurve: false,
	displayMode: MODES[0]
};

const uiState = defaultUIState;


function setup() {
	let elem = document.getElementById(parent);
	boundingRect = elem.getBoundingClientRect();
	canvas=createCanvas(boundingRect.width, boundingRect.width/2,WEBGL);
	canvas.parent(parent);
	canvasSize = min(width, height); //sets size of canvas.

	 //holds all the selectors and triangle
	ui = new graphicsWindow(canvasSize, {x:-2, y:-1, width:2, canvasMode: P2D});

	let sideLen = 1.9
	let vertShift = 0.1;
	let triVertices = [
		createVector(-0.5, -sqrt(3) / 6-vertShift).mult(sideLen),
		createVector(0.5, -sqrt(3) / 6-vertShift).mult(sideLen),
		createVector(0, sqrt(3) / 3-vertShift).mult(sideLen)
	];
	ui.triCoord = new TriangleCoords(triVertices);
	ui.selectors = new SelectorArray(ui.triCoord,degree,{real:true});
	//ui.selectors.doSymmetrize=true;
		
	//holds all the rendering for the curve.
	r = new pointSystem(canvasSize, {
		x:0, y:-1, width:2, 
		canvasMode: WEBGL, 
		mode:MODES[0],
		triCoord: ui.triCoord,
		selectors: ui.selectors
	})

	setupUI();
}

function setupUI(){
	// Left panel controls
	const realCoefs = document.getElementById('realCoefs');
	const degreeSlider = document.getElementById('degreeSlider');
	const enableRealCurve = document.getElementById('realCurve');
	const displayMode = document.getElementById('displayMode');

	realCoefs.checked = defaultUIState.realCoefs;
	degreeSlider.value = defaultUIState.degree;
	enableRealCurve.checked = defaultUIState.enableRealCurve;
	displayMode.value = defaultUIState.displayMode;

	// Real coefficients checkbox
	realCoefs.addEventListener("change", function() {
		uiState.realCoefs = this.checked;

		// Show/hide real curve checkbox
		document.getElementById("realCurveContainer").style.display =
			uiState.realCoefs ? "block" : "none";

		// If disabled, uncheck real curve
		if (!uiState.realCoefs) {
			document.getElementById("realCurve").checked = false;
			uiState.enableRealCurve=false;
			r.enableRealCurve = uiState.enableRealCurve;
	 		r.scheduleReset=true;
		}
	});

	// Update state when controls change
	realCoefs.addEventListener('change', () => {
		uiState.realCoefs = realCoefs.checked;
		ui.selectors.setRealMode(uiState.realCoefs);
	});

	degreeSlider.addEventListener('input', () => {
		degree = parseInt(degreeSlider.value);
  		degreeValue.textContent = degree;
		uiState.degree = degree;
		ui.selectors.setDegree(degree);
	});

	enableRealCurve.addEventListener('change', () => {
		uiState.enableRealCurve = enableRealCurve.checked;
		r.enableRealCurve = uiState.enableRealCurve;
	 	r.scheduleReset=true;
	});

	displayMode.addEventListener('change', () => {
		uiState.displayMode = displayMode.value;
		r.setMode(uiState.displayMode)
	});

	
}



function draw() {
	scale(height / 2, -height / 2, height / 2) //recale to a box [-1,1]times [-1,1]
	background(BKG);
	
	//// draw UI and selectors
	let layer = ui.g;
	layer.clear();
	layer.strokeWeight(0.01);
	layer.stroke(FRG);
	ui.triCoord.draw(layer);
	ui.selectors.update(ui.mouse());
	ui.selectors.draw(layer);
	ui.draw();

	if(ui.selectors.anyRollover() || r.mouse().isInside){ 
		disableScroll();
	} else {
		enableScroll();
	}
	
	//draw point renderer
	r.render(); //draw points to internal image
	r.draw();
}

function keyPressed() {
    if (keyCode === SHIFT) {
        ui.selectors.setScrollMode("angle");
		shiftDown=true;
    }
}

function keyReleased() {
    if (keyCode === SHIFT) {
		ui.selectors.setScrollMode("scale");
		shiftDown=false;
    }
}

function mouseWheel(event) {
    ui.selectors.scroll(event.delta);

	if(r.mouse().isInside && !ui.selectors.isUpdating()){
		r.pan.dZoom-=event.delta/10000;
	}
}

//go through and call the fractal points "pressed" function
function mousePressed() {
    ui.selectors.pressed();
}

//when mouse is released, make each draggable "released", and delete them if outside of screen.
function mouseReleased() {
    ui.selectors.released();
}

//when mouse is released, make each draggable "released", and delete them if outside of screen.
function mouseDragged() {
	if(r.mouse().isInside && !ui.selectors.isUpdating()){
		if(!shiftDown){
			r.camVelocity.y = (mouseX - pmouseX)*r.camSensitivity;
			r.camVelocity.x = (mouseY - pmouseY)*r.camSensitivity;	
		}
		

		if(!r.doCameraControl || shiftDown){
			let mousePos= r.screenToLocal(mouseX,mouseY);
			let pMousePos = r.screenToLocal(pmouseX,pmouseY);
			r.pan.dx = mousePos.x-pMousePos.x;
			r.pan.dy = mousePos.y-pMousePos.y;
		}
		
	}
    
}

//creates square graphics window
class graphicsWindow {
	//x,y represent BOTTOM LEFT corner of image.
	constructor(pixels, {x=-1,  y=-1, width=2, canvasMode=WEBGL}) { 
		this.x = x;
		this.y = y;
		this.pixels= pixels;
		this.width = width;

		this.pixels = pixels;
		this.g = createGraphics(pixels, pixels, canvasMode);
		this.transformCoords()
	}

	transformCoords(){
		let h = this.pixels;
		if(this.g._renderer.isP3D){ //IF WEBGLMODE: 
                this.g.scale(h / 2, h / 2, h / 2 );
		} else { //if 2D mode
			this.g.translate(h / 2, h / 2);
			this.g.scale(h / 2, h / 2);			
		}
	}

	draw() {
		image(this.g, this.x, this.y, this.width, this.width);
	}

	mouse() {
		return this.screenToLocal(mouseX, mouseY);
	}

	screenToLocal(mx, my) {
		//normalize mx,my to [-1,1]
		let mu = (mx - width / 2) * 2 / canvasSize;
		let mv = -(my - height / 2) * 2 / canvasSize;

		// move mu,mv to local coordinates
		let localX = 2 * (mu - this.x) / this.width - 1;
		let localY = 2 * (mv - this.y) / this.width - 1;

		let isInside = true;
		if (
			localX < -1 ||
			localX > 1 ||
			localY < -1 ||
			localY > 1
		) {
			isInside = false;
		}

		return { x: localX, y: localY, isInside: isInside };
	}
}

class pointSystem extends graphicsWindow{
	//options:
	// x, y, width , canvasMode
	// selectors (class SelectorArray)
    // mode: "REAL", "REAL3D", "STELLAR" "STELLAR3D", "TORIC"
	constructor(pixels, options) { 
		super(pixels, options);

		this.selectors = options.selectors
		this.curve = this.selectors.curve();
		this.numPts=0;
		this.scheduleReset=false;
		this.zoom=1;
		
		this.mode =  options.mode;
		this.doCameraControl = false;
		this.triCoord=options.triCoord;

		let v = createVector(0,0);
		this.pan = {doPan: false, dx: 0, dy: 0 , active:false, dZoom:0, zoom:1};

		this.camVelocity=createVector(0,0);
		this.camSensitivity=1/100;
		this.camDrag=0.95;

		this.setupMode();
	}

	//generates the curve from the selectors
	updateCurve(){
		return this.curve.setCoefs(this.selectors.getCoefs());
	}

	reset(){
		this.g.clear();
		this.numPts=0;
		this.scheduleReset=false;
	}

	render(){
		if(this.scheduleReset){
			this.reset();
		}

		
		let doClearPts =  r.updateCurve(); //if I updated the curve, then clear the poits.
		if(this.doCameraControl ){
			let isCamMove=  r.camVelocity.magSq()>1e-4
			doClearPts = doClearPts || isCamMove //if move, then clear
			if(!isCamMove){
				r.camVelocity.x=0;
				r.camVelocity.y=0;
			}
		}
		if(this.pan.doPan ){
			let isPan= (this.pan.dx*this.pan.dx+this.pan.dy*this.pan.dy)> 1e-5;
			let isZoom =  this.pan.dZoom*this.pan.dZoom > 1e-6;
			doClearPts = doClearPts || isPan || isZoom;
			if(!isPan){
				this.pan.dx=0;
				this.pan.dy=0;
			}
			if(!isZoom){
				this.pan.dZoom=0;
			}
			
		}

		if(doClearPts){ //CORSE points
			this.pointStyle=this.coarse;
			this.scheduleReset=true; //cause reset next frame
		} else { //FINE points
			this.pointStyle=this.fine;
		}
		if(r.doCameraControl){
			this.g.rotateX(this.camVelocity.x);
			this.g.rotateY(this.camVelocity.y);
		} 
		if(this.pan.doPan){
			this.pan.zoom+=this.pan.dZoom;
			let zoomLevel = exp(this.pan.zoom-1);
			this.g.translate(this.pan.dx/zoomLevel,this.pan.dy/zoomLevel)
			this.g.scale(1+this.pan.dZoom);
		}
		this.camVelocity.mult(r.camDrag);
		this.pan.dZoom *= r.camDrag;
		this.pan.dx*=r.camDrag;
		this.pan.dy*=r.camDrag;

		
		this.drawCurve();
		this.renderCurveDecor();
	}

	setMode(mode){
		this.mode=mode;
		//this.g.clear();
		this.scheduleReset=true;
		this.g.resetMatrix();
		this.transformCoords();
		this.setupMode();
	}

	//set default parameters per mode, and do any other sorting out we need.
	setupMode(){
	this.camVelocity=createVector(0,0);
	this.maxPts=40000;
	this.maxPtsPerFame=5000;
	this.doCameraControl=false;
	this.pan.doPan=false;
	this.fine={size: 0.2, color: color(FRG)};
	this.pointStyle=this.fine;
	this.realPointStyle={size: 5,color: color(TERTIARY)};
	this.coarse={size: 2, color: color(0,255)};
	switch(this.mode){
		case "REAL": //x1,x2
			this.pan.doPan=true;
			this.g.scale(0.3);
			break;

		case "REAL3D": //x1,x2,norm squared of imaginary part
			this.doCameraControl=true;
			this.pan.doPan=true;
			this.g.ortho();
			break;

		case "STELLAR":
			this.doCameraControl=true;
			this.g.scale(0.7);
			this.maxPtsPerFame=2000;
			break;

		case "STELLAR3D": case "STELLAR3DLine":
			this.fine={size: 0.1, color: color(0,255)};
			this.coarse={size: 2, color: color(0,255)};
			this.lineLen=0.003;
			this.doCameraControl=true;
			this.maxPts=20000;
			this.maxPtsPerFame=2000;
			break;

		case "TORIC": //requires specifying triCoords
			this.pan.doPan=true;
			break;
		}	
	}

	renderCurveDecor(){
		let layer= this.g || window;
		layer.push();
		layer.strokeWeight(4);
		switch(this.mode){
			case "REAL":
				break;

			case "REAL3D": //x1,y1,x2
				break;

			case "STELLAR":
				layer.noStroke();
				layer.fill(BKG);
				let sphereRad=0.99;
				layer.sphere(sphereRad);
				layer.noFill();
				layer.stroke(FRG);
				layer.strokeWeight(2);

				//DRAW REFRENCE CIRCLES
				// let circleRad=1;
				// layer.rotateX(PI/4);
				// layer.rotateY(PI/4);
				// layer.circle(0,0,2*circleRad,100)
				// layer.rotateX(PI/2);
				// layer.circle(0,0,2*circleRad)
				// layer.rotateY(PI/2);
				// layer.circle(0,0,2*circleRad)
				break;

			case "STELLAR3D": case "STELLAR3DLine":
				layer.noStroke();
				layer.fill(color("hsla(0, 36%, 47%, 1.00)"));
				layer.sphere(0.04);
				break;

			case "TORIC": //requires specifying triCoords
				this.triCoord.draw(layer);
				break;
		}	
		layer.pop();
	}

	drawCurve(){
		// let options={
		// 	real:false,
		// 	iterations:100
		// }
		// let points = CP2Point.makeGrid(4,options);
		// let style={
		// 	size: 10,
		// 	color: color(0),
		// 	mode: "sup"
		// }
		// for(let dualPoint of points){
		// 	dualPoint.setStyle(style);
		// 	let l = CP2Line.dualLine(dualPoint);
		// 	let intersects = this.curve.intersect(l,options)
		// 	for (let p of intersects) {
		// 		p.style=l.style;
		// 		p.render(this)
		// 	}
		// }
		// return; //ignore everything below
		
		
		let ptsPerFrame = this.maxPtsPerFame/pow(r.curve.degree,1.5);
		if (this.numPts < this.maxPts) {
			let pointPortion = (this.maxPts - this.numPts) / this.maxPts; //progress bar from 1 to 0
			let numNewPoints = constrain(map(pow(pointPortion, 2), 1, 0, 1.5, 0), 0, 1) * ptsPerFrame;
			this.numPts += numNewPoints;
			this.drawPtsOnCurve(numNewPoints);
			if(this.enableRealCurve){
				this.drawPtsOnCurve(200,{real: true});
			}
			
		}
	}

	drawPtsOnCurve(numPts,options={real: false}) {
		let layer = this.g || window;
		layer.push();
		let style; 
		if(options.real){
			style=this.realPointStyle;
		} else {
			style=this.pointStyle;
		}
		
		
		if (this.curve.isZero()) {
			for (let i = 0; i < numPts; i++) {
				let p = CP2Point.randPoint(options)
				p.style=style
				p.render(this);
			}
		} else {
			for (let i = 0; i < numPts; i++) {
				let l = CP2Line.randLine(options);
				//let l = CP2Line.dualLine(CP2Point.randPoint(options),options);
				let intersects = this.curve.intersect(l,options)
				
				if(l.style){
					style=l.style;
				}
				for (let p of intersects) {
					p.style=style;
					p.render(this)
				}
			}
		}
		layer.pop();
	}

}



class TorusDrawer extends pointSystem{
	//options:
	//r1, r2 (radius of origional curve)
	// x, y, width , canvasMode
	// selectors (class SelectorArray)
    // mode: "REAL", "REAL3D", "STELLAR" "STELLAR3D", "TORIC"
	constructor(pixels, options){
		super(pixels,options);
		this.r1 = options.r1;
		this.r2 = options.r2;
		this.theta1=0;
		this.theta2=0;
	}

	renderCurveDecor(){
		let layer = this.g || window;
		layer.push();
		layer.stroke(color(SECONDARY));
		layer.strokeWeight(20);
		layer.point(0,0)
		//layer.circle(0,0,0.1);
		layer.pop();
	}

	drawPtsOnCurve(numPts,{real= false}={}) {
		let dx = (sqrt(5)-1)/2; //phi-1
		let dy = sqrt(3); // 2-phi (these should be rationaly independent)
		this.theta1 =0;
		this.theta2=0;

		let layer = this.g || window;
		layer.push();
		let style=this.pointStyle
		layer.stroke(style.color);
		layer.strokeWeight(style.size);
		for(let i = 0;i <numPts; i++){
			this.theta1=random();
			this.theta2=random();
			let z1 = Complex.polar(this.r1,this.theta1*TWO_PI);
			let z2 = Complex.polar(this.r2,this.theta2*TWO_PI);
			let pt = new CP2Point([1,z1,z2]); //point in p2
			let output = this.curve.eval(pt);
			//output.div(z1).div(z2);
			let scale = 0.2;
			point(output.x*scale,output.y*scale);
			//this.theta1   = (this.theta1+dx)%1
			//this.theta2   = (this.theta2+dy)%1
			

		}
		layer.pop();

	}
}