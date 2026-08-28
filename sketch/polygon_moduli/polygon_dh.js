const FRG = '#E6CFB3'; //background color
const BKG = '#2c2621'; //foreground color

let containerId = "canvas-square";
let canvasSize
let windows, renderWindow


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


    let selectors = [];
    let numSelectors=5;
    let integerQuantization = 0.1;
    let doQuantize = false
    for(let i=0;i<numSelectors;i++){
        selectors.push(new IntervalDragger(0.3, {
            integerQuantization: integerQuantization,
            doQuantize: doQuantize
        }))

    }

    renderWindow = new DH_window({
		pixels: canvasSize,
        x: -1, y: -1, width: 2,
        selectors: selectors,
        integerQuantization: integerQuantization,
        doConstrain: true,
        doQuantize: doQuantize
	});

	windows = [renderWindow]; 
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

class IntervalDragger extends ComplexDragger {
    constructor(x, options = {}) {
        const defaults = {
            integerQuantization: 0.1, // Scale of the integer
            doQuantize: false,
        };
        options = Object.assign({}, defaults, options);
        super(x, 0, options);
        
        // Initialize the conceptual value right away
        this.updateValue(x);
    }

    // New helper to handle the math in one place
    updateValue(targetX) {
        if (this.doQuantize) {
            // Stored as a pure integer
            this.value = Math.round(targetX / this.integerQuantization);
            // x is constrained to the grid
            this.x = this.value * this.integerQuantization;
        } else {
            // Stored as continuous raw value
            this.value = targetX;
            this.x = targetX;
        }
    }

    // dragging behavior
    onUpdate() {
        let newX = this.mouse.x + this.offset.x;
        this.updateValue(newX);
    }
}

class DH_window extends DraggerWindow {
    constructor(options = {}) {
        let camera = new Camera2D({
            xRange: [-10, 10],
            yRange: [-0.5, 0.5],
            zoom: -0.1
        });
        const defaults = {
            camera: camera,
            multiDragType: "CLOSEST",
            allowVariableDimensions: false,
            integerQuantization: 0.1, // Scale of the integer
            doQuantize: false,
            fixedPoints: false,
            largestValue: false,
            totalVolume: false
        };
        options = Object.assign({}, defaults, options);
        super(options);
        this.numSticks = this.selectors.length;
    }

    update() {
        this.numSticks = this.selectors.length;
        for (let i = 0; i < this.selectors.length; i++) {
            let s = this.selectors[i];
            // Ensure child draggers respect the parent's mode
            s.doQuantize = this.doQuantize;
            s.integerQuantization = this.integerQuantization;
            s.y = map(i, 0, this.numSticks, -this.numSticks / 10, 0);
        }
        this.getFixedPoints();
        
        return super.update();
    }

    getFixedPoints() {
        let fixedPoints = [];
        for (let n = 0; n < pow(2, this.numSticks); n++) {
            let binary = numberToNary(n, 2, this.numSticks); // string of ones and zeros
            let value = 0;
            
            for (let i = 0; i < this.numSticks; i++) {
                // Because IntervalDragger now manages `.value`, we just use it directly!
                // No need to check if we are quantized here anymore.
                value += (binary[i] * 2 - 1) * abs(this.selectors[i].value);
            }
            fixedPoints[n] = { value: value, binary: binary };
        }
        this.fixedPoints = fixedPoints;
        return fixedPoints;
    }

    render() {
        let ctx = this.g;
     
        ctx.noFill();
        ctx.stroke(FRG);
        ctx.strokeWeight(3);
        ctx.line(-100, 0, 100, 0); 
        
        for (let s of this.selectors) {
            ctx.stroke(lerpColor(s.color, color(255), 0.5));
            ctx.line(s.x, s.y, -s.x, s.y);
        }

        this.plotFixedPoints(ctx);
        this.plotVolumeFunction(ctx);

        super.render();
    }

    plotFixedPoints(ctx) {
        const fixedPoints = this.getFixedPoints();
        const frequencies = new Map();

        // 1. Count how many times each 'value' appears
        let largestValue = -Infinity;
        for (let pt of fixedPoints) {
            // If continuous, rounding groups floats together. 
            // We use toFixed(4) for floats to avoid JS floating point math errors (e.g. 0.1 + 0.2 = 0.300000004)
            let val = this.doQuantize ? Math.round(pt.value) : parseFloat(pt.value.toFixed(4));
            
            frequencies.set(val, (frequencies.get(val) || 0) + 1);
            if (val > largestValue) {
                largestValue = val;
            }
        }
        this.largestValue = largestValue;

        // 2. Draw the lines based on their counts
        const baseLength = 0.1; 
        for (let [val, count] of frequencies.entries()) {
            // If quantized, val is an integer, so multiply by scale to get screen X
            // If continuous, val is already a raw screen coordinate
            let drawX = this.doQuantize ? val * this.integerQuantization : val;
            
            ctx.line(drawX, -baseLength * count, drawX, baseLength * count);
        }

        // Draw monotone indicator
        if (this.doQuantize) {
            ctx.noStroke();
            ctx.fill("#e66a57");
            // Multiply the pure integer calculation by the quantization scale to get the physical coordinate
            let indicatorX = (largestValue - this.selectors.length) * this.integerQuantization;
            ctx.circle(indicatorX, 0, 0.1);
        }
    }

    plotVolumeFunction(ctx) {
        let res = 1000;

        let totalVolume = 1
        for (let i = 0; i < this.selectors.length; i++) {
            let s = this.selectors[i];
            totalVolume*= 2*s.value;
        }

        ctx.noFill();
        ctx.stroke(FRG);
        ctx.beginShape();
        for (let i = 0; i < res; i++) {
            let x = map(i, 0, res, -this.largestValue, this.largestValue);
            let y = this.volumeFunction(x);
            ctx.vertex(x, y);
        }
        ctx.endShape();
    }

    generateSelectorDoubleClick(mousePos) {
        if (abs(mousePos.y) < 0.1) {
            return new IntervalDragger(mousePos.x, {
                doQuantize: this.doQuantize,
                integerQuantization: this.integerQuantization
            });
        }
    }


    volumeFunction(lambda, normalization  =1) {
        let vol = 0;
        for (let pt of this.fixedPoints) {
            if (lambda > pt.value) {
                let sign = (pt.binary.filter(x => x === 0).length % 2) * 2 - 1;     
                vol += sign * pow(abs((lambda - pt.value)), this.numSticks - 1) ;
            }
        }
        return -vol/normalization*pow(-1,this.numSticks);
    }
}

/////////////////////////
// HELPER FUNCTIONS
/////////////////////////

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

