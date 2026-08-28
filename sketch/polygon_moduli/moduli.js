const FRG = '#E6CFB3'; //background color
const BKG = '#2c2621'; //foreground color
const PRIMARY = '#2C7D15'; // primary highlight color

let containerId = "canvas";
let canvasSize
let windows, selectorWindow, polyWindow, weightedSphereOptions
let selectorCamera, polygonCamera

const defaultUIState = {
	gradientConstraint: 1,
	doAbelian: true,
    abelianLevel:0.5,
};

const uiState = defaultUIState;

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

    selectorCamera = new Camera3D({
        zoom: -0.3,
        zoomRange: [0.1,10],
        disablePan: true,
        disableZoom: true,
    });
    polygonCamera = new Camera3D({
        zoom: -0.5,
        zoomRange:[0.1,10],
        disablePan: false
    });
    
    weightedSphereOptions = { 
        camera: selectorCamera , 
        logRange: [-1,1]
    }
    function ran(){
        return 0.2 * (random()*2.-1.);
    }

    let selectors = [];
    
    selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector( 1,ran(),ran())})));
    selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector(ran(), 1,ran())})));
    selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector(ran(),ran(), 1)})));
    selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector(-1,ran(),ran())})));
    selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector(ran(),-1,ran())})));
    selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector(ran(),ran(),-1)})));


    selectorWindow = new PolygonSelectorWindow({
		pixels: canvasSize/2,
        x: -2, y: -1, width: 2,
        camera: selectorCamera,
        doGradientFlow: true,
        gradientFlowDt: 0.1,
        selectors: selectors,
        abelianPolygonSpace: defaultUIState.doAbelian,
        abelianLevel: defaultUIState.abelianLevel,
	});

     polyWindow = new PolygonWindow({
        pixels: canvasSize/2,
        camera: polygonCamera,
        x: 0, y: -1, width: 2,
        selectorWindow: selectorWindow,
        abelianPolygonSpace: defaultUIState.doAbelian,
        abelianLevel: defaultUIState.abelianLevel,
    })

	windows = [selectorWindow, polyWindow]; 
    setupUI();
}

function setupUI() {
    const gradientSlider = document.getElementById('gradientSlider');
    const gradientLabel = document.getElementById('gradientSliderValue');
    const doAbelian = document.getElementById('doAbelianBox');
    const levelSlider = document.getElementById('levelSlider');
    const levelLabel = document.getElementById('levelSliderValue');
    const levelSliderContainer = document.getElementById('levelSliderContainer');

    // --- Set Initial Input Values from defaultUIState ---

    gradientSlider.value = defaultUIState.gradientConstraint ?? 1;
    doAbelian.checked = defaultUIState.doAbelian ?? false;
    levelSlider.value = defaultUIState.abelianLevel ?? 0.5;

    // Set initial text label values
    if (gradientLabel) gradientLabel.textContent = nf(gradientSlider.value, 0, 1);
    if (levelLabel) levelLabel.textContent = nf(levelSlider.value, 0, 1);

    // Set initial visibility for the level slider container
    if (levelSliderContainer) {
        levelSliderContainer.style.display = doAbelian.checked ? 'block' : 'none';
    }

    // --- Event Listeners ---

    gradientSlider.addEventListener('input', () => {
        let val = gradientSlider.value;
        if (gradientLabel) gradientLabel.textContent = nf(val, 0, 1);
        uiState.gradientConstraint = val;

        let minExp = -2.5
        selectorWindow.gradientFlowDt = pow(10,map(val,0,1,minExp,-1))-pow(10,minExp)
    });

    doAbelian.addEventListener('change', () => {
        uiState.doAbelian = doAbelian.checked;
        
        // Toggle height slider container visibility
        if (levelSliderContainer) {
            levelSliderContainer.style.display = doAbelian.checked ? 'block' : 'none';
        }
        
        for (let w of windows) {
            w.abelianPolygonSpace = uiState.doAbelian;
        }

        console.log(selectorWindow.abelianPolygonSpace);
    });

    levelSlider.addEventListener('input', () => {
        let val = levelSlider.value;
        if (levelLabel) levelLabel.textContent = nf(val, 0, 1);
        uiState.abelianLevel = val;
        
        for (let w of windows) {
            w.abelianLevel = uiState.abelianLevel;
        }
    });
}


function draw() {
	scale(height / 2, -height / 2, height / 2) //recale to a box [-1,1]times [-1,1]
	background(BKG);

    let didSelectorCamUpdate = selectorCamera.update();
    let didPolygonCamUpdate = polygonCamera.update();
    if(didSelectorCamUpdate){
        polygonCamera.rotation = selectorCamera.rotation
    } 
    if(didPolygonCamUpdate){
        selectorCamera.rotation = polygonCamera.rotation
    }
    

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
            gradientFlowDt: 0.1,
            abelianPolygonSpace: false,
            abelianLevel: 0,
		};
        options = Object.assign({}, defaults, options);
        super(options); 
    }

    render(){
        
        let ctx = this.g;


        for (let s of this.selectors) {
			s.draw(this.g);
		}
        

        ctx.noStroke();
        ctx.fill(FRG);
        ctx.push();
        this.camera.applyRotationMatrix(ctx)

        lighting(ctx,this.camera);
        ctx.sphere(1,50);

         // Draw plane at level (if abelian)
        if(this.abelianPolygonSpace){
            ctx.push();
            ctx.noLights();
            ctx.translate(0, 0, this.abelianLevel/this.selectors.length);
            let fillCol = color(FRG)
            fillCol.setAlpha(80);
            ctx.fill(fillCol);
            ctx.strokeWeight(1);
            ctx.stroke(FRG);
            ctx.ellipse(0, 0, 2.3,2.3,50);
            ctx.pop();
        }
        
        ctx.pop();
        


        


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
        let zDirection = createVector(0,0,(totalRoots.z-this.abelianLevel))

        
        for(let s of this.selectors){
            if(!s.isPressed && !s.scrolling){
                if(this.abelianPolygonSpace){
                    s.sphere.add(zDirection.copy().mult(dt)).normalize();  //ABELIAN POLYGON SPACE
                } else {
                    s.sphere.add(totalRoots.copy().mult(dt)).normalize();  //POLYGON SPACE
                }
                
            }
            
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
            abelianPolygonSpace: false,
            abelianLevel: 0,
		};
        options = Object.assign({}, defaults, options);
        super(options); 
    }

    render() {
        let ctx = this.g;
        let p = createVector(0, 0, 0);
        
        // Define sizes for your 3D geometry
        let jointRadius = 0.06; 
        let boneRadius = 0.03;  
        
        // --- ADD LIGHTING HERE ---
        lighting(ctx,this.camera);
        // -------------------------

         
        ctx.fill(FRG);
        ctx.noStroke();

        // Draw the initial starting joint at (0,0,0)
        ctx.push();
        ctx.translate(p.x, p.y, p.z);
        ctx.sphere(jointRadius);
        ctx.pop();

        for (let s of this.selectorWindow.selectors) {
            if((s.rollover && !s.hidden)|| s.isPressed){
                ctx.fill(PRIMARY);
            } else {
                ctx.fill(FRG);
            }
            let pNext = p.copy().add(s.sphere.copy().mult(s.getWeight()));
            
            // --- 1. DRAW CYLINDER (The Bone) ---
            let dir = pNext.copy().sub(p);
            let dist = dir.mag();
            
            // Find the midpoint between p and pNext
            let mid = p.copy().add(dir.copy().mult(0.5));
            
            ctx.push();
            ctx.translate(mid.x, mid.y, mid.z);
            
            // Calculate rotation to point the cylinder from p to pNext
            let up = createVector(0, 1, 0); // Cylinders point UP in p5.js
            let axis = up.cross(dir);       // Axis to rotate around
            
            // Constrain dot product to [-1, 1] to prevent floating point math errors in acos
            let dot = up.dot(dir) / (dist || 1);
            dot = Math.min(Math.max(dot, -1), 1); 
            let angle = Math.acos(dot);
            
            // Only apply rotation if the vectors aren't perfectly parallel
            if (axis.magSq() > 0.000001) {
                axis.normalize();
                ctx.rotate(angle, axis);
            } else if (dir.y < 0) {
                ctx.rotateX(Math.PI); // Flip 180 degrees if pointing straight down
            }
            
            // Draw the cylinder (radius, height)
            ctx.cylinder(boneRadius, dist);
            ctx.pop();
            
            // --- 2. DRAW SPHERE (The Joint) ---
            ctx.push();
            ctx.translate(pNext.x, pNext.y, pNext.z);
            ctx.sphere(jointRadius);
            ctx.pop();
            
            // Advance to the next point
            p = pNext;
        }


        // Draw plane at level (if abelian)
        if(this.abelianPolygonSpace){
            ctx.push();
            ctx.noLights();
            ctx.translate(0, 0, this.abelianLevel);
            let fillCol = lerpColor(FRG,BKG,0.6)
            fillCol.setAlpha(100);
            ctx.fill(fillCol);
            ctx.strokeWeight(1);
            ctx.stroke(FRG);
            ctx.ellipse(0, 0, 3,3,50);
            ctx.pop();
        }
        
    }
}

function lighting(ctx,camera){
    ctx.noLights();
    ctx.ambientLight(120,120, 120); 

    let lightDirection = createVector(0,0,-1);
    lightDirection = camera.rotation.inverse().rotateVector(lightDirection)
    let fillDirection = createVector(1,-1,1);
    fillDirection = camera.rotation.inverse().rotateVector(fillDirection)

    // key light
    ctx.directionalLight(200, 200, 200, lightDirection.x,lightDirection.y,lightDirection.z);
    
    // fill light
    ctx.directionalLight(100, 70, 50, fillDirection.x,fillDirection.y,fillDirection.z);
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

    // Override to prevent SphereSelector's update logic from interfering
    update(mouse){
        let world = this.getWorld();
       
        this.x = world.x;
        this.y = world.y;
        this.hidden = world.z<0; 
        
        // We call ComplexDragger's update, skipping SphereSelector's version
        return super.update(mouse);
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

    draw(ctx){

        
        if(this.hidden){return false;}
        ctx.push();
        this.camera.applyRotationMatrix(ctx)
        let sphere = this.sphere;
        let lon = Math.atan2(sphere.x, sphere.z);
        // We negate asin(y) because p5.js has a Y-down coordinate system
        let lat = -Math.asin(sphere.y);
        ctx.rotateY(lon);
        ctx.rotateX(lat);
        ctx.translate(0,0,1);
         
        ctx.stroke(BKG);
        ctx.strokeWeight(1);

        if (this.isPressed) {
            ctx.fill(this.pressedColor);
        } 
        else if (this.rollover) {
            ctx.fill(this.rolloverColor);
        } 
        else {
            ctx.fill(this.color);
        }
        
        ctx.circle(0,0, this.radius*this.drawRatio);
        ctx.pop();

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
        
        for (let w of windows) {
            w.multiDragType = "ALL";
            w.camera.dragMode  =  "PAN";
        }
    } 
}

function keyReleased() {
    if (keyCode === SHIFT) {
        for (let w of windows) {
            w.multiDragType = "CLOSEST";
            w.camera.dragMode  =  "ROTATE";
        }
    }
    
}
