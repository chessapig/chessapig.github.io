const FRG = '#E6CFB3'; //background color
const BKG = '#2c2621'; //foreground color

let containerId = "canvas";
let canvasSize;
let windows = [];
let geo;
let levelSet,levelSetGeo;
let mesh, meshBdry


function preload(){

    let v0 = new ManifoldPoint(createVector(0,0,0),{index: 0})
    let v1 = new ManifoldPoint(createVector(1,0,0),{index: 1})
    let v2 = new ManifoldPoint(createVector(2,1,0),{index: 2})
    let v3 = new ManifoldPoint(createVector(1,1,0),{index: 3})
    let v4 = new ManifoldPoint(createVector(0,1,0),{index: 4})

    let s1 = new Simplex([v0,v1,v4]);

    let s2 = new Simplex([v1,v3,v4]);
    let s3 = new Simplex([v1,v2,v3]);
    // mesh = new SimplicialComplex([s1,s2,s3],{doReindex:false})
    let res = 6;

    

    mesh = SimplicialComplex.grid2D({
        range: [[-1,1],[-1,1]],
        res:  [res,res]
    });
    
    geo = mesh.geometry();


    function funct(v){
        return (v.x*v.x+v.y)-0.0;
    }

    let numVerts = mesh.vertices.length;
    let f = new Array(numVerts).fill(0);
    for(let i=0;i<numVerts;i++){
        f[i] = funct(mesh.vertices[i].pos);
    }
    levelSet = mesh.marchingSimplices(f);
    console.log(levelSet);
    levelSetGeo = levelSet.geometry();
    console.log(levelSetGeo)
    
    // meshBdry = mesh.boundary();

    // bdryGeo = meshBdry.complex.geometry();

    // let s2 = new Simplex([v3,v1,v2])
    // let s3 = new Simplex([v1,v0,v2])
    // let m = new Mesh([s1,s2,s3])
    // console.log(m);

}

function setup() {
   
	let elem = document.getElementById(containerId);
	boundingRect = elem.getBoundingClientRect();

    // // get computed border size
    let style = getComputedStyle(elem);
    let borderLeft = parseFloat(style.borderLeftWidth);
    let borderRight = parseFloat(style.borderRightWidth);
    let canvasWidth =  boundingRect.width - borderLeft - borderRight; //sets size of canvas.
    let canvasHeight =  boundingRect.height - borderLeft - borderRight; //sets size of canvas.
    canvasSize = canvasWidth;
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

    let myWindow = new TestWindow({
        pixels: canvasSize,
        x: -1, y: -1, width: 2
    });
    windows = [myWindow]



}

class TestWindow extends GraphicsWindowCamera{
    constructor(options={}){
        const defaults = {
			camera:  new Camera3D()
		};
        options = Object.assign({}, defaults, options);
        super(options);
        
    }

    render(){
        super.render();

        let ctx = this.g;
        ctx.scale(0.45);
        //ctx.noFill();

        //ctx.strokeWeight(5);
        ctx.stroke(FRG);
        //ctx.model(geo);
        mesh.drawWiremesh(ctx);

        ctx.noStroke();
        ctx.stroke("#d25252");
        //ctx.model(levelSetGeo);
        levelSet.drawWiremesh(ctx);

        
    }

}


function visualizeNormals(model,ctx){
    ctx.stroke(255, 0, 0);
    // Iterate over the vertices and vertexNormals arrays.
    for (let i = 0; i < levelSetGeo.vertices.length; i += 1) {

        // Get the vertex p5.Vector object.
        let v = levelSetGeo.vertices[i];

        // Get the vertex normal p5.Vector object.
        let n = levelSetGeo.vertexNormals[i];

        // Calculate a point along the vertex normal.
        let p = p5.Vector.mult(n, 0.1);

        // Draw the vertex normal as a red line.
        ctx.push();
        ctx.translate(v);
        ctx.line(0, 0, 0, p.x, p.y, p.z);
        ctx.pop();
    }
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
		windows[0].camera.dragMode  =  "PAN";
    } 
}

function keyReleased() {
    if (keyCode === SHIFT) {
		windows[0].camera.dragMode  =  "ROTATE";
    }
}


