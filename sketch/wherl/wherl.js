//given location of zeros, and frame, renders the density on a sphere
const rendererFragSrc = `
precision mediump float;

varying vec2 vTexCoord;

const int MAX_SELECTORS = 32;
#define PI 3.1415926535897932384626433832795

uniform vec2 worldCenter;
uniform vec2 worldSize;
uniform int numSelectors;
uniform vec4 selectorValues[MAX_SELECTORS];
uniform vec3 frame[3];
uniform float logL2Norm;


vec2 cMult(vec2 z, vec2 w){
    return vec2(
        z.x*w.x - z.y*w.y,
        z.x*w.y + z.y*w.x
        );  
}

float gain( float x, float k ) 
{
    float a = 0.5*pow(2.0*((x<0.5)?x:1.0-x), k);
    return (x<0.5)?a:1.0-a;
}

float logDensity(vec2 z){
    float logRho=0.;
    for(int i = 0;i<MAX_SELECTORS;i++){
        if(i<numSelectors){
            vec4 proj = selectorValues[i];
            vec2 z0 = vec2(proj.x,proj.y);
            vec2 z1 = vec2(proj.z,proj.w);
            float d = length(cMult(z,z0) -z1);
            logRho += 2.*log(d);
        }
    }
    logRho += -log(1.+pow(length(z),2.))*float(numSelectors);
    return logRho;
}


vec2 worldToComplex(vec2 world,vec3 frame[3]){
    vec3 xBasis = frame[0];
    vec3 yBasis = frame[1];
    vec3 view = frame[2];
    
    vec3 sphere = xBasis*world.x + yBasis*world.y + sqrt(1.-dot(world,world))*view;
    sphere=normalize(sphere);
    return vec2(sphere.x/(1.-sphere.z),sphere.y/(1.-sphere.z)); //stereographic projection
}

vec3 complexToSphere(vec2 z){
    float K = 1.+dot(z,z);
    return vec3(2.*z.x/K, 2.*z.y/K,1.-2./K);
}

vec3 darkColor = vec3(0.33,0.21,0.33);
vec3 lightColor =  vec3(0.9,0.81,0.7);
vec3 bkgColor = vec3(0.17,0.15,0.13);

void main(void)
{ 
    // Normalized pixel coordinates (from 0 to 1)
	vec2 world = worldCenter + (vTexCoord - 0.5) * worldSize;

    //from world coordinates to z coordinates
    vec2 z = worldToComplex(world, frame);

    //from sphere coordinates
    vec3 sphere = complexToSphere(z);

    float sphereHit = 1.-dot(world,world);
    
    vec3 outputColor = bkgColor;
    if(sphereHit>0.){
        float logRho= logDensity(z);
        float normalization = logL2Norm; 
        float rho = exp(logRho-normalization);
        float levelSpacing = 1.;
        float levelWidth=0.06;
        float blobCutoff=1.;

        float diff = normalization-logRho;
        
        if(diff < blobCutoff){
            outputColor= mix(darkColor, lightColor, clamp(diff,0.,1.));
        } else if (mod(diff,levelSpacing)<levelWidth*levelSpacing ) {
            float alpha = pow(clamp((8.0 - diff) / 8.0, 0.0, 1.0),2.0);
            outputColor= mix(outputColor, lightColor, alpha);
        }
        
        outputColor = mix(bkgColor,lightColor,gain(rho,3.));
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
uniform vec4 selectorValues[MAX_SELECTORS];
uniform float logL2Norm;
uniform vec2 iResolution;
uniform sampler2D uLebedevTex;

vec2 cMult(vec2 z, vec2 w){
    return vec2(
        z.x*w.x - z.y*w.y,
        z.x*w.y + z.y*w.x
        );  
}

float density(vec2 z){
    float logRho=0.;
    for(int i = 0;i<MAX_SELECTORS;i++){
        if(i<numSelectors){
            vec4 proj = selectorValues[i];
            vec2 z0 = vec2(proj.x,proj.y);
            vec2 z1 = vec2(proj.z,proj.w);
            float d = length(cMult(z,z0) -z1);
            logRho += 2.*log(d);
        }
    }
    logRho += -log(1.+pow(length(z),2.))*float(numSelectors);

    return exp(logRho-logL2Norm); //return actual density, not the log computation
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
    float index = gl_FragCoord.x + gl_FragCoord.y * iResolution.x;
    if(index>=float(NUM_LEBEDEV_POINTS)){
        return vec2(0.,0.);
    }
    vec3 sphere = getLebedevPt(index);
    float logWeight = readRow(3.0, float(index));  

    //stereographic projection
    vec2 complex = vec2(
                        sphere.x/(1.-sphere.z),
                        sphere.y/(1.-sphere.z)
                    ); 

    return vec2( density(complex) , logWeight);
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
    vec2 pixel = gl_FragCoord.xy;
    gl_FragColor =  encodeRhoWeight( getRhoWeight(pixel) );
    
    }  
`

const computeRandomFragSrc = `
precision highp float;

varying vec2 vTexCoord;

const int MAX_SELECTORS = 32;
#define PI 3.1415926535897932384626433832795

uniform int numSelectors;
uniform vec4 selectorValues[MAX_SELECTORS];
uniform float iFrame;
uniform float logL2Norm;


//return 2d random variable uniformly distributed in (0,1)
float random(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 cMult(vec2 z, vec2 w){
    return vec2(
        z.x*w.x - z.y*w.y,
        z.x*w.y + z.y*w.x
        );  
}

float density(vec2 z){
    float logRho=0.;
    for(int i = 0;i<MAX_SELECTORS;i++){
        if(i<numSelectors){
            vec4 proj = selectorValues[i];
            vec2 z0 = vec2(proj.x,proj.y);
            vec2 z1 = vec2(proj.z,proj.w);
            float d = length(cMult(z,z0) -z1);
            logRho += 2.*log(d);
        }
    }
    logRho += -log(1.+pow(length(z),2.))*float(numSelectors);

    return exp(logRho-logL2Norm); //return actual density, not the log computation
}

//returns density and log of weight
float getRandomRho(vec2 seed){
    vec2 toric = vec2(
                random(seed),
                random(seed+vec2(1.,0.))
            );

    float theta = 2.*PI*toric.x;
    float z = toric.y*2.-1.; //range [-1,1]
    float r = sqrt(1.-z*z);

    //toric to ambient
    vec3 sphere = vec3( 
                r*cos(theta),
                r*sin(theta),
                z
            ); 
    
    //stereographic projection
    vec2 complex = vec2(
                        sphere.x/(1.-sphere.z),
                        sphere.y/(1.-sphere.z)
                    ); 

    return  density(complex);
}

//input vector containing rho
vec4 encodeFloat(float v) {
    v = clamp(v, 0.0, 1.0);

    vec4 enc = fract(v * vec4(
        1.0,
        255.0,
        65025.0,
        160581375.0
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
    gl_FragColor =  encodeFloat( getRandomRho(vTexCoord + vec2(0.,iFrame*1.618) )); 
}  

`


const FRG = '#E6CFB3'; //background color
const BKG = '#2c2621'; //foreground color
const NUM_LEBEDEV_POINTS = 5294;

let parent = "wherl-canvas";

let wherlWindow;
let histogramWindow;
let histogram;
let windows = [];
let canvasSize;
let gl;
let lebedevTex;

function preload() {
    rubikFont = loadFont('../libraries/fonts/Rubik-Regular.ttf');
    lebedevTex = loadImage("lebedev.png");
    
}

function setup() {
   
	let elem = document.getElementById(parent);
	boundingRect = elem.getBoundingClientRect();
    // get computed border size
    let style = getComputedStyle(elem);
    let borderLeft = parseFloat(style.borderLeftWidth);
    let borderRight = parseFloat(style.borderRightWidth);
    let canvasWidth =  boundingRect.width - borderLeft - borderRight; //sets size of canvas.
    let canvasHeight =  boundingRect.height - borderLeft - borderRight; //sets size of canvas.
    canvasSize = canvasHeight;
	canvas = createCanvas(canvasWidth, canvasHeight , WEBGL);
	canvas.parent(parent);

    let camera = new Camera3D({
        zoom: -0.1,
        zoomRange:[0.7,20]
    });

    let selectors = []
    let numSelectors=6;
    let selectorRadius = 1;
    for(let i=0;i<numSelectors;i++){
        z=Complex.polar(selectorRadius,2*PI*i/numSelectors);
        selectors.push(new SphereSelector(z,
            { camera: camera }
        ));
    }

    histogram = new Histogram({
        numBoxes:1000,
        range: [0,1],
        color: FRG,
        drawMode: "REARRANGEMENT"
    });
  

	wherlWindow = new WherlWindow({
		pixels: canvasSize,
        x: -2, y: -1, width: 2,
        selectors: selectors,
        camera: camera,
        computePtsPerFrame: 10000,
        histogram: histogram,
        histogramMaxEntries: 10,
        doLebedev: true,
	});

    histogramWindow = new HistogramWindow({
        pixels: canvasSize/2,
        x: 0, y: -1, width: 2,
        histogram: histogram,
        BKG: color(25,25,25),
        camEnabled: false,
    })

	windows = [wherlWindow,histogramWindow]; 
    noSmooth();
}




class Histogram{
    constructor(options={}){
        const defaults = {
            numBoxes:100,
            range: [0,1], //range of histogram points
            color: color(255),
            drawLabels:true,
            drawMode:"GRAPH", //options are "GRAPH" and "HISTOGRAM" and "REARRANGEMENT"
            drawEntropy: true
		};
        Object.assign(this, defaults, options);
        this.reset();
    }

    reset(){
        this.histogram = new Array(this.numBoxes).fill(0);
        this.numEntries=0;
    }

    include(x, weight=1){
        let value = map(x,this.range[0],this.range[1],0,1); //remap x to 0,1
        
        if(value<0 || value>= 1){ return false;} //only accept points in range
        if(weight==0){return false;} //only accepts points with positive weight
        let boxNumber = floor(value*this.numBoxes);
        this.histogram[boxNumber]+=weight;
        this.numEntries+=weight;
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
                ctx.rectMode(CORNERS)
                const dx = 1/this.numBoxes;
                for(let i=0;i<this.numBoxes;i++){
                    x = i/this.numBoxes;
                    y =  this.histogram[i]/this.numEntries*this.numBoxes/10;
                    ctx.rect(x,0,x+dx,y);
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
                let rearrangement = this.computeRearrangement();
                let dy = 1/this.numBoxes;
                for(let i=0;i<this.numBoxes;i++){
                    y = i/this.numBoxes;
                    x = rearrangement[i];
                    ctx.rect(0,y,x,y+dy);
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
            ctx.translate(0.3,1-labelSize*2);
            ctx.scale(1,-1);
            ctx.noStroke();
            ctx.fill(this.color);
            ctx.textAlign(ctx.LEFT);
            ctx.text("Entropy " + nf(100*this.wherlEntropy(t => pow(t,3)),1,3),0,0);
        }


        ctx.pop();

    }

    computeRearrangement(){
        let rearrangement = new Array(this.numBoxes).fill(0);
        //compute integral of histogram, inverted.
        for(let i=0;i<this.numBoxes;i++){
            for(let j=i;j<this.numBoxes;j++){
                rearrangement[i]+=this.histogram[j]/this.numEntries;
            }
        }
        return rearrangement;
    }


}

class HistogramWindow extends GraphicsWindowCamera{
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
            defaultSelectorValueUniform: [0,0,0,0],
            multiDragType: "CLOSEST",
            doLebedev: false
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
        let p = this.getPolynomial();
        this.uniforms.logL2Norm = log(p.sphericalNormSq());
        let didUpdate = super.update();
        if(didUpdate){
            this.histogram.reset();
        }
        this.generateHistogram();
        
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
        shader.setUniform("logL2Norm", this.uniforms.logL2Norm);

        // draw full quad
        ctx.push();
        ctx.resetMatrix();
        ctx.noStroke();
        ctx.shader(shader); 
        ctx.rectMode(CENTER);
        //ctx.clear();

        
        ctx.rect(0, 0, ctx.width, ctx.height);

        ctx.pop();
    }

    getPolynomial(){
        let projRoots = [];
        for(let s of this.selectors){
            projRoots.push(s.complexToProjective());
        }
        this.polynomial=Polynomial.fromProjectiveRoots(projRoots);
        return this.polynomial;
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
        return [r +
                g / 255 +
                b / 65025 +
                a / 160581375,
                1];
                
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

//for function G taking in a list of points on P1, computes the gradient
function projectiveGradient(G){

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
		wherlWindow.camera.dragMode  =  "PAN";
        wherlWindow.multiDragType = "ALL";
    } 
    if (key === ' ') {
		wherlWindow.doLebedev = !wherlWindow.doLebedev;
        console.log("Use lebedev points  " + wherlWindow.doLebedev);
        histogram.reset();
    } 
}

function keyReleased() {
    if (keyCode === SHIFT) {
		wherlWindow.camera.dragMode  =  "ROTATE";
        wherlWindow.multiDragType = "CLOSEST";
    }
}


