





//Classes for SPECIFICALLY my website which lets you edit curves in CP2

// ============================== UI window for selecting coefficents of complex curve ================
class CP2CurveSelectorUI extends GraphicsWindow {
	constructor(options) {
		super( options);

		let sideLen = 1.85
		let vertShift = 0.1;
		let triVertices = [
			createVector(-0.5, -sqrt(3) / 6 - vertShift).mult(sideLen),
			createVector(0.5, -sqrt(3) / 6 - vertShift).mult(sideLen),
			createVector(0, sqrt(3) / 3 - vertShift).mult(sideLen)
		];

		const defaults = {
			triCoord: new TriangleCoords(triVertices),
			real: true,
			degree: 3,
			hideSelectors: false,
			doSymmetrize: false
		};

		Object.assign(this, defaults, options);

		this.curve= new CP2Curve();
		this.createSelectors();
		this.updateCurve();
	}

	render(){
		this.g.clear();
		this.g.strokeWeight(2);
		this.triCoord.draw(this.g);
		super.render();
	}

	update(){
		super.update();
		if(this.doSymmetrize){
			this.symmetrize();
		}
		this.updateCurve();
	}

	pressed(){
		super.pressed();
	}

	released(){
		super.released();
		if(this.doSymmetrize){
			this.symmetrize();
		}
	}

	//are any selectors updating?
	isUpdating(){
		let isUpdating=false;
		for(let s of this.selectors){
			isUpdating = isUpdating || s.isUpdating();
		}
		return isUpdating;
	}


	createSelectors() {
		//place selectors using barycentric coordinates
		for (let xDeg = 0; xDeg <= this.degree; xDeg++) {
			for (let yDeg = 0; yDeg <= this.degree - xDeg; yDeg++) {
				let zDeg = this.degree - xDeg - yDeg
				let position = this.triCoord.barycentricToScreen([xDeg, yDeg, zDeg]);
				let newSelector;
				if (this.real) {
					newSelector = new RealSelector({x: position.x, y: position.y});
				} else {
					newSelector = new ComplexSelector({x: position.x, y: position.y});
				}
				newSelector.hidden = this.hideSelectors;

				//have selectors store their own degrees
				newSelector.xDeg = xDeg;
				newSelector.yDeg = yDeg;
				if(xDeg == this.degree || yDeg == this.degree || zDeg == this.degree){ //enable the corners
					newSelector.enabled=true;
				}
				this.selectors.push(newSelector);
			}
		}
	}

	//updates the curve. Stores wether or not the curve just updated inside the curve itself.
	updateCurve(){
		let didUpdate=false;
		for(let s of this.selectors){
			let monomial = {
				xDeg: s.xDeg,
				yDeg: s.yDeg,
				c: s.value()
			};
			
			didUpdate= didUpdate || this.curve.setMonomial(monomial);
		}

		// delete monomials with no selector
		for (let m of this.curve.monomials){
			//does there exist a selector with this given monomial?
			let exists = this.selectors.some(s => 
				s.xDeg === m.xDeg && s.yDeg === m.yDeg 
			);
			if(!exists){
				m.c=Complex.zero();
				didUpdate=true;
			}
		}

		this.curve.sortMonomials();
		this.curve.didUpdate = didUpdate;
	}

	setDegree(newDegree){

		if(newDegree === this.degree) return; //dont do anything if new and old degree agree

		let newSelectors = []; //make shallow copy of selectors
		for (let xDeg = 0; xDeg <= newDegree; xDeg++) {
			for (let yDeg = 0; yDeg <= newDegree - xDeg; yDeg++) {

				let zDeg = newDegree - xDeg - yDeg;

				let s = this.selectors.find(sel =>
					sel.xDeg === xDeg && sel.yDeg === yDeg
				);

				let position = this.triCoord.barycentricToScreen([xDeg,yDeg,zDeg]);

				if(s){
					// reuse selector
					s.x = position.x;
					s.y = position.y;
					//disable the selector if it is a simple scrolling of undmodified corner.
					if(s.magnitude == s.defaults.magnitude && s.angle == s.defaults.angle && 
						(s.xDeg === this.degree || s.yDeg === this.degree) ){
							s.enabled=false 
						}
				}else{
					// create new selector
					if(this.real){
						s = new RealSelector({x:position.x,y:position.y});
					}else{
						s = new ComplexSelector({x:position.x,y:position.y});
					}

					s.xDeg = xDeg;
					s.yDeg = yDeg;
					s.hidden = this.hideSelectors;
				}

				newSelectors.push(s);
			}
		}

		// enable corner selectors
		for(let s of newSelectors){
			let zDeg = newDegree - s.xDeg - s.yDeg;
			if(s.xDeg === newDegree || s.yDeg === newDegree || zDeg === newDegree){
				s.enabled = true;
			}
		}

		this.degree = newDegree;
		this.selectors = newSelectors;
	}

	symmetrize(){
		for(let s of this.selectors){
			if(!s.isUpdating()) continue; //ignore the ones that arent currently updating (smart)

			let x = s.xDeg;
			let y = s.yDeg;
			let z = this.degree - x - y;

			let perms = [
				[x,y],
				[y,z],
				[z,x]
			];

			for(let [px,py] of perms){
				
				let target = this.selectors.find(sel =>
					sel.xDeg === px && sel.yDeg === py
				);
				if(target){
					target.copyParameters(s);
				}
			}
		}
	}

	setScrollMode(mode){
		for(let s of this.selectors){
			s.scrollMode=mode;
		}
	}

	//sets real mode. options are "REAL" and "COMPLEX"
	setSelectorType(mode){
		let newSelectors=[];
		for(let s of this.selectors){
			newSelectors.push(s.setSelectorType(mode));
		}
		this.selectors = newSelectors;
	}



}

class CP2RealProjection extends Projection{
	setup(r) {
		r.camera = new Camera2D({zoom: log(0.5)})
	}

	getPointCoord(pt){
		let affineCoords = pt.getAffine();
		return [affineCoords[0].x, affineCoords[1].x];
	}

}

//projects CP2 onto R2 by taking real parts, and using barycentric coordinates (setting x+y+z=1)
class CP23DProjection extends Projection{
	constructor(options){
		super();
		this.triCoord=options.triCoord;
		
	}

	setup(r,options){
		r.g.ortho();
		let newCam = new Camera3D();
		if(options.currentProjectionMode=="REAL"){ //only reset the camera if the other setting is not toric
			newCam.x= r.camera.x;
			newCam.y=r.camera.y;
			newCam.zoom=r.camera.zoom;
		}
		r.camera=newCam;
	}

	getPointCoord(pt){
		let affineCoords = pt.getAffine();
		return [affineCoords[0].x, affineCoords[1].x, affineCoords[0].y];
	}

}

//projects CP2 onto R2 by taking real parts, and using barycentric coordinates (setting x+y+z=1)
class realToricProjection extends Projection{
	constructor(options){
		super();
		this.triCoord=options.triCoord;
	}

	setup(r,options){
		if(options.currentProjectionMode!="TORIC"){ //only reset the camera if the other setting is not toric
			r.camera = new Camera2D();
		}
	}

	getPointCoord(pt){
		let affineCoords = pt.getAffine();
		let coords = this.triCoord.barycentricToScreen([1,affineCoords[0].x,affineCoords[1].x]);
		return [coords.x, coords.y];
	}

	renderDecor(r) {
		let g = r.g;
		g.push();
		g.stroke(r.FRG);
		g.strokeWeight(2);
		
		//draw lines extending through all the verticies
		let vs = this.triCoord.vertices;
		let numVs=vs.length;
		for(let i=0; i<numVs;i++){
			let iNext = (i+1)%numVs;
			let delta = vs[i].copy().sub(vs[iNext]).mult(10);
			let p0 = vs[i].copy().add(delta);
			let p1 = vs[i].copy().sub(delta);
			g.line(p0.x,p0.y,p1.x,p1.y);
		}

		g.pop();
	}
}

class toricProjection extends Projection{
	constructor(options){
		super();
		this.triCoord=options.triCoord;
	}

	setup(r,options){
		if(options.currentProjectionMode!="REAL_TORIC"){ //only reset the camera if the other setting is not toric
			r.camera = new Camera2D();
		}
	}


	getPointCoord(pt){
		let coords = this.triCoord.barycentricToScreen(pt.getNormSq());
		return [coords.x, coords.y];
	}

	renderDecor(r) {
		let g = r.g;
		g.push();
		g.stroke(r.FRG);
		g.strokeWeight(2);
		this.triCoord.draw(g);
		g.pop();
	}
}

class toric3DProjection extends toricProjection{
	constructor(options){
		super(options);
	}

	setup(r,options){
		r.g.ortho();
		let newCam = new Camera3D();
		if(options.currentProjectionMode=="REAL_TORIC" || options.currentProjectionMode=="TORIC"){ //only reset the camera if the other setting is not toric
			newCam.x= r.camera.x;
			newCam.y=r.camera.y;
			newCam.zoom=r.camera.zoom;
		}
		r.camera=newCam;
	}

	getPointCoord(pt){
		let coords = this.triCoord.barycentricToScreen(pt.getNormSq());
		let affine = pt.getAffine();
		return [coords.x, coords.y, affine[0].arg()/TWO_PI]; //z coordinate is phase
	}

}

//projection of what it would look like if you stood at zero and looked at your point (geodesic)
class POVProjection extends Projection{
	constructor(options){
		super(options);
	}

	setup(r,options){
		r.g.ortho();
		let newCam = new Camera3D();
		if(options.currentProjectionMode=="REAL_TORIC" || options.currentProjectionMode=="TORIC"){ //only reset the camera if the other setting is not toric
			newCam.x= r.camera.x;
			newCam.y=r.camera.y;
			newCam.zoom=r.camera.zoom;
		}
		r.camera=newCam;
	}


	plotPoint(pt, r) {
		let affine = pt.getAffine();
		let S3 = [affine[0].x,affine[0].y,affine[1].x,affine[1].y];
		r.g.point(coords.x, coords.y, affine[0].arg()/TWO_PI); //z coordinate is phase
	}
}


class StellarProjection {
	setup(r) {
		r.doCameraControl = true;
		r.g.scale(0.7);
	}

	renderPoint(p, r) {
		for (let c of p.getSpherical()) {
			r.g.point(c.x, c.y, c.z);
		}
	}

	renderDecor(r) {
		let g = r.g;
		g.noStroke();
		g.fill(r.BKG);
		g.sphere(0.99);
	}
}

class CurveRenderer extends PointRenderer{
	constructor(curve,options){
		const defaults = {
			scheduler: new RandomCP2CurveScheudler(curve),
			projection: new CP2RealProjection(),
		};
		options = Object.assign({}, defaults, options);
		super(options);
	}
}


// // ============================== curve renderer ================
// class pointSystem extends GraphicsWindow2DCamera {
// 	//options:
// 	// x, y, width , canvasMode
// 	// selectors (class SelectorArray)
// 	// projectionMode: "REAL", "REAL3D", "STELLAR" "STELLAR3D", "TORIC"
// 	// pointMode: "random", "starscape"
// 	// doBackground: true/ false
// 	constructor( options = {}) {
// 		super(options);

// 		const defaults = {
// 			doBackground: false,
// 			doCameraControl: false,
// 			pan: { doPan: false, dx: 0, dy: 0, active: false, dZoom: 0, zoom: 1 },
// 			camVelocity: createVector(0, 0),
// 			camSensitivity: 1 / 100,
// 			camDrag: 0.95,
// 			scheduleReset: false,
// 			numPts: 0, //this should always be 0 tbh...
// 			pointMode: "random",
// 			pointAddingSpeed: "slow", //slow / fast
// 			BKG: BKG,
// 			FRG: FRG,
// 			PRIMARY: PRIMARY,
// 			SECONDARY: SECONDARY,
// 			TERTIARY: TERTIARY,
// 			triCoord: options.ui.triCoord, //BE CAREFUL ABOUT THIS i dont always wanna pass in a tricoord!!!!!
// 		};

// 		Object.assign(this, defaults, options);

// 		this.setupMode();
// 		this.reset();
// 	}

// 	//make a new graphicswindow with an HD render
// 	hDRender(width) {
// 		let hD = new this.constructor(width, {
// 			x: 0, y: -1, width: 0.5,
// 			selectors: this.selectors,
// 			projectionMode: this.projectionMode,
// 			pointMode: this.pointMode,
// 			pointAddingSpeed: "fast",
// 			triCoord: this.triCoord,
// 			doBackground: true,
// 			BKG: 255,
// 			FRG: 0
// 		});
// 		hD.maxPts = 800000;
// 		hD.fine = { size: 0.5, color: color(0, 255) };

// 		return hD;
// 	}


// 	reset() {
// 		if (this.doBackground) {
// 			this.g.background(this.BKG);
// 		} else {
// 			this.g.clear();
// 		}
// 		this.numPts = 0;
// 		this.scheduleReset = false;
// 		this.clearGridTape();
// 	}

// 	clearGridTape() {
// 		this.gridState = {
// 			tape: [0, 0, 0, 0, 0, 0],
// 			base: 1
// 		}
// 		if (this.real) {
// 			this.gridState.tape = [0, 0, 0]
// 		}
// 	}

// 	update(){
// 		let didUpdateCamera = super.update();
// 		if(didUpdateCamera){
// 			this.scheduleReset=true;
// 		}
// 	}

// 	render() {
// 		if (this.scheduleReset) {
// 			this.reset();
// 		}
// 		let doClearPts = this.ui.updateCurve(); //if I updated the curve, then clear the poits.
// 		if (this.doCameraControl) {
// 			let isCamMove = this.camVelocity.magSq() > 1e-4
// 			doClearPts = doClearPts || isCamMove //if move, then clear
// 			if (!isCamMove) {
// 				this.camVelocity.x = 0;
// 				this.camVelocity.y = 0;
// 			}
// 		}
// 		if (this.pan.doPan) {
// 			let isPan = (this.pan.dx * this.pan.dx + this.pan.dy * this.pan.dy) > 1e-5;
// 			let isZoom = this.pan.dZoom * this.pan.dZoom > 1e-6;
// 			doClearPts = doClearPts || isPan || isZoom;
// 			if (!isPan) {
// 				this.pan.dx = 0;
// 				this.pan.dy = 0;
// 			}
// 			if (!isZoom) {
// 				this.pan.dZoom = 0;
// 			}

// 		}

// 		if (doClearPts) { //CORSE points
// 			this.pointStyle = this.coarse;
// 			this.scheduleReset = true; //cause reset next frame
// 		} else { //FINE points
// 			this.pointStyle = this.fine;
// 		}
// 		if (r.doCameraControl) {
// 			this.g.rotateX(this.camVelocity.x);
// 			this.g.rotateY(this.camVelocity.y);
// 		}
// 		if (this.pan.doPan) {
// 			this.pan.zoom += this.pan.dZoom;
// 			let zoomLevel = exp(this.pan.zoom - 1);
// 			this.g.translate(this.pan.dx / zoomLevel, this.pan.dy / zoomLevel)
// 			this.g.scale(1 + this.pan.dZoom);
// 		}
// 		this.camVelocity.mult(this.camDrag);
// 		this.pan.dZoom *= this.camDrag;
// 		this.pan.dx *= this.camDrag;
// 		this.pan.dy *= this.camDrag;


// 		this.drawCurve();
// 		this.renderCurveDecor();
// 	}

// 	setProjectionMode(mode) {
// 		this.projectionMode = mode;
// 		this.scheduleReset = true;
// 		this.g.resetMatrix();
// 		this.transformCoords();
// 		this.setupMode();
// 	}

// 	setPointMode(mode) {
// 		this.pointMode = mode;
// 		this.setupMode();
// 		this.scheduleReset = true;
// 	}


// 	//set default parameters per mode, and do any other sorting out we need.
// 	setupMode() {
// 		this.camVelocity = createVector(0, 0);
// 		this.maxPts = 40000;
// 		this.maxPtsPerFrame = 5000;
// 		this.doCameraControl = false;
// 		this.pan.doPan = false;
// 		this.realPointStyle = { size: 5, color: color(this.TERTIARY) };
// 		this.coarse = { size: 2, color: color(this.FRG) };
// 		this.fine = { size: 0.2, color: color(this.FRG) };
// 		this.pointStyle = this.fine;
// 		switch (this.projectionMode) {
// 			case "REAL": //x1,x2
// 				this.pan.doPan = true;
// 				this.g.scale(0.3);
// 				break;

// 			case "REAL3D": //x1,x2,norm squared of imaginary part
// 				this.doCameraControl = true;
// 				this.pan.doPan = true;
// 				this.g.ortho();
// 				break;

// 			case "STELLAR":
// 				this.doCameraControl = true;
// 				this.g.scale(0.7);
// 				this.maxPtsPerFrame = 2000;
// 				break;

// 			case "STELLAR3D": case "STELLAR3DLine":
// 				this.fine = { size: 0.1, color: color(this.FRG) };
// 				this.coarse = { size: 2, color: color(this.FRG) };
// 				this.lineLen = 0.003;
// 				this.doCameraControl = true;
// 				this.maxPts = 20000;
// 				this.maxPtsPerFrame = 2000;
// 				break;

// 			case "TORIC": //requires specifying triCoords
// 				this.pan.doPan = true;
// 				break;
// 		}

// 		switch (this.pointMode) {
// 			case "random":
// 				break;

// 			case "starscape":
// 				this.clearGridTape();
// 				this.maxPtsPerFrame = 500;
// 				break;
// 		}
// 	}

// 	renderCurveDecor() {
// 		let layer = this.g || window;
// 		layer.push();
// 		layer.strokeWeight(4);
// 		switch (this.projectionMode) {
// 			case "REAL":
// 				break;

// 			case "REAL3D": //x1,y1,x2
// 				break;

// 			case "STELLAR":
// 				layer.noStroke();
// 				layer.fill(this.BKG);
// 				let sphereRad = 0.99;
// 				layer.sphere(sphereRad);
// 				layer.noFill();
// 				layer.stroke(this.FRG);
// 				layer.strokeWeight(2);

// 				//DRAW REFRENCE CIRCLES
// 				// let circleRad=1;
// 				// layer.rotateX(PI/4);
// 				// layer.rotateY(PI/4);
// 				// layer.circle(0,0,2*circleRad,100)
// 				// layer.rotateX(PI/2);
// 				// layer.circle(0,0,2*circleRad)
// 				// layer.rotateY(PI/2);
// 				// layer.circle(0,0,2*circleRad)
// 				break;

// 			case "STELLAR3D": case "STELLAR3DLine":
// 				layer.noStroke();
// 				layer.fill(color("hsla(0, 36%, 47%, 1.00)"));
// 				layer.sphere(0.04);
// 				break;

// 			case "TORIC": //requires specifying triCoords
// 				layer.stroke(this.FRG);
// 				this.triCoord.draw(layer);
// 				break;
// 		}
// 		layer.pop();
// 	}

// 	//this is really janky im so grrrrrrrr
// 	ptsPerFrame(){
// 		return this.maxPtsPerFrame / pow(this.ui.curve.getDegree(), 1.5);
// 	}

// 	drawCurve() {
// 		let ptsPerFrame;
// 		switch (this.pointMode) {
// 			case "random":
// 				ptsPerFrame = this.ptsPerFrame();
// 				if (this.numPts <= this.maxPts) {
// 					let numNewPoints = 0;
// 					if (this.pointAddingSpeed == "slow") {
// 						let pointPortion = (this.maxPts - this.numPts) / this.maxPts; //progress bar from 1 to 0
// 						numNewPoints = constrain(map(pow(pointPortion, 2), 1, 0, 1.5, 0), 0, 1) * ptsPerFrame;
// 					} else if (this.pointAddingSpeed == "fast") {
// 						numNewPoints = ptsPerFrame;

// 					}
// 					this.numPts += numNewPoints;
// 					this.drawPtsOnCurve(numNewPoints);
// 					if (this.enableRealCurve) {
// 						this.drawPtsOnCurve(200, { real: true });
// 					}
// 				}
// 				break;

				

// 			case "starscape":
// 				let numNewPoints = this.maxPtsPerFrame / pow(this.ui.curve.getDegree(), 1.5);
// 				let style = {
// 					size: 2,
// 					color: color(this.FRG),
// 					pointMode: "sup"
// 				}
// 				if (this.scheduleReset) {
// 					numNewPoints = pow(6, 3.5);
// 				}
// 				if (this.numPts < this.maxPts) {
// 					let points = getGridPoints(this.gridState, numNewPoints).points

// 					for (let dualPoint of points) {
// 						dualPoint.setStyle(style);
// 						let l = CP2Line.dualLine(dualPoint);
// 						let intersects = this.curve.intersect(l, this.options)
// 						for (let p of intersects) {
// 							p.style = l.style;
// 							p.render(this)
// 						}
// 					}

// 					this.numPts += numNewPoints;
// 				}
// 				break;
// 		}
// 	}

// 	drawPtsOnCurve(numPts, options = { real: false }) {
// 		let layer = this.g || window;
// 		layer.push();
// 		let style;
// 		if (options.real) {
// 			style = this.realPointStyle;
// 		} else {
// 			style = this.pointStyle;
// 		}


// 		if (this.ui.curve.isZero()) {
// 			for (let i = 0; i < numPts; i++) {
// 				let p = CP2Point.randPoint(options)
// 				p.style = style
// 				p.render(this);
// 			}
// 		} else {
// 			for (let i = 0; i < numPts; i++) {
// 				let l = CP2Line.randLine(options);
// 				//let l = CP2Line.dualLine(CP2Point.randPoint(options),options);
// 				let intersects = this.ui.curve.intersect(l, options)
// 				if (l.style) {
// 					style = l.style;
// 				}
// 				for (let p of intersects) {
// 					p.style = style;
// 					p.render(this)
// 				}
// 			}
// 		}
// 		layer.pop();
// 	}

// }


