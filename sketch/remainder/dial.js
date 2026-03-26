

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
        let mx = mouseX;
        let my = mouseY;

        if (touches.length > 0) {
            mx = touches[0].x;
            my = touches[0].y;
        }

        return this.screenToLocal(mx, my);
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
		let didUpdate=false;
		let mouse = this.mouse();
		mouse = createVector(mouse.x, mouse.y)
		for (let s of this.selectors) {
			didUpdate = didUpdate || s.update(mouse);
		}
		return didUpdate;
	}

	render() {
		for (let s of this.selectors) {
			s.draw(this.g);
		}
	}
}

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
        this.rollover =
        dist(this.x,this.y,this.mouse.x,this.mouse.y) < this.selectRadius;
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
    }

    onPressed(){} //modify in lower classes to do extra things when button is pressed

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
}


class Dial extends Selector{
    constructor(options){
        super(options); //contains x,y,radius,selectraidus

        const defaults = { //additional parameters
            angle: 0,
            innerRadius: this.radius/2,
            outerRadius: this.radius,
            arrowLength: this.radius+0.1,
            doArrow: true,
            doPrintMode: false,
            doOutsideLabel: true,
            doInsideLabel: true,
            outerNumber: 35, //number of ticks on the outside
			innerNumber: 5,  //number of ticks on the inside
            activeColor: color(0),
            noColor: color(120),
            neutralColor: color(255),
		};
        this.defaults=defaults;
		Object.assign(this, defaults, options); 
    }

    onPressed(){
        this.startAngle = this.angle;
    }

    // Is mouse over object (stored in the rollover condition)
    over() {
        let d =  dist(this.x,this.y,this.mouse.x,this.mouse.y);
        this.rollover = d < this.outerRadius && d > this.innerRadius ;
    }
    
    onReleased(){
        this.over();
        this.isPressed = false;
    }

    onUpdate(){
        let p1 = createVector(this.x,this.y);
        let angleVector = p1.copy().sub(this.mouse);
        this.angle =
            this.startAngle +
            angleVector.heading() -
            this.offset.heading();
    }
    
    onScroll(delta){
        this.angle += TWO_PI * delta / 3000;
        this.angle = (this.angle + TWO_PI) % TWO_PI
        return true;
    }


    draw(graphics) {
        const ctx = graphics || window;

         

        //turn "spacing" into "multiplier" by computing the inverse mod N
        let outerMultiplier = modularInverse(this.outerSpacing,this.outerNumber);
        let innerMultiplier = modularInverse(this.innerSpacing,this.innerNumber);
       
        let weight=0.01;
        ctx.push();
            ctx.rotate(this.angle);// oveall rotation
        

            let drawColor = this.neutralColor
            if(this.rollover || this.isPressed){
                drawColor = this.activeColor
            }
            ctx.stroke(drawColor)
            ctx.strokeWeight(weight);

            //draw outer circle
            ctx.fill(this.noColor);
            ctx.translate(this.x, this.y);
            ctx.circle(0,0,2*this.outerRadius);

            //draw markings:
            ctx.strokeWeight(weight/2);

            ctx.textAlign(CENTER);
            ctx.rectMode(CENTER)
            
            //outer marking 
            ctx.push();
            let textSize= min(0.2*this.outerRadius,0.5*TWO_PI*this.outerRadius/this.outerNumber);
            textSize = min(textSize,0.1);
            ctx.textSize(textSize);
            let middleRadius= map(0.8,0,1,this.innerRadius,this.outerRadius);
            for(let i=0;i<this.outerNumber; i++){
                ctx.line(0, middleRadius, 0, this.outerRadius);
                if(this.doOutsideLabel){
                    ctx.push();
                        ctx.noStroke();
                        ctx.translate(0,this.outerRadius);
                        ctx.translate(textSize/2,textSize/2);
                        ctx.rotate(-0.2*textSize*TWO_PI);
                        ctx.translate(-textSize/2,-textSize);
                        ctx.scale(1,-1);
                        
                        
                        ctx.fill(drawColor)
                        ctx.text(mod(outerMultiplier*i,this.outerNumber),
                            textSize*0.8,0.5*textSize);
                        
                    ctx.pop();
                }
                ctx.rotate(-TWO_PI/this.outerNumber);
            }
            ctx.pop();


            //inner marking
            ctx.push();
            middleRadius= map(0.2,0,1,this.innerRadius,this.outerRadius);
            textSize= min(0.2*middleRadius,0.5*TWO_PI*middleRadius/this.innerNumber);
            textSize = max(textSize,0.05);
            ctx.textSize(textSize);
            for(let i=0;i<this.innerNumber; i++){
                ctx.line(0, this.innerRadius, 0, middleRadius);
                if(this.doInsideLabel){
                    ctx.push();
                        ctx.noStroke();
                        ctx.translate(0,this.innerRadius);
                        ctx.translate(textSize/2,textSize/2);
                        ctx.rotate(-0.2*textSize*TWO_PI);
                        ctx.translate(-textSize/2,-textSize/2);
                        ctx.scale(1,-1);
                        
                        ctx.fill(drawColor)
                        ctx.text(mod(innerMultiplier*i,this.innerNumber),
                            textSize*0.7,-textSize/3);
                        
                    ctx.pop();
                }
                ctx.rotate(-TWO_PI/this.innerNumber);
            }
            ctx.pop();
        

            //draw arrow
            ctx.strokeWeight(2*weight)
            if(this.doPrintMode || !this.doArrow){
                ctx.line(0,this.innerRadius, 0,this.outerRadius);
            } else {
                let tipLen=0.03;
                ctx.line(0,this.innerRadius, 0,this.arrowLength);
                ctx.line(-tipLen,this.arrowLength-tipLen, 0, this.arrowLength)
                ctx.line(tipLen,this.arrowLength-tipLen,0, this.arrowLength)    
            }
            

            //draw label numbering prime on dial
            middleRadius= map(0.4,0,1,this.innerRadius,this.outerRadius);
            textSize = min(0.3*(this.outerRadius-this.innerRadius),0.5);
            ctx.textSize(textSize);
            ctx.push();
                ctx.rotate(0.02*(TWO_PI)/middleRadius);
                ctx.translate(0,middleRadius);
                ctx.scale(1,-1);
                
                ctx.noStroke();
                ctx.fill(drawColor);
                ctx.text(this.innerNumber,
                    0,0);

                let w = ctx.textWidth(this.innerNumber);
                let h = textSize;
                ctx.stroke(drawColor);
                ctx.strokeWeight(weight/2);
                ctx.noFill();
                ctx.rect(0, -h*0.35, w + .04, h + .04,0.01); // padding

                
            ctx.pop();
            

            ctx.strokeWeight(weight)
            //draw inner circle
            ctx.fill(this.noColor);
            ctx.circle(0,0,2*this.innerRadius);
            
            //draw point at zero
            ctx.fill(this.neutralColor);
            ctx.noStroke();
            ctx.circle(0,0,0.02);

        ctx.pop();

    }
}





