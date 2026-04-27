const FRG = '#E6CFB3'; //background color
const BKG = '#2c2621'; //foreground color

const biranFragSrc = `
precision mediump float;

varying vec2 vTexCoord;

const int MAX_SELECTORS = 32;
#define PI 3.1415926535897932384626433832795
#define MAX_ITERATIONS 80
#define LEARNING_RATE 0.1 

uniform vec2 worldCenter;
uniform vec2 worldSize;
uniform int numSelectors;
uniform vec2 selectorValues[MAX_SELECTORS];
uniform float hbar;
uniform float normalization;

// All components are in the range [0…1], including hue.
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 getDensity(vec2 z){
    float logDensity=0.;
    vec2 gradLogDensity = vec2(0.,0.);
    for(int i = 0;i<MAX_SELECTORS;i++){
        if(i<numSelectors){
            vec2 root = selectorValues[i];
            vec2 delta = z-root;
            float magSqDelta = dot(delta,delta);
            logDensity += log(magSqDelta)- magSqDelta/hbar; 
            gradLogDensity += 2.*delta / magSqDelta - 2.*delta/hbar;
        }
    }
    if(numSelectors==0){
        logDensity = -dot(z,z)/hbar;
    }
    float density =  exp(logDensity)/normalization;

    vec2 gradDensity = gradLogDensity*density; 
    return vec3(density, gradDensity); 
}

vec2 adaptiveGradientDescent(vec2 z_start) {
    vec2 z = z_start; 
    vec3 current_density = getDensity(z_start);
    
    // Start with the initial LEARNING_RATE, which will adapt dynamically
    float lr = LEARNING_RATE; 
    float seedSize=0.03;
    float squareSeedSize = seedSize*seedSize;
    float totalTime = 0.;
    bool doBreak=false;

    for(int iter = 0; iter < MAX_ITERATIONS; iter++) {
        
        // 2. Propose a new position
        vec2 next_z = z - lr * current_density.yz;
    
        // 4. Evaluate the valid proposed step
        vec3 next_density = getDensity(next_z);
        
        if (next_density.x < current_density.x) {
            // SUCCESS: We moved downhill
            
            z = next_z;
            current_density = next_density;

            //check wether to stop
            for(int i = 0;i<MAX_SELECTORS;i++){
                if(i<numSelectors){
                    vec2 delta = z-selectorValues[i];
                    if(dot(delta,delta)<squareSeedSize){
                        doBreak=true;
                    }
                }
            }
            totalTime+=lr;

            if(doBreak){break;}
            
            // Accelerate the learning rate for the next iteration
            lr *= 1.2; 
            lr = clamp(lr,0.,1.);
        } else {
            // FAILURE: We overshot the minimum and went uphill
            // Reject the step, shrink the learning rate drastically, and loop again
            lr *= 0.5;
        }
    }

   if(!doBreak){
        return vec2(100.,-1); //if never converged, return time 1000 and vertex -1
    }

    //at the end of the day, see which point im closest to
    vec2 closestPoint = vec2(100.,-1.);
    
    for(int i = 0;i<MAX_SELECTORS;i++){
            if(i<numSelectors){
                vec2 delta = z-selectorValues[i];
                float magSqDelta = dot(delta,delta);
                if(magSqDelta<closestPoint.x){
                    closestPoint = vec2(magSqDelta,float(i));
                }
            }
        }
    
    
    if(closestPoint.x<squareSeedSize){
        return vec2(totalTime,closestPoint.y);
    } 
    else{
        return vec2(log(closestPoint.x/squareSeedSize)+totalTime,closestPoint.y);
    }
    
}

//takes in a point z, and outputs the time it too to reach a selector, and which selector it hit
vec2 flow(vec2 z){
    float learningRate=0.1;
    float seedSize=0.03;
    float squareSeedSize = seedSize*seedSize;
    float numSteps = 0.;
    bool doBreak=false;
    vec2 minZero = vec2(100.,-1.);
    for(int iter=0; iter < MAX_ITERATIONS; iter++) {
        vec2 grad = getDensity(z).yz;
        z = z-grad*learningRate;
        for(int i = 0;i<MAX_SELECTORS;i++){
            if(i<numSelectors){
                vec2 delta = z-selectorValues[i];
                if(dot(delta,delta)<squareSeedSize){
                    doBreak=true;
                }
            }
        }
        numSteps+=1.;

        if(doBreak){break;}
    }

     if(!doBreak){
        return vec2(100.,-1); //if never converged, return time 1000 and vertex -1
    }

    //at the end of the day, see which point im closest to
    vec2 closestPoint = vec2(-1.,100.);
    
    
    for(int i = 0;i<MAX_SELECTORS;i++){
            if(i<numSelectors){
                vec2 delta = z-selectorValues[i];
                float magSqDelta = dot(delta,delta);
                if(magSqDelta<closestPoint.y){
                    closestPoint = vec2(float(i),magSqDelta);
                }
            }
        }

    
    return vec2(numSteps/float(MAX_ITERATIONS),closestPoint.x);
    
   
}

void main(void)
{ 
    
    // Normalized pixel coordinates (from 0 to 1)
    vec2 z =worldCenter + (vTexCoord - 0.5) * worldSize;
    vec3 densityInfo = getDensity(z);
    float density = densityInfo.x;
    vec2 gradDensity = densityInfo.yz;

    float ld= -log(density);
    float cutoff=1.;
    float levelSpacing=0.3;

    float levelSets=(-10.-ld)*(1.-smoothstep(levelSpacing/10.,levelSpacing/10.+0.01,abs(mod(ld,levelSpacing))));
    float blob = clamp(levelSets+density*30.,0.,1.);
    vec2 flow = adaptiveGradientDescent(z);
    float flowTime = flow.x;
    float flowZero = flow.y;
    vec3 flowColor;
    if(flowZero<0.){
        flowColor = vec3(0.);
    } else {
        flowColor = hsv2rgb(vec3(flowZero/float(numSelectors) , 0.8, 0.7 ) );
    }
    

    float dt = 1./float(MAX_ITERATIONS);
    float basinOutside = (1.-step(0.,1.-flowTime));
    float basinBoundries =  (1.-smoothstep(0.4,0.6,1.-flowTime))-basinOutside;
    vec3 basinInside = flowColor;
    
    (1.-smoothstep(0.4,0.6,1.-flowTime))-basinOutside;
        

    vec3 outputColor = flowColor;
    
    gl_FragColor =  vec4(outputColor,1.);
}
`;

let containerId = "biran-canvas";

let biranWindow;
let windows = [];
let canvasSize;

const defaultUIState = {
	hbar: 1,
};

const uiState = defaultUIState;

function setup() {
    pixelDensity(1);

	let elem = document.getElementById(containerId);
	boundingRect = elem.getBoundingClientRect();

    // get computed border size
    let style = getComputedStyle(elem);
    let borderLeft = parseFloat(style.borderLeftWidth);
    let borderRight = parseFloat(style.borderRightWidth);
    let canvasWidth =  boundingRect.width - borderLeft - borderRight; //sets size of canvas.
    let canvasHeight =  boundingRect.height - borderLeft - borderRight; //sets size of canvas.
    canvasSize = min(canvasHeight,canvasWidth);
	canvas = createCanvas(canvasSize, canvasSize , WEBGL);
	canvas.parent(containerId);


    let selectors = []
    let numSelectors=6;
    let selectorRadius = 0.6;
    for(let i=0;i<numSelectors;i++){
        let theta = 2*PI*i/numSelectors;
        selectors.push(new ComplexDragger(selectorRadius*cos(theta),selectorRadius*sin(theta)))
    }
    
    let camera =  new Camera2D({zoomRange:[0.1,100000]})

	biranWindow = new DraggerWindow({
		pixels: canvasSize,
        x: -1, y: -1, width: 2,
        selectors: selectors,
        camera: camera,
        fragSrc: biranFragSrc,
        drawShader: true,
        uniforms:{
            hbar: 1,
            normalization:1,
        }
	});


	windows = [biranWindow]; 
    setupUI()
}

function setupUI(){
	const hbarSlider = document.getElementById('hbarSlider');

	hbarSlider.value = defaultUIState.hbar;

	hbarSlider.addEventListener('input', () => {
        let val = hbarSlider.value
  		hbarLabel.textContent = nf(val,1);
		uiState.hbar = val;
        biranWindow.uniforms.hbar = val;
	});
    
}









function draw() {
	scale(height / 2, -height / 2, height / 2) //recale to a box [-1,1]times [-1,1]
	background(FRG);

    let hbar = biranWindow.uniforms.hbar;
    let n = biranWindow.uniforms.numSelectors;
    let normalization = computeNormalization(hbar,n);
    biranWindow.uniforms.normalization = normalization
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

function computeNormalization(hbar,n){
    return pow(hbar,n)/(factorial(n)); // last PI*hbar to account for normalization of measure
}


function factorial(n) {
  if (n < 0) return undefined;
  if (n === 0) return 1;

  return n * factorial(n - 1);
}



/////////////////////////
// MOUSE INTERACTION
/////////////////////////


function mouseWheel(event) {
	let didScroll = false;
	for (let w of windows) {
		didScroll = didScroll || w.scroll(event.delta);
	}

	if (didScroll) {
		event.preventDefault();
	}
}

function doubleClicked() {
    for (let w of windows) {
		w.doubleClicked(mouseX, mouseY);
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

function mouseDragged() {
	for (let w of windows) {
		w.dragged(mouseX, mouseY, pmouseX, pmouseY);
	}

}

function keyPressed() {
    if (keyCode === SHIFT) {
		diceWindow.camera.dragMode  =  "PAN";
        diceWindow.multiDragType = "ALL";
    } 
}

function keyReleased() {
    if (keyCode === SHIFT) {
		diceWindow.camera.dragMode  =  "ROTATE";
        diceWindow.multiDragType = "CLOSEST";
    }
    
}


