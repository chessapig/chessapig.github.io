//class of a point in CP2
class CP2Point {
    //store a point in projective coordinates as a triple of complex numbers
    constructor(values) {
        this.set(values);
        this.style={
            size: 5,
            color: color(0)
        }
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

    //get affine coordinates for slice [1,z1,z2]
    getAffine() {
        return [this.z1.copy().div(this.z0), this.z2.copy().div(this.z0)];
    }

    getBarycentric() {
        return this.p.map(c => c.abs2());
    }

    getSqrtBarycentric() {
        return this.p.map(c => c.abs());
    }

    //get coordinates on C^*...
    getAmoeba() {
        return createVector(log(this.z0.abs2()), log(this.z1.abs2()));
    }

    getStellar() {
        let poly = new Polynomial(this.p) //build a polynonial with coeffficents the affine coordinates
        return poly.roots(); //return pair of complex numbers
    }

    //converts stellar coordinates to points on boundary of sphere in 3d
    getSpherical() {
        let roots = this.getStellar();
        let spherePts = [];
        for (let r of roots) {
            let K = 1 + r.abs2();
            let sphereVec = createVector(2 * r.x / K, 2 * r.y / K, 1 - 2 / K);
            spherePts.push(sphereVec);
        }
        return spherePts;
    }

    //set the style options
    setStyle(newStyle){
        this.style.color=newStyle.color;
        this.style.size=newStyle.size;
        switch(newStyle.mode){
            case "discriminant":
                //my discrimnant is b^2/4ac 
                let discriminant = this.z1.copy().mult(this.z1).div(this.z0.copy().mult(this.z1).mult(4));
                //discriminant.sub(1); //measure how close the ratio is 1

                let norm=discriminant.abs();
                this.style.size *= newStyle.size/(norm+0.1);
                break;

            case "sup":
                let norms=[];
                for(let z of this.p){
                    norms.push(z.abs());
                }
                this.style.size = newStyle.size/(max(norms)+0.1);
                break;
        }
    }

    //draw the curve "curve" in graphics window "ctx"
    // ----- options -----
    // CP2Curve curve
    // mode: "REAL", "REAL3D", "STELLAR" "STELLAR3D", "TORIC"
    // triCoords 
    // ctx, p5.graphics object
    render(r){
        let style= this.style;
        let ctx = r.g || window;
        let coords;
        ctx.stroke(style.color);
		ctx.strokeWeight(style.size);
        switch(r.mode){
            case "REAL":
                coords = this.getAffine();
                ctx.point(coords[0].x,coords[1].x);
                break;

            case "REAL3D": //x1,y1,x2
                
                coords = this.getAffine();
                let abs2=pow(coords[0].y,2)+pow(coords[1].y,2);
                let pointPos=createVector(coords[0].x,coords[1].x,pow(coords[0].y,2)+pow(coords[1].y,2));
                //ctx.stroke(lerpColor(style.color,color(255),pow(coords[0].y,2)+pow(coords[1].y,2)))
                ctx.point(pointPos.x,pointPos.y,pointPos.z);
                break;

            case "STELLAR":
                coords= this.getSpherical();
                for(let c of coords){
                    ctx.point(c.x,c.y,c.z)
                }
                break;

            case "STELLAR3D":
                coords= this.getSpherical();
                let dt = r.lineLen;
                ctx.line(
                    lerp(coords[0].x,coords[1].x,0.5 + dt), 
                    lerp(coords[0].y,coords[1].y,0.5 + dt), 
                    lerp(coords[0].z,coords[1].z,0.5 + dt), 
                    lerp(coords[0].x,coords[1].x,0.5 - dt), 
                    lerp(coords[0].y,coords[1].y,0.5 - dt), 
                    lerp(coords[0].z,coords[1].z,0.5 - dt))
                break;
                
            case "TORIC": //requires specifying triCoords
                
                let bary = this.getBarycentric();
                let screen = r.triCoord.barycentricToScreen(bary);
                ctx.point(screen.x,screen.y);
                break;
        }
    }

    set(values){
        this.p=values.map(c => Complex.complexify(c));
        this.z0 = this.p[0];
        this.z1 = this.p[1];
        this.z2 = this.p[2];
        return this;
    }

    copy(){
        let copyValues = [];
        for(let v of this.p){
            copyValues.push(v.copy());
        }
        return new CP2Point(copyValues);
    }

    //returns hermitian dot product between points in CP2
    dot(p2){
        let p1 = this.copy();
        let output = Complex.zero();
        for(let i=0;i<3;i++){
            output.add(p2.p[i].copy().conj().mult(p1.p[i]))
        }
        return output;
    }

    static cross(p1, p2) {
        return new CP2Point([
            p1.p[1].copy().mult(p2.p[2]).sub(p1.p[2].copy().mult(p2.p[1])),
            p1.p[2].copy().mult(p2.p[0]).sub(p1.p[0].copy().mult(p2.p[2])),
            p1.p[0].copy().mult(p2.p[1]).sub(p1.p[1].copy().mult(p2.p[0]))
        ])
    }

    //projects this onto orthogonal complement of p2
    proj_orthogonal(p2){
        let dot = this.dot(p2);
        let norm = p2.dot(p2);
        let scale = dot.div(norm);
        for(let i =0;i<3;i++){
            let z = this.p[i]
            z.sub(p2.p[i].copy().mult(scale)) //subtrract off the component parrallel to p2
        }
        return this;
        
    }

    static randPoint({real= false}={}) {
        if(!real){
            return new CP2Point([
                Complex.randNormal(),
                Complex.randNormal(),
                Complex.randNormal(),
            ])
        } else {
            return new CP2Point([
                Complex.randNormal().x,
                Complex.randNormal().x,
                Complex.randNormal().x,
            ])
        }
        
    }



    //produces a grid of points inside of CP^2
    //in projective coordinates, these are of the form (z0,z1,z2) where zk = ak + i bk
    // ak,bk drawn from the range [-]
    static makeGrid(gridSize,options={}){
        const EPS = 1e-7; //epsilon to squiggle thing around
        let base = gridSize;
        let numCoords = 6;
        if(options.real){
            numCoords=3; //life is easier if im real
        }

        //ticker tape algorithm: loops throguh all numbers [0,...,0] to [n,...,n] for base n
        //initialize coordinates to all zero
        let tape = [];
        for(let i=0;i<numCoords;i++){
            tape.push(0);
        }
        incrementTickerTape(tape,0,base); //make sure i dont have 0 in my grid

        let points=[]
        for(let i=0; i<pow(base,numCoords);i++){
            let t = incrementTickerTape(tape,0,base);
            if(t){
                let coords = t.map(x => x-(base-1)/2);
                if(coords.length==3){
                    coords[0]+=EPS;
                    points.push(new CP2Point(coords));
                } else {
                    let z0 = new Complex(coords[0]+EPS,coords[1])
                    let z1 = new Complex(coords[2],coords[3])
                    let z2 = new Complex(coords[4]-EPS,coords[5])
                    points.push(new CP2Point([z0,z1,z2]))
                }
            }
        }

        return points;
    }
}

//iterative function which increments ticker tape
// tape is array of numbers [*,...,*]
// position is the position you want to increment
// base is the base of the ticker tape
function incrementTickerTape(tape, position, base){
    if(tape[position]<base-1){
        tape[position]+=1;
        return tape;
    } else {
        if(position<tape.length-1){
            tape[position]=0;
            return incrementTickerTape(tape,position+1,base);
        } else {
            return false;
        }
        
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
       
        return new CP2Line(
            CP2Point.randPoint(options),
            CP2Point.randPoint(options)
        )
    }

    //returns the dual line to a point in CP^2
    //pick 2 random points in P2, project them onto the dual of the line, and orthogonalize
    //options:
    //  real (true/false) (ensures we produce a real line)
    static dualLine(point,options){
        let p1 = CP2Point.randPoint(options).proj_orthogonal(point);
        let p2 = CP2Point.randPoint(options).proj_orthogonal(point);
        p1.proj_orthogonal(p2); 
        let l = new CP2Line(p1,p2);
        l.style = point.style;
        return l;
    }
}

//class for curve in projective space
class CP2Curve {
    //define a curve implicitly by its polynomial (thoght of as a homogenous polynomial)
    //coefs is of the form  
    //[ [ 1   , x     , x^2   , x^3] , 
    //  [ y   , xy    , x^2 y ] , 
    //  [ y^2 , y^2 x], 
    //  [ y^3] 
    // ]
    constructor(coefs) {
        //this.degree = coefs[0].length - 1;
        this.coefs = [];
        for (let xPow = 0; xPow <= degree; xPow++) {
            let xCoefs = [];
            for (let yPow = 0; yPow <= degree - xPow; yPow++) {
                let c = coefs[xPow][yPow]
                if (c) {
                    xCoefs[yPow] = Complex.complexify(c);
                } else {
                    xCoefs[yPow] = Complex.zero();
                }
            }
            this.coefs.push(xCoefs);
        }

        //this.degree = degree;
    }

    //set coefficents 
    //returns true if one of the coefficents changed, false otherwise
    setCoefs(coefs){
        let didSet = false;
        this.degree = coefs[0].length-1;
        if(!this.coefs){ //if its my first time...
            this.coefs = [];
            didSet=true;
        } 
        if(this.degree < this.coefs[0].length-1){
            didSet=true;
        }

        let newCoefs=[];
        for (let xPow = 0; xPow <= this.degree; xPow++) {
            let xCoefs = [];
            for (let yPow = 0; yPow <= this.degree - xPow; yPow++) {
                let c = coefs[xPow][yPow]
                if (!c) { //if c wasnt defined, set it to zero
                    c = Complex.zero();
                } 
                if(xPow< this.coefs.length && yPow < this.coefs[xPow].length){
                    //if this array element does exist alread, just update the complex number
                    xCoefs[yPow] = this.coefs[xPow][yPow];
                    didSet= didSet || xCoefs[yPow].set(Complex.complexify(c));
                } else {
                    //otherwise, make new complex number 
                    xCoefs[yPow] = Complex.complexify(c);
                    didSet=true;
                }
            }
            newCoefs.push(xCoefs);
        }
        this.coefs= newCoefs;
        return didSet;
    }

    //evaluate at a point in CP2
    eval(pt) {
        let output = Complex.zero();
        for (let xPow = 0; xPow <= this.degree; xPow++) {
            for (let yPow = 0; yPow <= this.degree - xPow; yPow++) {
                let zPow = this.degree - xPow - yPow;
                let c = this.coefs[xPow][yPow]
                let monomial = Complex.pow(pt.z1, xPow).mult(Complex.pow(pt.z2, yPow)).mult(Complex.pow(pt.z0, zPow))
                output.add(monomial.mult(c))
            }
        }
        return output;
    }

    //intersect with CP2 Line l. 
    // returns array of CP2Points with length degree
    //options:
    intersect(l,options={
        real:false,
        iterations:100,
        tolerance: 1e-5}) 
    {
        let line = l.paramertize();
        let poly = new Polynomial([0]); //restriction of defining polynomial of curve to line
        for (let xPow = 0; xPow <= this.degree; xPow++) {
            for (let yPow = 0; yPow <= this.degree - xPow; yPow++) {
                let zPow = this.degree - xPow - yPow;
                let c= this.coefs[xPow][yPow];
                if(options.real){
                    c=c.x;
                }
                let monomial = new Polynomial([c]); //coefficent of this monomial
                monomial.mult(Polynomial.pow(line[0], xPow))
                monomial.mult(Polynomial.pow(line[1], yPow))
                monomial.mult(Polynomial.pow(line[2], zPow))
                poly.add(monomial)
            }
        }

        //loose tolerance, but lots of iterations
        let roots = poly.roots(options.iterations, options.tolerance);
        let points = [];
        for (let r of roots) {
            let intersectPt = l.interpolate(r);
            if(options.real){  //if "real", only look at real intersections
                let coords = intersectPt.getAffine();
                let eps = 1e-10;
                if(   (coords[0].y*coords[0].y+coords[1].y*coords[1].y)<eps) { //if i am real
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
        let isZero = true;
        for (let coefColumn of this.coefs) {
            for (let c of coefColumn) {
                if (!c.isZero()) {
                    isZero = false;
                }
            }
        }
        return isZero;
    }
}
