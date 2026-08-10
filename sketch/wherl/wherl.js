//given location of zeros, and frame, renders the density on a sphere
const rendererFragSrc = `
precision mediump float;

varying vec2 vTexCoord;

const int MAX_SELECTORS = 32;
#define PI 3.1415926535897932384626433832795

uniform vec2 worldCenter;
uniform vec2 worldSize;
uniform int numSelectors;
uniform vec3 selectorValues[MAX_SELECTORS];
uniform vec3 frame[3];
uniform float normSqPerSelector;


float gain( float x, float k ) 
{
    float a = 0.5*pow(2.0*((x<0.5)?x:1.0-x), k);
    return (x<0.5)?a:1.0-a;
}

float density(vec3 sphere){
    float density=1.;
    for(int i = 0;i<MAX_SELECTORS;i++){
        if(i<numSelectors){
            vec3 delta = sphere-selectorValues[i];
            density *= dot(delta,delta)/normSqPerSelector;
        }
    }
    return density;
}


vec3 worldToSphere(vec3 world,vec3 frame[3]){
    vec3 xBasis = frame[0];
    vec3 yBasis = frame[1];
    vec3 view = frame[2];

    vec3 sphere = xBasis*world.x + yBasis*world.y + world.z*view;
    return normalize(sphere);
}

vec3 darkColor = vec3(0.33,0.21,0.33);
vec3 lightColor =  vec3(0.9,0.81,0.7);
vec3 bkgColor = vec3(0.17,0.15,0.13);

void main(void)
{ 
    // Normalized pixel coordinates (from 0 to 1)
	vec2 uv = worldCenter + (vTexCoord - 0.5) * worldSize;

    float sphereHit = 1.-dot(uv,uv);
    if(sphereHit<0.){
        gl_FragColor = vec4(vec3(0.1), 1.);
        return;
    }
    vec3 world = vec3(uv,sqrt(sphereHit));
    vec3 sphere = worldToSphere(world,frame);
    
    vec3 outputColor = bkgColor;
    if(sphereHit>0.){ 
        float rho = density(sphere);
        float levelSpacing = 1.;
        float levelWidth=0.06;
        float blobCutoff=1.;

        float diff = log(rho);
        
        if(diff < blobCutoff){
            outputColor= mix(darkColor, lightColor, clamp(diff,0.,1.));
        } else if (mod(diff,levelSpacing)<levelWidth*levelSpacing ) {
            float alpha = pow(clamp((8.0 - diff) / 8.0, 0.0, 1.0),2.0);
            outputColor= mix(outputColor, lightColor, alpha);
        }
        
        outputColor = mix(bkgColor,lightColor,(rho + gain(rho,3.))/2.);
        outputColor = mix(lightColor,outputColor , smoothstep(levelWidth,levelWidth*1.1,mod(diff,levelSpacing)/levelSpacing));
    } else {
        outputColor = vec3(0.1,0.1,0.1);
    }

    gl_FragColor =  vec4(outputColor,1.);
}
`;

const computeLebedevFragSrc = `
precision highp float;

varying vec2 vTexCoord;

const int MAX_SELECTORS = 32;
#define PI 3.1415926535897932384626433832795
#define NUM_LEBEDEV_POINTS 5294

uniform int numSelectors;
uniform vec3 selectorValues[MAX_SELECTORS];
uniform float normSqPerSelector;
uniform vec2 iResolution;
uniform sampler2D uLebedevTex;

float density(vec3 sphere){
    float density=1.;
    for(int i = 0;i<MAX_SELECTORS;i++){
        if(i<numSelectors){
            vec3 delta = sphere-selectorValues[i];
            density *= dot(delta,delta)/normSqPerSelector;
        }
    }
    return density;
}


float unpackFloat(vec4 rgba) {
    return rgba.r +
           rgba.g / 255.0 +
           rgba.b / 65025.0 +
           rgba.a / 160581375.0;
}

float readRow(float row, float i) {
    float u = (i + 0.5) / float(NUM_LEBEDEV_POINTS);
    float v = (row + 0.5) / 4.0;
    return unpackFloat(texture2D(uLebedevTex, vec2(u, v)));
}

vec3 getLebedevPt(float i) {
    float x = readRow(0.0, i);
    float y = readRow(1.0, i);
    float z = readRow(2.0, i);

    return vec3(x, y, z) * 2.0 - 1.0;
}

//returns density and log of weight
vec2 getRhoWeight(vec2 seed){
    float index = seed.x + seed.y * iResolution.x;
    if(index>=float(NUM_LEBEDEV_POINTS)){
        return vec2(0.,0.);
    }
    vec3 sphere = getLebedevPt(index);
    float logWeight = readRow(3.0, float(index));  
    return vec2( density(sphere) , logWeight);
}

//input vector containing rho and the weight
vec4 encodeRhoWeight(vec2 rhoWeight) {
    // --- normalize inputs ---
    float r = clamp(rhoWeight[0], 0.0, 1.0);
    float w = clamp(rhoWeight[1], 0.0, 1.0);

    // --- pack 16-bit each into RG and BA ---
    vec2 encR = fract(r * vec2(1.0, 255.0));
    encR -= encR.yy * vec2(1.0/255.0, 0.0);

    vec2 encW = fract(w * vec2(1.0, 255.0));
    encW -= encW.yy * vec2(1.0/255.0, 0.0);

    return vec4(encR, encW);
}

void main(void){ 
    //vec2 pixel = gl_FragCoord.xy;
    //gl_FragColor =  encodeRhoWeight( getRhoWeight(pixel) );

    float index = gl_FragCoord.x + gl_FragCoord.y * iResolution.x;
    vec3 sphere = getLebedevPt(index);
    gl_FragColor = vec4(sphere* 0.5 + 0.5, 1.0);
    }  
`

const computeRandomFragSrc = `
precision highp float;

varying vec2 vTexCoord;

const int MAX_SELECTORS = 32;
#define PI 3.1415926535897932384626433832795

uniform int numSelectors;
uniform vec3 selectorValues[MAX_SELECTORS];
uniform float iFrame;
uniform float normSqPerSelector; //norm square, to the power of 1/numSelectors


// Sine-free 1D-to-1D hash to completely scatter the frame integer
float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 63.33;
    p *= p + p;
    return fract(p);
}

vec3 hash23_sphere(vec2 p, float frame) {
    // 1. Scatter the frame to break the linear chain
    float scrambledFrame = hash11(mod(frame, 10000.0));

    // 2. Pass into the 3D Hoskins Hash
    vec3 p3 = fract(vec3(p.x, p.y, scrambledFrame) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    
    // 3. Break the symmetry
    vec2 h = fract(vec2(
        (p3.x + p3.y) * (p3.z + 13.513),
        (p3.x + p3.z) * (p3.y + 93.179)
    ));

    // 3.5 THE AVALANCHE STEP: Scramble the decoupled hash one final time.
    // We multiply by large irregular scalars and wrap them again.
    // This shatters any surviving linear correlation between X and Y.
    h = fract(h * vec2(43.231, 71.989)); 
    h += dot(h, h.yx + 19.19);
    h = fract(h);

    // 4. Map the uniform [0, 1) 2D hash to S^2
    float z = h.y * 2.0 - 1.0;               
    float a = h.x * 6.28318530718;           
    float r = sqrt(1.0 - z * z);             

    // 5. Combine into 3D Cartesian coordinates (Already length 1.0, no normalize needed)
    return vec3(r * cos(a), r * sin(a), z);
}

float density(vec3 sphere){
    float density=1.;
    for(int i = 0;i<MAX_SELECTORS;i++){
        if(i<numSelectors){
            vec3 delta = sphere-selectorValues[i];
            density *= dot(delta,delta)/normSqPerSelector;
        }
    }
    return density;
}

//input vector containing rho
vec4 encodeFloat(float v) {
    float f = clamp(v, 0.0, 1.0);

    vec4 enc = fract(f * vec4(
        1.0,
        255.0,
        65025.0,
        16581375.0
    ));

    enc -= enc.yzww * vec4(
        1.0/255.0,
        1.0/255.0,
        1.0/255.0,
        0.0
    );

    return enc;
}

void main(void){ 
    gl_FragColor =  encodeFloat( density(hash23_sphere(vTexCoord, iFrame) )); 
    //gl_FragColor = vec4(hash23_sphere(vTexCoord, iFrame)* 0.5 + 0.5, 1.0);
}  

`


const FRG = '#E6CFB3'; //background color
const PRIMARY = "hsl(0, 71%, 49%)"; //highlight color
const BKG = '#2c2621'; //foreground color
const NUM_LEBEDEV_POINTS = 5294;

let containerId = "wherl-canvas";

let wherlWindow;
let histogramWindow;
let sphereSelectorOptions;
let histogram;
let windows = [];
let canvasSize;
let lebedevTex;

function preload() {
    rubikFont = loadFont('../libraries/fonts/Rubik-Regular.ttf');
    lebedevTex = loadImage("lebedev.png");
    
}

function setup() {
   
	let elem = document.getElementById(containerId);
	boundingRect = elem.getBoundingClientRect();
    // get computed border size
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
        zoomRange:[0.7,20]
    });



    let selectors = []
    // let numSelectors=6;
    // let selectorRadius = 5;
    // for(let i=0;i<numSelectors;i++){
    //     z=Complex.polar(selectorRadius,2*PI*i/numSelectors);
    //     selectors.push(new SphereSelector({ 
    //         z: z,
    //         camera: camera 
    //     }));
    // }
    selectorOptions = {camera: camera};
    selectors.push(new SphereSelector(Object.assign({}, selectorOptions, {sphere:  createVector( 1, 0, 0)})));
    selectors.push(new SphereSelector(Object.assign({}, selectorOptions, {sphere:  createVector(-1, 0, 0)})));
    selectors.push(new SphereSelector(Object.assign({}, selectorOptions, {sphere:  createVector( 0, 1, 0)})));
    selectors.push(new SphereSelector(Object.assign({}, selectorOptions, {sphere:  createVector( 0,-1, 0)})));
    selectors.push(new SphereSelector(Object.assign({}, selectorOptions, {sphere:  createVector( 0, 0.00001, 1)})));
    selectors.push(new SphereSelector(Object.assign({}, selectorOptions, {sphere:  createVector( 0, 0,-1)})));


    histogram = new Histogram({
        numBoxes:1000,
        range: [0,1],
        color: FRG,
        drawMode: "REARRANGEMENT"  //"REARRANGEMENT" or "HISTOGRAM"
    });
  
	wherlWindow = new WherlWindow({
		pixels: canvasSize,
        x: -2, y: -1, width: 2,
        selectors: selectors,
        camera: camera,
        computePtsPerFrame: 100000,
        histogram: histogram,
        histogramMaxEntries: 1000000000,
        doLebedev: false,
        doGradientFlow: false,
        gradientFlowDt: 0.0005, //negative for contract, postive for expand
	});

    pointCloudWindow = new PointDisplayWindow(wherlWindow.randomComputeLayer,
    {
		pixels: canvasSize,
        x: -2, y: -1, width: 2,
        camera: camera,
	});

    histogramWindow = new WherlEntropyWindow({
        pixels: canvasSize/2,
        x: 0, y: -1, width: 2,
        histogram: histogram,
        BKG: color(25,25,25),
        camEnabled: false,
    })

	windows = [wherlWindow,histogramWindow]; 
    noSmooth();
}


class PointDisplayWindow  extends GraphicsWindowCamera{
    constructor(pixelCanvas, options={}){
        super(options);
        this.pixelCanvas = pixelCanvas;
    }

    render(){
        // Force p5 to read the shader's output into the CPU-side pixels array
        this.pixelCanvas.loadPixels();
        let pixels = this.pixelCanvas.pixels;
        let ctx = this.g;
        
        // Set up the aesthetic for the points
        ctx.stroke(255, 180); // White dots with a little transparency
        ctx.strokeWeight(2);
        
        // Use POINTS to render the vertices efficiently
        ctx.beginShape(POINTS);
        
        // Step through the pixel array (R, G, B, A)
        for (let i = 0; i < pixels.length; i += 4) {
            
            // 1. Unpack the 0-255 color values back to the -1.0 to 1.0 range
            let x = (pixels[i]     / 255.0) * 2.0 - 1.0;
            let y = (pixels[i + 1] / 255.0) * 2.0 - 1.0;
            let z = (pixels[i + 2] / 255.0) * 2.0 - 1.0;
            
            // 2. Scale by the desired visual radius and draw the point
            ctx.vertex(x, y, z);
        }
        
        ctx.endShape();
    }
}

class Histogram{
    constructor(options={}){
        const defaults = {
            numBoxes:100,
            range: [0,1], //range of histogram points
            color: color(255),
            drawLabels:true,
            drawMode:"GRAPH", //options are "GRAPH" and "HISTOGRAM" and "REARRANGEMENT"
            drawEntropy: true,
            wherlNormalization: 1
		};
        Object.assign(this, defaults, options);
        this.reset();
    }

    reset(){
        this.histogram = new Array(this.numBoxes).fill(0);
        this.numEntries=0;
        this.computeRearrangement();
    }

    include(x, weight=1){
        let value = map(x,this.range[0],this.range[1],0,1); //remap x to 0,1
        
        if(value<0 || value>= 1){ return false;} //only accept points in range
        if(weight==0){return false;} //only accepts points with positive weight
        let boxNumber = floor(value*this.numBoxes);
        this.histogram[boxNumber]+=weight;
        this.numEntries+=weight;
    }

    //produce an array showing the wherl entropy for functions of the form G_c = max(rho-c,0)
    //this.rearrangement is already paramertized in terms of x. 
    wherlGraph(){
        let rearrange = this.rearrangement;
        let entropy = Array(rearrange.length).fill(0);
        let sum=0;
        for(let i = this.numBoxes-1; i>=0; i--){
            sum += rearrange[i]/this.numBoxes; //Indefinite integral of rearrange
            entropy[i] = sum * this.wherlNormalization; //subtract off rectangle below current value
            //We will take wherlNormalization = number of zeros + 1 (decided emphiercally).
        }  
        return entropy;  
    }

    //given function G, computes the wherl entropy using the histogram
    //G convex function from 0 to 1
    wherlEntropy(G = t => t*t){
        let sum = 0;
        for(let i=0;i<this.numBoxes;i++){
            sum += G(i/this.numBoxes)  *  this.histogram[i]/this.numEntries;
        }
        return sum;
    }

    //draw histogram in context ctx
    //assume [-1,1] times [-1,1] coordinates
    draw(ctx){
        ctx.textFont(rubikFont);

        ctx.push();
        ctx.scale(2);
        ctx.translate(-0.5,-0.5);
        let margins = 0.2;
        ctx.scale(1/(1+margins*2));
        ctx.translate(margins,margins)
        
        ctx.stroke(this.color);
        ctx.noFill();

        //draw axes
        ctx.strokeWeight(1);
        ctx.line(0,0,1,0);
        ctx.line(0,0,0,1);

        //draw labels
        let labelSize=0.1;
        ctx.textSize(labelSize);
        ctx.textAlign(ctx.CENTER, ctx.CENTER);
        if(this.drawLabels){
            ctx.push();
            ctx.noStroke();
            ctx.fill(this.color);

            ctx.push();
            ctx.translate(-labelSize,0);
            ctx.scale(1,-1);
            ctx.text("0",0,0);
            ctx.pop();

            ctx.push();
            ctx.translate(-labelSize,1);
            ctx.scale(1,-1);
            ctx.text("1",0,0);
            ctx.pop();

            ctx.push();
            ctx.translate(0,-labelSize);
            ctx.scale(1,-1);
            ctx.text(this.range[0],0,0);
            ctx.pop();

             ctx.push();
            ctx.translate(1,-labelSize);
            ctx.scale(1,-1);
            ctx.text(this.range[1],0,0);
            ctx.pop();

            ctx.pop();
        }
        
        //draw histogram itself
        let x,y
        const dy = 1/this.numBoxes;
        switch(this.drawMode){
            case "GRAPH":
                ctx.push();
                ctx.strokeWeight(2);
                ctx.beginShape();
                for(let i=0;i<this.numBoxes;i++){
                    x = (i)/this.numBoxes;
                    y =  this.histogram[i]/this.numEntries;
                    
                    ctx.vertex(x,y);
                }
                ctx.endShape();
                ctx.pop();
                break;

            case "HISTOGRAM":
                ctx.push();
                ctx.noStroke();
                ctx.fill(this.color);
                ctx.rectMode(CORNERS);
                for(let i=0;i<this.numBoxes;i++){
                    y = i/this.numBoxes;
                    x =  this.histogram[i]/this.numEntries*this.numBoxes/10;
                    ctx.rect(0,y,x,y+dy);
                }

                if(this.drawLabels){
                    ctx.translate(0.6,1);
                    ctx.scale(1,-1);
                    ctx.text("Pushforward density",0,0);
                }
                
                ctx.pop();
                break;

            case "REARRANGEMENT":
                ctx.push();
                ctx.noStroke();
                ctx.fill(this.color);
                ctx.rectMode(CORNERS)
                this.computeRearrangement();
                for(let i=0;i<this.numBoxes;i++){
                    y = i/this.numBoxes;
                    x = this.rearrangement[i];
                    ctx.rect(0,y,x,y+dy);  //Draw rearrangeent, but like on its side. Inverted. Beautiful
                } 

                if(this.drawLabels){
                    ctx.translate(0.5,1);
                    ctx.scale(1,-1);
                    ctx.text("Rearrangement",0,0);
                }
                
                ctx.pop();
                break;
        }

        if(this.drawEntropy){
            // ctx.translate(0.3,1-labelSize*2);
            // ctx.scale(1,-1);
            // ctx.noStroke();
            // ctx.fill(this.color);
            // ctx.textAlign(ctx.LEFT);
            // ctx.text("Entropy " + nf(100*this.wherlEntropy(t => pow(t,3)),1,3),0,0);

             this.computeRearrangement();
            ctx.push();
            ctx.strokeWeight(2);
            ctx.stroke(PRIMARY);
            ctx.beginShape();
            let entropy = this.wherlGraph();
            for(let i=0;i<this.numBoxes;i++){
                x =  i/this.numBoxes;
                y =  entropy[i];
                ctx.vertex(y,x);
            }
            ctx.endShape();
            ctx.pop();
        }


        ctx.pop();

    }

    computeRearrangement(){
        let rearrangement = new Array(this.numBoxes).fill(0);
        //compute integral of histogram from the top!
        for(let i=0;i<this.numBoxes;i++){
            for(let j=i;j<this.numBoxes;j++){
                rearrangement[i]+=this.histogram[j]/this.numEntries;
            }
        }
        this.rearrangement = rearrangement;
    }


}

class WherlEntropyWindow extends GraphicsWindowCamera{
    constructor(options={}){
        const defaults = {
            histogram: new Histogram(),
            
		};
        options = Object.assign({}, defaults, options);
        super(options); 
    }

    render(){
        this.g.background(this.BKG)
        super.render();
        this.histogram.draw(this.g);
    }
}



class WherlWindow extends SphereWindow{
    constructor(options={}){
        const defaults = {
            histogram: new Histogram(),
            histogramMaxEntries: 10000,
			computePtsPerFrame: 500,
            fragSrc: rendererFragSrc,
            drawShader:true,
            uniforms: {
                frame: [1,0,0,0,1,0,0,0,1],
                logL2Norm: 0
            },
            multiDragType: "CLOSEST",
            doLebedev: false,
            doGradientFlow: true,
            gradientFlowDt: 0.001
		};
        options = Object.assign({}, defaults, options);
        super(options); 
        this.lebedevComputeLayer = createGraphics(1,NUM_LEBEDEV_POINTS,WEBGL);
        this.lebedevComputeLayer.noStroke();
        this.lebedevComputeShader = this.lebedevComputeLayer.createShader(this.vertSrc, computeLebedevFragSrc);
        this.lebedevComputeLayer.shader(this.lebedevComputeShader); 
   

        let randomLayerWidth = floor(sqrt(this.computePtsPerFrame));
        this.randomComputeLayer = createGraphics(randomLayerWidth,randomLayerWidth,WEBGL);
        this.randomComputeLayer.noStroke();
        this.randomComputeShader = this.randomComputeLayer.createShader(this.vertSrc, computeRandomFragSrc);
        this.randomComputeLayer.shader(this.randomComputeShader); 

    }



    update(){

        this.maximum = this.maximize();
        this.deformToCoherent(this.maximum.getComplex(),0.001);
        
        let p = this.getPolynomial();
        let norm = p.sphericalNormSq();
        this.uniforms.normSqPerSelector = pow(norm,1/this.selectors.length);
         if(this.doGradientFlow){
            this.momentMapGradFlow(-this.gradientFlowDt);
        }
        super.update();
         this.histogram.wherlNormalization = this.selectors.length+1
        if(this.didSelectorUpdate){
            this.histogram.reset();
        }
        this.generateHistogram();
        
        
    }

    render(){
        super.render();
        this.maximum.draw(this.g);
    }

    updateUniforms(){
        super.updateUniforms();
    }

    

    generateHistogram(){
        if(this.histogram.numEntries>this.histogramMaxEntries){return false;}
        
        this.runCompute();
        let computeLayer;
        if(this.doLebedev){
            computeLayer = this.lebedevComputeLayer;
        } else {
            computeLayer = this.randomComputeLayer;
        }
        const densities = this.readComputeFloats(computeLayer);
        for(let d of densities){ //d[0] is rho, d[1] is weight
            this.histogram.include(d[0], d[1]);
            
        }
        return this.histogram;
    }

    momentMapGradFlow(dt){
        let totalRoots = createVector(0,0,0);
        for(let s of this.selectors){
            totalRoots.add(s.sphere);
        }
        totalRoots.mult(dt);

        for(let s of this.selectors){
            s.sphere.add(totalRoots).normalize(); 
        }

        this.flagSelectorUpdate =true; 
    }

    //linearly intperpolate between this and maximum
    deformToCoherent(z, dt){
        let coh = Polynomial.coherentState(z, this.selectors.length);
        let p = this.getPolynomial();
        let valueAtZ = p.eval(z);
        let phase = valueAtZ.mult(1/valueAtZ.abs());
        let coherentPhase = coh.eval(z);
        coherentPhase.mult(1/coherentPhase.abs());
        coh.mult(coherentPhase.inverse()); //normalize phase of coh
        p.add(coh.mult(phase.mult(dt)))
        let newRoots = p.roots();
        let tolerance=0.01
        for(let j=0; j< newRoots.length; j++){
            let r = newRoots[j];
            for(let i=0; i< this.selectors.length; i++){
                let s=  this.selectors[i]
                if(s.getComplex().sub(newRoots[j]).abs()<tolerance){
                    s.setComplex(newRoots[j]);
                    continue;
                }
            }
        }
        this.flagSelectorUpdate =true; 
    }



    runCompute() {
       let ctx, shader;
        if(this.doLebedev){
            ctx = this.lebedevComputeLayer;
            shader = this.lebedevComputeShader;
            shader.setUniform("uLebedevTex", lebedevTex);
            shader.setUniform("iResolution", [1,this.NUM_LEBEDEV_POINTS]);
            
        } else {
            ctx = this.randomComputeLayer;
            shader = this.randomComputeShader;
            shader.setUniform("iFrame", frameCount);
        }


        // uniforms
        shader.setUniform("numSelectors", this.uniforms.numSelectors);
        shader.setUniform("selectorValues", this.uniforms.selectorValues);
        shader.setUniform("normSqPerSelector", this.uniforms.normSqPerSelector);

        // draw full quad
        ctx.push();
        ctx.resetMatrix();
        ctx.noStroke();
        ctx.shader(shader); 
        ctx.rectMode(CENTER);
        ctx.clear();

        
        ctx.rect(0, 0, ctx.width, ctx.height);

        ctx.pop();
    }

    maximize(){
        let polynomial=this.getPolynomial(); //get the L^2 normalized polynomial
    
        function density(x,y){
            let z = new Complex(x,y);
            let val = polynomial.eval(z).abs2();
            let density = pow(1+x*x+y*y , -polynomial.degree)
            return val*density; 
        }

        // ==========================================
        // 1. Coarse Grid Search (Find the highest hill)
        // ==========================================
        let bestX = 0, bestY = 0;
        let maxVal = -Infinity;
        
        // Logarithmic polar grid (rExp from -2 to 2 covers r=0.01 to r=100)
        for (let rExp = -2; rExp <= 2; rExp += 0.2) {
            let r = Math.pow(10, rExp);
            if (rExp === -2) r = 0; // Ensure we explicitly check the origin
            
            let thetaSteps = r === 0 ? 1 : 36; // 10-degree increments
            for (let i = 0; i < thetaSteps; i++) {
                let theta = (i / thetaSteps) * TWO_PI;
                let x = r * cos(theta);
                let y = r * sin(theta);
                
                let v = density(x, y);
                if (v > maxVal) {
                    maxVal = v;
                    bestX = x;
                    bestY = y;
                }
            }
        }

        // ==========================================
        // 2. Finite-Difference Gradient Ascent 
        // ==========================================
        let lr = 0.5;      // Initial learning rate (step size)
        let h = 1e-6;      // Epsilon for finite differences
        let maxIters = 100;
        
        for (let i = 0; i < maxIters; i++) {
            let currentVal = density(bestX, bestY);
            
            // Calculate gradient via finite differences
            let dx = (density(bestX + h, bestY) - currentVal) / h;
            let dy = (density(bestX, bestY + h) - currentVal) / h;
            
            // Normalize gradient to control exact step size via `lr`
            let gradMag = Math.sqrt(dx * dx + dy * dy);
            if (gradMag < 1e-9) break; // We've reached the peak (gradient is zero)
            
            let dirX = dx / gradMag;
            let dirY = dy / gradMag;
            
            // Evaluate a step in the direction of the gradient
            let stepVal = density(bestX + lr * dirX, bestY + lr * dirY);
            
            // Simple backtracking line-search
            if (stepVal > currentVal) {
                // The step improved our value: commit the step and accelerate
                bestX += lr * dirX;
                bestY += lr * dirY;
                lr *= 1.2; 
            } else {
                // The step overshot the peak: reject the step and slow down
                lr *= 0.5; 
            }
            
            // If the step size becomes microscopic, we are done
            if (lr < 1e-8) break;
        }

        // Return a complex number at the maximum
        let maxZ = new Complex(bestX, bestY);
        
        return new SphereSelector({
            z: maxZ, 
            camera: this.camera,
            color: PRIMARY,
        });
    }

    decode(r,g,b,a){
        r /= 255;
        g /= 255;
        b /= 255;
        a /= 255;

        let rho = 0;
        let weight = 1;
        if(this.doLebedev){
            

            // --- decode 16-bit rho ---
            rho = r + g / 255.0;
            let logwEncoded= b + a / 255.0;
            if(logwEncoded<1e-6){ //for bottom of range, return weight
                return [rho,0]
            } 
            // map back from [0,1] → [-10, -8]
            let logw = logwEncoded * 2.-10.;
            weight = Math.exp(logw);
            return [rho,weight];
        }
        
        //if not lebedev, set weight to 1 and use all bits to decode the rho
        let f =  r +
                g / 255 +
                b / 65025 +
                a / 160581375;
        
       
        return [f,1];
                
    }

    readComputeFloats(ctx) {
        ctx.loadPixels();
        const pixels =ctx.pixels;
       
   

        const result = []
        let decode;
        for (let i = 0; i < pixels.length/4; i++) {
            const r = pixels[4 * i + 0];
            const g = pixels[4 * i + 1];
            const b = pixels[4 * i + 2];
            const a = pixels[4 * i + 3];
   
            decode = this.decode(r, g, b, a);
            result.push(decode);
        }
        return result;
    }
}

function remap(x){
    return (x/255)*2-1
}


function draw() {
	scale(height / 2, -height / 2, height / 2) //recale to a box [-1,1]times [-1,1]
	background(BKG);

    if(frameCount>=10){
             //noLoop();
        }

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

function doubleClicked() {
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
		wherlWindow.camera.dragMode  =  "PAN";
        wherlWindow.multiDragType = "ALL";
    } 
    if (key === ' ') {
		wherlWindow.doLebedev = !wherlWindow.doLebedev;
        console.log("Use lebedev points  " + wherlWindow.doLebedev);
        histogram.reset();
    } 

    if (key === 'h') {
        if(histogram.drawMode==="REARRANGEMENT"){
            histogram.drawMode="HISTOGRAM";
        } else {
             histogram.drawMode="REARRANGEMENT"
        }
    } 
}

function keyReleased() {
    if (keyCode === SHIFT) {
		wherlWindow.camera.dragMode  =  "ROTATE";
        wherlWindow.multiDragType = "CLOSEST";
    }
}


