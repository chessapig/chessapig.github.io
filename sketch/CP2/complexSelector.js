



class ComplexSelector {

    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.dragging = false; // Is the object being dragged?
        this.rollover = false; // Is the mouse over the object?
        this.isPressed = false; //Did we just click and drag this selector?
        this.scrolling = false;
        this.scrollMode = "scale"; //"scale" or "angle"
        this.enabled = false;
        this.justEnabled = false;

        this.mouse = createVector(0, 0);
        this.radius = 0.12;
        this.hidden = false;

        this.selectRadius = this.radius * 2;
        this.offset = createVector(0, 0);

        this.magnitude = 0.5;
        this.angle = PI/2;

        this.activeColor = color(SECONDARY);
        this.neutralColor = color(FRG);
        this.noColor = color(BKG);

        this.type="complex"
    }

    //copy parameters from another selector
    copyParameters(selector) {
        this.magnitude = selector.magnitude;
        this.angle = selector.angle;
        this.enabled = selector.enabled;
        this.justEnabled = selector.justEnabled;
    }

    getComplex() {
        if (!this.enabled) {
            return Complex.zero();
        }
        return Complex.polar(pow(20, this.magnitude) - 1, this.angle - HALF_PI);
    }

    // Is mouse over object (stored in the rollover condition)
    over() {
        this.mouse
        if (dist(this.x, this.y, this.mouse.x, this.mouse.y) < this.selectRadius) {
            this.rollover = true;
        } else {
            this.rollover = false;
        }
    }

    //returns true if this selector is currently changing parameters
    isUpdating(){
        return this.isPressed || this.scrolling
    }

    //update the mouse position when i call update...
    //mouse is a p5Vector object
    update(mouse) {
        this.mouse=mouse;
        this.scrolling = false;

        this.over();

        if (this.isPressed) {
            let p1 = createVector(this.x, this.y);
            let angleVector = p1.copy().sub(this.mouse);
            let p2 = this.mouse.copy().add(this.offset);
            p1.sub(p2); //p1 contians difference vector from starting point

            this.angle = this.startAngle + angleVector.heading() - this.offset.heading();
            this.magnitude = p1.mag();
            this.constrainMagnitude();
        }
    }

    draw(graphics) {
        const ctx = graphics || window;

        ctx.push();
        ctx.translate(this.x, this.y);
        ctx.scale(this.radius);

       

        if (this.hidden) {
            return false;
        }
        if (!this.enabled) {
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

      

        let drawRad = sqrt(this.magnitude);

        if (this.dragging || this.rollover) {
            ctx.noStroke();
            ctx.fill(fillColor);
            ctx.circle(0, 0, 1.2);
        }
        //fill in outside circle
        ctx.stroke(this.noColor);
        ctx.strokeWeight(0.08);
        if(ctx._renderer.isP3D){ //IF WEBGLMODE: Change stroke weight
            ctx.strokeWeight(8); 
        }
        ctx.fill(this.noColor);
        ctx.circle(0, 0, 1);

        //fill in inside circle
        ctx.fill(this.activeColor)
        ctx.circle(0, 0, drawRad);

        //draw line from outside to inside circle 
        //line(0,-drawRad/2,0,-1/2);

        //draw rotated line
        ctx.stroke(this.neutralColor)
        ctx.rotate(this.angle);
        ctx.line(0, 0, 0, -1 / 2);

        ctx.pop();

    }

    pressed() {
        // Did I click on the object?
        if (dist(this.x, this.y, this.mouse.x, this.mouse.y) < this.selectRadius && !this.hidden) {
            if (!this.enabled) {
                this.justEnabled = true;
            }
            this.enabled = true;
            this.isPressed = true;
            this.startAngle = this.angle;
            this.offset = createVector(this.x - this.mouse.x, this.y - this.mouse.y);
        }
    }

    released() {
        if (this.isPressed && dist(this.x, this.y, this.mouse.x, this.mouse.y) < this.radius) {
            if (!this.justEnabled) {
                this.enabled = false; //only turn of if i didnt just enable this controller
            } else {
                //if i just click a point, set it to default value
                this.magnitude = 0.5;
                this.angle = PI/2;
            }
        }
        this.isPressed = false;
        this.justEnabled = false;

    }

    scroll(delta) {
        if (this.rollover && this.enabled && !this.hidden) {
            if (delta != 0) {
                if (this.scrollMode == "scale") {
                    this.magnitude += delta / 1000;
                    this.constrainMagnitude();
                } else if (this.scrollMode == "angle") {
                    this.angle += TWO_PI * delta / 1000;
                    this.angle = (this.angle + TWO_PI) % TWO_PI
                }

                this.scrolling = true;
            }
        } else {
            this.scrolling = false;
        }
    }

    constrainMagnitude() {
        this.magnitude = constrain(this.magnitude, 0.0, 0.99);
    }

    toggleSelectorType(){
        let real = new RealSelector(this.x,this.y);
        real.magnitude=this.magnitude;
        real.constrainMagnitude();
        real.enabled=this.enabled;
       
        return real;
    }

}


class RealSelector extends ComplexSelector{
    constructor(x,y){
        super(x,y);
        this.type="real"
        this.negColor= color(PRIMARY);
        this.posColor = color(SECONDARY);
        this.neutralColor = color(FRG);
        this.noColor = color(BKG);
    }

     getComplex() {
        if (!this.enabled) {
            return Complex.zero();
        }
        return new Complex(tan(this.magnitude*PI/2*0.9),0); //output real part
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
      
        if(this.magnitude>=0){
            ctx.fill(this.posColor);
        } else {
            ctx.fill(this.negColor);
        }
        ctx.noStroke();
        ctx.circle(0,0,abs(this.magnitude));

        if (this.isPressed || this.rollover) {
            ctx.stroke(this.neutralColor);
            ctx.strokeWeight(0.1);
            ctx.noFill();
            ctx.circle(0,0,1);
        }
        ctx.pop();
    }

    constrainMagnitude() {
        this.magnitude = constrain(this.magnitude, -1, 1);
    }

    //update the mouse position when i call update...
    //mouse is a p5Vector object
    update(mouse) {
        this.mouse=mouse;
        this.scrolling = false;
        this.over();

        if (this.isPressed) {
            let p1 = createVector(this.x, this.y);
            let p2 = this.mouse.copy().add(this.offset);
            p1.sub(p2); //p1 contians difference vector from starting point

            this.magnitude = -3*p1.y; //set to y coordinate
            this.constrainMagnitude();
        }
    }

     toggleSelectorType(){
        let complex = new ComplexSelector(this.x,this.y);
        complex.magnitude=this.magnitude;
        complex.angle=PI/2;
        complex.enabled=this.enabled;
        return complex;
    }
}


//class to store array of selectors
class SelectorArray {
    constructor(triCoord,degree,{real=false}){
        this.triCoord=triCoord;
        this.degree=degree;
        this.real=real;
        
        this.arr = this.createTriangleArray(triCoord,degree);
        this.generateList()

        this.hidden=false;
        this.doSymmetrize=false;
    }

    draw(graphics){
        for(let s of this.list){
            s.draw(graphics);
        }
    }

    generateList(){
        this.list = []
        for (let list of this.arr) {
            for (let selector of list) {
                 this.list.push(selector);
            }
        }   
    }

    setDegree(degree){
        if(degree==this.degree){
            return //dont do anything if i didnt change the degree.
        }
       

        let newSelectors = [];
        for (let xPow = 0; xPow <= degree; xPow++) {
            let selectorColumn = [];
            for (let yPow = 0; yPow <= degree - xPow; yPow++) {
                let zPow = degree - xPow - yPow
                let position = this.triCoord.barycentricToScreen([xPow, yPow, zPow]);
                if(xPow< this.arr.length && yPow < this.arr[xPow].length){
                    let currentSelector = this.arr[xPow][yPow];
                    currentSelector.x=position.x;
                    currentSelector.y=position.y;
                    selectorColumn[yPow] = currentSelector;
                } else {
                    if(this.real){
                        selectorColumn[yPow] =  new RealSelector(position.x, position.y);
                    } else {
                       selectorColumn[yPow] =  new ComplexSelector(position.x, position.y);
                    }
                    
                }
            } 
            newSelectors[xPow] = selectorColumn;
        }
        newSelectors[degree][0].enabled=true;
        newSelectors[0][degree].enabled=true;
        for(let i=1;i<degree;i++){
            let edges  = [ newSelectors[i][0],newSelectors[0][i] ];
            for(let s of edges){
                if(s.getComplex().equals(Complex.one())){
                    s.enabled=false;
                }
            }
        }
        

        this.degree=degree;
        this.arr = newSelectors;
        this.generateList();
    }

    // options.real for real nodes.
    createTriangleArray(triCoord, degree){
        let selectors = [];
        for (let xPow = 0; xPow <= degree; xPow++) {
            let selectorColumn = [];
            for (let yPow = 0; yPow <= degree - xPow; yPow++) {
                let zPow = degree - xPow - yPow
                let position = triCoord.barycentricToScreen([xPow, yPow, zPow]);
                let newSelector;
                if(this.real){
                    newSelector = new RealSelector(position.x, position.y);
                } else {
                    newSelector = new ComplexSelector(position.x, position.y);
                }
                newSelector.hidden=this.hidden;
                selectorColumn.push(newSelector);
            }
            selectors.push(selectorColumn);
        }
        selectors[0][0].enabled = true;
        selectors[degree][0].enabled = true;
        selectors[0][degree].enabled = true;
        return selectors;  
    }

    //get CP2Curve class from the selector
    curve() {
        return new CP2Curve(this.getCoefs(),this.degree);
    }

    getCoefs(){
        let coefs = [];
        for (let i = 0; i < this.arr.length; i++) {
            let coefColumn = [];
            for (let j = 0; j < this.arr[i].length; j++) {
                coefColumn.push(this.arr[i][j].getComplex());
            }
            coefs.push(coefColumn);
        }
        return coefs;
    }

    symmetrize(){
        for (let xPow = 0; xPow <= this.degree; xPow++) {
            for (let yPow = 0; yPow <= this.degree - xPow; yPow++) {
                let zPow = this.degree - xPow - yPow
                let selector = this.arr[xPow][yPow];
                if (selector.isUpdating()) {
                    //this.arr[yPow][xPow].copyParameters(selector);

                    this.arr[yPow][zPow].copyParameters(selector);
                    //this.arr[zPow][yPow].copyParameters(selector);

                    this.arr[zPow][xPow].copyParameters(selector);
                    //this.arr[xPow][zPow].copyParameters(selector);
                }
            }
        }
    }

    isUpdating(){ //checks if any selectors are updating
        let isUpdating=false;
        for (let s of this.list) {
            isUpdating = isUpdating || s.isUpdating();
        }
        return isUpdating;
    }

    anyRollover(){
        let anyRollover=false;
        for (let s of this.list) {
            let selectorRollover= s.rollover && s.enabled && !s.hidden
            anyRollover = anyRollover || selectorRollover;
        }
        return anyRollover;
    }

    // ------- UI interactions -------
    update(mouse){
        if(this.doSymmetrize){
            this.symmetrize();
        }

        let mouseVect = createVector(mouse.x,mouse.y); //turn mouse into p5Vector object
        for (let s of this.list) {
            s.update(mouseVect);
        }

        
    }

    released(){
        for (let s of this.list) {
            s.released();
        }
    }

    pressed(){
        for (let s of this.list) {
            s.pressed();
        }
    }

    scroll(delta){
        for (let s of this.list) {
            s.scroll(delta);
        }
    }

    setScrollMode(mode){
        for (let s of this.list) {
            s.scrollMode = mode;
        }
    }

    toggleHidden(){
        this.hidden=!this.hidden;
        for (let s of this.list) {
            s.hidden = this.hidden;
        }
    }

    setRealMode(real){
        this.real=real;
        for (let xPow = 0; xPow <= this.degree; xPow++) {
            for (let yPow = 0; yPow <= this.degree - xPow; yPow++) {
                let s = this.arr[xPow][yPow]
                if(s.type=="real" && !this.real) { 
                    s=s.toggleSelectorType();
                } else if (s.type=="complex" && this.real){
                    s=s.toggleSelectorType();
                }
                this.arr[xPow][yPow] =s
            }
        }
        this.generateList();
    }
        


    toggleSelectorType(){
        this.real=!this.real;
        for (let xPow = 0; xPow <= this.degree; xPow++) {
            for (let yPow = 0; yPow <= this.degree - xPow; yPow++) {
                this.arr[xPow][yPow] = this.arr[xPow][yPow].toggleSelectorType();
            }
        }
        this.generateList();
    }
}
