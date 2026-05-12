//Requires my complex class
class Polynomial {
    //degree 0 first, higher degrees later
    //coefficents should be complex numbers
    constructor(coefs=[1]) {
        let newCoefs = [];
        for (let c of coefs) {
            //turn all the coefficents into complex numbers
            //also sanatizes inputs
            newCoefs.push(Complex.complexify(c))

        }
        this.setCoefs(newCoefs);
    }

     //each root is array of 2 complex numbers, representing ocmplex coordinates
    //[z0,z1] cooresponds to root [z1/z0]
    static fromProjectiveRoots(roots){
        let poly = new Polynomial();
        for(let r of roots){
            let linear = new Polynomial(r);
            poly.mult(linear);
        }
        return poly;
    }

    //monomial is (z-r)* sqrt( 4 / (1+r^2) )
    static fromRootsNormalize(roots){
        let poly = new Polynomial();
        for(let r of roots){
            let normalization = 2/sqrt(1+r.abs2());
            let linear = new Polynomial([r.copy().mult(-normalization), normalization]);
            poly.mult(linear);
        }
        return poly;
    }
 
    //scaling of the bombieri norm
    sphericalNormSq(){
        let d = this.degree
        let norm = 0;
        for(let n=0;n<=d;n++){
            let c = nChooseK(d,n);
            norm+=  this.coefs[n].abs2()/c;
        }
        return norm;
    }


    setCoefs(coefs) {
        this.coefs = coefs;
        this.degree = coefs.length - 1;
    }

    copy() {
        return new Polynomial(this.coefs);
    }

    //multiply with another polynomial (changes in place)
    mult(p) {
        if (typeof (p) == "number" || p.type == "complex") { //sanatize input
            p = new Polynomial([p])
        }
        let totalDeg = this.degree + p.degree;
        let newCoefs = [];
        for (let n = 0; n <= totalDeg; n++) { //initialize with zeros
            newCoefs[n] = new Complex(0, 0);
        }

        //loop through all elements of each polynomial
        for (let i = 0; i <= this.degree; i++) {
            for (let j = 0; j <= p.degree; j++) {
                newCoefs[i + j].add(p.coefs[j].copy().mult(this.coefs[i]))
            }
        }

        this.setCoefs(newCoefs);
        return this
    }

    //add another polynomial (changes in place)
    add(p) {
        for (let n = 0; n <= p.degree; n++) {

            if (n > this.degree) {
                this.coefs.push(p.coefs[n])
            } else {
                this.coefs[n].add(p.coefs[n])
            }
        }
        this.degree = this.coefs.length - 1;
        return this;
    }

    //evaluate polynomial
    eval(evalPoint) {
        let z = Complex.complexify(evalPoint);
        let output = Complex.zero();
        for (let n = 0; n <= this.degree; n++) {
            output.add(Complex.pow(z, n).mult(this.coefs[n]))
        }
        return output;
    }

    //take kth power of polynomial (changes in place)
    pow(k) {
        let newPoly = Polynomial.pow(this, k);
        this.setCoefs(newPoly.coefs);
        return this;
    }

    static pow(p, k) {
        if (k == 0) {
            return new Polynomial([1])
        }
        let newPoly = new Polynomial([1]);
        for (let i = 0; i < k; i++) {
            newPoly.mult(p);
        }
        return newPoly;
    }

    display() {
        let output = "";
        for (let n = 0; n <= this.degree; n++) {
            let c = this.coefs[n];
            if (c.isZero()) {
                continue;
            }

            if (output !== "") {
                output += " + "
            }

            let monomial;
            if (n == 0) {
                monomial = ""
            } else if (n == 1) {
                monomial = " x"
            } else {
                monomial = " x^" + str(n)
            }

            let disp = str(c.display());
            if (disp.indexOf("+") > -1) { // if we have a plus sign
                output += "(" + disp + ") " + monomial
            } else if (disp == "1" && n != 0) {
                output += monomial;
            } else {
                output += disp + monomial
            }

        }
        if (output == "") {
            output = "0"
        }
        return output;
    }

    //Durand–Kerner root finder, implemented by chat.
    roots(maxIter = 100, tol = 1e-10) {
        if (this.degree <= 0) {
            return [];
        }

        let n = this.degree;

        // Normalize polynomial so leading coefficient is 1
        let leading = this.coefs[n].copy();
        let normalized = this.coefs.map(c => c.copy());
        for (let c of normalized) {
            c.div(leading);
        }

        let poly = new Polynomial(normalized);

        // Initial guesses: roots of unity scaled slightly
        let roots = [];
        let radius = 1;
        for (let k = 0; k < n; k++) {
            let angle = TWO_PI * k / n;
            roots.push(Complex.polar(radius, angle));
        }

        // Durand–Kerner iteration
        for (let iter = 0; iter < maxIter; iter++) {
            let converged = true;

            for (let i = 0; i < n; i++) {
                let denominator = Complex.one();
                for (let j = 0; j < n; j++) {
                    if (i !== j) {
                        let diff = roots[i].copy().sub(roots[j]);
                        denominator.mult(diff);
                    }
                }

                let correction = poly.eval(roots[i]);
                correction.div(denominator);

                let newRoot = roots[i].copy().sub(correction);

                if (newRoot.copy().sub(roots[i]).abs2() > tol) {
                    converged = false;
                }

                roots[i] = newRoot;
            }

            if (converged) break;
        }

        this.roots = roots;
        return roots;
    }

}



function nChooseK(n, k) {
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n - k); // symmetry

    let result = 1;
    for (let i = 1; i <= k; i++) {
        result *= (n - (k - i));
        result /= i;
    }
    return result;
}