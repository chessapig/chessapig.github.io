
// Vertex shader code
let vertexShader = `
attribute vec3 aPosition; // Vertex position
attribute vec3 aNormal;   // Vertex normal

varying vec3 vNormal;     // Interpolated normal
varying vec3 vPosition;   // Vertex position in view space

uniform mat4 uModelViewMatrix;  // Model-view matrix
uniform mat4 uProjectionMatrix; // Projection matrix

void main() {
  // Transform the normal into view space
  vNormal = normalize(mat3(uModelViewMatrix) * aNormal);

  // Transform the vertex position into view space
  vec4 viewPosition = uModelViewMatrix * vec4(aPosition, 1.0);
  vPosition = viewPosition.xyz;

  // Transform the vertex position into clip space
  gl_Position = uProjectionMatrix * viewPosition;
}`;

let fragmentShader = `precision mediump float;

uniform sampler2D u_referenceImage;
uniform float scaleRef;
uniform bool doNormal;

varying vec3 vNormal;     // Interpolated normal
varying vec3 vPosition;   // Interpolated position

void main() {
  // Normalize the interpolated normal
  vec3 normal = normalize(vNormal);

  // Visualize the normal (map [-1, 1] to [0, 1] for RGB display)
  vec3 color = normal * 0.5*scaleRef + 0.5;
	vec2 lookupUV = vec2(color.r, color.g);
	vec4 refColor = texture2D(u_referenceImage, lookupUV);

	gl_FragColor = refColor;
  if(doNormal) {
    gl_FragColor = vec4(color,1.0);
  }
}`;


let layer;
let toggle=0;
let refs = [
  'baloon.jpeg',
  'escher.jpg',
  'ink.jpg',
  'orb.jpeg',
  'soccer.jpeg',
  'obama.jpg',
  'earth.jpg',
  'doorknob1.jpeg',
  'doorknob2.jpeg'
]
let currentRef=1;
let doNormal=false;
let myWidth=700;
let myHeight=700;
let scaleRef=0.97; // percentage of refrence circle used

let shape;
let refImage;
let maskedRef;


function preload(){
	
}

function setup() {
	createCanvas(myWidth*2, myHeight,WEBGL);
	layer3D = createFramebuffer();
  refLayer = createFramebuffer();

	loadImages();
  shape= loadModel('models/bunny.obj')
  
	lookupShader = createShader(vertexShader, fragmentShader);

  mask = createGraphics(myWidth, myHeight);
  mask.fill(255);
  mask.noStroke();
  mask.ellipse(myWidth/2,myHeight/2,myWidth*scaleRef,myHeight*scaleRef);

	
}

function draw() {
	noStroke();
	layer3D.begin();
	background(100);
	
	scale(10);
	 // Enable orbiting with the mouse.
  orbitControl();
	//ortho();
	
	
  // Draw the torus.
	//normalMaterial();
	lookupShader.setUniform('u_referenceImage', refImage);
	lookupShader.setUniform('scaleRef', scaleRef);
  lookupShader.setUniform('doNormal', doNormal);

	shader(lookupShader);
  //sphere(20);
	torus(20,10,100,50);
  //shape.computeNormals();
  //model(shape);
	//ellipsoid(15, 20, 20,100);
	
	layer3D.end();

  refLayer.begin();
  //background(100);
  let windowSize=0.5; // sets size of refLayer window
  //refImage.resize(myWidth*2,myHeight*2);
  maskedRef.mask(mask);
  image(maskedRef,-myWidth/2,-myHeight/2,myWidth*windowSize,myHeight*windowSize);
  fill(255)
  //circle(-myWidth/4,-myHeight/4,10);
  refLayer.end();
	
	
	push();
  texture(layer3D);
  translate(-myWidth/2,0);
	plane(width, height);
  pop();

  if(!doNormal){
    push();
    texture(refLayer);
    translate(myWidth/2,0);
    plane(width, height);
    pop();
  }
	
	
}

function keyPressed() {
  
  let doUpdate=false;
  
  if(keyCode === RIGHT_ARROW){
    currentRef+=1;
    doUpdate=true;
   
    
  } else if(keyCode === LEFT_ARROW){
    currentRef-=1;
    doUpdate=true;
  }
  if(currentRef<0){ currentRef=refs.length;}
  else if(currentRef > refs.length){ currentRef=0;}

  if(currentRef==0){ doNormal=true;}
  else { doNormal=false;}

  if(doUpdate){
    loadImages()
  }
}

function loadImages(){
  if(currentRef>=1){
    refImage = loadImage('reference/'+refs[currentRef-1]);  
    maskedRef = loadImage('reference/'+refs[currentRef-1]);
  }

}