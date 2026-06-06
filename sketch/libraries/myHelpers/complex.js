class Complex {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
		this.type = "complex"

	}

	isZero(eps = 1e-6) {
		return abs(this.x) < eps && abs(this.y) < eps
	}

	isReal(eps = 1e-6) {
		return abs(this.y) < eps;
	}

	typeOf(){
		return "complex"
	}

	display() {
		let numDigits = 1;
		let eps = 0.00001;
		let doPlus = true;

		let realPart, imagPart;
		if (abs(this.x - int(this.x)) < eps) {
			realPart = int(this.x);
		} else {
			realPart = nf(this.x, 1, numDigits);
		}

		if (this.y - int(this.y) == 0) {
			imagPart = str(this.y);
			if (abs(this.y - 1) < eps) {
				imagPart = ""
			}
		} else {
			imagPart = nf(this.y, 1, numDigits);
		}

		if (abs(this.x) < eps) {
			if (abs(this.y) > eps) {
				return imagPart + "i"
			}
			return "0"
		}

		if (abs(this.y) < eps) {
			return realPart;
		}

		return realPart + " + " + imagPart + "i"

	}

	//sets the value to that of another complex number c
	//returns true if the value changed, false otherwise
	set(c){
		let didSet=false;
		if(this.x != c.x){
			didSet=true;
			this.x=c.x
		}
		if(this.y != c.y){
			didSet=true;
			this.y=c.y;
		}
		return didSet;
	}
	
	equals(c){
		return this.x==c.x || this.y==c.y;
	}

	copy() {
		return new Complex(this.x, this.y);
	}

	vect() {
		return createVector(this.x, this.y);
	}

	theta() {
		return atan2(this.y, this.x);
	}

	abs2() {
		return this.x * this.x + this.y * this.y;
	}

	abs() {
		return sqrt(this.abs2());
	}

	add(c) {
		this.x += c.x;
		this.y += c.y;
		return this;
	}

	sub(c) {
		c=Complex.complexify(c);
		this.x -= c.x;
		this.y -= c.y;
		return this;
	}

	mult(c) {
		c=Complex.complexify(c);
		let newX = this.x * c.x - (this.y * c.y);
		let newY = this.x * c.y + this.y * c.x;
		this.x = newX;
		this.y = newY;
		return this;
	}

	div(c) {
		return this.mult(c.copy().inverse());
	}

	inverse() {
		let abs2 = this.abs2();
		this.x = this.x / abs2;
		this.y = -this.y / abs2;
		return this;
	}

	neg(){
		this.x=-this.x;
		this.y=-this.y;
		return this;
	}

	conj(){
		this.y = -this.y;
		return this;
	}

	pow(n) {
		let c = Complex.pow(this, n)
		this.x = c.x;
		this.y = c.y;
		return this;
	}

	arg(){
		return atan2(this.y,this.x);
	}

	equals(z){
		return this.x==z.x && this.y==z.y;
	}

	dot(z){
		return this.x*z.x+this.y*z.y;
	}

	//returns array of both complex square roots
	sqrt(){
		let theta = this.arg()/2;
		let r = sqrt(this.abs());
		let sqrt1 = Complex.polar(r,theta);
		let sqrt2 = sqrt1.copy().mult(-1);
		return[sqrt1,sqrt2];
	}

	static dot(z,w){
		return w.x*z.x+w.y*z.y;
	}

	static pow(z, n) {
		let rad = pow(z.abs(), n);
		let angle = z.theta() * n;
		let c = Complex.polar(rad, angle);
		return Complex.polar(rad, angle);
	}

	static polar(r, theta) {
		return new Complex(r * cos(theta), r * sin(theta));
	}

	static exp(z){
		return Complex.polar(exp(z.x), z.y);
	}

	static complexify(z) {
		if (typeof(z) == "number") { //works for real nubmers (floats / ints)
			return new Complex(z, 0)
		} else if (typeof(z) == "object") { //works for complexes or p5 vectors
			return new Complex(z.x, z.y)
		} else {
			return new Complex(0, 0);
		}

	}

	static zero() {
		return new Complex(0, 0)
	}

	static one() {
		return new Complex(1, 0)
	}

	static i() {
		return new Complex(0, 1)
	}

	//box muller method for random gaussian
	//if i plug in {seed: n} with integer n, then it returns a deteriminestic random normal.
	static randNormal(options={}){ 
		let rand1, rand2;
		if(options.seed){
			rand1 = hashFloat(2*options.seed);
			rand2 = hashFloat(2*options.seed+1);
		} else {
			rand1 = random();
			rand2 = random();
		}
		let r = sqrt(-2*log(rand1));
	    let theta = TWO_PI*rand2;
	    return Complex.polar(r,theta);
	}
}

function hashFloat(seed) {
	let x = seed | 0;

	x ^= x >>> 16;
	x = Math.imul(x, 0x7feb352d);
	x ^= x >>> 15;
	x = Math.imul(x, 0x846ca68b);
	x ^= x >>> 16;

	return (x >>> 0) / 4294967296;
}


//chatGPT implemented quaternions 
class Quaternion {
	constructor(w, x, y, z) {
		this.w = w; this.x = x; this.y = y; this.z = z;
	}

	static identity() {
		return new Quaternion(1,0,0,0);
	}

	static fromAxisAngle(axis, angle) {
		let h = angle/2, s = sin(h);
		return new Quaternion(cos(h), axis.x*s, axis.y*s, axis.z*s);
	}

	mult(q) {
		return new Quaternion(
			this.w*q.w - this.x*q.x - this.y*q.y - this.z*q.z,
			this.w*q.x + this.x*q.w + this.y*q.z - this.z*q.y,
			this.w*q.y - this.x*q.z + this.y*q.w + this.z*q.x,
			this.w*q.z + this.x*q.y - this.y*q.x + this.z*q.w
		);
	}

	normalize() {
		let m = sqrt(this.w*this.w + this.x*this.x + this.y*this.y + this.z*this.z);
		this.w/=m; this.x/=m; this.y/=m; this.z/=m;
		return this;
	}

	static slerp(q1, q2, t) {
		let cosT = q1.w*q2.w + q1.x*q2.x + q1.y*q2.y + q1.z*q2.z;
		if (abs(cosT) >= 1.0) return q1;

		let half = acos(cosT);
		let sinH = sqrt(1 - cosT*cosT);

		if (abs(sinH) < 1e-3) {
			return new Quaternion(
				(q1.w+q2.w)/2,
				(q1.x+q2.x)/2,
				(q1.y+q2.y)/2,
				(q1.z+q2.z)/2
			);
		}

		let a = sin((1-t)*half)/sinH;
		let b = sin(t*half)/sinH;

		return new Quaternion(
			q1.w*a + q2.w*b,
			q1.x*a + q2.x*b,
			q1.y*a + q2.y*b,
			q1.z*a + q2.z*b
		);
	}

	toMatrix() {
		let {w,x,y,z} = this;
		return [
			1-2*y*y-2*z*z, 2*x*y-2*z*w,   2*x*z+2*y*w,   0,
			2*x*y+2*z*w,   1-2*x*x-2*z*z, 2*y*z-2*x*w,   0,
			2*x*z-2*y*w,   2*y*z+2*x*w,   1-2*x*x-2*y*y, 0,
			0,0,0,1
		];
	}
}