const wilsonBasePath = "../../libraries/wilson";
import { WilsonCPU, WilsonGPU } from "../../libraries/wilson/wilson.js";
import * as math from "https://cdn.jsdelivr.net/npm/mathjs@11.11.0/+esm";

// Create a p5 instance JUST for offscreen drawing
const p = new p5(() => {}); // empty sketch


//gets frame from view vector. 
function getFrame(viewVector){
    let view = p.createVector(viewVector[0],viewVector[1],viewVector[2]).normalize();
    let vert = p.createVector(0.,0.,1.);

    let yBasis = vert.sub(view.copy().mult(view.dot(vert))).normalize(); //project vertical onto perpendicular to view
    let xBasis = yBasis.copy().cross(view); //project vertical onto perpendicular to view

    return [xBasis, yBasis, view];
}

//returns 2 vector containing the stereographic projection of the of the uv coordinates of the screen.
function worldToComplex(w,viewVector){
    let world=p.createVector(w[0],w[1]); 
    const [xBasis, yBasis, view] = getFrame(viewVector);
    let sphereHit = 1.-world.magSq();
    if(sphereHit>0){ //only add the points that hit sphere
        let sphere = xBasis.copy().mult(world.x)
                .add(yBasis.copy().mult(world.y))
                .add(view.copy().mult(math.sqrt(sphereHit)));
        let z = p.createVector(sphere.x/(1-sphere.z),sphere.y/(1-sphere.z));
        return z;
    } 
    return false;
}

//class containing all my zeros. Handles all the logic about rendering and 
class Zeros{
    constructor(zs=[createVector(0,0)]){ // store as array of p5vectors, representing the complex coordinates
        this.zs = zs;
        this.degree=zs.length;
    }

    toComplex(){
        return this.zs; 
    }

    //returns array of poitns on unit sphere under stereographic projection
    toSphere(){
        return this.zs.map((z) => {
            return p.createVector(
                2*z.x/(1+z.magSq()),
                2*z.y/(1+z.magSq()),
                1-2/(1+z.magSq())
            )
        });
    }

    //given view direction, outputs how the zeros appear in that direction
    toWorld(viewVector){
        let sphere = this.toSphere();
        return sphere.map((x) => {
            const [xBasis, yBasis, view] = getFrame(viewVector);
            return p.createVector(
                xBasis.dot(x),
                yBasis.dot(x),
                view.dot(x) //include the z coordiante
            )
        });
    }


    //turns current setting of draggables in wilson to zeros
    fromDraggables(wilson){
        let draggables = wilson.draggables;
        for (let i = 0; i < this.degree; i++) {
            if(draggables[`c${i}`]){
                const world = draggables[`c${i}`].location;
                
                let z = worldToComplex(world,wilson.viewVector);
                if(z){
                    this.zs[i]=z;
                }
            }
        }
        return this.zs;
    }

    //sets values of draggables from the zeros
    setDraggables(wilson){
        let worlds = this.toWorld(wilson.viewVector);
        for (let i = 0; i < this.degree; i++) {
            const d = wilson.draggables[`c${i}`];
            if(d){
                let world = worlds[i];
                d.location = [world.x,world.y];
            }
        }
    }

    getUniformArray(){ //outputs the thing that my shader takes in...
        let array = [];
        for (let z of this.zs) {
            array.push(z.x);
            array.push(z.y);
        }
        return array;
    }

    getInitJson(viewVector){
        let draggableInitJson={};
        let worlds = this.toWorld(viewVector);
        for (let i = 0; i < this.degree; i++) {
            if(worlds[i].z>=0){ //only include draggables which are in front
                draggableInitJson[`c${i}`] =  [worlds[i].x,worlds[i].y];
            }
        }
        return draggableInitJson;
    }
}







function initWilson() {
    const canvas = document.querySelector("#wherl-canvas");
    const resolution = 1000;
    const shader = /* glsl */ `
		precision highp float;
		
		varying vec2 uv;

        #define PI 3.1415926535897932384626433832795
        const int MAX_POINTS = 16;
		
        uniform float points[32];
		uniform vec2 worldCenter;
		uniform vec2 worldSize;
        uniform int NUM_PTS;
        uniform vec3 viewVector;
        

        uniform sampler2D overlay;

        float hue2rgb(float f1, float f2, float hue) {
            if (hue < 0.0)
                hue += 1.0;
            else if (hue > 1.0)
                hue -= 1.0;
            float res;
            if ((6.0 * hue) < 1.0)
                res = f1 + (f2 - f1) * 6.0 * hue;
            else if ((2.0 * hue) < 1.0)
                res = f2;
            else if ((3.0 * hue) < 2.0)
                res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
            else
                res = f1;
            return res;
        }

        vec3 hsl2rgb(vec3 hsl) {
            vec3 rgb;
            
            if (hsl.y == 0.0) {
                rgb = vec3(hsl.z); // Luminance
            } else {
                float f2;
                
                if (hsl.z < 0.5)
                    f2 = hsl.z * (1.0 + hsl.y);
                else
                    f2 = hsl.z + hsl.y - hsl.y * hsl.z;
                    
                float f1 = 2.0 * hsl.z - f2;
                
                rgb.r = hue2rgb(f1, f2, hsl.x + (1.0/3.0));
                rgb.g = hue2rgb(f1, f2, hsl.x);
                rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/3.0));
            }   
            return rgb;
        }

        vec2 getPoint(int i) {
            vec2 p = vec2(0.,0.);
            if (i == 0) p = vec2(points[0], points[1]);
            else if (i == 1) p = vec2(points[2], points[3]);
            else if (i == 2) p = vec2(points[4], points[5]);
            else if (i == 3) p = vec2(points[6], points[7]);
            else if (i == 4) p = vec2(points[8], points[9]);
            else if (i == 5) p = vec2(points[10], points[11]);
            else if (i == 6) p = vec2(points[12], points[13]);
            else if (i == 7) p = vec2(points[14], points[15]);
            else if (i == 8) p = vec2(points[16], points[17]);
            else if (i == 9) p = vec2(points[18], points[19]);
            else if (i == 10) p = vec2(points[20], points[21]);
            else if (i == 11) p = vec2(points[22], points[23]);
            else if (i == 12) p = vec2(points[24], points[25]);
            else if (i == 13) p = vec2(points[26], points[27]);
            else if (i == 14) p = vec2(points[28], points[29]);
            else if (i == 15) p = vec2(points[30], points[31]);
            return p;
        }

        float logDensity(vec2 z){
            float logRho=0.;
            for(int i = 0;i<MAX_POINTS;i++){
                if(i<NUM_PTS){
                    float d = length(z-getPoint(i));
                    logRho += 2.*log(d);
                }
            }
            logRho += -log(1.+pow(length(z),2.))*float(NUM_PTS);
            return logRho;
        }


        vec3 worldToSphere(vec2 world,vec3 view){
            view = normalize(view);
            vec3 vert = vec3(0.,0.,1.);
            vec3 yBasis = normalize(vert-view*dot(view,vert)); //project vertical onto perpendicular to view
            vec3 xBasis = cross(yBasis,view); //project vertical onto perpendicular to view
            
            vec3 sphere = xBasis*world.x + yBasis*world.y + sqrt(1.-dot(world,world))*view;
            return normalize(sphere);
        }

        vec2 sphereToPlane(vec3 sphere){
            return vec2(sphere.x/(1.-sphere.z),sphere.y/(1.-sphere.z));
        }

        void main(void)
        { 
            // Normalized pixel coordinates (from 0 to 1)
            vec2 world = uv * worldSize * 0.5 + worldCenter;

            //from world coordinates to sphere coordinates
            vec3 sphere  = worldToSphere(world, viewVector);
            vec2 z = sphereToPlane(sphere);

            float sphereHit = 1.-dot(world,world);
            
            float ld= -logDensity(z);
            float cutoff=1.;
            float levelSpacing=0.3;
            float brightness=0.;
            if(ld<cutoff){
                brightness=ld-cutoff+1.;
            } else {
                //brightness=(1.5-ld)*(1.-smoothstep(levelSpacing/10.,levelSpacing/10.+0.01,abs(mod(ld,levelSpacing))));
            }
            brightness=(1.5-ld)*(1.-smoothstep(levelSpacing/10.,levelSpacing/10.+0.01,abs(mod(ld,levelSpacing))));
            vec4 outputColor = vec4(vec3(brightness+0.2),1.0);
            
            if(sphereHit>0.){
                outputColor = vec4(
                    hsl2rgb(vec3(
                    (atan(z.y,z.x)/(2.*PI)),   //hue
                    0.6,             //saturation
                    brightness //length(z)/(1.+length(z))        //lightness
                    )
                ),1.);
            } else {
                outputColor = vec4(0.1,0.1,0.1,1.);
            }

            float selectorBrightness=0.;
            for(int i = 0;i<MAX_POINTS;i++){
                if(i<NUM_PTS){
                    vec2 z = getPoint(i);
                    float K = 1. + z.x*z.x + z.y*z.y;
                    vec3 selectorSpherePos = vec3(2.*z.x/K, 2.*z.y/K, 1.-2./K);
                    selectorBrightness += 1.-smoothstep(0.01,0.02,abs(dot(selectorSpherePos,sphere)-1.));
                }
            }
            if(sphereHit<=0.){
                selectorBrightness=0.;
            }
			
            outputColor+=vec4(vec3(selectorBrightness),1.);

            vec2 overlayUV = 0.5*vec2(uv.x,-uv.y)+vec2(0.5,0.5);
            vec4 overlayColor =  texture2D(overlay, overlayUV);

			gl_FragColor =  mix(outputColor, overlayColor, overlayColor.a);
        }
	`;

    let numPts=5;
    let startingZeros = [];
    for(let i=0;i<numPts;i++){
        let t = i/numPts*2*math.pi;
        startingZeros.push(p.createVector(math.cos(t),math.sin(t)));
    }
    let zeros = new Zeros(startingZeros);
    let defaultViewVector=[1./math.sqrt(2.),0.,1./math.sqrt(2.)];
    
     // rotate vector v around normalized axis by angle (radians) using Rodrigues' formula
    function rotateAroundAxis(v, axis, angle){
        const k = axis.copy().normalize();
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const term1 = v.copy().mult(cosA);
        const term2 = k.copy().cross(v).mult(sinA);
        const term3 = k.copy().mult(k.dot(v) * (1 - cosA));
        return term1.add(term2).add(term3);
    }

    // rotate wilson.viewVector based on drag deltas (dx, dy)
    function rotateViewForDrag(wilson, dx, dy){
        const sensitivity = 1; // tweak to taste (radians per world-unit drag)
        const angleYaw = -dx * sensitivity;   // horizontal drag -> yaw around world Z
        const anglePitch = dy * sensitivity;  // vertical drag -> pitch around camera-right axis

        let view = p.createVector(wilson.viewVector[0], wilson.viewVector[1], wilson.viewVector[2]);

        // yaw around global vertical (0,0,1)
        view = rotateAroundAxis(view, p.createVector(0,0,1), angleYaw);

        // recompute camera right axis for pitch and apply pitch
        const [xBasis] = getFrame([view.x, view.y, view.z]);
        view = rotateAroundAxis(view, xBasis, anglePitch);

        view.normalize();
        wilson.viewVector = [view.x, view.y, view.z];

        // update shader uniform and reposition any existing draggables to the new projection
        wilson.setUniforms({ viewVector: wilson.viewVector });
        zeros.setDraggables(wilson);
    }
    
    const options = {
        shader,
        uniforms: {
            worldCenter: [0, 0],
            worldSize: [2, 2],
            NUM_PTS: numPts,
            points: zeros.getUniformArray(),
            viewVector: defaultViewVector,
        },
        canvasWidth: resolution,
         onResizeCanvas: () => {
            resizeP5();
            drawFrame();
        },
        worldHeight: 3,
        minWorldWidth: 0.00001,
        minWorldHeight: 0.00001,
        minWorldX: -2,
        maxWorldX: 2,
        minWorldY: -1.3,
        maxWorldY: 1.3,
        useResetButton: true,
        useWebGL2: true,
        resetButtonIconPath: wilsonBasePath+"/reset.png",
        interactionOptions: {
            useForPanAndZoom: true,
            onPanAndZoom: drawFrame,
            callbacks: {
                mousedrag: ({ x, y, xDelta, yDelta, event }) => {
                    rotateViewForDrag(wilson, xDelta, yDelta);
                },
            }
            
        },
        fullscreenOptions: {
            fillScreen: true,
            useFullscreenButton: true,
            enterFullscreenButtonIconPath: wilsonBasePath+"/enter-fullscreen.png",
            exitFullscreenButtonIconPath: wilsonBasePath+"/exit-fullscreen.png",
        },
        draggableOptions: {
            draggables: zeros.getInitJson(defaultViewVector),
            callbacks: {
                drag: ({ id, x, y }) => {
                    updateZerosFromSelectors();
                },
                release: updateZerosFromSelectors
            }
        }
    };
    const wilson = new WilsonGPU(canvas, options);
    wilson.viewVector= defaultViewVector;
    wilson.createFramebufferTexturePair({
        id: "overlay",
        textureType: "unsignedByte",
    });
    wilson.useFramebuffer(null);
    const pg = p.createGraphics(wilson.canvasWidth, wilson.canvasHeight);
    
    function updateZerosFromSelectors(){
        zeros.fromDraggables(wilson);
        wilson.setUniforms({ points: zeros.getUniformArray() });
        drawFrame();    
    }

    function resizeP5(){
        pg.resizeCanvas(wilson.canvasWidth,wilson.canvasHeight);
    }
    //set up the coordinate system of pg to match wilson
    function transformCoords(pg,wilson){
        pg.resetMatrix();
        pg.scale(pg.width,pg.height); //scale to [0,1] times [0,1]
        pg.translate(0.5,0.5);
        pg.scale(1/wilson.worldWidth,-1/wilson.worldHeight);
        pg.translate(-wilson.worldCenterX,-wilson.worldCenterY);
    }

    
    function drawP5Frame(pg,wilson) {
        pg.clear();
    }

    drawFrame();
    function drawFrame() {
        drawP5Frame(pg,wilson);
        wilson.setTexture({
            id: "overlay",
            data: pg.canvas,
        });
        wilson.setUniforms({
            worldCenter: [wilson.worldCenterX, wilson.worldCenterY],
            worldSize: [wilson.worldWidth, wilson.worldHeight]
        });
        wilson.drawFrame();
        
    }
}
initWilson();
