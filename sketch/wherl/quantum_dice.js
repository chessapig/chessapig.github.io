const FRG = '#E6CFB3'; //background color
const BKG = '#2c2621'; //foreground color

const commonFunctions = `
// All components are in the range [0…1], including hue.
// OKLab → linear sRGB
vec3 oklab_to_linear_srgb(vec3 c) {
    float L = c.x;
    float a = c.y;
    float b = c.z;

    float l = L + 0.3963377774*a + 0.2158037573*b;
    float m = L - 0.1055613458*a - 0.0638541728*b;
    float s = L - 0.0894841775*a - 1.2914855480*b;

    l = l*l*l;
    m = m*m*m;
    s = s*s*s;

    return vec3(
        +4.0767416621*l - 3.3077115913*m + 0.2309699292*s,
        -1.2684380046*l + 2.6097574011*m - 0.3413193965*s,
        -0.0041960863*l - 0.7034186147*m + 1.7076147010*s
    );
}

// linear → display (gamma approx)
vec3 linear_to_srgb(vec3 c) {
    return pow(max(c, 0.0), vec3(1.0/2.2));
}

// "HSV-like" in OKLab
vec3 oklab_hsv(vec3 c) {
    float h = c.x; // 0–1
    float s = c.y; // chroma
    float v = c.z; // lightness

    float angle = 6.28318530718 * h;

    float L = v;
    float a = s * cos(angle);
    float b = s * sin(angle);

    vec3 rgb = oklab_to_linear_srgb(vec3(L, a, b));
    return linear_to_srgb(rgb);
}



//first 3 entries contain gradient, last contains density
vec4 density(vec3 sphere) {
    float log2Density = 0.0;
    vec3 gradLogDensity = vec3(0.0);

    // OPTIMIZATION 1: Remove the internal branch
    for(int i = 0; i < MAX_SELECTORS; i++) {
        if(i >= numSelectors) break;

        // OPTIMIZATION 2: Single fetch
        vec4 selector = selectorValues[i];
        vec3 root = selector.xyz;
        float weight = selector.w;
        
        vec3 delta = sphere - root;
        float magSqDelta = dot(delta, delta);

        // Optional: Uncomment the next line to prevent NaN/Inf explosions 
        // if a 'sphere' point ever perfectly aligns with a 'root' point.
        // magSqDelta = max(magSqDelta, 1e-8);

        // OPTIMIZATION 3: Use native base-2 logarithms
        log2Density += log2(magSqDelta) * (weight * 0.5);
        gradLogDensity += delta * (weight / magSqDelta);
    }

    // Project off the sphere direction
    gradLogDensity -= dot(gradLogDensity, sphere) * sphere;

    // OPTIMIZATION 4: Use native base-2 exponential
    float finalDensity = exp2(log2Density) * normalization;
    vec3 gradDensity = gradLogDensity * finalDensity;
    
    return vec4(gradDensity, finalDensity);
}

vec3 worldToSphere(vec2 world , vec3 frame[3]){
    vec3 xBasis = frame[0];
    vec3 yBasis = frame[1];
    vec3 view = frame[2];
    
    vec3 sphere = xBasis*world.x + yBasis*world.y + sqrt(1.-dot(world,world))*view;
    sphere=normalize(sphere);
    return sphere;
}


//   transports frame from frameZ to sphere. 
void transportFrameToPoint(vec3 sphere, vec3 frame[3], out vec3 result[3]) {
    // Compute the "rotation" that sends frameZ -> p
    vec3 frameX = frame[0];
    vec3 frameY = frame[1];
    vec3 frameZ = frame[2];
    vec3 u = frameZ + sphere;               // safe since not antipodal
    float invDenom = 2.0 / dot(u, u);       // = 1 / (1 + dot(frameZ, p))

    // Transport the tangent vectors
    vec3 resultX = frameX - dot(frameX,u) * invDenom * u;
    resultX = normalize(resultX - sphere * dot(sphere, resultX));
    vec3 resultY = cross(sphere, resultX);

    result[0] = resultX;
    result[1] = resultY;
    result[2] = sphere;
}

void getNearbyPoints(
    vec3 sphere,
    vec3 tangentFrame[3],
    float radius,
    out vec3 p0,
    out vec3 p1,
    out vec3 p2
){
    vec3 dx = tangentFrame[0] * radius;
    vec3 dy = tangentFrame[1] * radius;

    const float s32 = 0.86602540378;

    // Placed 120 degrees apart to form an equilateral triangle
    p0 = normalize(sphere + dx);
    p1 = normalize(sphere - 0.5 * dx + s32 * dy);
    p2 = normalize(sphere - 0.5 * dx - s32 * dy);
}
    
//returns the index and distance nearst selector
vec2 closestRoot(vec3 sphere){
    vec3 closest = vec3(-1.,100.,100.); // first coordinate contains index, second the squared distance, third the weighted distance
    for(int i = 0;i<MAX_SELECTORS;i++){
        if(i<numSelectors){
            vec3 root = selectorValues[i].xyz;
            float weight = selectorValues[i].w;
            vec3 delta = sphere-root;
            float magSq = dot(delta,delta);
            float weightedMagSq = magSq/weight;
            if(weightedMagSq <closest.z){  //divide by weight to subdivide the points better
                closest = vec3(float(i),magSq,weightedMagSq);
            }
        }
    }
    return vec2(closest.x, sqrt(closest.y) );
}

float voronoiBorder(vec3 sphere, vec3 tangentFrame[3], float borderSize){
    vec3 p0, p1, p2;
    getNearbyPoints(sphere, tangentFrame, borderSize, p0, p1, p2);

    vec2 cell = closestRoot(p0);
    float border = 0.0;
   
    if(abs(closestRoot(p1).x - cell.x) > 1e-5) border = 1.0;
    if(abs(closestRoot(p2).x - cell.x) > 1e-5) border = 1.0;    

    return border;
}

    

vec3 flow(vec3 sphere, float time){
    float dt = time/float(NUM_ITERATIONS);

    vec3 nextSphere = sphere;
    for(int i=0; i<NUM_ITERATIONS; i++){
        vec4 myDensity = density(sphere);
        nextSphere = normalize(sphere - dt*myDensity.xyz);
        vec3 delta = sphere-nextSphere;
        sphere=nextSphere;
        if(dot(delta,delta)<0.001*dt){
            break;
        }
    }
    return sphere;
}

//first term tells us the root number. if root number is -1, then am on border. 
vec2 flowVoronoi(vec3 sphere, vec3 tangentFrame[3], float borderSize, float time){
    vec3 p0, p1, p2;
    getNearbyPoints(sphere, tangentFrame, borderSize, p0, p1, p2);

    vec2 cell0 = closestRoot(flow(p0, time));
    vec2 cell1 = closestRoot(flow(p1, time));
    vec2 cell2 = closestRoot(flow(p2, time));
    
    float border = 0.0;
   
    if(abs(cell1.x - cell0.x) > 1e-5) border = 1.0;
    if(abs(cell2.x - cell0.x) > 1e-5) border = 1.0;    

    // Average distance now divided by 3
    float avgDist = (cell0.y + cell1.y + cell2.y) * 0.3333333;
    
    if(border == 0.0){
        return vec2(cell0.x, avgDist);
    } else {
        return vec2(-1.0, avgDist);
    }
}

vec3 darkColor = vec3(0.33,0.21,0.33);
vec3 lightColor =  vec3(0.9,0.81,0.7);
vec3 bkgColor = vec3(0.17,0.15,0.13);


vec3 marbledBlobs(vec3 sphere,vec3 frame[3]){
    // --------- MARBLED SPHERE ------ //  numIter= 20
    // vec2 r = closestRoot(sphere); 
    // vec3 startingColor = hsv2rgb(vec3( 
    //             r.x/float(numSelectors) ,  
    //             0.8, 
    //             0.7* pow((1.-r.y),5.)    ) );
    //
        

    vec3 startingColor = vec3(0.);
    float denominator=1.;
    float hue = 0.;
    float lightness =0.;
    for(int i = 0;i<MAX_SELECTORS;i++){
        if(i<numSelectors){
            vec3 root = selectorValues[i].xyz;
            float weight = selectorValues[i].w;
            vec3 delta = sphere-root;
            float magSqDelta=dot(delta,delta); //from 0 to 1
            float magnitude = exp(-magSqDelta*10./weight*sqrt(float(numSelectors)));

            startingColor += oklab_hsv(vec3(float(i)/float(numSelectors),0.22,sqrt(magnitude)));

            denominator+= magnitude;
        }
    }
    hue=hue/denominator;
    lightness= lightness/denominator;

    startingColor= startingColor/denominator;

    return  mix(startingColor,
                lightColor,
                1.-smoothstep(1.,2.,denominator)
                );

} 
`

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
#define MAX_ITERATIONS 40
#define LEARNING_RATE 0.1 
#define EPSILON 0.0001

vec3[3] getFrame(vec3 n_hat) {
    vec3[3] basis;

    vec3 x_basis = vec3(0.,1.,0.);
    vec3 y_basis  = normalize(cross(n_hat, x_basis));
    x_basis  = normalize(cross(n_hat, y_basis));

    basis[0] = x_basis;
    basis[1] = y_basis;
    basis[2] = n_hat; // already unit

    return basis;
}

//Computes the sterographic projection from the negative of n_hat. n_hat gets sent to zero.
vec2 sphereToComplex(vec3 pos, vec3[3] frame){
    vec3 x_basis = frame[0];
    vec3 y_basis = frame[1];
    vec3 z_basis = frame[2];

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

vec3 complexToSphere(vec2 z, vec3[3] frame){
    vec3 x_basis = frame[0];
    vec3 y_basis = frame[1];
    vec3 z_basis = frame[2];

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

//sterographiclly project objective to get optimizable function
float objective(vec2 z, vec3[3] frame){
    float normSq = dot(z,z);
    if(normSq >= 0.998) return 999999.0;

    float density=1.;
    for(int k = 0; k < MAX_SELECTORS; k++) {
        if(k >= numSelectors) break;
        vec2 root = sphereToComplex(selectorValues[k].xyz,frame);
        float weight = selectorValues[k].w;
        density *= pow(dot(z-root,z-root)/( (1.+normSq)*(1.+dot(root,root)) ) *2. , weight );
    }
    float interpolatedValue = ((1.-u_roundness)*(density+1.)+u_roundness);
    return interpolatedValue  * (1.+normSq) / (1. -normSq  );
}

float log_objective(vec2 z, vec3[3] frame){
    float log_dist_prod=0.;
    float normSq = dot(z,z);
    float logNormSq = log(1.+normSq);
    for(int k = 0; k < MAX_SELECTORS; k++) {
        if(k >= numSelectors) break;
        vec2 root = sphereToComplex(selectorValues[k].xyz,frame);
        float weight = selectorValues[k].w;

        float logDistSq = 2.*log(distance(z, root));
        log_dist_prod +=  weight * (logDistSq - logNormSq - log(1.+dot(root,root)) + log(2.) );
    }
    float density = exp(log_dist_prod);
    float interpolatedValue = ((1.-u_roundness)*(density+1.)+u_roundness);
    return interpolatedValue  * (1.+normSq) / (1. -normSq  );
}

// apply the adaptive gradient descent algorithm
// .xy coordinates contain z, .z coordinate contains maximum
vec3 minimize(vec2 z_start, vec3[3] frame) {
    vec2 z = z_start; 
    float current_val = objective(z, frame);
    
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
            grad.x = (objective(z + dx, frame) - objective(z - dx, frame)) / (2.0 * EPSILON);
            grad.y = (objective(z + dy, frame) - objective(z - dy, frame)) / (2.0 * EPSILON);
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
        float next_val = objective(next_z, frame);
        
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
    vec3[3] frame = getFrame(-n_hat);
    
    // Start gradient descent at zero nearest to n_hat
    vec2 z_start;



    if(u_doPolar){
        float minDistance = 1000.;
        for(int k = 0; k < MAX_SELECTORS; k++) {
             if(k >= numSelectors) break;
            vec2 root = sphereToComplex(selectorValues[k].xyz,frame);
            float distance = length(root);
            if(distance < minDistance){
                minDistance = distance;
                z_start = root;
            }
        } 
        if(minDistance>=1.){
            z_start = vec2(0.,0.);
        }
        vec3 min = minimize(z_start,frame);

        vNormal = complexToSphere(min.xy,frame);
        vRadius = min.z;
    } else {
        vRadius = objective(vec2(0.,0.), frame);
        vNormal = n_hat;
    }
    vec3 newPosition = n_hat*vRadius*1.3; 
    
    vWorldPosition = (uModelViewMatrix * vec4(newPosition, 1.0)).xyz;
    
    gl_Position = uProjectionMatrix * vec4(vWorldPosition, 1.0);
    
}
`

const diceVertSrc2 = `#version 300 es

in vec3 aPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

#define MAX_SELECTORS 32

uniform vec4 selectorValues[MAX_SELECTORS];
uniform int numSelectors;
uniform float u_roundness;
uniform float normSqPerPt;
uniform bool u_doPolar;

out vec3 vWorldPosition;
out vec3 vNormal;


//first 3 entries contain gradient, last contains density
vec3 outputDice(vec3 sphere) {
    float density = 1.0;
    vec3 gradLogDensity = vec3(0.0);

    for(int i = 0; i < MAX_SELECTORS; i++) {
        if(i >= numSelectors) break;

        vec4 selector = selectorValues[i];
        vec3 root = selector.xyz;
        float weight = selector.w;
        
        vec3 delta = sphere - root;
        float magSqDelta = dot(delta, delta);

        //magSqDelta = max(magSqDelta, 1e-8);

        float densityContribution = pow( magSqDelta /normSqPerPt , weight);
        density *=  densityContribution;
        gradLogDensity += delta * (2.*weight / magSqDelta* normSqPerPt)-sphere;
    }
    
    
    vec3 outputDice = (1.-u_roundness)*gradLogDensity*density + mix(density,1.,u_roundness)*sphere;
    
    return outputDice;
}

void main() {
    vec3 position = aPosition;
    vec3 n_hat = normalize(position);
    vNormal = n_hat;

    vec3 newPosition = outputDice(n_hat); 
    vWorldPosition = (uModelViewMatrix * vec4(newPosition, 1.0)).xyz;
    gl_Position = uProjectionMatrix * vec4(vWorldPosition, 1.0);
    
}
`

const diceFragSrc = `#version 300 es
precision highp float;
precision highp int; // Add this!

// Inputs from the vertex shader
in vec3 vWorldPosition;
in float vRadius;
in vec3 vNormal;


#define MAX_SELECTORS 32
#define PI 3.1415926535897932384626433832795
#define NUM_ITERATIONS 20

uniform vec4 selectorValues[MAX_SELECTORS];
uniform int numSelectors;
uniform vec3 frame[3];
uniform float normalization;

// Output to the screen
out vec4 fragColor;

uniform mat4 uModelViewMatrix;
` + commonFunctions + `
void main() {
    vec3 normal = normalize(vNormal);

    vec3 worldLightPos = vec3(-1.0, 1.0, 1.0);
    vec3 lightDir = normalize(inverse(mat3(uModelViewMatrix)) * worldLightPos);
    
    // Ambient light so the shadowed sides aren't pitch black
    float ambient = 0.2;
    
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

    //Color based on face
    vec3 tangentFrame[3];
    transportFrameToPoint(normal, frame, tangentFrame);
    // vec2 r = flowVoronoi(normal,tangentFrame, 0.01, 100.);
    // if(r.x>=0.){
    //     baseColor = oklab_hsv(vec3(r.x/float(numSelectors),0.17,0.6));
    // } else {
    //     baseColor = lightColor;
    // }
    vec3 flowSphere = flow(normal,0.2);
    baseColor = marbledBlobs(flowSphere,tangentFrame);

  
    float rateOfChange = length(fwidth(normal));
    float edgeIntensity = clamp(rateOfChange * 10.0, 0.0, 1.0);
    vec3 edgeColor = vec3(0.9,0.1,0.1);

    // 4. Combine and output
    vec3 finalColor = baseColor * (ambient + diffuse * 0.8 + specular*0.3) + edgeColor*edgeIntensity;

    fragColor = vec4(finalColor, 1.0);
}
`


//given location of zeros, and frame, renders the density on a sphere
const basinFragSrc = `
precision mediump float;

varying vec2 vTexCoord;

const int MAX_SELECTORS = 32;
#define PI 3.1415926535897932384626433832795
#define NUM_ITERATIONS 20

uniform vec2 worldCenter;
uniform vec2 worldSize;
uniform int numSelectors;
uniform vec4 selectorValues[MAX_SELECTORS];
uniform vec3 frame[3];
uniform float normalization;
uniform float flowTime;
uniform bool doMarble;
` + commonFunctions + `

void main(void)
{ 
    // Normalized pixel coordinates (from 0 to 1)
    vec2 world =worldCenter + (vTexCoord - 0.5) * worldSize;
    float sphereHit = 1.0 - dot(world, world);
    if (sphereHit <= 0.0) {
        gl_FragColor = vec4(bkgColor, 1.0);
        return; 
    }
    vec3 sphere = worldToSphere(world,frame);

    vec3 tangentFrame[3];
    transportFrameToPoint(sphere, frame, tangentFrame);
    
    vec3 outputColor = bkgColor;

    float time = (exp(flowTime)-1.)/float(numSelectors)*2.;

    if(doMarble){
        vec3 flowSphere = flow(sphere,time);
        outputColor = marbledBlobs(flowSphere,tangentFrame);
        //vec2 r = flowVoronoi(sphere,tangentFrame, 0.03, time);
        // if(r.x<0.){
        //     outputColor = lightColor;
        // }
    } else {
        vec2 r = flowVoronoi(sphere,tangentFrame, 0.01, time);
        if(r.x>=0.){
            outputColor = oklab_hsv(vec3(r.x/float(numSelectors),0.17,0.6));
        } else {
            outputColor = lightColor;
        }
    }
      

    gl_FragColor =  vec4(outputColor,1.);

}
`;

let containerId = "dice-canvas";

let diceWindow;
let weightedSphereOptions;
let basinWindow;
let windows = [];
let canvasSize;

const defaultUIState = {
	u_doPolar: true,
	u_roundness: 0.5,
    flowTime:0.5,
    doMarble:true,
};

const uiState = defaultUIState;

function preload() {
    rubikFont = loadFont('/sketch/libraries/fonts/Rubik-Regular.ttf');
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
    canvasSize =canvasWidth/2;
	canvas = createCanvas(canvasWidth, canvasSize , WEBGL);
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

    let camera = new Camera3D({
        zoom: -0.1,
        zoomRange:[0.001,20],
        disablePan: false
    });

    let selectors = []
    let numSelectors=6;
    let selectorRadius = 1;
    weightedSphereOptions = { 
        camera: camera , 
        logRange: [-1,1]
    }
    function ran(){
        return 0.2 * (random()*2.-1.);
    }
    selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector( 1,ran(),ran())})));
    selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector(-1,ran(),ran())})));
    selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector(ran(), 1,ran())})));
    selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector(ran(),-1,ran())})));
    selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector(ran(),ran(), 1)})));
    selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector(ran(),ran(),-1)})));
    //selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector( 1, 1,1)})));
    //selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector(-1, 1,1)})));
    //selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector( 1,-1,1)})));
    //selectors.push(new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {sphere:  createVector(-1,-1,1)})));


    basinWindow = new BasinWindow({
		pixels: canvasSize,
        x: -2, y: -1, width: 2,
        selectors: selectors,
        camera: camera,
        fragSrc: basinFragSrc,
        defaultSelectorValueUniform: WeightedSphereSelector.defaultUniform(),
        drawShader: true,
        uniforms:{
            normalization: 4,
            doMarble:defaultUIState.doMarble,
            flowTime: defaultUIState.flowTime,
        },
        sphereResolution: 200,
        multiDragType: "CLOSEST"
	});


	diceWindow = new DiceWindow({
		pixels: canvasSize,
        x: 0, y: -1, width: 2,
        camera: camera,
        vertSrc: diceVertSrc2,
        fragSrc: diceFragSrc,
        selectorWindow: basinWindow, //get shader uniforms from this window
        uniforms:{
            normSqPerPt: 2,
            normalization: 4,
            u_roundness: defaultUIState.u_roundness,
            u_doPolar: defaultUIState.u_doPolar,
        },
        sphereResolution: 300,
        multiDragType: "CLOSEST"
	});


    


	windows = [basinWindow,diceWindow]; 
    setupUI();
}

function setupUI(){
	const doPolar = document.getElementById('doPolarBox');
    const doMarble = document.getElementById('doMarbleBox');
	const roundnessSlider = document.getElementById('roundnessSlider');
    const timeSlider = document.getElementById('timeSlider');

	doPolar.checked = defaultUIState.u_doPolar;
	roundnessSlider.value = defaultUIState.u_roundness;
    timeSlider.value = defaultUIState.flowTime;

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

    timeSlider.addEventListener('input', () => {
        let val = timeSlider.value
  		timeLabel.textContent = nf(val,1);
		uiState.flowTime = val;
        basinWindow.uniforms.flowTime = val;
	});

    doMarble.addEventListener('change', () => {
		uiState.doMarble = doMarble.checked;
        basinWindow.uniforms.doMarble = uiState.doMarble;
	});
    
}


let doSave=false;
let totalFrames;
let initialFrame;

function draw() {
	scale(height / 2, -height / 2, height / 2) //recale to a box [-1,1]times [-1,1]
	background(BKG);

   
    if(doSave){
         let frame = frameCount-initialFrame-1;
        saveAnimationFrames(basinWindow,frame,(frame+1),totalFrames);
        if(frame >= totalFrames){
            doSave=false;
            frameRate(60);
        }
    }

    //basinWindow.uniforms.flowTime = (sin(frameCount/200)+1)/2;

	for (let w of windows) {
        w.clear();
		w.update();
		w.render();
		w.draw();
	}
}

function saveAnimation(numFrames){
    totalFrames = numFrames;
    frameRate(1);
    doSave = true;
    initialFrame=frameCount;
    basinWindow.uniforms.flowTime =0;
}

function saveAnimationFrames(w,startFrame, endFrame,totalFrames){
    for(let i=startFrame; i< endFrame ; i++){
        let t = sin((PI*i/totalFrames) / 2); //sin easing
        let flowTime = t;
        w.uniforms.flowTime = flowTime;
        console.log("frame number" + i);
        w.g.save("flow_"+i+".jpg");
    }
}

class DiceWindow extends SphereWindow{
    constructor(options={}){
        const defaults = {
            sphereResolution: 100,
            drawShader: true,
            defaultSelectorValueUniform: [0,0,0,0],
            selectorWindow: null,
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
        //super.renderShader();
        
    }

    render(){
        super.render();
        let ctx = this.g;
        let labelSize=0.15;
        
        ctx.push();
        ctx.resetMatrix();
        this.baseTransformCoords();
        ctx.textFont(rubikFont);
        ctx.textSize(labelSize);
        ctx.noStroke();
        ctx.fill(FRG);
        ctx.textAlign(ctx.CENTER, ctx.CENTER);
        ctx.translate(0.,labelSize/2-1.+0.03);
        ctx.scale(1,-1);
        if(this.uniforms.u_doPolar){
            ctx.text("Dice",0,0);
        } else {
            ctx.text("Density function",0,0);
        }
        ctx.pop();
        
    }

    updateUniforms(){
        let p = basinWindow.getPolynomial();
        let norm = p.sphericalNormSq();
        this.uniforms.normSqPerPt = pow(norm,1/basinWindow.selectors.length);
        this.uniforms.normalization = 12./this.uniforms.numSelectors;
        
		this.uniforms.numSelectors = this.selectorWindow.uniforms.numSelectors;
		this.uniforms.selectorValues = this.selectorWindow.uniforms.selectorValues
	}

}

class BasinWindow extends SphereWindow{
    constructor(options={}){
        const defaults = {
            drawShader: true,
            defaultSelectorValueUniform: [0,0,0,0],
		};
        options = Object.assign({}, defaults, options);
        super(options);
    }

    updateUniforms(){
        super.updateUniforms();
		this.uniforms.normalization = 12./this.uniforms.numSelectors;
    }

    generateSelectorDoubleClick(mousePos){
		let s =  new WeightedSphereSelector(Object.assign({}, weightedSphereOptions, {world:  mousePos}));
		if(s.sphere){
			return s;
		} else {
			return false;
		}
		
	}
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
        diceWindow.multiDragType = "ALL";
        basinWindow.camera.dragMode = "PAN";
    } 
    if(key === "s"){
        //saveAnimation(70);
    }
}

function keyReleased() {
    if (keyCode === SHIFT) {
        diceWindow.multiDragType = "CLOSEST";
        basinWindow.camera.dragMode = "ROTATE";
    }
    
}


