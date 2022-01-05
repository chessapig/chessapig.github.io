function getShader(_renderer) {
  const vert = `
   // our vertex data
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  
  // we need our texcoords again
  varying vec2 vTexCoord;
  
  void main() {
    // copy the texcoords
    vTexCoord = aTexCoord;
  
    // copy the position data into a vec4, using 1.0 as the w component
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  
    // send the vertex information on to the fragment shader
    gl_Position = positionVec4;
  }
  `;
  const frag = `
    precision highp float;

    varying vec2 vTexCoord;
    uniform sampler2D u_canvas;

    uniform vec3 particles[${num}];

    const float WIDTH = 500.0;
    const float HEIGHT = 500.0;

    void main() {
      vec2 uv = vTexCoord;
      float x = uv.x;
      float y = uv.y;
      float value = 0.0;

      for (int i = 0; i < ${num}; i++) {
        vec3 particle = particles[i];
        float dx = particle.x - x;
        float dy = particle.y - y;
        float r = particle.z;
        value +=  2.*exp(-(dx * dx + dy * dy)/(r * r)) / ${num}.0;
      }
      
      vec4 myColor = texture2D(u_canvas, uv);
      
       gl_FragColor = mix(texture2D(u_canvas, uv),vec4(value, value, value, 1.0),0.9);
    }
  `;
  return new p5.Shader(_renderer, vert, frag);
}
