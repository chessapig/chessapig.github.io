//class of point in CPn
class CPNPoint {
    //store a point in projective coordinates as a N+1 complex numbers
    constructor(values) {
        this.set(values);
        this.N = values.length - 1;
        this.style = {
            size: 1.2,
            color: color(0)
        }
    }

    set(values) {
        this.p = values.map(c => Complex.complexify(c));
        return this;
    }

    copy() {
        let copyValues = this.p.map(c => c.copy());
        return new CPNPoint(copyValues);
    }

    static randPoint(N, { real = false } = {}) {
        let values = [];
        for (let n = 0; n <= N; n++) {
            let newValue = Complex.randNormal();
            if (real) {
                newValue = newValue.x;
            }
            values.push(newValue);
        }
        return new CPNPoint(values);
    }

    display() {
        let str = "[ ";
        for (let i = 0; i < this.p.length; i++) {
            str = str + this.p[i].display();
            if (i < this.p.length - 1) {
                str = str + " , "
            }
        }
        str = str + " ]"
        return str;
    }

    //returns hermitian dot product between points in CP2
    dot(p2) {
        let p1 = this.copy();
        let output = Complex.zero();
        for (let i = 0; i <= this.N; i++) {
            output.add(p2.p[i].copy().conj().mult(p1.p[i]))
        }
        return output;
    }


    //get affine coordinates for slice [1,z1,...]
    getAffine() {
        let coords = [];
        let z0 = this.p[0];
        for (let i = 1; i <= this.N; i++) {
            let z = this.p[i]
            coords.push(z.copy().div(z0));
        }
        return coords;
    }

    getStellar() {
        let poly = new Polynomial(this.p) //build a polynonial with coeffficents the affine coordinates
        return poly.roots(); //return pair of complex numbers
    }

    //converts stellar coordinates to points on boundary of sphere in 3d
    getSpherical() {
        let roots = this.getStellar();
        let spherePts = roots.map(r => {
            let K = 1 + r.abs2();
            return createVector(2 * r.x / K, 2 * r.y / K, 1 - 2 / K);
        });
        return spherePts;
    }

    getNormSq() {
        return this.p.map(c => c.abs2());
    }

}

//class of a point in CP2
class CP2Point extends CPNPoint {
    //store a point in projective coordinates as a triple of complex numbers
    constructor(values) {
        super([values[0], values[1], values[2]]); //only send 3 vlaues 
    }

    set(values) {
        super.set(values);
        this.z0 = this.p[0];
        this.z1 = this.p[1];
        this.z2 = this.p[2];
        return this;
    }

    copy() {
        let copyValues = this.p.map(c => c.copy());
        return new CP2Point(copyValues);
    }

    //set the style options
    setStyle(newStyle) {
        this.style.color = newStyle.color;
        let ratio;
        switch (newStyle.pointMode) {
            case "discriminant":
                //this discrimnant is b^2/4ac 
                //let discriminant = this.z1.copy().mult(this.z1).div(this.z0.copy().mult(this.z1).mult(4));
                //discriminant.sub(1); //measure how close the ratio is 1

                let discriminant = this.z1.copy().mult(this.z1).sub(this.z0.copy().mult(this.z1).mult(4));

                let norm = discriminant.abs();
                ratio = 2 / (sqrt(norm + 1))
                this.style.size = newStyle.size * ratio;
                this.style.color = lerpColor(color(TERTIARY), newStyle.color, ratio / 2)
                break;

            case "sup":
                let norms = [];
                for (let z of this.p) {
                    norms.push(z.abs());
                }
                ratio = 3 / (0.1 + pow((max(norms)), 1.7))
                this.style.color = lerpColor(color(TERTIARY), newStyle.color, max(norms) / 3)
                this.style.size = newStyle.size * ratio;
                break;
        }
    }

    //draw the curve "curve" in graphics window "ctx"
    // ----- options -----
    // CP2Curve curve
    // projectionMode: "REAL", "REAL3D", "STELLAR" "STELLAR3D", "TORIC"
    // triCoords 
    // ctx, p5.graphics object
    render(r) {
        let style = this.style;
        let ctx = r.g || window;
        let coords;
        ctx.stroke(style.color);
        ctx.strokeWeight(style.size);
        switch (r.projectionMode) {
            case "REAL":
                coords = this.getAffine();
                ctx.point(coords[0].x, coords[1].x);
                break;

            case "REAL3D": //x1,y1,x2

                coords = this.getAffine();
                //let abs2=pow(coords[0].y,2)+pow(coords[1].y,2);
                let pointPos = createVector(
                    coords[0].x,
                    coords[1].x,
                    pow(coords[0].y, 2) + pow(coords[1].y, 2));
                //ctx.stroke(lerpColor(style.color,color(255),pow(coords[0].y,2)+pow(coords[1].y,2)))
                ctx.point(pointPos.x, pointPos.y, pointPos.z);
                break;

            case "STELLAR":
                coords = this.getSpherical();
                for (let c of coords) {
                    ctx.point(c.x, c.y, c.z)
                }
                break;

            case "STELLAR3D":
                coords = this.getSpherical();
                let dt = r.lineLen;
                ctx.line(
                    lerp(coords[0].x, coords[1].x, 0.5 + dt),
                    lerp(coords[0].y, coords[1].y, 0.5 + dt),
                    lerp(coords[0].z, coords[1].z, 0.5 + dt),
                    lerp(coords[0].x, coords[1].x, 0.5 - dt),
                    lerp(coords[0].y, coords[1].y, 0.5 - dt),
                    lerp(coords[0].z, coords[1].z, 0.5 - dt))
                break;

            case "TORIC": //requires specifying triCoords

                let bary = this.getNormSq();
                let screen = r.triCoord.barycentricToScreen(bary);
                ctx.point(screen.x, screen.y);
                break;
        }
    }



    static cross(p1, p2) {
        return new CP2Point([
            p1.p[1].copy().mult(p2.p[2]).sub(p1.p[2].copy().mult(p2.p[1])),
            p1.p[2].copy().mult(p2.p[0]).sub(p1.p[0].copy().mult(p2.p[2])),
            p1.p[0].copy().mult(p2.p[1]).sub(p1.p[1].copy().mult(p2.p[0]))
        ])
    }

    //projects this onto orthogonal complement of p2
    proj_orthogonal(p2) {
        let dot = this.dot(p2);
        let norm = p2.dot(p2);
        let scale = dot.div(norm);
        for (let i = 0; i < 3; i++) {
            let z = this.p[i]
            z.sub(p2.p[i].copy().mult(scale)) //subtrract off the component parrallel to p2
        }
        return this;

    }

    //if options.real=true, return point on RP2
    //if options.seed, produce deteriminstic random point.
    static randPoint(options = {}) {
        let z0, z1, z2;
        if (options.seed) {
            z0 = Complex.randNormal({ seed: 3 * options.seed });
            z1 = Complex.randNormal({ seed: 3 * options.seed + 1 });
            z2 = Complex.randNormal({ seed: 3 * options.seed + 2 });
        } else {
            z0 = Complex.randNormal();
            z1 = Complex.randNormal();
            z2 = Complex.randNormal();
        }

        if (options.real) { //take real parts to get gaussian distributed point on RP2
            z0 = z0.x;
            z1 = z1.x;
            z2 = z2.x
        }

        return new CP2Point([z0, z1, z2]);
    }
}



//class for line in projective space
class CP2Line {
    //construct a complex line through two points in projective space
    constructor(p0, p1) {
        this.p0 = p0;
        this.p1 = p1;
        this.points = [p0, p1]
        //this.style = {}
    }

    //implicitly, a line is given by a point in the dual CP2
    implicit() {
        this.dualPt = CP2Point.cross(this.p0, this.p1);
        return this.dualPt;
    }

    //returns a triple of polynomials paramertizing the line
    //this will return p0 at z=0 and p1 at z=1 
    //(1-t)*p0 + t*p1 = p0 + (p1-p0)t
    paramertize() {
        let f0 = new Polynomial([this.p0.z0, this.p1.z0.copy().sub(this.p0.z0)])
        let f1 = new Polynomial([this.p0.z1, this.p1.z1.copy().sub(this.p0.z1)])
        let f2 = new Polynomial([this.p0.z2, this.p1.z2.copy().sub(this.p0.z2)])
        this.parametric = [f0, f1, f2];
        return this.parametric;
    }

    //evaluate linear functional on p (essentially dot product)
    eval(pt) {
        this.implicit();
        let output = Complex.zero();
        for (let i = 0; i < 3; i++) {
            output.add(pt.p[i].copy().mult(this.dualPt.p[i]));
        }
        return output;
    }

    //get point t along line according to paramertization
    interpolate(t) {
        if (!this.parametric) {
            this.paramertize();
        }
        let point = [];
        for (let f of this.parametric) {
            point.push(f.eval(t));
        }
        return new CP2Point(point);
    }

    display() {
        let str = "[ ";
        let fs = this.paramertize();
        for (let i = 0; i < fs.length; i++) {
            str = str + fs[i].display();
            if (i < fs.length - 1) {
                str = str + " , "
            }
        }
        str = str + " ]"
        return str;
    }

    static randLine(options) {

        //return CP2Line.dualLine(CP2Point.randPoint(options),options);
        let p1, p2;
        if (options.seed) {
            options.seed = options.seed * 2;
            p1 = CP2Point.randPoint(options);
            options.seed += 1;
            p2 = CP2Point.randPoint(options);
        } else {
            p1 = CP2Point.randPoint(options);
            p2 = CP2Point.randPoint(options);
        }
        return new CP2Line(p1, p2);
    }

    //returns the dual line to a point in CP^2
    //pick 2 random points in P2, project them onto the dual of the line, and orthogonalize
    //options:
    //  real (true/false) (ensures we produce a real line)
    static dualLine(point, options) {
        let p1 = CP2Point.randPoint(options).proj_orthogonal(point);
        let p2 = CP2Point.randPoint(options).proj_orthogonal(point);
        p1.proj_orthogonal(p2);
        let l = new CP2Line(p1, p2);
        l.style = point.style;
        return l;
    }
}

class CP2Curve {
    constructor(data = []) {
        this.monomials = [];
        this.didUpdate = false;

        // CASE 0: empty input
        if (data.length == 0) {
            this.monomials = [];
        }

        // CASE 1: list of monomials
        else if (data.length && data[0].xDeg !== undefined) {

            this.monomials = data.map(m => ({
                xDeg: m.xDeg,
                yDeg: m.yDeg,
                c: Complex.complexify(m.c)
            }));

            this.degree = 0;

            for (let m of this.monomials) {
                this.degree = max(this.degree, m.xDeg + m.yDeg);
            }

        }

        // CASE 2: triangular coefficient array
        else {

            this.degree = data[0].length - 1;

            for (let xDeg = 0; xDeg <= this.degree; xDeg++) {
                for (let yDeg = 0; yDeg <= this.degree - xDeg; yDeg++) {

                    let c = data[xDeg][yDeg];

                    if (c) {
                        this.monomials.push({
                            xDeg: xDeg,
                            yDeg: yDeg,
                            c: Complex.complexify(c)
                        });
                    }

                }
            }

        }


    }


    //sets the x,y degree monomial. n is object {xDeg, yDeg, c} for c a complex number
    //returns true if i changed something, false if not.
    setMonomial(n) {
        n.c = Complex.complexify(n.c);
        for (let m of this.monomials) {
            if (m.xDeg == n.xDeg && m.yDeg == n.yDeg) {
                if (!m.c.equals(n.c)) {
                    m.c = n.c;
                    return true; //i DID modify the monomial
                } else {
                    return false; //i failed to modify the monomial
                }
            }
        }
        //if i didnt see any monomials, add myself to the list
        if (!n.c.isZero()) {
            this.monomials.push(n);
            this.sortMonomials();
            return true; //if i added a whole new monomial, that WASNT ZERO, then i successfuly changed the coefficent
        }
        this.getDegree();
        return false;
    }

    //sort monomials and prune those with coeffenct zero
    sortMonomials() {
        this.monomials = this.monomials.filter(m => !m.c.isZero());
        this.monomials.sort((a, b) => {

            let degA = a.xDeg + a.yDeg;
            let degB = b.xDeg + b.yDeg;

            if (degA !== degB) return degA - degB;
            if (a.xDeg !== b.xDeg) return a.xDeg - b.xDeg;

            return a.yDeg - b.yDeg;
        });
    }

    display() {
        this.sortMonomials(); //ensures monomials are sorted, and that there are no zero coeffs
        let string = ""
        for (let i = 0; i < this.monomials.length; i++) {
            let m = this.monomials[i];
            let monomialStr = "";
            if (!m.c.isZero()) {
                if (m.c.isReal()) {
                    let realDisplay = m.c.display();
                    if (m.xDeg == 0 && m.yDeg == 0) {
                        monomialStr += realDisplay;
                    } else if (realDisplay == "1.0") {
                        monomialStr += ""; //dont put anything
                    } else if (realDisplay == "-1.0") {
                        monomialStr += "-" //only put a minus sign!
                    } else {
                        monomialStr += realDisplay;
                    }
                } else {
                    monomialStr += "(" + m.c.display() + ")";
                }
                //monomialStr += " \\cdot ";
                if (m.xDeg > 0) {
                    monomialStr += "x";
                    if (m.xDeg > 1) {
                        monomialStr += "^" + str(m.xDeg);
                    }
                }
                if (m.yDeg > 0) {
                    monomialStr += "y";
                    if (m.yDeg > 1) {
                        monomialStr += "^" + str(m.yDeg);
                    }
                }
                if (i != this.monomials.length - 1) {
                    monomialStr += " + "
                }
            }
            string += monomialStr;
        }

        if (string == "") {
            return "0"
        }
        return string;
    }

    getDegree() {
        this.degree = 0;

        for (let m of this.monomials) {
            this.degree = max(this.degree, m.xDeg + m.yDeg);
        }

        return this.degree;
    }

    eval(pt) {
        let output = Complex.zero();
        for (let m of this.monomials) {
            let zDeg = this.degree - m.xDeg - m.yDeg;
            let monomial =
                Complex.pow(pt.z1, m.xDeg)
                    .mult(Complex.pow(pt.z2, m.yDeg))
                    .mult(Complex.pow(pt.z0, zDeg));
            output.add(monomial.mult(m.c));
        }
        return output;
    }

    //intersect with CP2 Line l. 
    // returns array of CP2Points with length degree
    //options:
    intersect(l, options = {
        real: false,
        iterations: 100,
        tolerance: 1e-5
    }) {
        if (this.isZero()) {
            return [l.implicit()];
        }
        let line = l.paramertize();
        let poly = new Polynomial([0]); //restriction of defining polynomial of curve to line
        for (let m of this.monomials) {
            let zDeg = this.degree - m.xDeg - m.yDeg;

            let c = m.c;
            if (options.real) {
                c = c.x;
            }

            let monomial = new Polynomial([c]);

            monomial.mult(Polynomial.pow(line[0], m.xDeg))
            monomial.mult(Polynomial.pow(line[1], m.yDeg))
            monomial.mult(Polynomial.pow(line[2], zDeg))

            poly.add(monomial);
        }

        //loose tolerance, but lots of iterations
        let roots = poly.roots(options.iterations, options.tolerance);
        let points = [];
        for (let r of roots) {
            let intersectPt = l.interpolate(r);
            if (options.real) {  //if "real", only look at real intersections
                let coords = intersectPt.getAffine();
                let eps = 1e-10;
                if ((coords[0].y * coords[0].y + coords[1].y * coords[1].y) < eps) { //if i am real
                    points.push(intersectPt);
                }
            } else {
                points.push(intersectPt);
            }
        }
        // points.map( p => p.style=this.style)
        return points;
    }

    isZero() {
        return this.monomials.length === 0;
    }

    //from chatgpt
    parseFromString(input) {
        if (!input || typeof input !== "string") return false;

        // normalize string
        let s = input
            .replace(/\s+/g, "")          // remove spaces
            .replace(/-/g, "+-");         // split on +

        let terms = s.split("+").filter(t => t.length > 0);

        let newMonomials = [];

        for (let term of terms) {

            let coeff = null;
            let xDeg = 0;
            let yDeg = 0;

            // --- extract x powers ---
            let xMatch = term.match(/x(\^(-?\d+))?/);
            if (xMatch) {
                xDeg = xMatch[2] ? parseInt(xMatch[2]) : 1;
                term = term.replace(xMatch[0], "");
            }

            // --- extract y powers ---
            let yMatch = term.match(/y(\^(-?\d+))?/);
            if (yMatch) {
                yDeg = yMatch[2] ? parseInt(yMatch[2]) : 1;
                term = term.replace(yMatch[0], "");
            }

            // --- remaining part is coefficient ---
            if (term === "" || term === "+") {
                coeff = 1;
            } else if (term === "-") {
                coeff = -1;
            } else {
                coeff = term;
            }

            let c = Complex.complexify(coeff);

            if (!c.isZero()) {
                newMonomials.push({
                    xDeg: xDeg,
                    yDeg: yDeg,
                    c: c
                });
            }
        }

        // --- merge like terms ---
        let map = new Map();

        for (let m of newMonomials) {
            let key = `${m.xDeg},${m.yDeg}`;

            if (!map.has(key)) {
                map.set(key, {
                    xDeg: m.xDeg,
                    yDeg: m.yDeg,
                    c: m.c
                });
            } else {
                map.get(key).c.add(m.c);
            }
        }

        // --- update in place ---
        this.monomials = Array.from(map.values()).filter(m => !m.c.isZero());

        this.sortMonomials();
        this.getDegree();

        this.didUpdate = true;

        return true;
    }
}