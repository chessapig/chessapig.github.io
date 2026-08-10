//TODO::::
//-test gradient function
// use gradient to choose orientations for marching simplices


//USES MATH.JS
//Vertex of a mesh
//default to a 2D vertex. But, make this flexible enough to live in arbitrary manifolds...
class ManifoldPoint{ 
    constructor(p,options={}){
        this.pos = p

        const defaults = {
		};
        Object.assign(this, defaults, options);
    }

    equals(p){
        return this == p || this.pos.equals(p.pos)
    }

    // Gets vector between this point and point p.
    vectTo(p){
        let delta =  this.pos.copy().sub(p.pos);
        let vect = new ManifoldVect(this,delta)
        return vect;
    }

    //for t between 0 and 1, interpolates between this and p
    interpolate(p,t){
        //convex interpolation
        let newPos = this.pos.copy().mult(1-t).add(p.pos.copy().mult(t))
        return new ManifoldPoint(newPos);
    }

    //ONLY USE FOR DRAWING
    //returns p5Vector in 2D or 3D
    project(){
        return this.pos;
    }
}

//Class defining tangent space of manifold. The vector lives at a point
class ManifoldVect{
    constructor(p,v,options={}){
        this.pt = p;
        this.v = v

        const defaults = {
		};
        Object.assign(this, defaults, options);
    }

    // Helper to validate tangent space alignment
    assertSameTangentSpace(vec) {
        if (!this.pt.equals(vec.pt)) {
            throw new Error("Invalid operation: Vectors belong to different tangent spaces.");
        }
    }

    //add another vector at same point
    add(vec){
        this.assertSameTangentSpace(vec);
        return this.v.add(vec.v);
    }

    mult(c){
        this.v.mult(c);
    }

    copy(){
        return new ManifoldVect(this.p, this.v.copy());
    }

    //define an inner product on the tangent space
    innerProd(vec){
        this.assertSameTangentSpace(vec);
        return this.v.dot(vec.v);
    }

    normSq(){
        return this.innerProd(this);
    }
    
    toArray(){
        return [this.v.x,this.v.y,this.v.z];
    }

    static zero(p){
        return new ManifoldVect(p,createVector(0));
    }
}

class Simplex{
    //takes a cyclically ordered array of verticies
    constructor(verts){ 
        this.vs = verts;
        this.dim =  verts.length-1
    }

    skeleton(d){
        if(d==this.dim){
            return [this];
        }

        if(d==this.dim-1){
             //the d-1 skeleton is the boundary. 
             //deal with this case seperately to get vertex ordering correct.
            return this.boundary();
        }
        
        let skeleton = []

        //inefficent algorithm for finding dim choose d elements...
        for(let i = 0; i< pow(2,this.dim+1); i++){
            let n = i
            let bin = []
            let numOnes = 0;
            //convert to binary
            for(let j=0; j < this.dim+1; j++){
                bin[j] = n % 2;
                n = floor(n/2);
                if(bin[j]==1){
                    numOnes+=1;
                }
            }
            if(numOnes==d+1){
                let newVs = [];
                for(let i = 0; i<this.dim+1; i++){
                    if(bin[i]){
                        newVs.push(this.vs[i])
                    }
                }
                let newSimplex = new Simplex(newVs)
                skeleton.push(newSimplex);
            }
        }
        return skeleton;
    }

    // Inside Simplex
    equals(s) {
        if (this.dim !== s.dim) return false;
        
        // Check if every vertex in THIS simplex exists in THAT simplex
        return this.vs.every(v1 => s.vs.some(v2 => v1.equals(v2)));
    }

    boundary(){
        let bdrySimplices = [];
        let nVerts=this.vs.length
        for( let i = 0; i<nVerts; i++){
            let newVertices = [];
            for( let j = i+1; j<i+nVerts; j++){
                let index = j%nVerts;
                newVertices.push(this.vs[index])
            }

            bdrySimplices[i] = new Simplex(newVertices);
        }
        return bdrySimplices;
    }

    //returns [v,i] if this.vs[i]=v
    findVertex(vOrIndex){
        // Check if the input is a number (index) or vertex
        if (typeof vOrIndex === 'number') {
            if(vOrIndex<0 || vOrIndex>this.vs.length){
                return [false,false];
            }
            return [this.vs[vOrIndex],vOrIndex];
        } 

        for(let i=0;i<this.vs.length;i++){
            if(vOrIndex.equals(this.vs[i])){
                return [this.vs[i],i]
            }
        }
        return [false,false];
    }

    //check if simplex contains given list of verticies
    //DOESNT collapse identical verticies to one antoher...looks for same object
    contains(vertexInput) {
        // If the input is not an array, wrap it in an array so the loop still works
        const vertices = Array.isArray(vertexInput) ? vertexInput : [vertexInput];

        for (let v of vertices) {
            let doesContain = false;
            for (let w of this.vs) {
                if (v === w) {
                    doesContain = true;
                    break; // Optimization: stop searching once we find a match
                }
            }
            if (!doesContain) {
                return false;
            }
        }
        return true;
    }

    // for vertex v in this.vs, construct the basis of edges coming out from v
    basis(vOrIndex) {
        let [vertex, index] = this.findVertex(vOrIndex);
        if (!vertex) {
            console.warn("basis(): Invalid vertex or index provided.");
            return false;
        }

        let basis = [];
        for (let i = 0; i < this.vs.length; i++) {
            if (i === index) { continue; }
            
            basis.push(vertex.vectTo(this.vs[i]));
        }
        
        return basis;
    }

    //computes the gram matrix of the simplex based at vertex v
    //optionally, pass the basis in.
    gram(vOrIndex, basis = this.basis(vOrIndex)){
        let gram = math.zeros(this.dim, this.dim)
        for(let i=0;i<this.dim;i++){
            let v1 = basis[i];
            for(let j=i;j<this.dim;j++){
                let v2 = basis[j];
                let dot = v1.innerProd(v2);
                gram.set([i,j],dot);
                gram.set([j,i],dot);
            }
        }
        return gram
    }

    volume(){
        let gram = this.gram(0);
        let det = math.det(gram);
        let scale = math.factorial(this.dim);
        return math.sqrt(det)/scale;
    }

    normal(){

    }


    // if edge = [v1,v2] is an edge in the simplex, then finf the oppisite n-2 simplex. 
    // output object 
    //  cos: cos(theta), with theta the dihedreal angle oppisite the edge
    //  vol: the volume of the opposing simplex
    dihedrealOppositeEdge(edge){
        let [vOrIndex0,vOrIndex1] = edge
        let [v0,i0] = this.findVertex(vOrIndex0);
        let [v1,i1] = this.findVertex(vOrIndex1);

        //  Construct the opposite simplex
        const oppVs = this.vs.filter((_, index) => index !== i0 && index !== i1);
        let [oppVertex,oppIndex] = this.findVertex(oppVs[0]);
        const oppSimplex = new Simplex(oppVs);
        if(this.dim==2){
            let e0 = oppVertex.vectTo(v0);
            let e1 = oppVertex.vectTo(v1);
            let cosTheta = e0.innerProd(e1) / math.sqrt(e0.normSq()*e1.normSq())
             return {cos: cosTheta, vol: 1}
        }
         
        //invert the gram matrix
        let gram = this.gram(oppIndex);
        let invGram = math.inv(gram);
        

        //relabel i0,i1 so that they match with the columns of gram
        i0 = (i0>oppIndex) ? i0-1 : i0;
        i1 = (i1>oppIndex) ? i1-1 : i1;

        let g_0_0 = invGram.get([i0,i0]);
        let g_1_1 = invGram.get([i1, i1]);
        let g_0_1 = invGram.get([i0, i1]);

        //Minus sign to correct for the difference between angle between normals and angle between faces.
        const cosDihedrealAngle = -g_0_1/math.sqrt(g_0_0*g_1_1);
        
        const oppVolume = oppSimplex.volume();
        return {cos: cosDihedrealAngle, vol: oppVolume}
    }

    //f is a array of length dim+1, defining the value of a function on the corners of the simplex. 
    //outputs the value of grad f at corner vOrIndex
    //I can compute a linear approximation to f canonically, but turning that to a gradient requires the metric
    // <nabla f, v> = df(v) => nabla f = c_i e_i, where c_i g_ij = df(e_j), so c_i = g_{ij}^-1 df(e_i)
    gradient(f, vOrIndex){
        let [vertex, index] = this.findVertex(vOrIndex);
        let basis = this.basis(index);
        let gram = this.gram(index,basis);

        let df = [];
        for (let i = 0; i < this.vs.length; i++) {
            if (i === index) { continue; }
            
            df.push(f[i]-f[index]);
        }
        let c = math.lusolve(gram,df);
        
        let nalbaF = ManifoldVect.zero(vertex);
        for (let i = 0; i < basis.length; i++) {
            nalbaF.add(basis[i].mult(c[i]));
        }
        return nalbaF;
    }


}

class SimplicialComplex{
    constructor(simplices,options={}){
        this.simplices = simplices;
         const defaults = {
		};
        Object.assign(this, defaults, options);
        this.vertices=[];
        this.vertexIndexMap = new Map();
        this.generateVertexMap();
    }

    generateVertexMap(){
        let zeroSkeleton = this.skeleton(0);
        this.vertices = zeroSkeleton.map(s => s.vs[0]); 
        
        // Create the Map: Key = ManifoldPoint object, Value = Integer
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertexIndexMap.set(this.vertices[i], i);
        }
        return this.vertices;
    }

    //returns the d-skeleton of the simplicial complex
    skeleton(d){
        let skeleton = [];
        for(let s of this.simplices){
            let newSkeleton = s.skeleton(d); 
            //merge newSkeleton into existing list skeleton
            for(let z1 of newSkeleton){
                let doMerge = true;
                for(let z2 of skeleton){
                    if(z1.equals(z2)){
                        doMerge=false;
                        break;
                    }
                }
                if(doMerge){
                    skeleton.push(z1);
                }
            }
            
        }
        return skeleton;
    }


    //returns object b
    // b.vertices: Returns list of vertex objects on the boundary
    // b.complex: Returns simplical complex object.
    boundary(){
        // Initialize the map. Key: "sorted,vertex,indices" -> Value: face object (b)
        let faceMap = new Map();

        for (let s of this.simplices) {
            const newBoundary = s.boundary();
            
            for (let b of newBoundary) {
                // Create a unique, order-independent key for the face
                // We map to the vertex index, sort them ascending, and join with commas.
                let key = b.vs.map(v => this.vertexIndexMap.get(v)).sort((a, b) => a - b).join(',');

                // Mod-2 Addition logic using the Map
                if (faceMap.has(key)) {
                    // If it's already in the map, it's a shared interior face. Delete it.
                    faceMap.delete(key);
                } else {
                    // If it's not in the map, it's currently a boundary candidate. Add it.
                    faceMap.set(key, b);
                }
            }
        }

        // 3. Extract the surviving faces (which appear exactly once)
        let boundaries = Array.from(faceMap.values());
        
        //build simplciial complex of boundary     
        const boundaryComplex = new SimplicialComplex(boundaries); 
        return boundaryComplex
    }


    //draw 1-skeleton
    drawWiremesh(ctx){
        ctx.beginShape(ctx.LINES);
        for (let e of this.skeleton(1)) {
            let projEdge = e.vs.map(v => v.project());
            ctx.vertex(projEdge[0].x, projEdge[0].y, projEdge[0].z);
            ctx.vertex(projEdge[1].x, projEdge[1].y, projEdge[1].z);
        }
        ctx.endShape();

    }

    geometry() {
        let geo = new p5.Geometry();

        for (let v of this.vertices) {
            geo.vertices.push(v.project()); //ordered according to this.vertices
        }

        for (let e of this.skeleton(1)) {
            let edgeVerts = e.vs;
            let idx0 = this.vertexIndexMap.get(edgeVerts[0]);
            let idx1 = this.vertexIndexMap.get(edgeVerts[1]);
            
            // Retrieve the correct new indices from the map
            geo.edges.push([idx0,idx1]);
        }

        for (let f of this.skeleton(2)) {
            let faceVerts = f.vs;

            let idx0 = this.vertexIndexMap.get(faceVerts[0]);
            let idx1 = this.vertexIndexMap.get(faceVerts[1]);
            let idx2 = this.vertexIndexMap.get(faceVerts[2]);
            
            // Retrieve the correct new indices for all three vertices of the face
            geo.faces.push([idx0,idx1,idx2]);
        }
        geo.computeNormals(FLAT);
        
        return geo;
    }

    dimension(){
        let dim = this.simplices[0].dim
        for(let s of this.simplices){
            if(s.dim != dim){
                return -1;
            }
        }
        return dim;
    }

    //Inplements the formula of the cotan laplacian in arbitrary dimensions
    // from https://www.cs.cmu.edu/~kmcrane/Projects/Other/nDCotanFormula.pdf 
    // returns object:
        //stiffness:  sparse stiffness matrix L
        //mass:   sparse mass matrix M
    laplacian(){
        this.generateVertexMap();
        const size = this.vertices.length;

        //Compute mass matrix
        let diagonals = new Array(size).fill(0);
        for(let s of this.simplices){
            let volContribution = s.volume()/(s.dim+1);
            for(let v of s.vs){
                let id = this.vertexIndexMap.get(v)
                diagonals[id] += volContribution;
            }
        }
        const mass = math.diag(diagonals, 'sparse');
        
        //compute stiffness matrix (contains adjancency info)
        let stiffness = math.zeros(size, size, 'sparse');
        for(let s of this.simplices){
            let dimFactor = 1/((s.dim)*(s.dim-1));
            for(let edge of s.skeleton(1)){
                let id0 = this.vertexIndexMap.get(edge.vs[0]);
                let id1 = this.vertexIndexMap.get(edge.vs[1]);
                const opp = s.dihedrealOppositeEdge(edge.vs);
                const cot = opp.cos/math.sqrt(1-opp.cos*opp.cos);
                const contribution = cot* opp.vol *dimFactor

                const indices = [id0 , id1]
                let currentVal = stiffness.get(indices);
                stiffness.set(indices, currentVal + contribution);

                //ensure symmetry of stiffness laplacian
                const reverseIndices = [id1 , id0]
                currentVal = stiffness.get(reverseIndices);
                stiffness.set(reverseIndices, currentVal + contribution);
            }
        }
        return {stiffness: stiffness, mass: mass};
    }

    gradient(f){

    }

    //input: a function f, an array of length equal to the number of vertices
    //Output: a simplical complex representing the level set f\inv(0)
    marchingSimplices(f){
        //for each simplex, find intersection of finv(0) with that simplex/ This is an n-1 simplex. 
        // All these together make the new simplical complex
        let marchedSimplices = []
        for(let s of this.simplices){

            //split vertices into positive and negative values of f
            let pos = [];
            let neg = [];

            let posLocations=[]; //use this to determine boundary sign
            
            for (let i = 0; i< s.vs.length; i++) {
                let v = s.vs[i];
                let idx = this.vertexIndexMap.get(v);
                let val = f[idx];
                
                if (val >= 0) {
                    pos.push({ v: v, val: val });
                    posLocations.push(i)
                } else {
                    // Store absolute value for easier interpolation math later
                    neg.push({ v: v, val: Math.abs(val) });
                }
            }
             

            // If all positive or all negative, the surface doesn't cross this simplex
            if (pos.length === 0 || neg.length === 0) continue;

            // Count Topological Inversions
            // This determines the relative parity of the positive vs negative split
            let inversions = 0;
            for (let p of pos) {
                for (let n of neg) {
                    if (p.i > n.i) inversions++;
                }
            }
            let needsSwap = (inversions % 2 === 1);
            if (neg.length === 1) { //force normal to point in the direction of positive f
                needsSwap = !needsSwap;
            }

            // Helper to interpolate between a positive and negative vertex
            const getIntersection = (p, n) => {
                // Corrected interpolation math
                let t = p.val / (p.val + n.val);
                return p.v.interpolate(n.v, t); 
            };

            //Triangulate
            // case 1: there is exactly 1 positive vertex
            if (pos.length === 1 || neg.length === 1) {
               
                let single = pos.length === 1 ? pos[0] : neg[0];
                let group = pos.length === 1 ? neg : pos;
                
                let marchedVertices = group.map(g => getIntersection(single, g));
                if (needsSwap) { 
                    // Swap the first two to flip the triangle's normal
                    let temp = marchedVertices[1];
                    marchedVertices[1] = marchedVertices[0];
                    marchedVertices[0] = temp;
                }

                marchedSimplices.push(new Simplex(marchedVertices));
            }

            // case 2 (3D only): there are 2 positive and 2 negative verticies. Intersection is a quadralateral.
            else if (pos.length === 2 && neg.length === 2) {
                // Find the 4 intersections on the edges connecting pos to neg
                let e11 = getIntersection(pos[0], neg[0]);
                let e12 = getIntersection(pos[0], neg[1]);
                let e21 = getIntersection(pos[1], neg[0]);
                let e22 = getIntersection(pos[1], neg[1]);

                let t1 = [e11, e12, e21];
                let t2 = [e12, e22, e21];

                if (needsSwap) {
                    // Swap the first two vertices of BOTH generated triangles
                    t1 = [e12, e11, e21];
                    t2 = [e22, e12, e21];
                }

                // split the quadrilateral into two connected triangles
                marchedSimplices.push(new Simplex(t1));
                marchedSimplices.push(new Simplex(t2));
            }
        }

        levelSet = new SimplicialComplex(marchedSimplices);
        levelSet.compileVertices(); //merge nearby verticies
        return levelSet;

    }


    //merges nearby vertices in simplical complex
    compileVertices() {
        this.vertices = [];
        this.vertexIndexMap = new Map();
        
        let index = 0;
        
        // A temporary map to find vertices at the exact same location
        let spatialHash = new Map(); 

        for (let s of this.simplices) {
            for (let i = 0; i < s.vs.length; i++) {
                let v = s.vs[i];
                
                // 1. Get coordinates. Assuming v.project() returns {x, y, z}
                let p = (typeof v.project === 'function') ? v.project() : v;
                
                // 2. Create a unique string key based on position. 
                // We use toFixed(5) to merge microscopic floating point errors!
                let hash = `${(p.x || 0).toFixed(5)},${(p.y || 0).toFixed(5)},${(p.z || 0).toFixed(5)}`;
                
                if (!spatialHash.has(hash)) {
                    // First time seeing this location! Add it to the master list.
                    this.vertices.push(v);
                    this.vertexIndexMap.set(v, index);
                    
                    // Record it in the spatial hash for future adjacent simplices
                    spatialHash.set(hash, v);
                    index++;
                } else {
                    // 3. CRITICAL: We've seen this location before from a neighboring simplex.
                    // Overwrite the duplicate object reference with the original one.
                    let sharedVertex = spatialHash.get(hash);
                    s.vs[i] = sharedVertex; 
                }
            }
        }
    }


    //function for creating a 2D grid
    static grid2D(options={}){
        const defaults = {
            range: [[-1,1],[-1,1]],
            res:  [5, 5]
		};
        options = Object.assign({}, defaults, options);
        let res = options.res;
        let range = options.range;

        let vertexMap = new Map();

        for(let i0=0;i0<=res[0];i0++){
            for(let i1=0;i1<=res[1];i1++){
                let x = map(i0,0,res[0],range[0][0],range[0][1])
                let y = map(i1,0,res[1],range[1][0],range[1][1])
                let v = new ManifoldPoint(createVector(x,y))
                let key = [i0,i1].join(",");
                vertexMap.set(key, v) //Record the vertirices by combinatorial coordinates
            }
        }

        let simplices = [];
        for(let i0=0;i0<=res[0];i0++){
            for(let i1=0;i1<=res[1];i1++){
                if(i0+1<=res[0] && i1+1<=res[1]){
                    let v00 = vertexMap.get([i0,i1].join(","));         // Bottom-Left
                    let v10 = vertexMap.get([i0+1,i1].join(","));     // Bottom-Right
                    let v01 = vertexMap.get([i0,i1+1].join(","));     // Top-Left
                    let v11 = vertexMap.get([i0+1,i1+1].join(",")); // Top-Right

                    let s0 = new Simplex([v00,v10,v01]);
                    simplices.push(s0);

                    let s1 = new Simplex([v10,v11,v01]);
                    simplices.push(s1);
                }
                
            }
        }
        return new SimplicialComplex(simplices);
    }

    //function for creating a 3D volumetric grid
    static grid3D(options={}){
        const defaults = {
            range: [[-1,1], [-1,1], [-1,1]],
            res:  [5, 5, 5]
        };
        options = Object.assign({}, defaults, options);
        let res = options.res;
        let range = options.range;

        let vertexMap = new Map();

        // 1. Generate all vertices in 3D space
        for(let i0=0; i0<=res[0]; i0++){
            for(let i1=0; i1<=res[1]; i1++){
                for(let i2=0; i2<=res[2]; i2++){
                    let x = map(i0, 0, res[0], range[0][0], range[0][1]);
                    let y = map(i1, 0, res[1], range[1][0], range[1][1]);
                    let z = map(i2, 0, res[2], range[2][0], range[2][1]);
                    
                    // createVector handles 3D natively in p5.js
                    let v = new ManifoldPoint(createVector(x,y,z)); 
                    let key = [i0,i1,i2].join(",");
                    vertexMap.set(key, v); // Record the vertices by combinatorial coordinates
                }
            }
        }

        let simplices = [];
        // 2. Iterate over every cube cell in the grid
        for(let i0=0; i0<=res[0]; i0++){
            for(let i1=0; i1<=res[1]; i1++){
                for(let i2=0; i2<=res[2]; i2++){
                    
                    // Check that we aren't spilling over the edge
                    if(i0+1<=res[0] && i1+1<=res[1] && i2+1<=res[2]){
                        
                        // Grab the 8 corners of the current cube
                        let v000 = vertexMap.get([i0,   i1,   i2  ].join(","));
                        let v100 = vertexMap.get([i0+1, i1,   i2  ].join(","));
                        let v010 = vertexMap.get([i0,   i1+1, i2  ].join(","));
                        let v110 = vertexMap.get([i0+1, i1+1, i2  ].join(","));
                        let v001 = vertexMap.get([i0,   i1,   i2+1].join(","));
                        let v101 = vertexMap.get([i0+1, i1,   i2+1].join(","));
                        let v011 = vertexMap.get([i0,   i1+1, i2+1].join(","));
                        let v111 = vertexMap.get([i0+1, i1+1, i2+1].join(","));

                        // Slice the cube into 6 tetrahedra (3-simplices)
                        // Every path starts at v000, takes steps along axes, and ends at v111
                        let s0 = new Simplex([v000, v100, v110, v111]); // (x, y, z) -> Even
                        let s1 = new Simplex([v100, v000, v101, v111]); // (x, z, y) -> Odd  
                        let s2 = new Simplex([v010, v000, v110, v111]); // (y, x, z) -> Odd  
                        let s3 = new Simplex([v000, v010, v011, v111]); // (y, z, x) -> Even
                        let s4 = new Simplex([v000, v001, v101, v111]); // (z, x, y) -> Even
                        let s5 = new Simplex([v001, v000, v011, v111]); // (z, y, x) -> Odd 
                        
                        simplices.push(s0, s1, s2, s3, s4, s5);
                    }
                }
            }
        }
        
        return new SimplicialComplex(simplices);
    }
}


