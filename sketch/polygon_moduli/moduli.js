const FRG = '#E6CFB3'; //background color
const BKG = '#2c2621'; //foreground color

let containerId = "canvas-wide";
let canvasSize
let windows, selectorWindow, weightedSphereOptions


function setup() {
   
	let elem = document.getElementById(containerId);
    print(elem)
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

    let camera = new Camera3D({
        zoom: -0.1,
        zoomRange:[0.001,20],
        disablePan: false
    });
    weightedSphereOptions = { 
        camera: camera , 
        logRange: [-1,1]
    }
    function ran(){
        return 0.2 * (random()*2.-1.);
    }

    let selectors = [];
    
    selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector( 1,ran(),ran())})));
    selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector(-1,ran(),ran())})));
    selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector(ran(), 1,ran())})));
    selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector(ran(),-1,ran())})));
    selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector(ran(),ran(), 1)})));
    selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector(ran(),ran(),-1)})));


    selectorWindow = new PolygonSelectorWindow({
		pixels: canvasSize/2,
        x: -2, y: -1, width: 2,
        camera: camera,
        selectors: selectors,
	});

     polyWindow = new PolygonWindow({
        pixels: canvasSize/2,
        camera: camera,
        x: 0, y: -1, width: 2,
        selectorWindow: selectorWindow,
    })

	windows = [selectorWindow, polyWindow]; 
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

class PolygonSelectorWindow extends SphereWindow{
    constructor(options={}){
        const defaults = {
            multiDragType: "CLOSEST",
            doGradientFlow: true,
            gradientFlowDt: 0.001
		};
        options = Object.assign({}, defaults, options);
        super(options); 
    }

    render(){
        
        let ctx = this.g;
        ctx.sphere(0,0,1)
        super.render();
    }

    update(){
         if(this.doGradientFlow){
            this.momentMapGradFlow(-this.gradientFlowDt);
        }
        return super.update();
    }

    generateSelectorDoubleClick(mousePos){
		let s =  new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {world:  mousePos}));
		if(s.sphere){
			return s;
		} else {
			return false;
		}
	}

    momentMapGradFlow(dt){
        let totalRoots = createVector(0,0,0);
        for(let s of this.selectors){
            totalRoots.add(s.sphere.copy().mult(s.getWeight()));
        }
        totalRoots.mult(dt);

        let zDirection = createVector(0,0,totalRoots.z)
        for(let s of this.selectors){
            // s.sphere.add(totalRoots).normalize();  //POLYGON SPACE
             s.sphere.add(zDirection).normalize();  //ABELIAN POLYGON SPACE
        }

        this.flagSelectorUpdate =true; 
    }

}

class PolygonWindow extends GraphicsWindowCamera{
    constructor(options={}){
        let camera = new Camera3D({
            zoom:-1
        });
        const defaults = {
            camera: camera,
            selectorWindow: false,
            
		};
        options = Object.assign({}, defaults, options);
        super(options); 
    }

    render(){
        let ctx = this.g;
        let p = createVector(0,0,0)
        ctx.stroke(FRG);
        ctx.strokeWeight(4);
        for( let s of this.selectorWindow.selectors){
            let pNext = p.copy().add( s.getWorld()); 
            ctx.line(p.x,p.y,p.z,pNext.x,pNext.y,pNext.z);
            p = pNext;
        }
    }
}


class WeightedSphereSelector extends SphereSelector{
    constructor(options){
        const defaults = {
            logWeight: 0,
            logRange: [1,1],
		};
        options = Object.assign({}, defaults, options);
        super(options);
    }

   

    onScroll(delta){
        if(this.hidden){
            this.scrolling=false;
            return false;
        }

       
        this.logWeight += delta / 1000;
        this.constrainWeight();
        this.drawRatio = sqrt(this.getWeight());
        return true;
    }

   
    constrainWeight(){
        this.logWeight=constrain(this.logWeight,this.logRange[0],this.logRange[1]);
    }

    getWeight(){
        return exp(this.logWeight);
    }

    getUniform(){
        let sphere = this.sphere;
        return [sphere.x,sphere.y,sphere.z,this.getWeight()];
    }

    static defaultUniform(){
        return [0,0,0,0];
    }
}

/////////////////////////
// HELPER FUNCTIONS
/////////////////////////



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
        selectorWindow.multiDragType = "ALL";
        selectorWindow.camera.dragMode = "PAN";
    } 
}

function keyReleased() {
    if (keyCode === SHIFT) {
        selectorWindow.multiDragType = "CLOSEST";
        selectorWindow.camera.dragMode = "ROTATE";
    }
    
}

