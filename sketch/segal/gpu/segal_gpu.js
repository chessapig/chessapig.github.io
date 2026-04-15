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
		
        uniform float points[32];
		uniform vec2 worldCenter;
		uniform vec2 worldSize;
        uniform int NUM_PTS;
        

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


        void main(void)
        { 
            
            // Normalized pixel coordinates (from 0 to 1)
            vec2 z = uv * worldSize * 0.5 + worldCenter;
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
            vec4 outputColor = vec4(vec3(brightness),1.0);
			
            vec2 overlayUV = 0.5*vec2(uv.x,-uv.y)+vec2(0.5,0.5);
            vec4 overlayColor =  texture2D(overlay, overlayUV);

			gl_FragColor =  mix(outputColor, overlayColor, overlayColor.a);
        }
	`;

    let numPts=5;
    let draggableInit = [];
    for(let i=0;i<numPts;i++){
        draggableInit.push(i*0.1); //x coordinate
        draggableInit.push(0);     // y coordinate
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
            points: draggableInit
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
            worldSize: [wilson.worldWidth, wilson.worldHeight]
        });
        wilson.drawFrame();
        
    }
}
initWilson();
