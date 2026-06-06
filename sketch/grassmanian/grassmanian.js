const FRG = '#E6CFB3'; //background color
const BKG = '#2c2621'; //foreground color

let containerId = "grassmanian-canvas";
let canvasSize

function setup() {
   
	let elem = document.getElementById(containerId);
	boundingRect = elem.getBoundingClientRect();

    // // get computed border size
    let style = getComputedStyle(elem);
    let borderLeft = parseFloat(style.borderLeftWidth);
    let borderRight = parseFloat(style.borderRightWidth);
    let canvasWidth =  boundingRect.width - borderLeft - borderRight; //sets size of canvas.
    let canvasHeight =  boundingRect.height - borderLeft - borderRight; //sets size of canvas.
    canvasSize = canvasWidth/2;
	canvas = createCanvas(canvasWidth, canvasHeight , WEBGL);
	//canvas.parent(containerId);

   // THE MANUAL OVERRIDE: 
    // Wait a tiny fraction of a second to let any other scripts finish their nonsense, 
    // then forcefully move the canvas into the div.
    setTimeout(() => {
        let targetDiv = document.getElementById(containerId);
        let myCanvas = document.getElementById("defaultCanvas0");
        
        if (targetDiv && myCanvas) {
            targetDiv.appendChild(myCanvas);
        }
    }, 50); // 50 milliseconds is usually plenty of time


    let selectors = [];
    let numSelectors=5;
    for(let i=0;i<numSelectors;i++){
        let theta = i/numSelectors*2*PI;
        let r = 2/numSelectors;
        selectors.push(new StarDragger(r*cos(theta),r*sin(theta)))

    }

    starWindow = new StarWindow({
		pixels: canvasSize,
        x: -2, y: -1, width: 2,
        selectors: selectors,
        doConstrain: true,
	});


    let camera = new Camera2D({
        xRange:[-2,2],
        yRange:[-2,2],
    })
    renderWindow = new HighDimWindow({
        pixels: canvasSize,
        x: 0, y: -1, width: 2,
        basisSelectors: starWindow.selectors,
        camera: camera,
        latticeScale: 0.2,
        latticeDepth: 4,
    });

    constrainStarSelectors(selectors,[]);

	windows = [starWindow,renderWindow]; 
}


function draw() {
	scale(height / 2, -height / 2, height / 2) //recale to a box [-1,1]times [-1,1]
	background(BKG);

	for (let w of windows) {
        w.clear();
		w.update();
		w.render();
		w.draw();
	}
}

class StarDragger extends ComplexDragger{
    constructor(x,y,options={}){
        const defaults = {
            maxRadius: 1,
            doConstrain: true,
		};
        options = Object.assign({}, defaults, options);
        super(x,y,options);
    }

    onUpdate(){ //constrain to circle
        let newPos= createVector(this.mouse.x + this.offset.x,this.mouse.y + this.offset.y);
        if(this.doConstrain){
            if(newPos.magSq()>pow(this.maxRadius,2)){
                newPos = newPos.mult(this.maxRadius/newPos.mag())
            }
        }
        this.x = newPos.x;
        this.y = newPos.y;
        
    }
    
}



class StarWindow extends DraggerWindow{
    constructor(options={}){
        let camera = new Camera2D({
            xRange:[-2,2],
            yRange:[-2,2],
            zoom: -0.1
        })
        const defaults = {
            camera:camera,
            doConstrain: true,
            multiDragType: "CLOSEST",
            allowVariableDimensions:false,
		};
        options = Object.assign({}, defaults, options);
        super(options);
    }

    render(){
        
        let ctx = this.g;
     
        ctx.noFill();
        ctx.stroke(FRG);
        ctx.strokeWeight(3);
        ctx.ellipse(0,0,2,2,50);
        
        for(let s of this.selectors){
            ctx.stroke(lerpColor(s.color,color(255),0.5));
            ctx.line(s.x,s.y,-s.x,-s.y);
        }

        super.render();
        

    }

    selectorUpdate(){
        super.selectorUpdate(); 
        if(!this.didSelectorUpdate){
            return false;
        }

        //if a selector is updated, run the optimizer to fix the sum of their squares
        let variableSelectors=[];
        let constrainedSelectors=[];
        for(let s of this.selectors){
            if(s.isPressed){
                constrainedSelectors.push(s);
            } else{
                variableSelectors.push(s);
            }
        }
        if(this.doConstrain){
            L2constrainStarSelectors(variableSelectors,constrainedSelectors);
        }
    }

    doubleClicked(mouseX=0,mouseY=0){
        if(!allowVariableDimensions){
            return false;
        }
        super.doubleClicked(mouseX,mouseY);
    }

    generateSelectorDoubleClick(mousePos){
        if(mousePos.x*mousePos.x+mousePos.y*mousePos.y<=1){
            return new StarDragger(mousePos.x,mousePos.y,{doConstrain: this.doConstrain});
        }
	}

    released(){
        super.released();
        if(this.doConstrain){
            L2constrainStarSelectors(this.selectors,[]);
        }
    }

}


function L2constrainStarSelectors(variableSelectors,constrainedSelectors){
    let x0 = [];
    let y0 = [];
    let xs = [];
    let ys = [];
    for(let i = 0; i<constrainedSelectors.length; i++){
        let s = constrainedSelectors[i];
        x0[i] = s.x;
        y0[i] = s.y;
    }
    for(let i = 0; i<variableSelectors.length; i++){
        let s = variableSelectors[i];
        xs[i] = s.x;
        ys[i] = s.y;
    }
    solution = solveClosestOrthonormalPair(x0,y0,xs,ys)

    for(let i = 0; i<variableSelectors.length; i++){
        let s = variableSelectors[i];
        s.x = solution.xs[i];
        s.y = solution.ys[i];
    }
}

/**
 * Solves the L^2 closest orthonormal pair optimization problem using mathjs.
 * Forces the first few entries of the resulting vectors to equal the vectors x0 and y0.
 * * @param {Array<number>} x0 - The forced prefix vector for the first output vector
 * @param {Array<number>} y0 - The forced prefix vector for the second output vector
 * @param {Array<number>} xs - The initial remaining dimensions of vector X
 * @param {Array<number>} ys - The initial remaining dimensions of vector Y
 * @returns {Object} An object containing the optimal orthonormal sub-arrays { xs: [...], ys: [...] }
 */
function solveClosestOrthonormalPair(x0, y0, xs, ys) {
    let a,b,d;
    if(x0.length>0){
        // Compute the dot products of the fixed prefix components
        a = math.dot(x0, x0);
        b = math.dot(x0, y0);
        d = math.dot(y0, y0);

        // 1. Feasibility Guard: Ensure the maximum eigenvalue of G0 is <= 1
        let term1 = (a + d) / 2;
        let term2 = Math.sqrt(Math.pow((a - d) / 2, 2) + b * b);
        let maxEigenval = term1 + term2;

        let eValCutoff=0.9999;
        if (maxEigenval > eValCutoff) {
            let scale = eValCutoff / Math.sqrt(maxEigenval);
            // Gracefully scale the prefix vectors down to the boundary of feasibility
            x0 = math.multiply(x0, scale);
            y0 = math.multiply(y0, scale);
            
            // Recompute the dot products for the scaled prefixes
            a = math.dot(x0, x0);
            b = math.dot(x0, y0);
            d = math.dot(y0, y0);
        }
    } else {  //If there are no constraints, target gram matrix is the identity.
        a = 0;
        b = 0; 
        d = 0; 
    }

    // 2. Assemble remaining vectors into an (n - k) x 2 matrix A
    const aData = [];
    for (let i = 0; i < xs.length; i++) {
        aData.push([xs[i], ys[i]]);
    }
    const A = math.matrix(aData);

    // 3. Compute M = A^T * A (Result is a 2x2 matrix)
    const AT = math.transpose(A);
    const M = math.multiply(AT, A);

    // 4. Construct target Gram Matrix G = I - G0
    const G = math.matrix([
        [1.0 - a, -b],
        [-b, 1.0 - d]
    ]);


    // 5. Compute G^(1/2) (and force real numbers)
    const sqrtG = math.re(math.sqrtm(G));

    // 6. Compute C = G^(1/2) * M * G^(1/2)
    const tempC = math.multiply(sqrtG, M);
    let C = math.multiply(tempC, sqrtG);

    // Inject a tiny ridge epsilon to the diagonal of C for absolute numerical stability
    const eps = 1e-10;
    C = math.add(C, math.multiply(eps, math.identity(2)));

    // 7. Compute C^(-1/2) 
    const sqrtC = math.re(math.sqrtm(C));
    const invSqrtC = math.inv(sqrtC);

    // 8. Compute total transformation matrix H = sqrtG * invSqrtC * sqrtG
    const tempH = math.multiply(sqrtG, invSqrtC);
    const H = math.multiply(tempH, sqrtG);

    // 9. Reconstruct the optimal remaining components: U_sub = A * H
    const U_sub = math.multiply(A, H);

    // Convert the mathjs matrix back to a standard nested JS array [[u1, v1], [u2, v2], ...]
    const uSubArray = U_sub.toArray();

    // Map rows back into separate column vectors
    const optSubU = uSubArray.map(row => row[0]);
    const optSubV = uSubArray.map(row => row[1]);

    // 10. Assemble and return the complete final orthonormal sub-vectors
    return {
        xs: optSubU,
        ys: optSubV
    };
}


function constrainStarSelectors(variableSelectors,constrainedSelectors){
    let constraint = Complex.zero();
    for(let s of constrainedSelectors){
        let z = s.value();
        constraint.add(z.copy().pow(2));
    }
    constraint.mult(-1);

    let edges = []
    for(let s of variableSelectors){
        let z = s.value();
        edges.push(z.copy().pow(2));
    }
    let numAttempts=10;
    let dTheta = 0.002*2*PI;
    for(let i = 0; i < numAttempts; i++){
        if(constrainPolygon(edges,constraint,2)){
            break;
        } 
        for(j=0;j<edges.length;j++){
            let e = edges[j]
            let sign = ((j%2)*2-1);
            e.mult(Complex.polar(1,dTheta*sign));
        }
    }
    
    for(let i=0;i<edges.length;i++){
        let e = edges[i];
        
        let s = variableSelectors[i];
        let [sqrt1,sqrt2] = e.sqrt();

        //choose the square root closest to current value of s.
        let val = s.value();
        s.x = sqrt1.x;
        s.y = sqrt1.y;
        if(sqrt2.copy().sub(val).abs2()<sqrt1.copy().sub(val).abs2()){
            s.x = sqrt2.x;
            s.y = sqrt2.y;
        } 
        
    }
}


//apply newtons method to scale and translate the vectors and nail down the polygon
//Changes the edge vectors themselves
//takes edges a list of complex numbers, and v0 a complex number.s
function constrainPolygon(edges, v0, perimeter) {
	let vbar = barycenter(edges);
	let v0bar = v0.copy().mult(1 / edges.length);

	let PERCISION = 0.001; //precision of newtons method
	let MAXSTEPS = 30;
	let c = 1;

    let didConverge=false;

	for (let i = 0; i < MAXSTEPS; i++) {
		let f = 0;
		let fPrime = 0;
		for (let v of edges) {
			let delta = v.copy().sub(vbar);
			
			let len = delta.copy().mult(c).add(v0bar).abs(); //length of the translated and scaled vector
			f += len;

			let numerator = delta.copy().add(v0bar).dot(delta);
			
			fPrime += numerator / len
		}
		f = f + v0.abs() - perimeter; //constrain total perimeter to be perimeter.
		
		if (abs(f) <= PERCISION) {
            didConverge=true;
			break;
		}
		c = c - f / fPrime; //newtons method step

	}
    if(!didConverge){
        return false
    }

	let lambda = v0bar.copy().sub(vbar.copy().mult(c));
	for (let e of edges) {
		e.mult(c).add(lambda);
	}
	return edges
}


class HighDimWindow extends GraphicsWindowCamera{
    constructor(options={}){
        const defaults = {
            latticeScale: 1,
            latticeDepth: 1,
            basisSelectors: [] // bind to array of selectors from another window...
		};
        options = Object.assign({}, defaults, options);
        super(options);
    }

    render(){
        super.render();
        let ctx = this.g;
        
        //this.drawHypercube();
        //this.drawLattice(this.latticeDepth,this.latticeScale);
        let poly = RP2();
        this.polyhedron(poly);

    }

    // Takes in vector of same length as basisSelectors
    //draws projection from nD to 2D using basisSelectors
    project(v){
        const bx = this.basisSelectors.map(s => s.x);
        const by = this.basisSelectors.map(s => s.y);
        let x = math.dot(bx, v); 
        let y = math.dot(by, v); 
        return [x,y];

        //attempt at perspective:
        // let complementV = math.subtract(v,math.add(math.multiply(bx, x),math.multiply(by, y)));
        // let distanceFromPlane = math.norm(complementV);
        // let projCorrection = 1/(1+distanceFromPlane); 
        // return [x*projCorrection,y*projCorrection];
    }


    //vertices is a list of  k different n dimenisonal arrays
    //  edges has form [[i,j]...], where i,j are between 1 and k
    polyhedron(poly,options={}){
        const defaults = {
            faceMargin: 0.05
		};
        options = Object.assign({}, defaults, options);

        let ctx = this.g;

        const projectedVerts = poly.vertices.map(v => this.project(v));
        
        ctx.noStroke();
        ctx.fill(FRG);
        for(let v of projectedVerts){
            //ctx.circle(v[0],v[1],0.03);
        }
           
        ctx.stroke(FRG);
        ctx.strokeWeight(2);
        for(let e of poly.edges){
            let v1 = projectedVerts[e[0]];
            let v2 = projectedVerts[e[1]];
            ctx.line(v1[0],v1[1],v2[0],v2[1])
        }

        ctx.fill(255,20);
        ctx.stroke(FRG);
        for(let f of poly.faces){
            ctx.beginShape();
            let faceVerticies = []
            for(let i of f){
                faceVerticies.push( poly.vertices[i] )
            }
            //apply barycentric coordinates
            let antiMargin = 1-(f.length-1)*options.faceMargin; //barycentric coordinate of my vertex
            let margin = options.faceMargin
            for(let v of faceVerticies){
                let marginVertex = math.multiply(v,antiMargin);
                for(let otherV of faceVerticies){
                    marginVertex = math.add(marginVertex,math.multiply(otherV,margin));
                }
                let projV = this.project(marginVertex);
                ctx.vertex(projV[0],projV[1]);
            }
            ctx.endShape();
        }
    }


    drawPolygon() {
        let edges = []
        for(let s of this.basisSelectors){
            let z = s.value();
            edges.push(z.copy().pow(2));
        }

        let verts = [];
        verts[0] = new Complex(0, 0);
        for (let i = 0; i < edges.length; i++) {
            verts[i + 1] = verts[i].copy().add(edges[i]);
        }
        let bary = barycenter(verts);
        for (let v of verts) {
            v.sub(bary);
        }

        let ctx = this.g;
        ctx.beginShape(POINTS);
        for (let v of verts) {
            ctx.vertex(v.x, v.y);
        }
        ctx.endShape();
    }

    drawLattice(height,scale){
        let ctx = this.g;

        let vals = [];
        for(let s of this.basisSelectors){
            vals.push(s.value());
        }
        let dim = vals.length;

        let base= 2*height+1;
        for(let n=0;n<pow(base,dim); n++){
            let nary = numberToNary(n,base);
            for(let n of nary){
                n-=height //go from -height to height
            }
            let vertex = addValuesFromNary(vals,nary);
            ctx.stroke(FRG);
            ctx.strokeWeight(3);
            ctx.point(vertex.x*scale,vertex.y*scale);
        }
    }

    //for visualizing (1+...+n)^2 = 1^3 + .. + n^3
    drawSimplexTimesSquare(height,scale){
        let ctx = this.g;

        let vals = [];
        let cols = [];
        for(let s of this.basisSelectors){
            vals.push(s.value());
            cols.push(createVector(red(s.color),green(s.color),blue(s.color)))
        }
        let dim = vals.length;

        let base= height;
        for(let n=0;n<pow(base,dim); n++){
            let nary = numberToNary(n,base);
            if(nary[0]+nary[1] > base-1){ //apply linear constraint to hypercube.
                continue;
            }
            
            //form convex combination of colors
            let totalNary = 0;
            let blendedCol = createVector(0,0,0);
            for(let i=0;i<nary.length;i++){
                totalNary+=nary[i];
                blendedCol.add(cols[i].copy().mult(nary[i]));
            }
            blendedCol.mult(1/totalNary);
            ctx.fill(blendedCol.x,blendedCol.y,blendedCol.z);

            ctx.stroke(255);
            ctx.strokeWeight(1);
            let vertex = addValuesFromNary(vals,nary);
            ctx.circle(vertex.x*scale,vertex.y*scale,0.03)
            //ctx.point(vertex.x*scale,vertex.y*scale);
        }
    }

    //for visualizing (1+...+n)^2 = 1^3 + .. + n^3
    drawConeOverCube(height,scale){
        let ctx = this.g;

        let vals = [];
        let cols = [];
        for(let i = 0; i<4; i++){
            if(i<this.basisSelectors.length){
                let s = this.basisSelectors[i]
                vals[i] = s.value();
                cols[i] = createVector(red(s.color),green(s.color),blue(s.color));
            } else {
                vals[i] = Complex.zero()
                cols[i] = createVector(255,255,255);
            }
            
        }
        let dim = 4;

        let base= height;
        for(let n=0;n<pow(base,dim); n++){
            let rawNary = numberToNary(n,base);
            let nary= new Array(dim).fill(0);
            for(let i = 0; i< rawNary.length; i++){
                nary[i] = rawNary[i];
            }
            //apply linear constraints
            if(nary[0]>nary[1]){ continue;}
            if(nary[0]>nary[2]){ continue;}
            if(nary[0]>nary[3]){ continue;}

            
            //form convex combination of colors
            let totalNary = 0;
            let blendedCol = createVector(0,0,0);
            for(let i=0;i<nary.length;i++){
                totalNary+=nary[i];
                blendedCol.add(cols[i].copy().mult(nary[i]));
            }
            if(totalNary>0){
                blendedCol.mult(1/totalNary);
            }else {
                blendedCol = createVector(0,0,0);
            }
            ctx.fill(blendedCol.x,blendedCol.y,blendedCol.z);

            ctx.stroke(255);
            ctx.strokeWeight(1);
            let vertex = addValuesFromNary(vals,nary);
            ctx.circle(vertex.x*scale,vertex.y*scale,0.03)
            //ctx.point(vertex.x*scale,vertex.y*scale);
        }
    }
}




/////////////////////////
// HELPER FUNCTIONS
/////////////////////////

function hypercube(dim){
    let verts = [];
    let edges = [];
    for(let n=0;n<pow(2,dim); n++){
        let bin = numberToNary(n,2,dim);
        verts.push(bin.map(x => x-0.5));
        
        //add edges
        let newBin = bin.slice();
        for(let i =0; i<bin.length;i++){
            if(bin[i]==0){
                newBin[i]=1;
                edges.push([n,naryToNumber(newBin,2)])
                newBin[i]=bin[i]
            }
        }
    }
    return {vertices: verts, edges: edges, faces: []}
}

//verticies from https://web.archive.org/web/20240516192727/https://auee04.userpage.fu-berlin.de/article_6.html 
function simplex(dim){
    let verts = Array.from(
        { length: dim+1 },
        () => Array(dim).fill(0)
    );
    
    for(let j=0;j<dim; j++){
        let n = j+1
        let entry = 1/sqrt(n+n*n);
        for(let i=0;i<=dim; i++){
            if(i<=j){
                verts[i][j] = entry;
            } else if (i==j+1){
                verts[i][j] = -n*entry;
            } else {
                verts[i][j] = 0
            }
        }
    }

    let edges = [];
    for(let i = 0; i<= dim; i++){
        for(let j = 0; j< i; j++){
            edges.push([i,j]);
        }
    }
    return {vertices: verts, edges: edges, faces: []}
}

function RP2(){
    let poly = simplex(5);
    poly.edges = [];
    poly.faces = [
        //central ring of triangles
        [0,1,2],
        [0,2,3],
        [0,3,4],
        [0,4,5],
        [0,5,1],
        //next ring of triangles
        [1,2,4],
        [2,3,5],
        [3,4,1],
        [4,5,2],
        [5,1,3],
        //outer ring of trianges
        [1,3,4],
        [2,4,5],
        [3,5,1],
        [4,1,2],
        [5,2,3]
    ]
    return poly;
}

//if length enabled, cut off at the length given by the length
function numberToNary(n,base,length=false){
    let nary = [];
    if(length){
        for(let i = 0; i < length; i++){
            nary.push(n%base);
            n = floor(n/base);
        }
    } else {
        while(n>0){
            nary.push(n%base);
            n = floor(n/base);
        }
    }
    return nary;
}

function naryToNumber(nary,base){
    let n = 0;
    for(let i = 0; i<nary.length;i++){
        n+= nary[i]*pow(base,i)
    }
    return n;
}

function addValuesFromNary(vals,nary){
    let totalValue = new Complex(0);
    for(let i = 0; i<nary.length;i++){
        totalValue.add(vals[i].copy().mult(nary[i]));
    }
    return totalValue;
}

//takes list of complex numbers
function barycenter(edges) {
	let totalvec =  Complex.zero();
	for (let v of edges) {
		totalvec.add(v)
	}
	return totalvec.mult(1 / edges.length);
}


/////////////////////////
// MOUSE INTERACTION
/////////////////////////


function mouseWheel(event) {
	let didScroll = false;
	for (let w of windows) {
		didScroll =  w.scroll(event.delta) || didScroll;
	}

	if (didScroll) {
		event.preventDefault();
	}
}

function mousePressed() {
	for (let w of windows) {
		w.pressed();
	}
}

function mouseReleased() {
	for (let w of windows) {
		w.released();
	}
}

function doubleClicked(event) {
    for (let w of windows) {
		w.doubleClicked(mouseX, mouseY);
	}
}

function mouseDragged() {
	for (let w of windows) {
		w.dragged(mouseX, mouseY, pmouseX, pmouseY);
	}

}

function keyPressed() {
    if (keyCode === SHIFT) {
        starWindow.multiDragType = "ALL";
    } 
}

function keyReleased() {
    if (keyCode === SHIFT) {
        starWindow.multiDragType = "CLOSEST";
    }
    
}

