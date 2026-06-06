

//stores the information of position,  mouse interaction. 
class Selector{
    constructor(options){
        const defaults = {
            x: 0,
            y: 0,
			radius: 0.1,
            selectRadius: 0.1
		};

		Object.assign(this, defaults, options); 

        this.rollover = false; // Is the mouse over the object?
        this.isPressed = false; //Did we just click and drag this selector?
        this.scrolling = false;
        this.hidden = false;
    } 

    // Is mouse over object (stored in the rollover condition)
    over() {
        let distance = dist(this.x,this.y,this.mouse.x,this.mouse.y);
        this.rollover = distance < this.selectRadius;
        return distance;
    }

    //returns true if updated
    update(mouse){
        this.mouse = mouse;
        this.over();

        if(this.isPressed){
            this.onUpdate();
            return true;
        }
        return false;
    }

    onUpdate(){ //default behievor is to just move the selector
        this.x = this.mouse.x + this.offset.x;
        this.y = this.mouse.y + this.offset.y;
    }

    pressed() {
        // Did I click on the object?
        if (this.rollover && !this.hidden) {
            this.isPressed = true;
            this.offset = createVector(this.x - this.mouse.x, this.y - this.mouse.y);
            
            this.onPressed();
        }
        return this.isPressed;
    }
    onPressed(){} //modify in lower classes to do extra things when button is pressed

    doubleClicked(){
        // Did I double click on this object
        let didDoubleClick=false;
        if (this.rollover && !this.hidden) {
            didDoubleClick=true;
            this.onDoubleClicked();
        }
        return didDoubleClick
    }

    onDoubleClicked(){} //modify in lower classes to do extra things when button is double clicked

    released(){
        this.onReleased();
        this.isPressed = false;
    }

    onReleased(){} //modify in lower classes to do extra things when button is released

    // scroll hook
    //return true if scroll was recognized, false otherwise
    scroll(delta){
        if(this.rollover && !this.hidden){
            if (delta != 0) {
                this.scrolling=true;
                return this.onScroll(delta);
            } else {
                this.scrolling=false;
            }

            return true;
        }
        return false
    }

    onScroll(delta){}   // subclasses override

    isUpdating(){
        return this.isPressed || this.scrolling
    }

    draw(ctx){ //default draw (modify in lower classes)
        ctx.push();
        ctx.stroke(0);
        ctx.strokeWeight(this.radius);
        ctx.fill(0);
        ctx.circle(this.x,this.y,0.1);
        ctx.pop();
    }

    value(){
        return [this.x,this.y];
    }

    //outupts uniform, to be inputted to shaders.
    getUniform(){
        return this.value();
    }
}

class ComplexSelector extends Selector{
    constructor(options){
        super(options); //contains x,y,radius,selectraidus

        const defaults = { //additional parameters
            enabled: false,
            magnitude: 0.5,
            angle: 0,
            scrollMode: "SCALE", //"scale" or "angle"
            activeColor: color(SECONDARY),
            neutralColor: color(FRG),
            noColor: color(BKG),
            
		};
        this.defaults=defaults;
		Object.assign(this, defaults, options); 

        
        this.justEnabled=false; 
        this.type="COMPLEX"; //just in case i wanna check
    }

    onPressed(){
        if(!this.enabled){
            this.justEnabled = true;
        }

        this.enabled = true;
        this.startAngle = this.angle;
    }
    
    onReleased(){
        this.over();
        if (this.isPressed && this.rollover) {
            if (!this.justEnabled) {
                this.enabled = false; //only turn of if i didnt just enable this controller
            } else {
                //if i just click a point, set it to default value
                this.magnitude = this.defaults.magnitude ;
                this.angle = this.defaults.angle ;
            }
        }
        this.isPressed = false;
        this.justEnabled = false;
    }

    onUpdate(){
        let p1 = createVector(this.x,this.y);
        let angleVector = p1.copy().sub(this.mouse);
        let p2 = this.mouse.copy().add(this.offset);
        this.magnitude =  p1.sub(p2).mag();
        this.constrainMagnitude();

        this.angle =
            this.startAngle +
            angleVector.heading() -
            this.offset.heading();
    }
    
    onScroll(delta){
        if(!this.enabled){
            this.scrolling=false;
            return false;
        }

        
        switch(this.scrollMode){
            case "SCALE":
                this.magnitude += delta / 1000;
                this.constrainMagnitude();
                break;

            case "ANGLE":
                this.angle += TWO_PI * delta / 1000;
                this.angle = (this.angle + TWO_PI) % TWO_PI
                break;
        }
       
        return true;
    }

    constrainMagnitude(){
        this.magnitude=constrain(this.magnitude,0.,0.99)
    }

    //copy parameters from another selector
    copyParameters(selector) {
        this.magnitude = selector.magnitude;
        this.angle = selector.angle;
        this.enabled = selector.enabled;
    }

    draw(graphics) {
        const ctx = graphics || window;

        ctx.push();
        ctx.translate(this.x, this.y);
        ctx.scale(this.radius);

        if (this.hidden) { //if hidden do nothing
            ctx.pop();
            return false;
        }
        if (!this.enabled) { //if not enabled then draw a small dot
            ctx.noStroke();
            ctx.fill(this.noColor);
            ctx.circle(0,0,1);
            ctx.fill(this.neutralColor);
            ctx.circle(0,0,0.3);
            ctx.pop();
            return false;
        }

         let fillColor=this.activeColor;
        if (this.isPressed) {
            fillColor = lerpColor(this.activeColor, this.noColor, 0.3);
        } else if (this.rollover) {
            fillColor = lerpColor(this.activeColor, this.noColor, 0.6)
        }

        let drawRad = sqrt(this.magnitude); //set area proportional to size

        if (this.isPressed || this.rollover) { //small outer ring
            ctx.noStroke();
            ctx.fill(fillColor);
            ctx.circle(0, 0, 1.2);
        }
        //fill in outside circle
        ctx.noStroke();
        ctx.fill(this.noColor);
        ctx.circle(0, 0, 1);

        //fill in inside circle
        ctx.fill(this.activeColor)
        ctx.circle(0, 0, drawRad);

        //draw line from outside to inside circle 
        //line(0,-drawRad/2,0,-1/2);

        //draw rotated line
         ctx.strokeWeight(2);
        ctx.stroke(this.neutralColor)
        ctx.rotate(this.angle+PI/2);
        ctx.line(0, 0, 0, -1 / 2);

        ctx.pop();

    }

    //converts from value stored to real number
    magnitudeToValue(x){ //send [-1,1] to [-infty,infty] in symmetric way
        return tan(x*PI/2);
    }

    getUniform(){
        let v = this.value();
        return [v.x,v.y];
    }

    //return value of selector. In this case a complex number.
    value(){
        if (!this.enabled) {
            return Complex.zero();
        }
        return Complex.polar(this.magnitudeToValue(this.magnitude), this.angle);
    }

    //set selector type. Options are "COMPLEX" and "REAL"
    setSelectorType(type){
        switch(type){
            case "COMPLEX":
                return this;
            case "REAL":
                let real = new RealSelector(this); //send all values over!
                return real;
        }
    }
}

//the only difference is in the way that i display the real selector, and that i output a real number.
class RealSelector extends ComplexSelector{
    constructor(options){
        super(options);
        const defaults = { //additional parameters
            posColor: color(SECONDARY),
            negColor: color(TERTIARY),
        };
        Object.assign(this, defaults, options); 

    }
    draw(graphics) {
        const ctx = graphics || window;
        ctx.push();
        ctx.translate(this.x, this.y);
        ctx.scale(this.radius);
        ctx.noStroke();
        if (this.hidden) {
            return false;
        }
        if (!this.enabled) {
            ctx.fill(this.noColor);
            ctx.circle(0,0,1);
            ctx.fill(this.neutralColor);
            ctx.circle(0,0,0.3);
            ctx.pop();
            return false;
        }
        ctx.fill(this.noColor);
        ctx.circle(0,0,1);
      
        let value = this.value();
        let radius = constrain(abs(value)/2,0,1);
        if(value>=0){
            ctx.fill(this.posColor);
        } else {
            ctx.fill(this.negColor);
        }
        ctx.noStroke();
        ctx.circle(0,0,radius);

        if (this.isPressed || this.rollover) {
            ctx.stroke(this.neutralColor);
            ctx.strokeWeight(2);
            ctx.noFill();
            ctx.circle(0,0,1);
        }
        ctx.pop();
    }

    constrainMagnitude(){
        let limit=0.99;
        this.magnitude=constrain(this.magnitude,-limit,limit)
    }

     onUpdate(){
        let p1 = createVector(this.x,this.y);
        let p2 = this.mouse.copy().add(this.offset);
        this.magnitude =  -p1.sub(p2).y;
        this.constrainMagnitude();
    }
    
    onScroll(delta){
        if(!this.enabled){
            this.scrolling=false;
            return false;
        }

        this.magnitude += delta / 1000;
        this.constrainMagnitude();
        return true;
    }
    
    //return value of selector
    value(){
        if(this.enabled){
            return this.magnitudeToValue(this.magnitude);
        }
        return 0;
       
    }

    //set selector type. Options are "COMPLEX" and "REAL"
    setSelectorType(type){
        switch(type){
            case "REAL":
                return this;
            case "COMPLEX":
                let complex = new ComplexSelector(this);
                complex.magnitude=abs(this.magnitude);
                if(this.magnitude>=0){
                    complex.angle=0;
                } else {
                    complex.angle=PI;
                }
                
                return complex;
        }
    }
}

class ComplexDragger extends Selector {

    constructor(x,y, options = {}) {
        const defaults = {
            x: x,
            y: y,
			radius: 0.1,
            selectRatio: 1,
            drawRatio: 1,
            doConstrain: false,
            xRange: [-1,1],
            yRange: [-1,1],
            isDoubleClicked: false,
            color: "#2C7D15",
            rolloverColor: "#a2e817",
            pressedColor: "#e6ed1c"
		};
        //deduce rollover color and pressed color from color
        if(options.color){
            let c = color(options.color);
            let white = color(255);
            if(!options.rolloverColor){
                options.rolloverColor = lerpColor(c,white,0.1);
            }
            if(!options.pressedColor){
                options.pressedColor = lerpColor(c,white,0.3);
            }
        }
		options=Object.assign({}, defaults, options); 

        super(options);
        this.selectRadius = this.selectRatio*this.radius;
    }

    setRadius(radius){
        this.radius=radius;
        this.selectRadius = this.selectRatio*this.radius;
    }

    // dragging behavior
    onUpdate(){
        if(this.doConstrain){
            this.x = constrain(this.mouse.x + this.offset.x,this.xRange[0],this.xRange[1]);
            this.y = constrain(this.mouse.y + this.offset.y,this.yRange[0],this.yRange[1]);
        } else {
            this.x = this.mouse.x + this.offset.x;
            this.y = this.mouse.y + this.offset.y;
        }
        
    }

    onDoubleClicked(){
        this.isDoubleClicked=true;
    }

    draw(ctx){

        ctx.push();
        ctx.stroke(0);
        ctx.strokeWeight(2);

        if (this.isPressed) {
            ctx.fill(this.pressedColor);
        } 
        else if (this.rollover) {
            ctx.fill(this.rolloverColor);
        } 
        else {
            ctx.fill(this.color);
        }

        ctx.circle(this.x, this.y, this.radius*this.drawRatio);
        ctx.pop();
    }
    
    getUniform(){
        let z = this.value();
        return [z.x,z.y];
    }

    value(){
        return new Complex(this.x, this.y);
    }

}

//select point on 3 sphere
class SphereSelector extends ComplexDragger{
    constructor(options){ //input either complex number or 3-vector
        const defaults = {
                camera: new Camera3D(),
                hidden: false,
                z: null,  //takes Complex
                sphere: null, //takes p5vector length 3
                world: null   //takes p5vector length 2
            };
		options=Object.assign({}, defaults, options); 
        super(0,0,options);

        let didSucceed = true;
        if(this.sphere){
            this.sphere.normalize();
        } else if (this.z){
            this.setComplex(this.z);
        } else if(this.world){
            let didSucceed = this.setWorld(this.world);
            
        }
        if(didSucceed){
            this.update();
        }
        
    }

    

    worldToSphere(world= createVector(this.x,this.y)){
        let sphereHit = 1.-world.magSq();
        if(sphereHit<0){
            return false;
        }
        let [xBasis, yBasis,view] = this.camera.getFrame();
        let sphere = xBasis.mult(world.x)
                    .add(yBasis.mult(world.y))
                    .add(view.mult(sqrt(sphereHit)));
        return sphere;
    }

    setWorld(world= createVector(this.x,this.y)){
        let sphereHit = 1.-(world.x*world.x + world.y*world.y);
        if(sphereHit<0){
            return false;
        }
        let [xBasis, yBasis,view] = this.camera.getFrame();
        let sphere = xBasis.mult(world.x)
                    .add(yBasis.mult(world.y))
                    .add(view.mult(sqrt(sphereHit)));
        this.sphere = sphere;
        return sphere;
    }

    getWorld(){
        let [xBasis, yBasis,view] = this.camera.getFrame();
        return createVector(
                xBasis.dot(this.sphere),
                yBasis.dot(this.sphere),
                view.dot(this.sphere) //include the z coordiante
            )
    }

    setComplex(z){
        let sphere =  createVector(
                2*z.x/(1+z.abs2()),
                2*z.y/(1+z.abs2()),
                1-2/(1+z.abs2())
            );
        this.sphere = sphere;
        return sphere;
    }

    getComplex(){
        let sphere = this.sphere;
        let z = new Complex(sphere.x/(1-sphere.z),sphere.y/(1-sphere.z));
        return z;
    }

    //gets nicely normalized projective coordinates
    getProjective(){
        let z = this.getComplex();
        let norm = z.abs();
        if(norm < 1e-7){
            return  [new Complex(0) , new Complex(1) ]
        }
        let multiplier =  1/sqrt(norm);
        return [new Complex(multiplier) , z.copy().mult(multiplier)]
    }


    update(mouse){
        let world = this.getWorld();
       
        this.x = world.x;
        this.y = world.y;
        this.hidden = world.z<0; 
        
        let didUpdate = false;
        if(mouse){
            didUpdate = super.update(mouse); //changes this.x and this.y cordinates with mouse
            if(this.isPressed){
                sphere = this.setWorld(); //restores new sphere value, if dragged
            }
        }
        return didUpdate;
    }
    
    onUpdate(){
        
        this.x = this.mouse.x + this.offset.x;
        this.y = this.mouse.y + this.offset.y;
        let pos = createVector(this.x,this.y);
        let limitRadius=0.99;
        let sensitivity = 0.1;
        let distance = pos.mag();
        if(distance>limitRadius && this.isPressed){
            let rotationAngle = (distance-limitRadius)*sensitivity;
            pos.normalize().mult(limitRadius); // clamp magnitude to 0
            let forward = this.camera.getFrame()[2];
            let selectorVector = this.worldToSphere(pos);
            this.camera.rotateAroundAxis( selectorVector.cross(forward),-rotationAngle);
        }
        this.x = pos.x;
        this.y = pos.y;
    }

    value(){
        return this.sphere;
    }

    valueComplex(){
        return this.sphereToComplex();
    }

    getUniform(){
        return [this.sphere.x,this.sphere.y,this.sphere.z];
    }

     static defaultUniform(){
        return [0,0,0];
    }

    draw(ctx){
        if(this.hidden){return false;}
        let world = createVector(this.x,this.y);
        ctx.push();

        ctx.translate(world.x,world.y);
        ctx.rotate(world.heading());
        ctx.scale(sqrt(1-world.magSq()),1);
        ctx.stroke(FRG);
        ctx.strokeWeight(3);

        if (this.isPressed) {
            ctx.fill(230, 237, 28);
        } 
        else if (this.rollover) {
            ctx.fill(162, 232, 23);
        } 
        else {
            ctx.fill(44, 125, 21);
        }

        ctx.circle(0,0, this.radius*this.drawRatio);
        ctx.pop();
    }

    
}