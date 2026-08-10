 /// Classes that give me points to plot. 

 class PointScheduler {
	constructor(options) {
		const defaults = {
			maxPerFrame: 1000,
			maxTotal: 40000,
			style: {size: 1 , color: color(0) },
			doStorePoints: false,
		};
	Object.assign(this, defaults, options);

	this.points=[];

	this.numPoints = 0;
	}

	// returns how many points to generate this frame
	//gets to fully filled as fast as possible.
	pointsThisFrame() {
		if (this.numPoints >= this.maxTotal) return 0;

		let n = this.maxPerFrame*this.pointVelocityProfile(this.numPoints/this.maxTotal);
		if (this.numPoints + n > this.maxTotal) {
			n = this.maxTotal - this.numPoints;
		}

		this.numPoints += n;
		return n;
	}

	//takes a number from [0,1] (the percentage filled i am) and outputs a number [0,1] (the number of points i should plot)
	//hook for sublasses. edit this if i want it to fill more slowly
	pointVelocityProfile(x){
		return 1;
	}

	reset() {
		this.numPoints = 0;
		this.points=[];
	}

	//returns wether or not the scheduler updated.
	update(){
		return false;
	}

	generate(newPoints, options) {		
		let points = [];
		for (let i = 0; i < newPoints; i++) {
			points.push(createVector(random()*2-1,random()*2-1));
		}
		return points;
	}

	next(options={}) {
		let n = this.pointsThisFrame();
		this.nextPoints = this.generate(n, options) //stores last generated points
		if(this.savePoints){
			this.points.append(this.doStorePoints);
		}
		return this.nextPoints;
	}
}


//class contianing hooks for point Projection class
class Projection {
	constructor(options){
		Object.assign(this, options);
	}

	setup(r){}

	renderPoint(p,r){
		r.g.push();
		r.g.stroke(p.style.color);
		let zoom=1;
		if(r.camera){
			zoom = r.camera.zoomLevel();
		}
		r.g.strokeWeight(p.style.size*zoom);
		this.plotPoint(p,r);
		r.g.pop();
	}

	getPointCoord(p){
		return [p.x,p.y];
	}

	plotPoint(p,r){
		let coords = this.getPointCoord(p);
		if(!coords[2]){
			coords[2]=0;
		}
		if(coords[0].length){ // if it is an array of arrays
			for(let c of coords){
				r.g.point(c[0],c[1],c[2]);
			}
		}
		r.g.point(coords[0],coords[1],coords[2]);
	}

	renderDecor(r) {}

	update(){
		return false;
	};
}



class PointRenderer extends GraphicsWindowCamera{
	constructor(options){
		super(options);

		const defaults = {
			scheduler: new PointScheduler(),
			projection: new Projection(),
			doBackground: false,
			BKG: '#FFFFFF', 
			FRG: '#000000',
			scheduleReset: false,
			doClearPoints: false,
			camera: new Camera2D()
		};
		defaults.coarseStyle  	= { size: 1, color: color(defaults.FRG) };
		defaults.fineStyle 		= { size: 0.2, color: color(defaults.FRG) },

		Object.assign(this, defaults, options);
		this.projection.setup(this)
	}

	//clear the points this frame if we moved the camera or curve.
	update(){
		this.doClearPoints = super.update()  //checks if camera updated
							|| this.projection.update() //checks if projection parameters updated
							|| this.scheduler.update(); // checks if point scheduler updated
		return this.doClearPoints;
		
	}

	render() {
		if (this.scheduleReset ) {
			this.reset();
		}

		super.render();
		
		let pointStyle;
		if (this.doClearPoints) { //CORSE points
			pointStyle = this.coarseStyle;
			this.scheduleReset = true; //reset next frame
		} else { //FINE points
			pointStyle = this.fineStyle;
		}

		let pts = this.scheduler.next({style: pointStyle});

		for(let p of pts){
			this.projection.renderPoint(p,this);
		}
		this.projection.renderDecor(this);
	}

	reset() {
		if (this.doBackground) {
			this.g.background(this.BKG);
		} else {
			this.g.clear();
		}
		this.scheduler.reset();
		this.scheduleReset = false;
	}

	setProjection(proj) {
		this.projection = proj;
		this.projection.setup(this);
		this.reset();
	}

	setScheduler(s) {
		this.scheduler = s;
		this.reset();
	}
}

// ####################
//      EXAMPLES
// ####################

class StellarProjection extends Projection{
	constructor(options){
		super(options);
	}

	setup(r) {
		r.g.ortho();
		let newCam = new Camera3D();
		newCam.zoom=-0.1;
		r.camera=newCam;
	}

	plotPoint(p, r) {
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


class ToricProjection extends Projection{
	constructor(options){
		let triVertices = [
			createVector(0.7,-0.7),
			createVector(-0.7,-0.7),
			createVector(-0.7,0.7)
		];
		let tri = new TriangleCoords(triVertices)
		const defaults = {
			triCoord: tri,
		};

		options = Object.assign({}, defaults, options);
		super(options);
	
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