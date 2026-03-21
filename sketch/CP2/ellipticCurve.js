//class containing elliptic curves. Stores numbes as C/<1,tau>
class EllipticCurve {
	constructor( options) {
		const defaults = {
			tau: Complex.i(),
			thetaResolution: 3, //number of terms used in theta expansion
			level: 3 //degree of line bundle over elliptic curve (for use of canonical theta functions)
		};

		Object.assign(this, defaults, options);
	}

	//computes the jth canonical theta function of level this.level
	theta(z,j){
		z= Complex.complexify(z);
		j=j%this.level; //j = 0,1,...,level-1
		let theta=Complex.zero();
		for(let n=-this.thetaResolution;n<this.thetaResolution;n++){
			let x = j/this.level + n;
			// e^ ( pi i tau  N (j/N+n)^2  + 2 pi i z N(j/N + n))
			let exponent = Complex.i().mult(this.tau).mult(PI*this.level*pow(x,2))
			exponent.add(Complex.i().mult(z).mult(2*PI*this.level*x));
			theta.add(Complex.exp(exponent));
		}
		return theta;
	}

	//computes the kodiara embedding at point z with level l (simply the values of all the theta functions)
	kodaira(z){
		let values = []
		for(let j=0; j<this.level; j++){
			values.push(this.theta(z,j));
		}
		return new CPNPoint(values);
	}

	// transforms x,y from the unit square to the fundamental cell of the lattice 1,tau
	transformToLattice([x,y]){
		let newX =  x + y*this.tau.x; 
		let newY = y*this.tau.y;
		return [newX,newY];
	}

	//gets random point in fundamental domain
	randPoint(){ 
		//start with uniform distrabution in [0,1] x [0,1]
		let coord = this.transformToLattice([random(),random()]);
		return new Complex(coord[0],coord[1]);
	}

	//returns all n-torsion points
	torsionPoints(n){
		let points=[];
		for(let i = 0;i<n;i++){
			for(let j = 0;j<n;j++){
				let coord = this.transformToLattice([i/n,j/n]);
				points.push(new Complex(coord[0],coord[1]));
			}
		}
		return points;
	}


}

class EllipticCurveRenderer extends pointSystem{
	constructor(options={}){
		super(options);

		let sideLen = 1.85
		let vertShift = 0.1;
		let triVertices = [
			createVector(-0.5, -sqrt(3) / 6 - vertShift).mult(sideLen),
			createVector(0.5, -sqrt(3) / 6 - vertShift).mult(sideLen),
			createVector(0, sqrt(3) / 3 - vertShift).mult(sideLen)
		];

		const defaults = {
			triCoord: new TriangleCoords(triVertices),
			ellipticCurve: new EllipticCurve(),
			pointMode: "random"
		};

		Object.assign(this, defaults, options);
	}

	//draw torison points
	 drawCurve(){
		super.drawCurve();
		if(this.pointMode=="torsion"){
			this.scheduleReset=true;
			let E = this.ellipticCurve;
			let torsionPts = E.torsionPoints(50);
			for(let z of torsionPts){
				let CP2Pt = new CP2Point(E.kodaira(z).p);
				CP2Pt.render(this);
			}
		}
	 }

	ptsPerFrame(){
		return 4000;
	}

	drawPtsOnCurve(numPts){
		if(this.pointMode=="random") {
			for(let i=0;i<numPts;i++){
				let  E = this.ellipticCurve;
				let randPt = E.randPoint(); 
				let CP2Pt = new CP2Point(E.kodaira(randPt).p);
				CP2Pt.render(this);
			}
		}
	}
}

//UI for editing ellptic curve
class EllipticCurveUI extends GraphicsWindow2DCamera{
	constructor(ellipticCurve,options={}){
		super(options);
		this.ellipticCurve=ellipticCurve;
		this.selectors=[new ComplexDragger(0,0)]; 
	}

	updateCurve(){
		let value = this.selectors[0].value();
		value.add(new Complex(0,1));
		if(!this.ellipticCurve.tau.equals(value)){
			this.ellipticCurve.tau = value;
			return true;
		}
		return false;
		
	}

	//draw things to this pane
	render(){
		
		let ctx = this.g || window;
		ctx.clear();
		this.drawAxes(ctx);
		super.render();
	}

	drawAxes(ctx){
		ctx.push();
		ctx.translate(0,-1);
		ctx.noFill();
		ctx.strokeWeight(2);
		ctx.line(-1,0,1,0); //x axis
		ctx.line(0,0,0,2); // y axis
		ctx.line(0.5,sqrt(3)/2,0.5,2);  //right boundary
		ctx.line(-0.5,sqrt(3)/2,-0.5,2);  //left boundary
		ctx.arc(0,0,2,2,PI/3,2*PI/3)
		ctx.pop();
	}
	
}