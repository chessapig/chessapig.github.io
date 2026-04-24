const FRG = '#E6CFB3'; //background color
const BKG = '#2c2621'; //foreground color


const diceVertSrc = `#version 300 es

in vec3 aPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

#define MAX_SELECTORS 32

uniform vec4 selectorValues[MAX_SELECTORS];
uniform int numSelectors;
uniform float u_roundness;
uniform bool u_doPolar;

out vec3 vWorldPosition;
out float vRadius;
out vec3 vNormal;

// Optimization parameters
#define MAX_ITERATIONS 20
#define LEARNING_RATE 0.1
#define EPSILON 0.0001

vec3[3] getFrame(vec3 n_hat) {
    vec3[3] basis;

    vec3 x_basis = vec3(1.,0.,0.);
    vec3 y_basis  = normalize(cross(n_hat, x_basis));
    x_basis  = normalize(cross(n_hat, y_basis));

    basis[0] = x_basis;
    basis[1] = y_basis;
    basis[2] = n_hat; // already unit

    return basis;
}

//Computes the sterographic projection from the negative of n_hat. n_hat gets sent to zero.
vec2 sphereToComplex(vec3 pos, vec3 n_hat){
    vec3[3] basis = getFrame(-n_hat);
    vec3 x_basis = basis[0];
    vec3 y_basis = basis[1];
    vec3 z_basis = basis[2];

    vec3 sphere = vec3 (
        dot(pos,x_basis),
        dot(pos, y_basis),
        dot(pos, z_basis)
        );
    
    vec2 complex = vec2(
        sphere.x/(1.-sphere.z),
        sphere.y/(1.-sphere.z)
        );

    return complex;
}

vec3 complexToSphere(vec2 z, vec3 n_hat){
    // Build same frame used in projection
    vec3[3] basis = getFrame(-n_hat);
    vec3 x_basis = basis[0];
    vec3 y_basis = basis[1];
    vec3 z_basis = basis[2]; // = -n_hat

    float r2 = dot(z, z);
    float denom = 1.0 + r2;

    // Local sphere coordinates
    vec3 sphere = vec3(
        2.0 * z.x / denom,
        2.0 * z.y / denom,
        (r2 - 1.0) / denom
    );

    // Map back to world coordinates
    return sphere.x * x_basis +
           sphere.y * y_basis +
           sphere.z * z_basis;
}

float objective(vec2 z, vec3 n_hat){
    float dist_prod=1.;
    float normSq = dot(z,z);
    for(int k = 0; k < MAX_SELECTORS; k++) {
        if(k >= numSelectors) break;
        vec2 root = sphereToComplex(selectorValues[k].xyz,n_hat);
        float weight = selectorValues[k].w;

        float distSq = pow(distance(z, root),2.);
        dist_prod *= pow(distSq, weight)/((1.+normSq)*(1.+dot(root,root)))*2.;
    }
    float interpolatedValue = ((1.-u_roundness)*(dist_prod+1.)+u_roundness);
    return interpolatedValue  * (1.+normSq) / (1. -normSq  );
}

// apply the adaptive gradient descent algorithm
// .xy coordinates contain z, .z coordinate contains maximum
vec3 minimize(vec2 z_start, vec3 n_hat) {
    vec2 z = z_start; 
    float current_val = objective(z, n_hat);
    
    // Start with the initial LEARNING_RATE, which will adapt dynamically
    float lr = LEARNING_RATE; 
    vec2 grad;
    
    // Flag to avoid recalculating the gradient if our previous step was rejected
    bool compute_grad = true;

    for(int iter = 0; iter < MAX_ITERATIONS; iter++) {
        
        // 1. Calculate gradient only if we accepted the previous step
        if (compute_grad) {
            vec2 dx = vec2(EPSILON, 0.0);
            vec2 dy = vec2(0.0, EPSILON);
            grad.x = (objective(z + dx, n_hat) - objective(z - dx, n_hat)) / (2.0 * EPSILON);
            grad.y = (objective(z + dy, n_hat) - objective(z - dy, n_hat)) / (2.0 * EPSILON);
            compute_grad = false;
        }

        // 2. Propose a new position
        vec2 next_z = z - lr * grad;
        
        // 3. BOUNDARY GUARD
        // The objective diverges at |z| == 1.0. 
        // If the step throws us out of bounds, reject it immediately and shrink the step size.
        if (dot(next_z, next_z) >= 0.999) {
            lr *= 0.5;
            continue; 
        }
        
        // 4. Evaluate the valid proposed step
        float next_val = objective(next_z, n_hat);
        
        if (next_val < current_val) {
            // SUCCESS: We moved downhill
            
            // Early stopping if the improvement is microscopically small
            if (current_val - next_val < 0.000001) {
                z = next_z;
                current_val = next_val;
                break; 
            }
            
            // Accept the step
            z = next_z;
            current_val = next_val;
            
            // Accelerate the learning rate for the next iteration
            lr *= 1.2; 
            
            // Flag to compute a fresh gradient at this new position
            compute_grad = true; 
            
        } else {
            // FAILURE: We overshot the minimum and went uphill
            // Reject the step, shrink the learning rate drastically, and loop again
            lr *= 0.5;
        }
    }
    
    return vec3(z, current_val);
}

void main() {
    vec3 position = aPosition;
    vec3 n_hat = normalize(position);
    
    // Start gradient descent at zero nearest to n_hat
    vec2 z_start;
    float minDistance = 1000.;
    for(int k = 0; k < MAX_SELECTORS; k++) {
        vec2 root = sphereToComplex(selectorValues[k].xyz,n_hat);
        float distance = length(root);
        if(distance < minDistance){
            minDistance = distance;
            z_start = root;
        }
    } 
    if(minDistance>=1.){
        z_start = vec2(0.,0.);
    }

    if(u_doPolar){
        vec3 min = minimize(z_start, n_hat);
        vNormal = complexToSphere(min.xy,n_hat);
        vRadius = min.z;
    } else {
        vRadius = objective(vec2(0.,0.), n_hat);
        vNormal = n_hat;
    }
    vec3 newPosition = n_hat*vRadius; 
    
    vWorldPosition = (uModelViewMatrix * vec4(newPosition, 1.0)).xyz;
    
    gl_Position = uProjectionMatrix * vec4(vWorldPosition, 1.0);
    
}
`

const diceFragSrc = `#version 300 es
precision highp float;

// Inputs from the vertex shader
in vec3 vWorldPosition;
in float vRadius;
in vec3 vNormal;

// Output to the screen
out vec4 fragColor;

uniform mat4 uModelViewMatrix;




void main() {
    vec3 normal = normalize(vNormal);

    vec3 worldLightPos = vec3(-1.0, 1.0, 1.0);
    vec3 lightDir = normalize(inverse(mat3(uModelViewMatrix)) * worldLightPos);
    
    // Ambient light so the shadowed sides aren't pitch black
    float ambient = 0.1;
    
    // Diffuse lighting (Lambertian)
    // max(0.0, ...) ensures we don't get negative light on the dark side
    float diffuse = max(dot(normal, lightDir), 0.0);

    //specular lighting
    float gloss = 20.;
    vec3 halfway = normalize(normal+lightDir);
    float specular = pow(max(dot(halfway, lightDir), 0.0), gloss);
    
    // 3. Define the Material Color
    // A standard ivory/white dice color
    vec3 baseColor = vec3(0.9, 0.85, 0.8); 
    
    // (Optional) Color mapping based on the radius
    // This maps smaller radii (the stable flat faces) to one color and peaks to another,
    // which can be helpful for debugging the depth of your minimization!
    // baseColor = mix(vec3(0.2, 0.5, 0.9), vec3(0.9, 0.2, 0.2), (vRadius ));

  
    float rateOfChange = length(fwidth(normal));
    float edgeIntensity = clamp(rateOfChange * 10.0, 0.0, 1.0);
    vec3 edgeColor = vec3(0.9,0.1,0.1);

    // 4. Combine and output
    vec3 finalColor = baseColor * (ambient + diffuse * 0.8 + specular*0.3) + edgeColor*edgeIntensity;

    fragColor = vec4(finalColor, 1.0);
}
`

let containerId = "dice-canvas";

let diceWindow;
let windows = [];
let canvasSize;

const defaultUIState = {
	u_doPolar: true,
	u_roundness: 0.5,
};

const uiState = defaultUIState;

function setup() {
   
	let elem = document.getElementById(containerId);
    console.log(elem);
	boundingRect = elem.getBoundingClientRect();

    // // get computed border size
    let style = getComputedStyle(elem);
    let borderLeft = parseFloat(style.borderLeftWidth);
    let borderRight = parseFloat(style.borderRightWidth);
    let canvasWidth =  boundingRect.width - borderLeft - borderRight; //sets size of canvas.
    let canvasHeight =  boundingRect.height - borderLeft - borderRight; //sets size of canvas.
    canvasSize = min(canvasHeight,canvasWidth);
	canvas = createCanvas(canvasSize, canvasSize , WEBGL);
	//canvas.parent("dice-canvas");

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
        zoomRange:[0.01,20]
    });

    let selectors = []
    let numSelectors=6;
    let selectorRadius = 1;
    let options = { 
        camera: camera , 
        logRange: [-1,1]
    }
    selectors[0] = new WeightedSphereSelectors(createVector(1,0,0),options);
    selectors[1] = new WeightedSphereSelectors(createVector(-1,0,0),options);
    selectors[2] = new WeightedSphereSelectors(createVector(0,1,0),options)
    selectors[3] = new WeightedSphereSelectors(createVector(0,-1,0),options)
    selectors[4] = new WeightedSphereSelectors(createVector(0,0.1,0.9999999),options)
    selectors[5] = new WeightedSphereSelectors(createVector(0,0.0001,-1),options)

    console.log(selectors.map(s => s.z.display()));


	diceWindow = new DiceWindow({
		pixels: canvasSize,
        x: -1, y: -1, width: 2,
        selectors: selectors,
        camera: camera,
        vertSrc: diceVertSrc,
        fragSrc: diceFragSrc,
        uniforms:{
            u_roundness: defaultUIState.u_roundness,
            u_doPolar: defaultUIState.u_doPolar,
        },
        sphereResolution: 300,
	});


	windows = [diceWindow]; 
    setupUI()
}

function setupUI(){
	const doPolar = document.getElementById('doPolarBox');
	const roundnessSlider = document.getElementById('roundnessSlider');

	doPolar.checked = defaultUIState.u_doPolar;
	roundnessSlider.value = defaultUIState.u_roundness;

	// Update state when controls change
	doPolar.addEventListener('change', () => {
		uiState.u_doPolar = doPolar.checked;
        diceWindow.uniforms.u_doPolar = uiState.u_doPolar;
	});

	roundnessSlider.addEventListener('input', () => {
        let val = roundnessSlider.value
  		roundnessLabel.textContent = nf(val,1);
		uiState.u_roundness = val;
        diceWindow.uniforms.u_roundness = val;
	});
    
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

class DiceWindow extends SphereWindow{
    constructor(options={}){
        const defaults = {
            sphereResolution: 100,
            drawShader: true,
            defaultSelectorValueUniform: [0,0,0,0],
		};
        options = Object.assign({}, defaults, options);
        super(options);
    }

    renderShader(){
        this.shaderLayer.clear();
        this.shaderLayer.resetMatrix();
        this.shaderLayer.noStroke();
        this.camera.transform(this.shaderLayer);
        this.shaderLayer.sphere(this.g.width*0.3, this.sphereResolution, this.sphereResolution);
        super.renderShader();
        
    }


}

class WeightedSphereSelectors extends SphereSelector{
    constructor(sphere,options){
        const defaults = {
            logWeight: 0,
            logRange: [1,1],
		};
        options = Object.assign({}, defaults, options);
        super(new Complex(sphere.x/(1-sphere.z),sphere.y/(1-sphere.z)),
            options);
    }

    getUniform(){
        let sphere = this.complexToSphere();
        return [sphere.x,sphere.y,sphere.z,this.getWeight()];
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


