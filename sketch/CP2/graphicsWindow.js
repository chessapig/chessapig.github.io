/// a class which holds a p5graphics object and deals with all coordinate transforms. 
//these hold selector objects, whch can be dragged and edited.
// The subcalss GraphicsWindow2DCamera also has a 2D camera for panning around and zooming in and out.



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
			canvasMode: WEBGL
		};

		Object.assign(this, defaults, options);

		this.g = createGraphics(this.pixels, this.pixels, this.canvasMode);
		this.transformCoords()

		this.selectors = [];
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
		for (let s of this.selectors) {
			s.pressed();
		}

	}

	released() {
		for (let s of this.selectors) {
			s.released();
		}
	}

	scroll(delta) {
		let didScroll=false;
		for (let s of this.selectors) {
			didScroll  = didScroll || s.scroll(delta);
		}
		return didScroll;
	}

	dragged(mouseX,mouseY,pmouseX,pmouseY){} //hook for sublcasses.

	update() {
		let mouse = this.mouse();
		mouse = createVector(mouse.x, mouse.y)
		for (let s of this.selectors) {
			s.update(mouse);
		}
	}

	render() {
		for (let s of this.selectors) {
			s.draw(this.g);
		}
	}
}

//graphics window with 2D camera 
class GraphicsWindow2DCamera extends GraphicsWindow{
	constructor(options) {
		//add the defaults to the options BEFORE. calling super
		const defaults = {
			camEnabled: true,
			camera:  new Camera2D()
		};

		options = Object.assign({}, defaults, options);
		super(options);


	}

	//apply camera to new coordinates
	cameraTransform(){
		let zoom = this.camera.zoomLevel();
		this.g.scale(zoom);
		this.g.translate(this.camera.x / zoom, this.camera.y / zoom)
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
		super.update();
		return this.camera.update();
	}

	dragged(mouseX,mouseY,pmouseX,pmouseY){
		let amPressingSelector=false;
		for (let s of this.selectors) {
			amPressingSelector  = amPressingSelector || s.isPressed;
		}
		if(!amPressingSelector && this.camEnabled  && this.mouse().isInside ){
			let mousePos= this.screenToLocal(mouseX,mouseY);
			let pMousePos = this.screenToLocal(pmouseX,pmouseY);
			this.camera.dragged(mousePos.x-pMousePos.x,mousePos.y-pMousePos.y);
		}
	}

	scroll(delta) {
		let didScroll=false;
		let mouse = this.mouse();
		if(mouse.isInside && this.camEnabled && delta != 0){
			this.camera.scroll(delta,mouse);
			didScroll = true;
		}
		didScroll = didScroll || super.scroll(delta);
		return didScroll;
	}
}

class Camera2D {
	constructor() {
		this.x = 0;
		this.dx=0;
		this.y = 0;
		this.dy = 0;
		this.zoom = 0;
		this.dZoom = 0;
		this.drag = 0.9;
	}

	//returns true is camera updated, false otherwise
	update(){
		// detect if anything will change
		let oldX = this.x;
		let oldY = this.y;

		let zoomLevel = this.zoomLevel(this.zoom); // 👈 key line

		// scale movement by zoom
		this.x += this.dx * zoomLevel;
		this.y += this.dy * zoomLevel;

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


	//zooms in centered on mouse.
	scroll(delta, mouse=createVector(0,0)){
		let oldX = this.x;
		let oldY = this.y;
		let oldZoom = this.zoom;

		let zoomLevel =  this.zoomLevel(this.zoom);
		let worldX = (mouse.x - this.x) / zoomLevel;
		let worldY = (mouse.y - this.y) / zoomLevel;

		// apply instantly (no dZoom)
		this.zoom += -delta / 1000;

		let newZoomLevel = this.zoomLevel(this.zoom);

		this.x = mouse.x - worldX * newZoomLevel;
		this.y = mouse.y - worldY * newZoomLevel;

		let eps = 1e-6;
		if( abs(this.x - oldX) > eps ||
			abs(this.y - oldY) > eps ||
			abs(this.zoom - oldZoom) > eps){
				this.didUpdate=true;
			}
	}

	//takes mouse position and previous mouse position
	dragged(dMouseX, dMouseY){
		this.dx = dMouseX;
		this.dy = dMouseY;
	}

	// scroll(delta){
	// 	this.dZoom += -delta/1000;
	// }

	zoomLevel(zoom=this.zoom){
		return exp(zoom);
	}
}


class GraphicsWindow3DCamera extends GraphicsWindow2DCamera {
	constructor(options) {
		const defaults = {
			camEnabled: true,
			camera: new Camera3D()
		};
		options = Object.assign({}, defaults, options);
		super(options);
	}

	cameraTransform() {
		super.cameraTransform();

		// apply rotation (orbit-style)
		this.g.rotateX(this.camera.pitch);
		this.g.rotateY(this.camera.yaw);
	}

	setDragMode(mode){
		this.camera.dragMode = mode;
	}
}

class Camera3D extends Camera2D {
	constructor() {
		super();

		// NEW: rotation (orbit camera)
		this.yaw = 0;     this.dYaw = 0;
		this.pitch = 0;   this.dPitch = 0;

		this.dragMode= "ROTATE" //options: "ROTATE" or "PAN"
	}

	update() {
		// store old state for change detection
		let oldYaw = this.yaw;
		let oldPitch = this.pitch;

		// 👇 reuse ALL 2D logic (x, y, zoom, damping, etc.)
		let didUpdate2D = super.update();

		// rotation
		this.yaw += this.dYaw;
		this.pitch += this.dPitch;

		// decay rotation
		this.dYaw *= this.drag;
		this.dPitch *= this.drag;

		// collapse tiny velocities
		let cutoff = 1e-3;
		if (abs(this.dYaw) + abs(this.dPitch) < cutoff) {
			this.dYaw = 0;
			this.dPitch = 0;
		}

		// detect updates
		let eps = 1e-6;
		let didUpdate3D =
			abs(this.yaw - oldYaw) > eps ||
			abs(this.pitch - oldPitch) > eps;

		return didUpdate2D || didUpdate3D;
	}

	// override: in 3D, dragging rotates instead of translates
	dragged(dx, dy) {
		switch(this.dragMode){
			case "ROTATE":
				let sensitivity = 1.;
				this.dYaw = dx * sensitivity;
				this.dPitch = dy * sensitivity;
				break;
			
			case "PAN":
				this.dx = dx ;
				this.dy = dy ;
		}
	
	}
}