let myPlane;

function setup() {
    createCanvas(700, 700, WEBGL);
    testShader = createShader(quadVert, quadFrag);

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
    
  }


  
function draw() {
    background(0);
    shader(testShader);
    model(myPlane);
   
}


  // vertex shader
  quadVert = `#version 300 es
precision highp float;

in vec3 aPosition;
out vec2 v_uv;

void main() {
    gl_Position = vec4(aPosition, 1.0);
    v_uv = aPosition.xy * 0.5 + 0.5;
}`

// fragment shader
quadFrag =`#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

void main() {
    fragColor = vec4(v_uv, 0.0, 1.0); // visualize full screen
}
`