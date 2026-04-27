const wilsonBasePath = "../../libraries/wilson";
import { WilsonCPU, WilsonGPU } from "../../libraries/wilson/wilson.js";
import * as math from "https://cdn.jsdelivr.net/npm/mathjs@11.11.0/+esm";

// Create a p5 instance JUST for offscreen drawing
const p = new p5(() => {}); // empty sketch



function initWilson() {
    const canvas = document.querySelector("#segal-canvas");
    const resolution = 1000;
    const shader = /* glsl */ `
		precision highp float;
		
		varying vec2 uv;

        const int MAX_POINTS = 16;
        #define MAX_ITERATIONS 40

		
        uniform float points[32];
		uniform vec2 worldCenter;
		uniform vec2 worldSize;
        uniform int NUM_PTS;
        uniform float hbar;
        uniform float time;
        

        uniform sampler2D overlay;

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
            for(int i = 0;i<MAX_POINTS;i++){
                if(i<NUM_PTS){
                    vec2 root = getPoint(i);
                    vec2 delta = z-root;
                    float magSqDelta = dot(delta,delta);
                    logDensity += 2.*log(magSqDelta)- magSqDelta/hbar;
                    gradLogDensity += 4.*delta / magSqDelta - 2.*delta/hbar;
                }
            }
            float density =  exp(logDensity);

            vec2 gradDensity = gradLogDensity*pow(density,0.1);
            return vec3(density, gradDensity); //EDIT THIS MAYBE
        }

        //takes in a point z, and outputs the time it too to reach a selector, and which selector it hit
        vec2 flow(vec2 z){
            float learningRate=0.01;
            float seedSize=0.03;
            float squareSeedSize = seedSize*seedSize;
            float numSteps = 0.;
            bool doBreak=false;
            vec2 minZero = vec2(100.,-1.);
            for(int iter=0; iter < MAX_ITERATIONS; iter++) {
                vec2 grad = getDensity(z).yz;
                z = z-grad*learningRate;
                for(int i = 0;i<MAX_POINTS;i++){
                    if(i<NUM_PTS){
                        vec2 delta = z-getPoint(i);
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
            
            for(int i = 0;i<MAX_POINTS;i++){
                    if(i<NUM_PTS){
                        vec2 delta = z-getPoint(i);
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
            vec2 z = uv * worldSize * 0.5 + worldCenter;
            vec3 densityInfo = getDensity(z);
            float density = densityInfo.x;
            vec2 gradDensity = densityInfo.yz;

            float ld= -log(density);
            float cutoff=1.;
            float levelSpacing=0.3;

            float levelSets=(-10.-ld)*(1.-smoothstep(levelSpacing/10.,levelSpacing/10.+0.01,abs(mod(ld,levelSpacing))));
            float blob = clamp(levelSets+density*30.,0.,1.);
            vec2 flow = flow(z);
            float flowTime = flow.x;
            float flowZero = flow.y;
            vec3 flowColor;
            if(flowZero<0.){
                flowColor = vec3(0.);
            } else {
                flowColor = hsv2rgb(vec3(flowZero/float(NUM_PTS) , 0.8, 0.7 ) );
            }
            

            float dt = 1./float(MAX_ITERATIONS);
            float basinOutside = (1.-step(0.,1.-flowTime));
            float basinBoundries =  (1.-smoothstep(0.4,0.6,1.-flowTime))-basinOutside;
            vec3 basinInside = flowColor;
            
            (1.-smoothstep(0.4,0.6,1.-flowTime))-basinOutside;
             
    
            vec3 outputColor = vec3(basinBoundries)+ basinInside;
			
			gl_FragColor =  vec4(outputColor,1.);
        }
	`;

    let numPts=10;
    let draggableInit = [];
    let radius = 1;
    for(let i=0;i<numPts;i++){
        let theta = 2*3.14159*i/numPts;
        draggableInit.push(radius*math.cos(theta)); //x coordinate
        draggableInit.push(radius*math.sin(theta));     // y coordinate
    }
    let draggableJson={};
    for (let i = 0; i < numPts; i++) {
        draggableJson[`c${i}`] =  [draggableInit[2*i],draggableInit[2*i+1]];
    }
    function draggablesToArray(draggables){
        let array = [];
        for (let i = 0; i < numPts; i++) {
            const p = draggables[`c${i}`].location;
            array.push(p[0]);
            array.push(p[1]);
        }
        return array;
    }
    const options = {
        shader,
        uniforms: {
            worldCenter: [0, 0],
            worldSize: [2, 2],
            NUM_PTS: numPts,
            points: draggableInit,
            hbar: 1,
            time:1,
        },
        canvasWidth: resolution,
         onResizeCanvas: () => {
            resizeP5();
            drawFrame();
        },
        worldHeight: 3,
        minWorldWidth: 0.00001,
        minWorldHeight: 0.00001,
        minWorldX: -100,
        maxWorldX: 100,
        minWorldY: -100,
        maxWorldY: 100,
        useResetButton: true,
        useWebGL2: true,
        resetButtonIconPath: wilsonBasePath+"/reset.png",
        interactionOptions: {
            useForPanAndZoom: true,
            onPanAndZoom: drawFrame,
        },
        fullscreenOptions: {
            fillScreen: true,
            useFullscreenButton: true,
            enterFullscreenButtonIconPath: wilsonBasePath+"/enter-fullscreen.png",
            exitFullscreenButtonIconPath: wilsonBasePath+"/exit-fullscreen.png",
        },
        draggableOptions: {
            draggables: draggableJson,
            callbacks: {
                drag: ({ id, x, y }) => {
                    wilson.setUniforms({ points: draggablesToArray(wilson.draggables) });
                    drawFrame();
                },
                release: drawFrame
            }
        }
    };
    const wilson = new WilsonGPU(canvas, options);
    wilson.createFramebufferTexturePair({
        id: "overlay",
        textureType: "unsignedByte",
    });
    wilson.useFramebuffer(null);
    const pg = p.createGraphics(wilson.canvasWidth, wilson.canvasHeight);
    
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
            worldSize: [wilson.worldWidth, wilson.worldHeight],
            time: (Date.now()/1000)%1
        });
        wilson.drawFrame();
        
    }
}
initWilson();
