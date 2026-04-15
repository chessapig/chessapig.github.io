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
		//this.curve=curve;

		const defaults = {
			scheduler: new PointScheduler(),
			projection: new Projection(),
			doBackground: false,
			BKG: '#FFFFFF', 
			FRG: '#000000',
			scheduleReset: false,
			doClearPoints: false
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

	//converts this.scheduler.points to a pointcloud via projection, then saves as csv.
	exportPoints(){
		let points = this.scheduler.points;
		let coords = points.map(pt => this.projection.getPointCoord(pt)); //This will break if i return array of poitns. but thats okay
		console.log(coords);
	}
}


//eventually this will be my starscape scheudler...

// class gridScheduler extends PointScheduler {
// 	constructor(curve, maxPerFrame=5000, maxTotal=40000) {
// 		super(maxPerFrame, maxTotal);
// 		this.curve = curve; 
// 	}

// 	generate(numPoints, options={}) {
// 		let points = [];
// 		for (let i = 0; i < numPoints; i++) {
// 			if (this.curve.isZero()) {
// 				points.push(CP2Point.randPoint(options));
// 			} else {
// 				let l = CP2Line.randLine(options);
// 				points.push(...this.curve.intersect(l, options)); /// ... spreads out array of intersect, and puts them all individually
// 			}
// 		}
// 		return points;
// 	}

// 	next(options={}) {
// 		let n = this.pointsThisFrame();
// 		return this.generate(n, options);
// 	}
// }



//produces a grid of points inside of CP^2
//in projective coordinates, these are of the form (z0,z1,z2) where zk = ak + i bk
// ak,bk drawn from the range [-]
//get # grid points , starting at state. filling sequence is ticker tape, skipping already checked boxes.
// state: 
// tape ([*,...,*])
// base (current level of filling)
function getGridPoints(state,numPts){
    let points=[]
    let len = state.tape.length;
    let addedPoints=0;
    let allowEndLoop=false;
    while(addedPoints<numPts || !allowEndLoop){
        
        let t = incrementTickerTape(state,0).tape;
         if(max(t)==state.base-1){ //only include points which start at base
            points.push(getPointFromTape(state));
            allowEndLoop=true;
        }
        addedPoints+=1;
    }
    
    return {
        points: points,
        state: state
    };
}

//iterative function which increments ticker tape
// tape is array of numbers [*,...,*]
// position is the position you want to increment
// base is the base of the ticker tape
function incrementTickerTape(state, position){
    let tape=state.tape;
    let base=state.base;
    if(tape[position]<base-1){
        tape[position]+=1;
        return state;
    } else {
        if(position<tape.length-1){
            tape[position]=0;
            return incrementTickerTape(state,position+1);
        } else {
            //if i overflow, reset and increase the base
            for(let i =0; i<tape.length; i++){
                state.tape[i] = 0
            }
            state.tape[0]=state.base;
            state.base+=1;
            return state;
        }
    }
}

function getPointFromTape(state){
    const EPS = 1e-7; //epsilon to squiggle thing around
    let coords = state.tape.map(x => x-(state.base-1)/2);
    let p;
    if(coords.length==3){
        coords[0]+=EPS;
        p=new CP2Point(coords);
    } else {
        let z0 = new Complex(coords[0]+EPS,coords[1])
        let z1 = new Complex(coords[2],coords[3]-EPS)
        let z2 = new Complex(coords[4]-EPS,coords[5])
        p= new CP2Point([z0,z1,z2]);
    }
    return p;
}
