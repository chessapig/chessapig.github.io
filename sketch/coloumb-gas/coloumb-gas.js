
let controlPts=[];
let Shader;
let frame=0;

let N = 10;   // number of particles
let stateSize;
let potentialSize=256;
let renderSize=700;

let potentialBuffer;
let potentialShader;
let particleBuffer;
let particleShader;
let renderShader;
let initShader;
let testShader;


function setup() {
	let cnv = createCanvas(renderSize, renderSize,WEBGL);
	cnv.elt.getContext("webgl2");  // request WebGL2
	testShader=createShader(quadVertSrc,testFragSrc);

	myPlane = new p5.Geometry();
    let v0 = createVector(-1, -1, 0);
    let v1 = createVector(1, -1, 0);
    let v2 = createVector(1, 1, 0);
    myPlane.vertices.push(v0, v1, v2);
    myPlane.faces.push([0,1,2]);
    v0 = createVector(-1, -1, 0);
    v1 = createVector(-1, 1, 0);
    v2 = createVector(1, 1, 0);
    myPlane.vertices.push(v0, v1, v2);
    myPlane.faces.push([3,4,5]);
	
	background(100);
  	potentialShader = createShader(quadVertSrc, potFragSrc);
	potentialBuffer = createFramebuffer({ 
		width: potentialSize, 
		height: potentialSize, 
		format: FLOAT 
	});

	stateSize=ceil(sqrt(N));
	console.log(stateSize);
	particleShader = createShader(quadVertSrc, updateFragSrc);
	initShader = createShader(quadVertSrc, initFragSrc);
	particleBuffer = createFramebuffer({ 
		width: stateSize, 
		height: stateSize, 
		format: FLOAT 
	})

	renderShader = createShader(quadVertSrc, renderFragSrc);
	
	//initialize particles
	initShader.setUniform("uSeed",1);
	particleBuffer.begin();
	shader(initShader);
	model(myPlane);
	particleBuffer.end();

	

}

function draw() {

	

	// //draw potential
	potentialShader.setUniform('uStateTex', particleBuffer);
	potentialShader.setUniform('uStateSize', stateSize);
	potentialShader.setUniform('uN', N);
	potentialBuffer.begin();
	shader(potentialShader);
	model(myPlane);
	potentialBuffer.end();

	//update particles
	particleShader.setUniform('uStateTex', particleBuffer);
	particleShader.setUniform('uPotTex', potentialBuffer);
	particleShader.setUniform('uStateSize', stateSize);
	particleShader.setUniform('uN', N);
	particleShader.setUniform('uDt', 0.00001);//timestep
	particleBuffer.begin();
	//shader(particleShader);
	model(myPlane);
	particleBuffer.end();

	//render scene
	renderShader.setUniform('uStateTex', particleBuffer);
	renderShader.setUniform('uStateSize', stateSize);
	renderShader.setUniform('uN', N);
	renderShader.setUniform('uPointSize',0.01)
	background(0);
	shader(potentialShader);
	model(myPlane);
	//image(particleBuffer,1,1,-1,-1);
	//scale(1);
	//plane(2);
	//rect(0,0,0.1,0.1)
}




const quadVertSrc = `#version 300 es
precision highp float;

// p5 built-in attributes
in vec3 aPosition;
in vec2 aTexCoord;

// pass UVs to fragment shader
out vec2 v_uv;

void main() {
    gl_Position = vec4(aPosition, 1.0);  // pass vertex position through

	// compute UV from clip-space coordinates [-1,1] -> [0,1]
    v_uv = aPosition.xy*0.5+0.5;
}
`;


/* POTENTIAL FRAGMENT:
	each pixel in uStateTex correspond to a particle. This function renders the
	potential energy function from this set of particles
	*/
const potFragSrc = `#version 300 es
	precision highp float;
	precision highp sampler2D;
	in vec2 v_uv;
	out vec4 outColor;
	
	uniform sampler2D uStateTex; // particle state (x,y,vx,vy)
	uniform int uStateSize;
	uniform int uN;

	float confiningWell(vec2 pos){
		return dot(pos,pos)*0.001;
	}

	void main(){
	  vec2 pos = (v_uv * 2.0 - 1.0);
	
	  float phi = 0.0;
	
	  // iterate over particle texels
	  for(int j=0; j<uStateSize; ++j){
		for(int i=0; i<uStateSize; ++i){
		  int idx = j * uStateSize + i; //get particle number

		  if(idx >= uN) break; //if particle number greater than fixed value, dont draw

		  vec4 s = texelFetch(uStateTex, ivec2(i,j), 0); //get state of pixel

		  vec2 p = s.xy;
		  vec2 d = pos - p;
		  float r2 = dot(d,d)+0.00001; 
		  float contrib = log(r2)/float(uN); // logrithmic potential
		  phi += contrib;
		}
	  }

	  phi+= confiningWell(pos);
	  phi=fract(phi);
	  // write potential into rgb channel, alpha channels unused
	  outColor = vec4(phi, phi, phi, 1.0);
	}
`;


/* UPDATE FRAGMENT:
   For every texel (particle), read its position, sample potential texture nearby
   and approximate gradient with central differences, then update velocity & pos.
   The particle state is written back as (x,y,vx,vy).
*/
const updateFragSrc = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 v_uv;
out vec4 outColor;

uniform sampler2D uStateTex; // old state
uniform int uStateSize;
uniform int uN;

uniform sampler2D uPotTex;   // potential texture
uniform vec2 uPotSize;

uniform float uDt;
uniform float uEps;

vec2 uvFromIndex(int idx){
  int x = idx % uStateSize;
  int y = idx / uStateSize;
  // texel center in [0,1]
  return (vec2(float(x)+0.5, float(y)+0.5) / vec2(uStateSize));
}

void main(){
  // determine which particle this fragment corresponds to by gl_FragCoord in particle texture space
  ivec2 pix = ivec2(gl_FragCoord.xy) - ivec2(0);
  int idx = pix.y * uStateSize + pix.x;
  if(idx >= uN){
    outColor = vec4(0.0);
    return;
  }

  // fetch particle state
  vec4 s = texelFetch(uStateTex, pix, 0);
  vec2 pos = s.xy;
  vec2 vel = s.zw;

  float uDomainRadius=1.;
  // map particle world pos -> potential texture uv coordinates [0,1]
  vec2 uv = (pos / uDomainRadius) * 0.5 + 0.5;
  // clamp inside pot UVs
  uv = clamp(uv, vec2(0.0), vec2(1.0));

  // finite difference step in uv-space (1 pixel in potential texture)
  vec2 px = vec2(1.0 / uPotSize.x, 1.0 / uPotSize.y);
  // sample potentials
  float phiC = texture(uPotTex, uv).r;
  float phiR = texture(uPotTex, uv + vec2(px.x, 0.0)).r;
  float phiL = texture(uPotTex, uv - vec2(px.x, 0.0)).r;
  float phiU = texture(uPotTex, uv + vec2(0.0, px.y)).r;
  float phiD = texture(uPotTex, uv - vec2(0.0, px.y)).r;

  // gradient (dphi/dx, dphi/dy) in *potential texture space*. Convert to world-space by dividing by pixel step size.
  vec2 grad;
  grad.x = (phiR - phiL) / (2.0 * px.x);
  grad.y = (phiU - phiD) / (2.0 * px.y);

  
  // but those derivatives are per-uv; convert to per-world length:
  // uv -> x_world: x = (uv*2-1)*R => dx/d(uv) = 2R
  grad *= (1.0 / (2.0 * uDomainRadius));

  // force is negative gradient
  vec2 force = -grad;

  // simple integrator: semi-implicit Euler (stable-ish)
  vel += uDt * force; // mass=1
  pos += uDt * vel;

  // simple boundary: reflect at box [-1, 1]
  float R = uDomainRadius;
  if(pos.x < -R){ pos.x = -R; vel.x *= -0.5; }
  if(pos.x >  R){ pos.x =  R; vel.x *= -0.5; }
  if(pos.y < -R){ pos.y = -R; vel.y *= -0.5; }
  if(pos.y >  R){ pos.y =  R; vel.y *= -0.5; }

  outColor = vec4(pos, vel);
}
`;


const testFragSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

void main() {
  vec2 pos = (v_uv * 2.0 - 1.0);
  // Minimal: just output white
  //fragColor = vec4(1.0, 1.0, 1.0, 1.0);

  // Or, if you want to see the framebuffer:
  fragColor = vec4(pos.x*pos.x, pos.y*pos.y, 1.0, 1.0);
}
`;

/* RENDER FRAGMENT:
   For each screen pixel, loop over particles and add Gaussian splats centered
   at each particle position. For N~1000 and 700x700, this is OK for demo.
*/
const renderFragSrc = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D uStateTex;
uniform int uStateSize;
uniform int uN;
uniform float uPointSize; // in world coords

void main(){
  // map uv->world coords [-1,1]
  vec2 pos = (v_uv * 2.0 - 1.0);

  float accum = 0.0;
  // iterate particles (naive)
  for(int j=0; j<uStateSize; ++j){
    for(int i=0; i<uStateSize; ++i){
      int idx = j * uStateSize + i;
      if(idx >= uN) break;
      vec4 s = texelFetch(uStateTex, ivec2(i,j), 0);
      vec2 p = s.xy;
      float d2 = dot(pos - p, pos - p)+0.00001;
      float sigma = uPointSize;
      //accum += exp(-d2 / (sigma*sigma));
	  accum += log(d2+1.);
    }
  }
  //accum = clamp(accum, 0.0, 1.0);
  accum=fract(accum);
  vec3 col = mix(vec3(0.02,0.05,0.12), vec3(1.0,0.85,0.3), accum);
  fragColor = vec4(col, 1.0);
}
`;

/* Initialization fragment shader:
   Fill the pixel array with random values from -1,1
*/
const initFragSrc = `#version 300 es
precision highp float;
uniform float uSeed;

in vec2 v_uv;
out vec4 fragColor;

float rand(vec2 co) {
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453 + uSeed);
}

void main() {
  float x = rand(v_uv) * 2.0 - 1.0;  // position x in [-1,1]
  float y = rand(v_uv + 100.0) * 2.0 - 1.0;  // position y
  float vx = rand(v_uv + 200.0) * 2.0 - 1.0; // velocity x
  float vy = rand(v_uv + 300.0) * 2.0 - 1.0; // velocity y
  fragColor = vec4(x, y, vx, vy);
}`

