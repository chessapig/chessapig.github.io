const palette = {
        bkg: "#2c2621",
        neutral: "#E6CFB3",
        neutral_rollover: "#e66a57",
        inactive: "#5a5043",
        primary: "rgb(187, 41, 46)",
        primary_rollover: "#000000",
        secondary: "#8b5ed3",
        secondary_rollover: "#c2a8ec",
    }


let containerId = "canvas";
let asset_folder = "assets/research/floer/data/"
let initialData = "data_quadradic.json"
let canvasSize;
let floerCylinderWindow
let windows = [];
let floer;
let orbits = []
let cylinder;

async function preload(){
    floer = await loadJSON(asset_folder+'data.json');

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


    let floerCamera = new Camera2D();


    floerCylinderWindow = new FloerWindow({
        pixels: canvasSize,
        x: -1, y: -1, width: 2,
        camera: floerCamera,
        palette: palette
    });
    loadHamiltonianFromFile(initialData)

    
    windows = [floerCylinderWindow]

}



class FloerWindow extends GraphicsWindowCamera{
    constructor(options={}){
        const default_palette = {
            bkg: "#000000",
            neutral: "#bfbcbc",
            neutral_rollover: "#FFFFFF",
            inactive: "#888888",
            primary: "#aa5555",
            primary_rollover: "#d77c7c",
            secondary: "#55aa55",
            secondary_rollover: "#82dd82",
        }
        const defaults = {
            activeCylinders: [],
            cylinders: [],
            t: 0,
            dt: 0.003,
            palette: default_palette,
            showNonconvergedCylinders: false
		};

		options = Object.assign({}, defaults, options); 
        super(options);
    }

    loadData(floer){
        this.floer = floer
        this.selectors = []
        for( let orbit of floer.orbits){
            let orbit_options = Object.assign({}, orbit, {
                parentWindow: this,
                palette: this.palette
            })
            this.selectors.push(new HamiltonianOrbit(orbit_options))
        }

        this.cylinders=[]
        //store cylinders with their source orbits and with FloerWindow
        for(let cylinder_data of floer.floer_cylinders){
            let cylinder =  new FloerCylinder(cylinder_data);
            this.cylinders.push(cylinder)
            this.getOrbitByID(cylinder.orbits[0]).cylinders.push(
                cylinder
            )
        }
        
        //Set NONE cylinder to be active
        this.activeCylinders=[];
        // for(let cylinder of this.cylinders){
        //     if(cylinder.did_converge()){
        //         this.activeCylinders[0] = cylinder
        //         break;
        //     }
        // }

        //Set the bounds
        setBounds(this.camera, floer.bounds, 0.2);

    }


    getOrbitByID(id){
        for(let orbit of this.selectors){
            if(orbit.id === id){
                return orbit
            }
        }
        return false
    }
        
    update(){
        let didUpdate = super.update();

        for (let s of this.selectors) {
			s.animationTime = this.t
		}
        
        //If no orbits are pressed, remove highlighting
        let pressedSelector = false;
		for (let s of this.selectors) {
            if(s.isPressed){
                pressedSelector = s;
            }
		}
        if(!pressedSelector){
            for (let s of this.selectors) {
                s.highlighted=false;
                s.lowlighted = false;
                
            }
        }
        this.pressedSelector = pressedSelector;
        

        
        let minimizer =  this.closest_orbit_to_mouse();
        if(this.activeCylinders.length>0){
            const cyl = this.activeCylinders[0];
            const orbit1 = this.getOrbitByID(cyl.orbits[0]);
            const orbit2 = this.getOrbitByID(cyl.orbits[1]);
            updateFloerOrbits([ orbit1 , orbit2 ]);
            orbit1.lowlighted = true;
            orbit2.highlighted = true;
        }
        else if(pressedSelector){
            if(minimizer.highlighted){
                updateFloerOrbits([pressedSelector, minimizer])
            } else {
                updateFloerOrbits([pressedSelector, false])
            }
        } else {
            if(minimizer){
                updateFloerOrbits([minimizer, false ])
            } else {
                updateFloerOrbits([ false , false ])
            }
        }

        if(this.activeCylinders.length>0){
            let cyl = this.activeCylinders[0];
            updateFloerDetails(`Maximum Error: ${cyl.max_loss.toPrecision(3)}  <br> Average Error: ${cyl.avg_loss.toPrecision(3)}   `)
        } else {
            updateFloerDetails(false)
        }
        
            
        this.t = this.t+this.dt
        return didUpdate
    }

    render(){


        let doDrawFloerCylinder = this.activeCylinders.length>=1;
        for(let o of this.selectors){
            o.active=!doDrawFloerCylinder;
        }

        for(let cylinder of this.activeCylinders){
            let sorceOrbit = this.getOrbitByID(cylinder.orbits[0]);
            let targetOrbit = this.getOrbitByID(cylinder.orbits[1]);
            sorceOrbit.active=true;
            targetOrbit.active = true;
        }

        super.render(); //handles rendering the orbits, since they are selectors

        let ctx = this.g;
        ctx.noFill();
        ctx.stroke(this.palette.neutral);
        ctx.strokeWeight(3);
        
        for(let c of this.activeCylinders){
            c.drawSlices(ctx,frameCount/60, {palette: this.palette})
        }

    }

    //computes closest selectable orbit to mosue
    closest_orbit_to_mouse(){
        let minimalDistance = Infinity
        let minimizer = false
        for(let orbit of this.selectors){
            let distance = orbit.over();
            if(distance<minimalDistance){
                minimizer = orbit;
                minimalDistance = distance;
            }

        }

        if(minimalDistance<minimizer.selectRadius){
            return minimizer
        }
        return false
    }
}


class HamiltonianOrbit extends Selector{
    constructor(data){
        const defaults = {
            selectRadius: 0.2,
            cylinders: [],
            highlighted: false,
            lowlighted: false, //Highlighting the other color
            parentWindow: false,
            discrete_path: false,
            path_resolution: 100,
            startArrow: [0,0],
            arrowVelocity: 0.25,
            animationTime: 0,
            active: true,
            palette: {}
		};

		let options = Object.assign({}, defaults, data); 
        super(options)

        this.generateDiscretePath(this.path_resolution)
    }

    //Evaluate a point on the orbit from the fourier series 
    // t is between 0 and 2 pi
    eval(t, tolerance=0.001){
        let pos = [0,0] //Encode position as an array (not vector to make this faster)
        let path = this.path
        for(let i = 0; i<=2*path.max_freq; i++){
            if(abs(path.real[i]) < tolerance && abs(path.imag[i]) < tolerance){
                continue;
            }

            let k = i - path.max_freq;
            let cos_k = cos(k*t);
            let sin_k = sin(k*t);
            pos[0] += path.real[i]*cos_k - path.imag[i]*sin_k;
            pos[1] += path.imag[i]*cos_k + path.real[i]*sin_k;
        }
        return pos
    }

    generateDiscretePath(res = 100){
         this.discrete_path = new Array(res) 
        if(this.multiplicity>0){
            let maxT = 2*PI/this.multiplicity
           
            for(let i = 0; i< res; i++){
                let t = map(i,0,res,0,maxT);
                this.discrete_path[i] = this.eval(t);
            }
        } else {
            let pt =  this.eval(0)
            for(let i = 0; i< res; i++){
                this.discrete_path[i] = pt;
            }
        }
    }

    getCylinders(){
        if (this.parentWindow.showNonconvergedCylinders){
            return this.cylinders
        } else {
            let convergedCylinders = []
            for(let cyl of this.cylinders){
                if(cyl.did_converge()){
                    convergedCylinders.push(cyl)
                }
            }

            return convergedCylinders
        }
    }

    over() {
        const constraint_data = this.constrainToOrbit([this.mouse.x,this.mouse.y])
        const distSq = constraint_data[1];
        this.rollover = (distSq < pow(this.selectRadius,2));
        
        return sqrt(distSq);
    }

    onPressed(){
        super.onPressed();

        //highlight the target of all cylinders
        for(let cylinder of this.getCylinders() ){
            let targetOrbit = this.parentWindow.getOrbitByID(cylinder.orbits[1]) 
            targetOrbit.highlighted = true;
        }

        this.startArrow = [this.mouse.x,this.mouse.y]
    }

    onReleased(){
        //check if i release over a highlighted orbit. If so, add active j curve
        //Otherwise, unhighlight all orbits and return to default. 
        let minimizer = this.parentWindow.closest_orbit_to_mouse();

        //if we ever find an highlighted orbit which is close to the mouse
        //add the associated cylinder to the list of active
        if(minimizer && this.isPressed){
            for(let cylinder of this.getCylinders()){
                if(cylinder.orbits[1] === minimizer.id){
                    this.parentWindow.activeCylinders = [cylinder];
                    break;
                }
            }
        } 

        if(this.over() && !minimizer.highlighted && this.isPressed){
            this.parentWindow.activeCylinders = [];
        }
    }

    update(mouse){
        if(this.isPressed){
            const t = this.arrowVelocity;
            const constrainStartPoint = [(1-t)*this.startArrow[0] + t*this.mouse.x, (1-t)*this.startArrow[1] + t*this.mouse.y]
            const constraint_data = this.constrainToOrbit(constrainStartPoint);
            this.startArrow = constraint_data[0];
        }
        return super.update(mouse);
    }
    
    draw(ctx){

        ctx.noFill()
        ctx.strokeWeight(3)
        let orbitColor = color(255);
        this.drawPoints = true
        if(this.isPressed || this.lowlighted){
            orbitColor = this.palette.primary
        } else if (this.highlighted){
            if(this.rollover){
                orbitColor = this.palette.secondary_rollover
            } else {
                orbitColor = this.palette.secondary
            }
        } else if(this.active){
            orbitColor = this.palette.neutral
            
            if (this.rollover){
                orbitColor = this.palette.neutral_rollover
            }
            if(this.parentWindow.pressedSelector){
                
                this.drawPoints=false
            }
        } else if (!this.active){
            orbitColor = this.palette.inactive
            this.drawPoints = false
        }

        
        

        //draw orbit
        this.drawOrbit(ctx, {color: orbitColor})
    
        //Draw arrow
        if(this.isPressed){
            ctx.stroke(palette.neutral)
            this.drawArrow(ctx,this.startArrow[0],this.startArrow[1],this.mouse.x,this.mouse.y);
        }
    }

    drawOrbit(ctx, options={}){
        ctx.push();
        ctx.stroke(options.color);
        if(this.multiplicity>0){
            
            ctx.beginShape()
            for(let i = 0; i<this.path_resolution; i++){
                let eval_point = this.discrete_path[i]
                ctx.vertex(eval_point[0],eval_point[1])
            }
            ctx.endShape(CLOSE)

            if(this.drawPoints){
                let bounds = this.parentWindow.floer.bounds;
                let zoom = (bounds[1]-bounds[0])/8;
                drawDotsAlongCurve(ctx,this.animationTime,(t) => this.eval(t), {
                    numDots: 30*this.multiplicity,
                    dotRadius: 0.2*zoom,
                    dotRotationVelocity:0.3,
                    color: options.color
                })
            }

        } else {
            let eval_point = this.eval(0)
            ctx.circle(eval_point[0],eval_point[1],0.05)
        }
        ctx.pop();
    }

    drawArrow(ctx, startX,startY, endX, endY, steps = 20){
        ctx.push();
        let length = dist(startX,startY,endX,endY)
        let maxWeight = 5;
        let minWeight = map(constrain(map(length,0,4,0,1),0,1),0,1,5,1);
        for(let i = 0; i < steps; i++){
            let x0 = map(i,0,steps,startX,endX);
            let y0 = map(i,0,steps,startY,endY);

            let x1 = map(i+1,0,steps,startX,endX);
            let y1 = map(i+1,0,steps,startY,endY);

            let weight =  map(i,0,steps,minWeight,maxWeight)
            ctx.strokeWeight(weight);

            ctx.line(x0,y0,x1,y1)
        }
        ctx.pop();
    }

    //finds the closest point on the orbit to a given point
    constrainToOrbit(pt){

        let minDistSq = Infinity;
        let closestPt =  this.discrete_path[0];
        for(let i = 0; i<this.path_resolution; i++){
            let constraint_data = constrainToSegment(pt,
                this.discrete_path[i%this.path_resolution],
                this.discrete_path[(i+1)%this.path_resolution]);
            if(constraint_data[1]<minDistSq){
                minDistSq = constraint_data[1];
                closestPt = constraint_data[0];
            }
            if(this.multiplicity==0){
                break;
            }
        }
        
        return [closestPt,minDistSq]
    }

    displayIndex(){
        if (this.index[0] === this.index[1]) {
            return `${this.index[0]}`;
        } else {
            if (abs(this.index[0]) <= abs(this.index[1])){
                return `${this.index[0]} or ${this.index[1]}`;
            } else {
                return `${this.index[1]} or ${this.index[0]}`;
            }
            
        }
    }
}


class FloerCylinder{
    constructor(data){
        Object.assign(this, data);
    }

    //Evaluate a point on the floer from the chebyshef-fourier series 
    // t in [0,2 pi]
    // s in [-infty,infty]
    eval(s,t, tolerance=0.01){
        let pos = [0,0]  
        let curve = this.curve
        
        let sigma = (2.0 / PI) * atan(s);

        let s_modes = curve.real.length;
        let t_modes = curve.real[0].length;
        //OUTER part of curve.real is s parameters, INNNER is t 
        for(let id_s = 0; id_s<s_modes; id_s++){
            let k_s = id_s;
            // chebyshev = cos(k_s*arccos(sigma))
            let chebyshev = evalChebyshev(sigma,k_s)
            for(let id_t = 0; id_t<t_modes; id_t++){
                let coef_real = curve.real[id_s][id_t]
                let coef_imag = curve.imag[id_s][id_t]
                
                if(abs(coef_real) < tolerance && abs(coef_imag) < tolerance){
                    continue;
                }

                let k_t = id_t - floor((t_modes)/2); // move to centered fourier modes
                let cos_k = cos(k_t*t);
                let sin_k = sin(k_t*t);
                
               

                pos[0] += (coef_real*cos_k - coef_imag*sin_k)*chebyshev;
                pos[1] += (coef_imag*cos_k + coef_real*sin_k)*chebyshev;
            }
        }
        return pos
    }
    
    drawSlices(ctx, time, options = {}){
        const defaults = {
			spacing: 3,
            numSlices: 3,
            resolution: 200,
            numDots: 10,
            dotRadius: 0.2,
            dotRotationVelocity: 0.05,
            palette: {}
        };
        const opt = Object.assign({}, defaults, options);

        const startingTime = fract(time/opt.spacing)*opt.spacing
        const slices = [];
        for(let i=0; i<opt.numSlices; i++){
            slices[i] = startingTime + opt.spacing*i - opt.spacing*floor(opt.numSlices/2);
        }

        
        for(let s of slices){
            const sigma_visual =atan(s)/PI+0.5;
            const depth = constrain(4*sigma_visual*(1-sigma_visual)-0.05,0,1)
            const col = lerpColor(opt.palette.primary,opt.palette.secondary,sigma_visual)
            //col.setAlpha(sqrt(depth)*255)

            ctx.stroke(col);
            ctx.strokeWeight(depth*5);
            ctx.noFill();
            ctx.beginShape();
            let eval_pos = this.eval(s,0)
            for(let i=0;i<opt.resolution+3;i++){
                const t = (i/opt.resolution+time)%1 * TWO_PI;
                eval_pos = this.eval(s,t)
                ctx.vertex(eval_pos[0],eval_pos[1]);
            }
            ctx.endShape();

            // ctx.noStroke();
            // ctx.fill(col,depth*255);
            // drawDotsAlongCurve(ctx,time,(t) => this.eval(s,t), {
            //     numDots: opt.numDots,
            //     dotRadius: opt.dotRadius*max((1-1.5*depth),0),
            //     dotRotationVelocity:  opt.dotRotationVelocity,
            //     color: col
            // })
        }
    }

    did_converge(){
        return this.max_loss<0.5
    }
}

//curve is function take takes in number in [0,2 pi] and returns a point on plane
function drawDotsAlongCurve(ctx,animationTime, curve, options={}){
    const defaults = {
        numDots: 10,
        dotRadius: 0.2,
        dotRotationVelocity: 0.05,
        color: "#FFFFFF"
    };

    const opt = Object.assign({}, defaults, options); 

    ctx.push();
    ctx.fill(opt.color)
    ctx.noStroke();
    
    for(let i=0;i<opt.numDots;i++){
        const t = (i/opt.numDots + opt.dotRotationVelocity*animationTime)%1 * TWO_PI;
        const eval_pos = curve(t)
        ctx.circle(eval_pos[0],eval_pos[1],opt.dotRadius)
    }
    ctx.pop();
}



/////////////////////////
// Mathematical helpers
/////////////////////////

//Computes T_k(x) = cos(k arccos(x)), the chebyshev polynomial
//uses recursive formula to be faster and more numericaly stable. (Rodrigues formula)
function evalChebyshev(x, k) {
  //  Base cases
  if (k === 0) return 1.0;
  if (k === 1) return x;

  //  Fast recurrence for ks >= 2
  let t0 = 1.0;
  let t1 = x;
  let cheb = 0.0;

  for (let i = 2; i <= k; i++) {
    cheb = 2.0 * x * t1 - t0;
    t0 = t1;
    t1 = cheb;
  }

  return cheb;
}

//See https://www.shadertoy.com/view/3tdSDj
//input is 3 lists [float, float]. point is p, line segment goes between a and b
//output is vector in first place of tuple, and distance in second place
function constrainToSegment(p,a,b){
    // ba = b - a
    const ba_x = b[0] - a[0];
    const ba_y = b[1] - a[1];

    // pa = p - a
    const pa_x = p[0] - a[0];
    const pa_y = p[1] - a[1];

    // dot(pa, ba) and dot(ba, ba)
    const dot_pa_ba = pa_x * ba_x + pa_y * ba_y;
    const dot_ba_ba = ba_x * ba_x + ba_y * ba_y;

    //handle the case where a=b
    //then pa is the displacement
    if(dot_ba_ba<1e-6){
        return [a, pa_x * pa_x + pa_y * pa_y]
    }

    // clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)
    // Handle division by zero if start and end points are identical (dot_ba_ba === 0)
    const h = constrain(dot_pa_ba/dot_ba_ba,0,1)
    
    // pa - h * ba
    const dx = pa_x - h * ba_x;
    const dy = pa_y - h * ba_y;

    // Return the coordinate a + h * ba
    const closestPt =  [a[0] + h * ba_x, a[1] + h * ba_y];
    const distSq = dx*dx+dy*dy;
    
    return [closestPt,distSq];
}


function draw() {
	scale(height / 2, -height / 2, height / 2) //recale to a box [-1,1]times [-1,1]
	background(palette.bkg);



	for (let w of windows) {
        w.clear();
		w.update();
		w.render();
		w.draw();
	}
}

/////////////////////////
// INTERFACING WITH HTML
/////////////////////////

function updateHamiltonianLatex(latexString) {
  const displayContainer = document.getElementById('hamiltonianLatexDisplay');

  if (window.katex) {
    katex.render(latexString, displayContainer, {
      displayMode: true, // Renders as standalone block math ($$...$$)
      throwOnError: false
    });
  }
}

// This.value is the string of the file contianing the json.
async function loadHamiltonianFromFile(filename){
    const response = await fetch(asset_folder + filename);
    const newFloerData = await response.json();

    updateHamiltonianLatex(newFloerData.hamiltonian)
    floerCylinderWindow.loadData(newFloerData)
}

/**
 * Updates the table entries with a tuple of strings [startOrbit, endOrbit]
 * @param {[HamiltonianOrbit, HamiltonianOrbit]} orbitTuple 
 */
function updateFloerOrbits(orbitTuple) {
  const [startOrbit, endOrbit] = orbitTuple;

  const startCell = document.getElementById('startOrbitCell');
  const endCell = document.getElementById('endOrbitCell');

  if (startOrbit) {
    startCell.textContent = startOrbit.displayIndex();
  } else {
    startCell.textContent = " \u00A0"
  }

  if (endOrbit) {
    endCell.textContent = endOrbit.displayIndex();
  } else {
    endCell.textContent = " \u00A0"
  }
}

/**
 * Updates the container div below the table
 * @param {string} content - HTML or plain text string
 */
function updateFloerDetails(content) {
     const container = document.getElementById('floerDetailsText');
    if(content){
        container.innerHTML = content;
        container.classList.remove('text-muted');
    } else {
        container.classList.add('text-muted');
        container.innerHTML = "Select a Floer cylinder"
    }

}

function toggleNonConverging(isChecked) {
 floerCylinderWindow.showNonconvergedCylinders  = isChecked
}

/////////////////////////
// MOUSE INTERACTION
/////////////////////////

function setBounds(camera,bounds, margin=0){
    camera.x = (bounds[0]+bounds[1])/2;
    camera.y = (bounds[2]+bounds[3])/2;
    camera.xRange = [ bounds[0],bounds[1]];
    camera.yRange = [ bounds[2],bounds[3]];

    camera.zoom = Camera2D.inverseZoomLevel(2/(bounds[1]-bounds[0] + 2*margin))

}

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


