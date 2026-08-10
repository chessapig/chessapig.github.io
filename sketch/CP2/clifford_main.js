const BKG = '#E6CFB3'; //background color
const FRG = '#2c2621'; //foreground color
const PRIMARY = "hsl(0, 76%, 31%)";
const SECONDARY =  "hsl(108, 60%, 33%)";
const TERTIARY =  "hsla(34, 78%, 40%, 1.00)";

let parent = "almost_toric_sketch";

let windows = [];
let canvasSize;

let sliderTorsion ;

const defaultUIState = {
	realCoefs: true,
	degree: 3,
	enableRealCurve: false,
	symmetrize: false,
};

const uiState = defaultUIState;


function setup() {
	let elem = document.getElementById(parent);
	boundingRect = elem.getBoundingClientRect();
	canvas=createCanvas(boundingRect.width, boundingRect.width/2,WEBGL);
	canvas.parent(parent);
	canvasSize = min(width, height); //sets size of canvas.


	const cliffordRender = new PointRenderer({
			x:0, y:-1, width:2,
			scheduler:  new CliffordScheduler(),
			projection: new StellarProjection(),
			BKG: "#d2a16f", 
			FRG: FRG,
	})
	cliffordRender.camera.rotateAroundAxis(createVector(1,0,0),PI/2) 
	const linkRender = new PointRenderer({
			x:0, y:-1, width:2,
			scheduler:  new LinkScheduler(),
			projection: new ToricProjection(),
			BKG: "#d2a16f", 
			FRG: FRG,
	})
	const CP2UI = new CP2CliffordWindow({
		pixels: canvasSize,
		x:-2, y:-1, width:2, canvasMode: WEBGL,
		boundRenderer: cliffordRender
	})

	const CPnUI = new CPnCliffordWindow({
		pixels: canvasSize,
		x:-2, y:-1, width:2, canvasMode: WEBGL,
		boundRenderer: cliffordRender,
		height: 0.9,
		numPts: 3
	})

	const linkSelector = new DraggerWindow({
		pixels: canvasSize,
		x:-2, y:-1, width:2, canvasMode: WEBGL,
	})

	
	windows=[CP2UI,linkRender];

}



function draw() {
	scale(height / 2, -height / 2, height / 2) //recale to a box [-1,1]times [-1,1]
	background(BKG);

	for (let w of windows) {
		w.update();
		w.render();
		w.draw();
	}
}



/////////////////////////
// Classes to define windows
/////////////////////////

//manipulates point in toric poltrope of Pn, as n points on the intevrval whcih may not pass through eachother.
class CPnCliffordWindow extends DraggerWindow{
	constructor(options={}) {
		const defaults = {
			camEnabled: false,
			numPts: 3,
			height: 1,
		};
		options = Object.assign({}, defaults, options);
		super( options);

		this.draggerProperties = {
			doConstrain: true,
			xRange: [-0,0],
			yRange: [-this.height,this.height],
		}

		for(let i = 1 ;i<this.numPts+1; i++){
			let y = ((i)/(this.numPts+1) *2 - 1)*this.height;
			this.selectors.push(new ComplexDragger(0,y,this.draggerProperties))
		}

	}

	update(){
		let didUpdate = super.update();
		if(this.boundRenderer && didUpdate){
			this.boundRenderer.scheduler.bary = this.getBarycentricCoords();
			this.boundRenderer.scheduleReset = true;
		}
	}

	render(){
		this.g.clear();
		this.g.strokeWeight(2);
		this.g.line(0,this.height, 0, -this.height);
		let markWidth = 0.05;
		this.g.line(-markWidth,this.height, markWidth, this.height);
		this.g.line(-markWidth, - this.height, markWidth, - this.height);
		super.render();
	}

	generateSelectorDoubleClick(mousePos){
		let xClickMargin = 0.1;
		if(abs(mousePos.x)<xClickMargin && abs(mousePos.y)<this.height){
			return new ComplexDragger(0,mousePos.y,this.draggerProperties);
		}
		return false;
	}

	doubleClicked(mouseX=0,mouseY=0){
		super.doubleClicked(mouseX,mouseY);
		this.selectors.sort((a, b) => a.y - b.y); 
		this.numPts=this.selectors.length
	}

	getBarycentricCoords(){
		const EPSILON = 1e-8;
		let values = this.selectors.map(s => map(s.y,-this.height,this.height,EPSILON,1-EPSILON))
		values.sort();
		let bary = [];
		bary[0] = values[0];
		for(let i=1; i<values.length;i++){
			bary[i] = values[i]-values[i-1];
		}
		bary.push(1-values[values.length-1]);
		bary = bary.map(b => sqrt(b))
		return  bary;
	}
}





class CP2CliffordWindow extends GraphicsWindow {
	constructor(options) {
		super( options);

		// let sideLen = 1.85
		// let vertShift = 0.1;
		// let triVertices = [
		// 	createVector(-0.5, -sqrt(3) / 6 - vertShift).mult(sideLen),
		// 	createVector(0.5, -sqrt(3) / 6 - vertShift).mult(sideLen),
		// 	createVector(0, sqrt(3) / 3 - vertShift).mult(sideLen)
		// ];
		let triVertices = [
			createVector(0.7,-0.7),
			createVector(-0.7,-0.7),
			createVector(-0.7,0.7)
			
			
		];

		let tri = new TriangleCoords(triVertices)
		const defaults = {
			triCoord: tri,
			hideSelectors: false,
			selectors: [new CliffordDragger(0,0,{constrainTri: tri})],
			boundRenderer: false
		};

		Object.assign(this, defaults, options);
	}

	render(){
		this.g.clear();
		this.g.strokeWeight(2);
		this.triCoord.draw(this.g);
		super.render();
	}

	update(){
		let didUpdate = super.update();
		if(this.boundRenderer && didUpdate){
			this.boundRenderer.scheduler.bary = this.selectors[0].value();
			this.boundRenderer.scheduleReset = true;
		}


	}
}

class CliffordDragger extends ComplexDragger{
	constructor(x,y, options = {}) {
        const defaults = {
            doConstrain: true,
			constrainTri: new TriangleCoords([createVector(0,0),createVector(0,1),createVector(1,0)])
		};
		options=Object.assign({}, defaults, options); 

        super(x,y,options);
    }

	constrain(){
		let bary = this.value();
		bary = bary.map(x => max(x,0))
		let newScreen = this.constrainTri.barycentricToScreen(bary);
		this.x = newScreen.x;
		this.y = newScreen.y;
	}

	value(){
        return this.constrainTri.screenToBarycentric(createVector(this.x,this.y))
    }
}



//produces points on torus fibers in CP2
class CliffordScheduler extends PointScheduler{
	constructor(options={}){
		super(options);
		const defaults = {
			bary: [1,1,1],
		};
		Object.assign(this, defaults, options);
	}

	//samples from 0 to n^d, then writes this as a number in base n.
	generate(newPoints,options={}){
		let points = [];
		let n = this.bary.length-1;
		for (let i = 0; i < newPoints; i++) {
			let values = [];
			for(let i = 0; i<=n; i++){
				values[i] = Complex.polar(this.bary[i], random()*2*PI)
			}
			points[i] = new CPNPoint(values)
		}
		return points;
	}
}

// chooses points on a CP2 as sym^2(L), where L is a 2 component link. 
class LinkScheduler extends PointScheduler{
	constructor(options={}){
		super(options);
		const defaults = {
			circleCenters: [createVector(0,1,0),createVector(1,0,0)],
			areas: [0.01,0.01],
		};
		Object.assign(this, defaults, options);
	}

	_P1circle(p, r, theta) {
		// Find the projection 'h' of the target point onto p
		// r^2 = 2 - 2h  =>  h = 1 - r^2 / 2
		let h = 1 - (r * r) / 2;

		//sanitize inputs
		if(h>1 || h<-1){
			return false;
		}
		
		// The radius of the circle in the plane orthogonal to p
		let radius_ortho = Math.sqrt(1 - h * h);
		
		// Find an arbitrary vector 'w' that is not parallel to 'p'
		// If p is pointing heavily along the X axis, use Y axis. Otherwise use X axis.
		let w = createVector(1, 0, 0);
		if (Math.abs(p.x) > 0.9) {
			w = createVector(0, 1, 0);
		}
		
		//  Create two orthogonal basis vectors (u1, u2) perpendicular to p
		let u1 = p5.Vector.cross(p, w).normalize();
		let u2 = p5.Vector.cross(p, u1).normalize();
		
		// Calculate the final point q
		// q = h*p + radius_ortho * (cos(theta)*u1 + sin(theta)*u2)
		let q = p.copy().mult(h); // Component along p
		
		let v1 = u1.copy().mult(radius_ortho * Math.cos(theta));
		let v2 = u2.copy().mult(radius_ortho * Math.sin(theta));
		
		q.add(v1).add(v2);
		
		// Normalize at the end to correct any tiny floating point accumulation errors
		q.normalize();


		//convert to P1 projective coordinates 
		let z = new Complex(q.x/(1-q.z),q.y/(1-q.z));
        let norm = z.abs();
        if(norm < 1e-7){
            return  [new Complex(0) , new Complex(1) ]
        }
        let multiplier =  1/sqrt(norm); //equalize norm
        return [new Complex(multiplier) , z.copy().mult(multiplier)]
		
	}

	//samples from 0 to n^d, then writes this as a number in base n.
	generate(newPoints,options={}){
		let points = [];
		let rs = this.areas.map(A => 2*sqrt(A) )
		for (let i = 0; i < newPoints; i++) {
			let p1 = this._P1circle(this.circleCenters[0],rs[0],random(2*PI))
			let p2 = this._P1circle(this.circleCenters[1],rs[1],random(2*PI))
			//map Sym^2(P^1) into P^2 in projective coordinates
			let veronese = [
				p1[0].copy().mult(p2[0]),
				p1[1].copy().mult(p2[0]).add(p1[0].copy().mult(p2[1])),
				p1[1].copy().mult(p2[1])
			]
			points.push(new CP2Point(veronese))
		}
		
		return points;
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

function keyPressed() {
    if (keyCode === SHIFT) {
		for (let w of windows) {
			if(w.camera){
				w.camera.dragMode = "PAN";
				w.multiDragType = "ALL";
			}
		}
    }
}

function doubleClicked() {
    for (let w of windows) {
		w.doubleClicked(mouseX, mouseY);
	}
}

function keyReleased() {
    if (keyCode === SHIFT) {
		for (let w of windows) {
			if(w.camera){
				w.camera.dragMode =  "ROTATE";
				w.multiDragType = "CLOSEST";
			}
		}
    }
}



