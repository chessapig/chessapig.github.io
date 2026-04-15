const wilsonBasePath = "../libraries/wilson";
import { WilsonCPU, WilsonGPU } from "../libraries/wilson/wilson.js";
import * as math from "https://cdn.jsdelivr.net/npm/mathjs@11.11.0/+esm";

// Create a p5 instance JUST for offscreen drawing
const p = new p5(() => {}); // empty sketch


function initWilsonP52D(){
    const canvas = document.querySelector("#demo-canvas-p5");
    const resolution = 1000;
    const options = {
        canvasWidth: resolution,
        onResizeCanvas: () => {
            resizeP5();
            drawFrame();
        },
        useResetButton: true,
        resetButtonIconPath: wilsonBasePath+"/reset.png",
        draggableOptions: {
            draggables: {
                center: [0, 0],
                radius: [1, 0],
            },
            callbacks: {
                drag: drawFrame,
                release: drawFrame
            }
        },
        fullscreenOptions: {
            fillScreen: true,
            useFullscreenButton: true,
            enterFullscreenButtonIconPath: wilsonBasePath+"/enter-fullscreen.png",
            exitFullscreenButtonIconPath: wilsonBasePath+"/exit-fullscreen.png",
        },
    };
    const wilson = new WilsonCPU(canvas, options);
    const pg = p.createGraphics(wilson.canvasWidth, wilson.canvasHeight);
    

    function resizeP5(){
        pg.resizeCanvas(wilson.canvasWidth, wilson.canvasHeight);
    }
    //set up the coordinate system of pg to match wilson
    function transformCoords(pg,wilson){
        pg.resetMatrix();
        pg.scale(pg.width/2,pg.height/2); //scale to [0,2] times [0,2]
        pg.translate(0.5,0.5);
        pg.translate(wilson.worldCenterX,wilson.worldCenterY);
        pg.scale(1/wilson.worldWidth,-1/wilson.worldHeight);
    }
    function drawP5Frame(pg,wilson) {
        pg.clear();
        transformCoords(pg,wilson);
        pg.stroke(255);
        pg.fill(0);
        pg.strokeWeight(0.1);
        let center  = wilson.draggables.center.location;
        center = p.createVector(center[0],center[1])
        let target = wilson.draggables.radius.location;
        target = p.createVector(target[0],target[1])
        pg.circle(center.x,center.y,0.3);
        pg.strokeWeight(0.1);
        pg.line(center.x,center.y,target.x,target.y);
    }

    drawFrame();
    function drawFrame() {
        drawP5Frame(pg,wilson)
        wilson.ctx.clearRect(
            0,
            0,
            wilson.canvasWidth,
            wilson.canvasHeight
        );
        wilson.ctx.drawImage(pg.canvas,0,0,pg.width,pg.height,0,0,wilson.canvasWidth,wilson.canvasHeight);
    }
}


function initWilsonP5frag() {
    const canvas = document.querySelector("#demo-canvas-p5-frag");
    const resolution = 1000;
    const shader = /* glsl */ `
		precision highp float;
		
		varying vec2 uv;
		
		uniform vec2 worldCenter;
		uniform vec2 worldSize;
		uniform vec2 c;

        uniform sampler2D overlay;  
		
		void main(void)
		{
			vec2 z = uv * worldSize * 0.5 + worldCenter;
			
			vec3 color = normalize(
				vec3(
					abs(z.x + z.y) / 2.0,
					abs(z.x) / 2.0,
					abs(z.y) / 2.0
				)
				+ .1 / length(z) * vec3(1.0)
			);
			
			float brightness = exp(-length(z));
			
			for (int iteration = 0; iteration < 200; iteration++)
			{	
				if (length(z) >= 4.0)
				{
					break;
				}
				
				z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
				
				brightness += exp(-length(z));
			}
            vec4 outputColor = vec4(vec3(brightness / 10.0 * color),1.0);
			
            vec2 overlayUV = 0.5*vec2(uv.x,-uv.y)+vec2(0.5,0.5);
            vec4 overlayColor =  texture2D(overlay, overlayUV);

			gl_FragColor =  mix(outputColor, overlayColor, overlayColor.a);
            
		}
	`;
    const options = {
        shader,
        uniforms: {
            worldCenter: [0, 0],
            worldSize: [2, 2],
            c: [0, 1]
        },
        canvasWidth: resolution,
         onResizeCanvas: () => {
            resizeP5();
            drawFrame();
        },
        worldHeight: 3,
        minWorldWidth: 0.00001,
        minWorldHeight: 0.00001,
        minWorldX: -4,
        maxWorldX: 4,
        minWorldY: -4,
        maxWorldY: 4,
        useResetButton: true,
        resetButtonIconPath: wilsonBasePath+"/reset.png",
        interactionOptions: {
            useForPanAndZoom: true,
            onPanAndZoom: drawFrame,
        },
        fullscreenOptions: {
            fillScreen: false,
            useFullscreenButton: true,
            enterFullscreenButtonIconPath: wilsonBasePath+"/enter-fullscreen.png",
            exitFullscreenButtonIconPath: wilsonBasePath+"/exit-fullscreen.png",
        },
        draggableOptions: {
            draggables: {
                complexSlider: [0, 1],
                lineTarget: [0,0]
            },
            callbacks: {
                drag: ({ id, x, y }) => {
                    if(id === "complexSlider"){
                        wilson.setUniforms({ c: [x, y] });
                    }
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
        
        //first, you can draw things in pixel space that are overlayed on the screen.
        pg.stroke(255);
        pg.noFill();
        pg.resetMatrix();
        pg.strokeWeight(10);
        pg.rect(0,0,pg.width,pg.height);
        
        pg.fill(255);
        pg.noStroke();
        pg.textSize(60);
        pg.text("UI overlay", 10,70)

        //then you can draw things which are zoomed with everything
        transformCoords(pg,wilson);
        pg.stroke(255,200);
        pg.fill(0);
        pg.strokeWeight(0.1);
        let center  = wilson.draggables.complexSlider.location;
        center = p.createVector(center[0],center[1])
        let target = wilson.draggables.lineTarget.location;
        target = p.createVector(target[0],target[1])
        pg.circle(center.x,center.y,0.3);
        pg.strokeWeight(0.1);
        pg.line(center.x,center.y,target.x,target.y);
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
initWilsonP52D();
initWilsonP5frag();
