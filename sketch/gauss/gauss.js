
// Vertex shader code
let vertexShader = `#version 300 es

in vec3 aPosition; // Vertex position
in vec3 aNormal;   // Vertex normal
in vec2 aTexCoord;

out vec3 vNormal;     // Interpolated normal
out vec2 vTexCoord;
out vec3 vViewPos;
out vec3 vViewNormal;

uniform mat4 uModelViewMatrix;  // Model-view matrix
uniform mat4 uProjectionMatrix; // Projection matrix

void main() {
  // Transform the normal into view space
  vNormal = normalize(mat3(uModelViewMatrix) * aNormal);

  vec4 viewPos = uModelViewMatrix * vec4(aPosition, 1.0);
  vViewPos = viewPos.xyz;

  mat3 normalMatrix = transpose(inverse(mat3(uModelViewMatrix)));
  vViewNormal = normalize(normalMatrix * aNormal);

  // Transform the vertex position into clip space
  gl_Position = uProjectionMatrix * viewPos;

  // Pass along data to the fragment shader
  vTexCoord = aTexCoord;
}`;

//fragment shader for "lookup", which uses the normal to refrence an image
let fragLookup = `#version 300 es
precision mediump float;

uniform  sampler2D u_referenceImage;
uniform float scaleRef;
uniform bool doNormal;

in vec3 vNormal;     // Interpolated normal
in vec3 vPosition;   // Interpolated position


out vec4 fragColor;  // Output color

void main() {
  // Normalize the interpolated normal
  vec3 normal = normalize(vNormal);

  //if applying surfaces with an inside and outside, this makes inside faces consistant.
  //if not, this causes some weirdness on the boundaries due to how nromals are computed
  if(normal.b<0.){
     //normal=normal*-1.;
  }

  // Visualize the normal (map [-1, 1] to [0, 1] for RGB display)
  vec3 color = normal * 0.5*scaleRef + 0.5;
  
	vec2 lookupUV = vec2(color.r, color.g);
	vec4 refColor = texture(u_referenceImage, lookupUV);

	fragColor = refColor;
  if(doNormal) {
    fragColor = vec4(color,1.0);
  }
}`;

let fragNormals = `#version 300 es
precision highp float;

in vec3 vNormal;     // Interpolated normal
out vec4 fragColor;  // Output color

void main() {
  vec3 normal = normalize(vNormal);
  vec3 color = normal * 0.5 + 0.5;
  fragColor = vec4(color,1.0);
}`;

let fragCurvature = `#version 300 es
precision highp float;

in vec3 vViewPos;   // view-space position
in vec3 vViewNormal; // view-space normal

uniform  vec2 u_resolution;
uniform int mode; //0 for first fundamental form, 1 for second fundamental form

out vec4 fragColor;

void main() {
  //depth ranges from vViewPos.z=100 to vViewPos.z=10000
  float cameraNear=100.;
  float cameraFar=10000.;
  float depth = -1.*vViewPos.z/cameraFar;
  float scale=.1;

  // Compute tangent vectors as partial derivatives of position
  //we normalize by depth in hope that our basis vectors won't change with depth 
  vec3 Xu = dFdx(vViewPos)/depth*scale;
  vec3 Xv = dFdy(vViewPos)/depth*scale;

  // First fundamental form coefficients
  float E = dot(Xu, Xu);
  float F = dot(Xu, Xv);
  float G = dot(Xv, Xv);

  // Compute derivatives of normal for second fundamental form
  vec3 Nu = dFdx(vViewNormal)/depth*scale;
  vec3 Nv = dFdy(vViewNormal)/depth*scale;

  // Second fundamental form coefficients (shape operator)
  float L = -dot(Nu, Xu);
  float M = -0.5 * (dot(Nu, Xv) + dot(Nv, Xu)); // symmetrized mixed derivative
  float N = -dot(Nv, Xv);

  // Compute Gaussian curvature: K = (L*N - M^2) / (E*G - F^2)
  float denom = E * G - F * F;
  float K = 0.0;
  if (denom != 0.0) {
    K = (L * N - M * M) / denom;
  }

  // Map K for visualization (adjust scaling and bias for your mesh)
  float kVis = clamp(0.5 + K, 0.0, 1.0);

  //fragColor = vec4(E,F,G, 1.0);
  //fragColor = vec4(vec3(kVis), 1.0);

  if (mode == 0) {
    fragColor = vec4(E , F , G , 1.0);
  } else if (mode == 1) {
    fragColor = vec4(L , M , N , 1.0);
  }
}`;


let layer;
let toggle=0;
let refs = [
  'orb.jpeg',
  'mySphere.jpg',
  'headlight.jpg',
  'headlight_hard.jpg',
  'baloon.jpeg',
  'escher.jpg',
  'ink.jpg',
  'soccer.jpeg',
  'obama.jpg',
  'earth.jpg',
  'doorknob1.jpeg',
  'lagrangian.jpg',
  'raindrop.jpg'
]
let currentRef=1;
let doNormal=false;
let curvatureMode=0;
//let myWidth=700;
//let myHeight=700;
let scaleRef=1; // percentage of refrence circle used

let shape;
let refImage;
let maskedRef;

let tube;


function setup() {
	createCanvas(windowWidth, windowHeight,WEBGL);
  let gl = this._renderer.GL
  lookupShader = createShader(vertexShader, fragLookup);
  curvatureShader = createShader(vertexShader, fragCurvature);
  normalShader = createShader(vertexShader, fragNormals);

  normalBuffer = createFramebuffer({
    colorFormat: 'float32',
    //colorChannels: 3,       // RGB, no alpha needed for normals
    depth: true             // optional, if you're using depth
  });
  c
	layer3D = createFramebuffer();
  refLayer = createFramebuffer();

  imageLayer = createFramebuffer({ width: 400, height: 400 });

	loadImages();
  //shape= loadModel('models/bean.obj')
  tube = buildTube();
  

  mask = createGraphics(imageLayer.width, imageLayer.height);
  mask.fill(255);
  mask.noStroke();
  mask.ellipseMode(CORNER)
  mask.ellipse(0,0,mask.width,mask.width);

  perspective(0.5, width/height, 100, 10000);
}

function draw() {

  imageLayer.begin();
  fill(0);
  // rect(-5*imageLayer.width,-5*imageLayer.width,10*imageLayer.width,10*imageLayer.width)
  image(refImage,-imageLayer.width/2,-imageLayer.height/2,imageLayer.width,imageLayer.height);
  noFill();
  stroke(0);
  eps = 3;
  strokeWeight(eps);
  //ellipse(0,0,imageLayer.width-eps*0.8,imageLayer.width-eps*0.8,49);
  imageLayer.end();

  
  refLayer.begin();
  background(100);
  //let windowSize=0.5; // sets size of refLayer window
  //refImage.resize(myWidth*2,myHeight*2);
  //maskedRef.mask(mask);
  //image(maskedRef,0,0);
  refLayer.end();
	

 
  normalBuffer.begin();
  background(0);
  shader(normalShader);
  noStroke();
  drawGeometry();
  normalBuffer.end();
  //precompute the depth buffer for rendering the curvature (two pass approach)

  //curvatureShader.setUniform('depthTex', normalBuffer.depth);
  //curvatureShader.setUniform('normalTex', normalBuffer);
  curvatureShader.setUniform('u_resolution', [width, height]);
  curvatureShader.setUniform('mode', curvatureMode); //0 for first fundamental form, 1 for second fundamental form
  //console.log(curvatureMode)
  // curvatureLayer.begin();
  // shader(curvatureShader);
  // background(0);
  // noStroke();
  // drawGeometry();
  // curvatureLayer.end();
  

 // set the shaders
 lookupShader.setUniform('u_referenceImage', imageLayer);
 lookupShader.setUniform('scaleRef', scaleRef);
 lookupShader.setUniform('doNormal', doNormal);

	layer3D.begin();
	background(100);
  shader(lookupShader);
  drawGeometry();
	layer3D.end();
  //shader(lookupShader);
  //curvatureShader.setUniform('depthTex', layer3D.depth);
  noStroke();

	push();
  texture(layer3D);
  //translate(-width/2,0);
	plane(width, height);
  //indicatrix();
  pop();

  translate(-width/2,-height/2);
  //scale(0.3);
  //image(imageLayer,0,0)
  if(!doNormal){
    // push();
    // texture(imageLayer);
    // //translate(imageLayer.width/2,imageLayer.height/2);
    // //translate(imageLayer.width/2,imageLayer.height/2);
    // translate(-width/4,-height/4);
    // scale(0.3);
    // plane(300, 300);
    // pop();
  }
}


//draws the geometry
function drawGeometry(){
  //noStroke();
  scale(100);
  //rotateZ(frameCount*0.005);
  //rotateX(PI/3);
  orbitControl();
  torus(1,0.5,30,30);
  //model(tube.model);
  //renderWireframe(tube.wireframe);
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

  if(keyCode === 32){
    curvatureMode+=1;
    if(curvatureMode>1){
      curvatureMode=0;
    }
  }
}

function loadImages(){
  if(currentRef>=1){
    refImage = loadImage('reference/'+refs[currentRef-1]);  
    maskedRef = loadImage('reference/'+refs[currentRef-1]);
  }

}

//draws indictrix from the second fundamental form.
function indicatrix(){
  //translate(-width/2,-height/2);
  fill(255,0,0);
  circle(-250,0,500);
  console.log(width,height);
  let numInd = createVector(10,10);
  for(let i=0;i<numInd.x; i++){
    for(let j=0;j<numInd.y; j++){
      
      push();
      pos = createVector(i/numInd.x*width,j/numInd.y*height);
      console.log(pos.x/width)
      //console.log(pos);
      translate(pos.x,pos.y);
      scale(5);
      fill(255);
      circle(0,0,1);
      pop();
    }
  }
 
}


//creates 2D loop as a function of time t. The loop is normalized to have radius 1.
//phase indicates where to start placing the ring points
function ringPts(t,phase=0){
  //takes in t from 0 to 1, and angle theta, and outputs list of points
  let verticesPerRing = 30;
  let pts=[];
  for(let i=0;i<=verticesPerRing;i++){
    //r = (1+pow((2*t-1)/0.8,4))/2;
    r=1/(0.3-3*t*(t-1));
    theta=2*PI*i /verticesPerRing + phase;
    pts.push(createVector(r*cos(theta),r*sin(theta)));
  }
  return pts;

}


function directrix(t){
  //takes in a time coordinate t from 0 to 1, returns a point in 3D space
  //let v=createVector(cos(2*PI*t),sin(2*PI*t*2),0);
  //return torusKnot(5,7,t);

  let s = 2*t-1;
  return createVector(s,s*s,s*s*s);
}

function torusKnot(p,q,t){
  r = cos(2 * PI * t* q )+2
  return createVector(r* cos(2*PI*t * p),r* sin(2*PI*t * p),sin(q * 2*PI*t));
}

//Builds a extrucsion of a series of loops around a central curve, the directrix. The loops are placed using the fernet frame
function buildTube(){
  let directrixScale=30;
  let tubeRadius=5;
  let wire=[]

  tube = buildGeometry(() => {
    let numRings = 20;
    let loop=[];
    let points=[];
    let lastPoints=[];
    let dt = 1/numRings;

    let totalTorsion=0;
    for (let t = 0; t <= 1+dt; t+= dt) {
      lastPoints=points;
      points = [];

      let center=directrix(t).mult(directrixScale);
      let frame=fernetFrame(t);
      //loop = ringPts(t,totalTorsion*-4*PI);
      loop = ringPts(t,totalTorsion*0);

      totalTorsion+=frame.torsion/frame.derivative.mag(); //measures accumulated torsion, integrated against arclength on the curve
      //compute points 
      for(let i=0;i<loop.length;i++){
        //change ringPts from x,y basis to normal,binormal basis
        delta=frame.normal.copy().mult(loop[i].x).add(frame.binormal.copy().mult(loop[i].y));
        delta.mult(tubeRadius);
        
        //add to the directrix
        point = center.copy().add(delta);
        points.push(point);
      }

      //only after first loop, do we try to draw the triangle strips
      if(t>= dt){
        line
        beginShape(QUAD_STRIP);
        for(let i=0;i<points.length;i++){
          vertex(lastPoints[i].x,lastPoints[i].y,lastPoints[i].z);
          vertex(points[i].x,points[i].y,points[i].z);
        }
        endShape();
      }
      wire.push(points);
    }
  });
  tube.computeNormals(SMOOTH);
  

  return {  
    model: tube,
    wireframe: wire
  }
}


//draws segment at time t, with boundarys loop1 and loop2.
//Current paramertization of loop1 and loop2 indicies starts pointing in direciton of normal vector. 
// when the torsion of the curve is large, the normal vector rotates quickly, and we get a hyperboloid effect.
//To counter, we should start indexing at the accumulated torsion. 


// returns the fernet frame of curve(t) at time t
//output is: array of p5.Vectors [tangent, normal, binormal]
function fernetFrame(t){
  let del = 0.01;

  //compute three points on the curve for finite differences
  let curve0 = directrix(t);
  let curve1 = directrix(t+del);
  let curve2 = directrix(t+2*del);
  let curve3 = directrix(t+3*del);

  // use forward difference coefficents with four stencil points
  // first derivative: -11/6, 3, -3/2, 1/3
  let der1 = curve0.copy().mult(-11/6).add(
              curve1.copy().mult(3).add(
              curve2.copy().mult(-3/2).add(
              curve3.copy().mult(1/3)
              )
             )
            ).mult(pow(del,-1))
  //second derivative:  2 -5 4 -1
  let der2 = curve0.copy().mult(2).add(
              curve1.copy().mult(-5).add(
              curve2.copy().mult(4).add(
              curve3.copy().mult(-1)
              )
            )
            ).mult(pow(del,-2))
  //third derivative: -1 3 -3 1
  let der3 = curve0.copy().mult(-1).add(
            curve1.copy().mult(3).add(
            curve2.copy().mult(-3).add(
            curve3.copy().mult(1)
            )
          )
          ).mult(pow(del,-3))

  //apply gram schmidt to first and second derivative of curve
  let tangent =  der1.copy().normalize();
  let normal = der2.copy().normalize();
  normal.add(p5.Vector.mult(tangent, - normal.dot(tangent))).normalize();

  let preBinormal=p5.Vector.cross(der1,der2);
  let binormal = preBinormal.copy().normalize();

  let curvature = preBinormal.mag()/pow(der1.mag(),3); 
  let torsion = preBinormal.dot(der3)/preBinormal.magSq()

  // console.log("curvature is " + curvature);
  // console.log("torsion is " + torsion);
  return {
    tangent: tangent,
    normal: normal,
    binormal: binormal,
    curvature: curvature,
    torsion: torsion,
    derivative: der1
  };
    
}

//takes in a list of loops, and renders the wireframe
function renderWireframe(wire){
  stroke(0);
  strokeWeight(1);
  noFill();

  for (let i = 1; i < wire.length; i++) {
    let prev = wire[i - 1];
    let curr = wire[i];
    let n = curr.length;

    for (let j = 0; j < n; j++) {
      let next = (j + 1) % n;

      // vertical
      line(prev[j].x, prev[j].y, prev[j].z, curr[j].x, curr[j].y, curr[j].z);

      // ring edges
      //line(curr[j].x, curr[j].y, curr[j].z, curr[next].x, curr[next].y, curr[next].z);
      line(prev[j].x, prev[j].y, prev[j].z, prev[next].x, prev[next].y, prev[next].z);
    }
  }
}