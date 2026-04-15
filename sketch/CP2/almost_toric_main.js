const BKG = '#E6CFB3'; //background color
const FRG = '#2c2621'; //foreground color
const PRIMARY = "hsl(0, 76%, 31%)";
const SECONDARY =  "hsl(108, 60%, 33%)";
const TERTIARY =  "hsla(34, 78%, 40%, 1.00)";

let parent = "almost_toric_sketch";


let E;
let ellipticRender;
let ellipticUI;
let ellipticUI2;
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


	curveUI = new CP2CurveSelectorUI({
		pixels: canvasSize,
		x:-2, y:-1, width:2, canvasMode: WEBGL,
		degree: defaultUIState.degree,
		real: defaultUIState.realCoefs
	})

	

	AurouxRender = new NodalTradeRenderer(curveUI.curve,{
		pixels: canvasSize,
	 	x:0, y:-1, width:2,
		projection: new AurouxProjection(0.5),
		selectors: [new NodeDragger(0,0,{direction:[1,0],maxDistance:10,t:0.5})]
	});

	tradeRender = new NodalTradeRenderer(curveUI.curve,{
		pixels: canvasSize,
	 	x:0, y:-1, width:2,
		projection: new NodalTradeProjection(0.5),
		selectors: [new NodeDragger(0,0,{direction:[1,1],maxDistance:10,t:0.5})],
	});

	focusFoucsRender = new NodalTradeRenderer(curveUI.curve,{
		pixels: canvasSize,
	 	x:0, y:-1, width:2,
		projection: new FocusFocusProjection({c:0.5, m:[0,1]}),
		selectors: [new NodeDragger(0,0,{direction:[1,1],maxDistance:10,t:0.5})],
	});

	windows=[curveUI, tradeRender];

	setupUI();
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

function setupUI(){
	const realCoefs = document.getElementById('realCoefs');
	const degreeSlider = document.getElementById('degreeSlider');
	const enableRealCurve = document.getElementById('realCurve');
	const symmetrize = document.getElementById('symmetrize');

	realCoefs.checked = defaultUIState.realCoefs;
	degreeSlider.value = defaultUIState.degree;
	enableRealCurve.checked = defaultUIState.enableRealCurve;
	symmetrize.value = defaultUIState.symmetrize;

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
		curveRender.setRealCurve(uiState.enableRealCurve);
	 	curveRender.scheduleReset=true;
	});

	symmetrize.addEventListener('change', () => {
		uiState.symmetrize = symmetrize.checked;
		curveUI.doSymmetrize =uiState.symmetrize;
	});


}


/////////////////////////
// almost toric controls
/////////////////////////


class AurouxProjection extends Projection{
	constructor(c=0.5){
		super();
		this.c = c;
	}
	setup(r) {
		r.camera = new Camera2D({x:-0.7,y:0});
	}

	getPointCoord(pt){
		let affineCoords = pt.getAffine();
		let z1=  affineCoords[0];
		let z2 = affineCoords[1];
		let c = new Complex(this.c,0);
		
		let H1 = z1.copy().mult(z2).sub(c).abs2();
		let H2 = (z1.abs2()-z2.abs2())/2;
		return [H1,H2];
	}

	renderDecor(r) {
		let g = r.g;
		g.push();
		g.stroke(r.FRG);
		g.strokeWeight(2);
		
		//draw boundary line
		g.line(0,-10,0,10);
		
		//draw node
		g.strokeWeight(1);
		g.line(0,0,this.c,0);
		g.translate(this.c,0);
		let crossSize=0.05;
		g.line(-crossSize,-crossSize,crossSize,crossSize);
		g.line(crossSize,-crossSize,-crossSize,crossSize);

		g.pop();
	}

}


class FocusFocusProjection extends Projection{
	constructor(options){
		const defaults = {
			c: 0.5,
			m: [1,0]
		};
		options = Object.assign({}, defaults, options);
		super(options);
		console.log(this.c);
	}
	setup(r) {
		r.camera = new Camera2D({x:-0.7,y:-0.7});
	}

	getPointCoord(pt){
		//let c = new Complex(this.c,0);
		let z0=pt.z0;
		let z1=pt.z1;
		let z2=pt.z2;
		let denominator = z0.abs2()+z1.abs2()+z2.abs2();
		let pertrubation = z1.copy().pow(this.m[1]).mult(z2.copy().pow(this.m[0]).conj());
		let J = this.m[0]*z1.abs2()+this.m[1]*z2.abs2()/(denominator);
		let H = z1.abs2() / denominator + this.c*pertrubation.x/pow(denominator,(this.m[1]+this.m[0])/2)
		return [H,J];
	}
}

class NodalTradeRenderer extends CurveRenderer{
	constructor(curve,options){
		let startT = 0.0;
		const defaults = {
			scheduler: new RandomCP2CurveScheudler(curve),
			projection: new NodalTradeProjection(startT),
			selectors: [new NodeDragger(0,0,{direction:[1,1],maxDistance:10,t:startT})],
			FRG: FRG,
			BKG: BKG,
		};
		options = Object.assign({}, defaults, options);
		super(curve,options);

		console.log(this.projection)
	}

	update(){
		super.update();
		let dir = this.selectors[0].direction;
		this.projection.c = this.selectors[0].t/sqrt(dir[0]*dir[0] + dir[1]*dir[1])
	}
}


class NodalTradeProjection extends Projection{
	constructor(c=0.5){
		super();
		this.c = c;
	}
	setup(r) {
		r.camera = new Camera2D({x:-0.7,y:-0.7});
	}

	getPointCoord(pt){
		let affineCoords = pt.getAffine();
		let z1=  affineCoords[0];
		let z2 = affineCoords[1];
		let c = new Complex(this.c,0);
		
		let H1 = z1.copy().mult(z2).sub(c).abs2();
		let H2 = (z1.abs2()-z2.abs2())/2;

		if(H2<0){
			H1 = H1 - H2;
		}

		H2 = H1 + H2;
		return [H1,H2];
	}

	renderDecor(r) {
		let g = r.g;
		g.push();
		g.stroke(r.FRG);
		g.strokeWeight(2);
		
		//draw boundary line
		g.line(0,0,0,10);
		g.line(0,0,10,0);
		
		//draw node
		g.strokeWeight(1);
		g.line(0,0,this.c,this.c);
		g.translate(this.c,this.c);
		let crossSize=0.05;
		g.line(-crossSize,-crossSize,crossSize,crossSize);
		g.line(crossSize,-crossSize,-crossSize,crossSize);

		g.pop();
	}

}

class NodeDragger extends ComplexDragger{
	constructor(x,y, options = {}) {
        const defaults = {
			startX: x,
			startY: y,
			direction: [1,0],
			maxDistance: 1,
			t:0.5
		};
		options=Object.assign({}, defaults, options); 

        super(x,y,options);
    }

	onUpdate(){
		let origin=createVector(this.startX,this.startY);
		let direction= createVector(this.direction[0],this.direction[1]).normalize();
		let rel = this.mouse.copy().sub(origin);
		let t = rel.dot(direction);
		t = constrain(t,0,this.maxDistance);
		let finalPos = origin.copy().add(direction.mult(t/direction.mag()));
		this.x = finalPos.x;
		this.y = finalPos.y;
        
		this.t=t;
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

