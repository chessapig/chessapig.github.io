class Complex {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
		this.type = "complex"

	}

	isZero(eps = 1e-6) {
		return abs(this.x) < eps && abs(this.y) < eps
	}

	display() {
		let numDigits = 2;
		let eps = 0.00001;
		let doPlus = true;

		let realPart, imagPart;
		if (this.x - int(this.x) == 0) {
			realPart = str(this.x);
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

	static pow(z, n) {
		let rad = pow(z.abs(), n);
		let angle = z.theta() * n;
		let c = Complex.polar(rad, angle);
		return Complex.polar(rad, angle);
	}

	static polar(r, theta) {
		return new Complex(r * cos(theta), r * sin(theta));
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

	static randNormal(){ //box muller method for random gaussian
		 let r = sqrt(-2*log(random()));
	    let theta = TWO_PI*random();
	    return Complex.polar(r,theta);
	}

}