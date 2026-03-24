//class containing elliptic curves. Stores numbes as C/<1,tau>
class EllipticCurve {
	constructor( options) {
		const defaults = {
			tau: Complex.i(),
			thetaResolution: 3, //number of terms used in theta expansion
			level: 3, //degree of line bundle over elliptic curve (for use of canonical theta functions)
			torsion: 5, //for when i mess wth torsion...
			didUpdate: false
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

//UI for editing elliptic curve
//stores elliptic curve, and a complex dragg selector.
class EllipticCurveUI extends PointRenderer{
	constructor(options={}){
		const defaults = {
			ellipticCurve: new EllipticCurve()
		};
		options = Object.assign({}, defaults, options);
		super(options);

		let torsionScheduler = new EllipticTorsionScheduler({
			ellipticCurve: this.ellipticCurve,
		});
		this.scheduler = torsionScheduler;
		
		let ellipticTorsionProjection = new EllipticTorsionProjection({
			ellipticCurve: this.ellipticCurve
		})
		this.projection = ellipticTorsionProjection;

		this.selectors=[new ComplexDragger(0,1,{
			doConstrain: true,
			xRange: [-10,10],
			yRange: [0,10]
		})]; 
		this.camera.y=-1;
	}

	update(){
		super.update();
		let value = this.selectors[0].value();
		if(!this.ellipticCurve.tau.equals(value)){
			this.ellipticCurve.tau = value;
			this.ellipticCurve.didUpdate=true;
			return true;
		}
		this.ellipticCurve.didUpdate=false;
		return false;
	}
}

class EllipticCurveRenderer extends PointRenderer{
	constructor(E,options){
		super(options)
		this.ellipticCurve = E;
		this.scheduler = new EllipticTorsionScheduler({ ellipticCurve: E});
		this.projection = new EllipticCPnProjection({ellipticCurve: E, N:2})
	}

	update(){
		super.update();
		this.doClearPoints = this.doClearPoints || this.ellipticCurve.didUpdate;
	}
}



//produces numbers in [0,size-1]^d;
class GridScheduler extends PointScheduler{
	constructor(options){
		super(options);
		const defaults = {
			dimension: 2,
			size: 10
		};
		Object.assign(this, defaults, options);
		this.setGridSize(this.size);
	}

	setGridSize(size){
		this.size = size;
		this.maxTotal = pow(this.size, this.dimension);
		this.currentGridPoint =  0;
		this.delta = randCoprime(this.maxTotal);
	}

	//samples from 0 to n^d, then writes this as a number in base n.
	generate(newPoints,options){
		let points = [];
		for (let i = 0; i < newPoints; i++) {
			this.currentGridPoint = (this.currentGridPoint + this.delta) % this.maxTotal
			let baseSequence = convertToBase(this.currentGridPoint,this.size,this.dimension);
			let p = this.getPointFromBaseSequence(baseSequence);
			points.push(p);
		}
		return points;
	}

	getPointFromBaseSequence(baseSequence,options){
		return {
			grid: baseSequence,
			gridSize: this.size, //store the size of grid in the point
			style: stylizeGridPoint(baseSequence,options)}
		};
	

	stylizeGridPoint(baseSequence,options={}){
		let scaleFactor=100;
		let style = {size:min(scaleFactor/this.size,4), color: color(FRG)}
		if(options.style){
			stlye = {size: min(options.style.size *scaleFactor/this.size,4)   ,  color: color(FRG)}
		}
		return style;
	}
}

class EllipticTorsionScheduler extends GridScheduler{
	constructor(options={}){ //stores the elliptic curve, and the number of torsion points.
		const defaults = {
			ellipticCurve: new EllipticCurve()
		};
		options = Object.assign({}, defaults, options);
		super({dimension: 2 , size: options.ellipticCurve.torsion});
		Object.assign(this, defaults, options);
	}

	reset(){
		super.reset();
		this.setGridSize(this.ellipticCurve.torsion);
	}
	
	getPointFromBaseSequence(baseSequence,options){
		let tau = this.ellipticCurve.tau.copy();
		let x = baseSequence[0] / this.size;
		let y = baseSequence[1] / this.size;
		let c = tau.mult(y).add(Complex.one().mult(x));
		return {c:c,
				ellipticCurve: this.ellipticCurve,
		 		style: this.stylizeGridPoint(baseSequence,options) }

	}

	

	update(){
		if(this.ellipticCurve.didUpdate){
			this.reset();
		}
		return super.update() || this.ellipticCurve.didUpdate;
	}
}


class EllipticTorsionProjection extends Projection{
	constructor(options){ 
		super(options);
		const defaults = {
			ellipticCurve: new EllipticCurve()
		};
		Object.assign(this, defaults, options);
	}

	//takes a point p of the form {c,size,ellipticCurve} where c is complex number
	plotPoint(p,r){
		let c = p.c;
		r.g.point(c.x,c.y);
	}

	renderDecor(r) {
		let w = r.g
		
		//draw axes with fundamental domain
		w.push();
		w.noFill();
		w.strokeWeight(2);
		w.line(-100,0,100,0); //x axis
		w.line(0,0,0,200); // y axis
		w.line(0.5,sqrt(3)/2,0.5,200);  //right boundary
		w.line(-0.5,sqrt(3)/2,-0.5,200);  //left boundary
		w.arc(0,0,2,2,PI/3,2*PI/3)
		

		//draw fundamental cell of elliptic curve
		w.strokeWeight(1);
		let tau = this.ellipticCurve.tau;
		w.line(0,0,1,0);
		w.line(0,0,tau.x,tau.y);
		w.line(tau.x+1,tau.y,tau.x,tau.y);
		w.line(tau.x+1,tau.y,1,0);

		w.pop();
	}
}

//projects an elliptic curve into projective space
class EllipticCPnProjection extends Projection{
	constructor(options){
		super(options);
		const defaults = {
			N: 2
		};
		Object.assign(this, defaults, options);

		//computes barycentric coordinates for specifically the simplex mapped to the roots of unity
		this.vertices = new Array(this.N+1);
		for(let i=0; i<=this.N;i++){
			let theta = TWO_PI*i/(this.N+1);
			this.vertices[i] = createVector(cos(theta),sin(theta));
		}

	}

	//takes a point p of the form {c,ellipticCurve} where c is complex number
	plotPoint(p,r){
		let curve = p.ellipticCurve;
		curve.level = this.N+1
		let pt = curve.kodaira(p.c); // get point in CPN
		
		//get the norm squared while avoiding huge numbers:
		let values = pt.p.map(z => z.abs());  //FIRST take the absolute value
		values = values.map(x => pow(x,2)); //then square
		let sum = values.reduce((partialSum, a) => partialSum + a, 0); //find the total
		values = values.map(x => x/sum)// normalize
		

		
		let plotPoint = createVector(0,0);
		for(let i = 0; i<=this.N; i++){
			plotPoint.add(this.vertices[i].copy().mult(values[i]));
		}
		r.g.point(plotPoint.x,plotPoint.y)
	}

	renderDecor(r) {
		let N = this.vertices.length;
		for(let i=0;i<N; i++){
			for(let j=0;j<i;j++){
				r.g.line( this.vertices[i].x,this.vertices[i].y,this.vertices[j].x,this.vertices[j].y)
			}
			
		}
	}
}




//////////////////
// HELPER FUNCTIONS 
/////////////////

//adds two arrays, interpreting them as vectors
function addVector(a,b){
    return a.map((e,i) => e + b[i]);
}

function randCoprime(n) {
  while (true) {
    let a = floor(random() * n);
    if (gcd(a, n) === 1) return a;
  }
}

//returns an array of the number k in base n , with d digets
//written in reverse order: 106 written as [6,0,1]
function convertToBase(k,n,d) {
  let digits =  new Array(d).fill(0);
  for(let i=0;i<d;i++){
	digits[i] = k % n;
	k = floor(k / n);
  }
  return digits;
}

function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}