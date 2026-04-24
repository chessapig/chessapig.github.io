/// a class which holds a p5graphics object and deals with all coordinate transforms. 
//these hold selector objects, whch can be dragged and edited.
// The subcalss GraphicsWindow2DCamera also has a 2D camera for panning around and zooming in and out.

let defaultVertSrc = `
precision highp float;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
}
`

let defaultFragSrc = `
precision mediump float;

varying vec2 vTexCoord;

const int MAX_SELECTORS = 32;

uniform vec2 worldCenter;
uniform vec2 worldSize;
uniform int numSelectors;
uniform vec2 selectorValues[MAX_SELECTORS];


void main() {
	// Normalized pixel coordinates (from 0 to 1)
	vec2 world = worldCenter + (vTexCoord - 0.5) * worldSize;

	//code for reading selectorValues
	float brightness = 0.;
	for(int i = 0;i<MAX_SELECTORS;i++){
		if(i<numSelectors){
			vec2 selectorLocation = selectorValues[i];
			brightness+=1.-smoothstep(0.2,0.4,length(world-selectorValues[i]));
		}
	}

	//make checkerboard
	float scale = 10.;
	vec3 outputColor=vec3(0.,0.,0.);
	if(mod(float(floor(world.x*scale)+floor(world.y*scale)),2.)==0.){
		outputColor = vec3(1.,0.,1.);
	}
	outputColor += vec3(brightness);

	//make boundary
	float EPS = 0.1;
	float bdry=1.;
	if(abs(world.x-bdry)<EPS || abs(-world.x-bdry)<EPS || abs(world.y-bdry)<EPS|| abs(-world.y-bdry)<EPS){
		outputColor = vec3(1.);
	}
	gl_FragColor = vec4(outputColor, 1.0);
}
`;


//creates square graphics window
//handles all the logic of coordinate systems and mouse interaction
//contains a list of "selector" objects, and handles their logic.
class GraphicsWindow {
	//x,y represent BOTTOM LEFT corner of image.
	constructor(options={}) {
		const defaults = {
			pixels: 500,
			x: -1,
			y:-1,
			width: 2,
			canvasMode: WEBGL,
			selectors:[],
			vertSrc: defaultVertSrc,
			fragSrc: defaultFragSrc,
			drawShader: false,
			uniforms: {
				worldCenter: [0,0],
				worldSize: [2,2],
				numSelectors: 0,
				selectorValues: [] //default: selector values is trivial
			},
			multiDragType: "CLOSEST", //options are "ALL" and "CLOSEST"
			defaultSelectorValueUniform: [0,0],
		};
		Object.assign(this, defaults, options);
		Object.assign(this.uniforms, defaults.uniforms, options.uniforms); //make sure options doesnt overwirte default uniforms
		this.g = createGraphics(this.pixels, this.pixels, this.canvasMode);
		this.transformCoords()

		this.loadShader();

		this.MAX_SELECTORS = 32;
		
	}


	transformCoords() {
		this.g.resetMatrix();
		let h = this.pixels;
		if (this.g._renderer.isP3D) { //IF WEBGLMODE: 
			this.g.scale(h / 2, h / 2, h / 2);
		} else { //if 2D mode
			this.g.translate(h / 2, h / 2);
			this.g.scale(h / 2, h / 2);
		}

		this.cameraTransform();
	}

	cameraTransform(){} //hook to be changed for camera subclasses

	screenToLocal(mx, my) {
		//normalize mx,my to [-1,1]
		let mu = (mx - width / 2) * 2 / canvasSize;
		let mv = -(my - height / 2) * 2 / canvasSize;

		// move mu,mv to local coordinates
		let localX = 2 * (mu - this.x) / this.width - 1;
		let localY = 2 * (mv - this.y) / this.width - 1;

		let isInside = true;
		if (
			localX < -1 ||
			localX > 1 ||
			localY < -1 ||
			localY > 1
		) {
			isInside = false;
		}

		return { x: localX, y: localY, isInside: isInside };
	}

	

	draw() {
		image(this.g, this.x, this.y, this.width, this.width);
	}

	clear() {
		this.g.clear();
	}

	
	mouse() {
		return this.screenToLocal(mouseX, mouseY);
	}

	pressed() {
		let didPress;
		switch(this.multiDragType){
			case "ALL":
				for (let s of this.selectors) {
					didPress= s.pressed();
				}
				break;
			
			case "CLOSEST":
				let minDistanceSelector;
				let minDistance = 10000;
				for (let s of this.selectors) {
					let distance = s.over();
					if(distance<minDistance){
						minDistance = distance ;
						minDistanceSelector = s
					}
				}
				didPress = minDistanceSelector.pressed(); //only press the closest selector. 
				break;
		}
		return didPress;
	}

	released() {
		for (let s of this.selectors) {
			s.released();
		}
	}

	scroll(delta) {
		let didScroll=false;
		for (let s of this.selectors) {
			didScroll  =  s.scroll(delta) || didScroll;
		}
		return didScroll;
	}

	dragged(mouseX,mouseY,pmouseX,pmouseY){} //hook for sublcasses.

	update() {
		if(this.drawShader){
			this.updateShader();
		}

		let didUpdate=false;
		let mouse = this.mouse();
		mouse = createVector(mouse.x, mouse.y)
		for (let s of this.selectors) {
			didUpdate =  s.update(mouse) || didUpdate;
		}
		return didUpdate;
	}

	
	render() {
		if(this.drawShader){
			this.renderShader();
			this.g.push();
			this.g.resetMatrix();
			this.g.imageMode(CORNER);
			this.g.image(this.shaderLayer, -this.g.width/2, -this.g.height/2, this.g.width, this.g.height);
			this.g.pop();
		}

		for (let s of this.selectors) {
			s.draw(this.g);
		}
	}


	loadShader(){
		if(!this.drawShader){return false;}
		this.shaderLayer = createGraphics(this.g.width, this.g.height, WEBGL);
		this.shaderLayer.rectMode(CORNER);      // origin at top-left
		this.shader = createShader(this.vertSrc, this.fragSrc);
		this.shaderLayer.shader(this.shader);
		
	}

	updateUniforms(){
		//update selectorValues uniform
		this.uniforms.numSelectors = this.selectors.length;
		let values = [];
		for(let i=0 ; i<this.MAX_SELECTORS; i++){
			if(i<this.selectors.length ){
				let s = this.selectors[i];
				values.push(...s.getUniform());
			} else {
				values.push(...this.defaultSelectorValueUniform);
			}
		}
		this.uniforms.selectorValues=values; 		
	}

	updateShader(){
		this.updateUniforms();
		for (const key in this.uniforms) {
			this.shader.setUniform(key, this.uniforms[key]);
		}
	}

	renderShader(){
		if(!this.shaderLayer){
			console.log("ERROR: You forgot to load shader!")
			return;
		}
		this.shaderLayer.rect(-this.pixels/2, -this.pixels/2, this.pixels, this.pixels);
	}
}

//graphics window with 2D camera 
class GraphicsWindowCamera extends GraphicsWindow{
	constructor(options={}) {
		//add the defaults to the options BEFORE. calling super
		const defaults = {
			camEnabled: true,
			camera:  new Camera2D()
		};

		options = Object.assign({}, defaults, options);
		super(options);
	}

	computeWorldBounds() {
		let zoom = this.camera.zoomLevel();
		
		// Prevent division by zero if zoom accidentally hits 0
		if (zoom === 0) zoom = 0.0001; 

		// 1. World Center
		// The specific world coordinate located at the exact center (0,0) of your [-1, 1] screen.
		let worldCenterX = -this.camera.x / zoom;
		let worldCenterY = -this.camera.y / zoom;

		// 2. World Width & Height
		// The screen spans from -1 to 1, meaning the screen has a total width of 2.
		let screenWidth = 2;
		let worldWidth = screenWidth / zoom;
		let worldHeight = screenWidth / zoom;

		return {
			center: { x: worldCenterX, y: worldCenterY },
			width: worldWidth,
			height: worldHeight
		};
	}

	//apply camera to new coordinates
	cameraTransform(){
		this.camera.transform(this.g);
	}

	//take old screen to local, then remap it with new variables
	screenToLocal(mx,my){
		let coords = super.screenToLocal(mx, my);
		let z = this.camera.zoomLevel();

		coords.x = (coords.x - this.camera.x) / z;
		coords.y = (coords.y - this.camera.y) / z;

		return coords;
	}

	//return wether or not the camera updated.
	update(){
		this.transformCoords(); //retransform coords every update
		return super.update() || this.camera.update();;
	}

	updateUniforms(){
		super.updateUniforms();
		let zoom = this.camera.zoomLevel();
		this.uniforms.worldCenter=[-this.camera.x/zoom,-this.camera.y/zoom];
		this.uniforms.worldSize=[2/zoom,2/zoom];
	}

	dragged(mouseX,mouseY,pmouseX,pmouseY){
		let amPressingSelector=false;
		for (let s of this.selectors) {
			amPressingSelector  = amPressingSelector || s.isPressed;
		}
		if(!amPressingSelector && this.camEnabled  && this.mouse().isInside ){
			let mousePos= super.screenToLocal(mouseX,mouseY); 
			let pMousePos = super.screenToLocal(pmouseX,pmouseY);
			this.camera.dragged(mousePos.x-pMousePos.x,mousePos.y-pMousePos.y);
		}
	}

	scroll(delta) {
		let didScroll=false;
		let mouse = this.mouse();
		for (let s of this.selectors) {
			didScroll  =  s.scroll(delta) || didScroll;
		}
		if(!didScroll && mouse.isInside && this.camEnabled && delta != 0){
			this.camera.scroll(delta,mouse);
			didScroll = true;
		}
		didScroll = didScroll || super.scroll(delta);
		return didScroll;
	}
}


class Camera2D {
	constructor(options) {
		const defaults = {
			x :  0,
			dx : 0,
			xRange: [-1,1],
			y  : 0,
			yRange: [-1,1],
			dy : 0,
			zoom : 0,
			dZoom : 0,
			zoomRange:[0.1,10],
			drag : 0.9,
		};

		Object.assign(this, defaults, options);
	}

	transform(ctx){
		let zoom = this.zoomLevel();
		ctx.scale(zoom);
		ctx.translate(this.x / zoom, this.y / zoom)
	}

	//returns true is camera updated, false otherwise
	update(){
		// detect if anything will change
		let oldX = this.x;
		let oldY = this.y;


		// scale movement by zoom
		this.x += this.dx;
		this.y += this.dy;

		let zoom = this.zoomLevel(this.zoom);
		//constrain to range
		this.x = constrain(this.x,this.xRange[0]*zoom,this.xRange[1]*zoom);
		this.y = constrain(this.y,this.yRange[0]*zoom,this.yRange[1]*zoom);


		// decay
		this.dx *= this.drag;
		this.dy *= this.drag;

		//collapses to zero
		let cutoffVelocity = 1e-2;
		if(abs(this.dx)+abs(this.dy) < cutoffVelocity){
			this.dx = 0;
			this.dy = 0;
		}
	
		let didUpdate=false;
		if(this.didUpdate){
			didUpdate=true;
			this.didUpdate = false;
		}
		let eps = 1e-6
		didUpdate = didUpdate || (abs(this.x - oldX) > eps || abs(this.y - oldY) > eps );
		return didUpdate;
	}


	scroll(delta, mouse) {
		let oldX = this.x;
		let oldY = this.y;
		let oldZoom = this.zoom;

		let z0 = this.zoomLevel(this.zoom);

		// apply zoom
		this.zoom += -delta / 1000;
		this.zoom = constrain(this.zoom,
					this.inverseZoomLevel(this.zoomRange[0]),
					this.inverseZoomLevel(this.zoomRange[1]))

		let z1 = this.zoomLevel(this.zoom);

		let s = z1 / z0;

		// right now mouse lives in the coordinates.
		//I need to shift mouse from world coordinates to screen coordinates
		let mx= (z0*mouse.x+this.x);
		let my= (z0*mouse.y+this.y);
		this.x = mx- s * (mx - this.x);
		this.y = my - s * (my - this.y);

		let eps = 1e-6;
		if (
			Math.abs(this.x - oldX) > eps ||
			Math.abs(this.y - oldY) > eps ||
			Math.abs(this.zoom - oldZoom) > eps
		) {
			this.didUpdate = true;
		}
	}

	//takes mouse position and previous mouse position
	dragged(dMouseX, dMouseY){
		this.dx = dMouseX;
		this.dy = dMouseY;
	}

	inverseZoomLevel(z){
		return log(z);
	}

	zoomLevel(zoom=this.zoom){
		return exp(zoom);
	}

	getCameraWithDimension(d){
		if(d===2){
			return this;
		} else if(d===3){
			return new Camera3D({x: this.x, y:this.y, zoom:this.zoom})
		}
	}
}


class Camera3D extends Camera2D {
    constructor(options = {}) {
        super(options);

        const defaults = {
            rotation: Quaternion.identity(),
            dPanAngle: 0,   // Momentum for horizontal rotation
            dTiltAngle: 0,  // Momentum for vertical rotation
            dragMode: "ROTATE" // "ROTATE" or "PAN"
        };
        Object.assign(this, defaults, options);
    }

	transform(ctx){
		super.transform(ctx);
		this.applyRotationMatrix(ctx);
	}

    // Returns [right, up, forward]
    getFrame() {
        let m = this.rotation.toMatrix();
        
        // A standard rotation matrix transforms the base vectors (1,0,0), (0,1,0), (0,0,1) 
        // into the columns of the matrix. Your toMatrix() returns a row-major array, 
        // so we extract the columns directly using their indices.
        
        // Column 1 is the rotated X-axis (Right)
        let right = createVector(m[0], m[4], m[8]);
        
        // Column 2 is the rotated Y-axis (Up)
        let up = createVector(m[1], m[5], m[9]);
        
        // Column 3 is the rotated Z-axis (Forward)
        let forward = createVector(m[2], m[6], m[10]);

        return [right, up, forward];
    }

    // Call this inside your rendering pipeline instead of rotateX/rotateY
    applyRotationMatrix(graphicsContext) {
        // CRITICAL: A camera transform is the INVERSE of an object transform.
        // If the camera rotates right, the world must mathematically rotate left.
        // The inverse of a normalized quaternion is just its conjugate (negate x, y, z).
        let q = this.rotation;
        let invQ = new Quaternion(q.w, -q.x, -q.y, -q.z);
        
        let m = invQ.toMatrix();

        // p5.js applyMatrix expects values in COLUMN-MAJOR order.
        // Since your toMatrix() outputs a ROW-MAJOR array, we pass the 
        // arguments transposed (by columns) to align with p5.js expectations.
        graphicsContext.applyMatrix(
            m[0], m[4], m[8],  m[12], // Column 1
            m[1], m[5], m[9],  m[13], // Column 2
            m[2], m[6], m[10], m[14], // Column 3
            m[3], m[7], m[11], m[15]  // Column 4
        );
    }

    update() {
        // Reuse 2D translation logic (x, y, dx, dy, zoom)
        let didUpdate2D = super.update();
        let didUpdate3D = false;

        // If we have rotational momentum, apply it
        if (Math.abs(this.dPanAngle) > 0 || Math.abs(this.dTiltAngle) > 0) {
            
            // Get our current local axes
            let [right, up, forward] = this.getFrame();

            // To avoid Gimbal Lock, we rotate around the camera's LOCAL axes.
            // Panning rotates around our local UP vector.
            // Tilting rotates around our local RIGHT vector.
            let qPan = Quaternion.fromAxisAngle(up, this.dPanAngle);
            let qTilt = Quaternion.fromAxisAngle(right, this.dTiltAngle);

            // Combine rotations: NewRot = qTilt * qPan * OldRot
            this.rotation = qTilt.mult(qPan).mult(this.rotation).normalize();
            
            didUpdate3D = true;
        }

        // Decay angular momentum
        this.dPanAngle *= this.drag;
        this.dTiltAngle *= this.drag;

        // Collapse microscopic velocities to zero
        let cutoff = 1e-4;
        if (Math.abs(this.dPanAngle) < cutoff) this.dPanAngle = 0;
        if (Math.abs(this.dTiltAngle) < cutoff) this.dTiltAngle = 0;

        return didUpdate2D || didUpdate3D;
    }

    dragged(dx, dy) {
        let zoom = this.zoomLevel();

        switch (this.dragMode) {
            case "ROTATE":
                let sensitivity = 1.0;
                // Convert mouse pixel drag into rotation angles.
                this.dPanAngle = (-dx * sensitivity) / zoom;
                this.dTiltAngle = (dy * sensitivity) / zoom;
                break;
            
            case "PAN":
                super.dragged(dx, dy);
                break;
        }
    }

	/**
     * Rotates the camera by a given angle around a given 3D axis.
     */
    rotateAroundAxis(axis,angle) {
        if (axis.magSq() === 0) return;
        let k = axis.copy().normalize();

        let qRot = Quaternion.fromAxisAngle(k, angle);
        this.rotation = qRot.mult(this.rotation).normalize();

        // 4. Flag that the camera state changed so the render loop updates
        this.didUpdate = true;
    }

    getCameraWithDimension(d) {
        if (d === 3) {
            return this;
        } else if (d === 2) {
            return new Camera2D({ x: this.x, y: this.y, zoom: this.zoom });
        }
    }
}



class SphereWindow extends GraphicsWindowCamera{
    constructor(options={}){
        super(options);
    }

    updateUniforms(){
        super.updateUniforms();
        let frame = this.camera.getFrame();
        let xBasis = frame[0];
        let yBasis = frame[1];
        let zBasis = frame[2];
        this.uniforms.frame = [ xBasis.x,xBasis.y,xBasis.z,
                                yBasis.x,yBasis.y,yBasis.z,
                                zBasis.x,zBasis.y,zBasis.z,
                            ];
    }

    cameraTransform(){ //only use the 3D camera to keep track of view, not spin.
		let zoom = this.camera.zoomLevel();
		this.g.scale(zoom);
		this.g.translate(this.camera.x / zoom, this.camera.y / zoom)

        for(let s of this.selectors){
            s.setRadius(min(0.1/zoom,0.1));
        }
	}
}