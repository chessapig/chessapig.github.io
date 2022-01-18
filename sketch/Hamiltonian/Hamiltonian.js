let Shader;
const balls=[],num=10000;


let system;
let fps=30;
let loopTime=1,saveFormat="webm";
let dt,dq,dp;
let life=200;
let width=500,height=500;
let canvas1,canvas2;




function preload() {
  Shader = getShader(this._renderer);
}

function setup() {
  createCanvas(300,300,WEBGL);
  canvas0 = createGraphics(width,height,WEBGL);
  canvas1 = createGraphics(width,height,WEBGL);
  canvas2 = createGraphics(width,height,WEBGL);
  //plotHamiltonian();
  system = new ParticleSystem(createVector(width/10,0));
  initilizeBurst();
  frameRate(fps);
  dt=1/fps;
  dq=1/width;
  dp=dq;
  
  //shader(Shader);

  // frameRate(fps)
  // capturer = new CCapture( { 
  //   format: 'webm', 
  //   workersPath: 'js/', 
  //   framerate: fps,
  //   } );
  // gifFrames=0; //track how many frames in gif saved so far
  // console.log(capturer);

  noiseOptions={
		seed: 12346,
		radius: 0,
		center: 0,
	}

	createLoop({
		duration: 15, 
		noiseOptions,
		gif: false,
    render:false,
    open:true
		});

  
}

function draw() {
  background(0,0,0,255);
  //translate(width/2, height/2);
  //plotHamiltonian();
  //if(frameCount%1==0){system.addParticle();}
  
  let data = serialize(system.particles);
  Shader.setUniform("particles",data);
  
  canvas1.background(0);
  canvas1.stroke(0);
  canvas1.fill(5);
  
  
  //canvas1.beginDraw();
  //canvas1.shader(Shader);
  Shader.setUniform("u_canvas",canvas1);
  system.run();

  //canvas1.endDraw();
  
  //canvas2.beginDraw();
  //canvas2.shader(Shader);
  //Shader.setUniform("u_canvas",canvas1);
  //canvas2.endDraw();
  
  
  
  //image(canvas1,0,0);
  // capturer.capture(document.getElementById('defaultCanvas0'));
  // gifFrames+=1;
  // if(gifFrames>=loopTime*fps){
  //   capturer.stop();
  //   capturer.save();
  //   gifCapturing=false;
  //   gifFrames=0;
  // }
  

}


function Hamiltonian(position, momentum){
  return momentum.magSq() + (position.magSq()*sq(dq))**0.9; //+ 100/(exp(-(momentum.magSq()/10))+1);//-abs(position.x)*dq;
}

function plotHamiltonian(){
  loadPixels();
  d=pixelDensity();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      H=Hamiltonian(createVector(x-width/2,y-height/2),createVector(0,0));
      value=lerp(H,0,1/dq,0,255);
      // loop over
      for (let i = 0; i < d; i++) {
        for (let j = 0; j < d; j++) {
          // loop over
          index = 4 * ((y * d + j) * width * d + (x * d + i));
          pixels[index] = value;
          pixels[index+1] = value;
          pixels[index+2] = value;
          pixels[index+3] = 255;
        }
      }
    }
  }
  updatePixels();
}

function initilizeBurst(){
    for(i=0;i<num;i++){
      system.addParticle();
    }
}

// A simple Particle class
let Particle = function(position) {
  this.momentum = createVector(sqrt(random(0,0.1)), 0).rotate(random(0,2*PI)).mult(width);
  this.position = position.copy();
  this.lifespan = life;
  
};

Particle.prototype.run = function() {
  this.update();
  this.display();
};

// Method to update position
Particle.prototype.update = function(){
  //this.momentum.add(this.position.mult(2*(1-this.position.mag()/100)/(this.position.mag()+0.01)));
  //this.momentum.mult(0.98);
  //this.momentum.add(createVector(this.position.y,-this.position.x).normalize().mult(0.05));
  //this.momentum.add(createVector(-0.05*this.momentum.x,0));
  //this.position.add(this.momentum);
  
  
  this.position.add(HGradP(this.position, this.momentum).mult(dt));
  this.momentum.add(HGradQ(this.position, this.momentum).mult(-1).mult(dt));
  
  this.lifespan -= dt;
};




function HGradQ(position, momentum){
  dHdqx = -(Hamiltonian(position,momentum) - Hamiltonian(position.add(createVector(dq,0)),momentum))/dq;
  dHdqy = -(Hamiltonian(position,momentum) - Hamiltonian(position.add(createVector(0,dq)),momentum))/dq;
  return createVector(dHdqx,dHdqy).mult(1/sq(dq));
  //return position.copy().mult(position.magSq()*sq(dq*2));
}

function HGradP(position, momentum){
  dHdpx = -(Hamiltonian(position,momentum) - Hamiltonian(position,momentum.add(createVector(dp,0))))/dp;
  dHdpy = -(Hamiltonian(position,momentum) - Hamiltonian(position,momentum.add(createVector(0,dp))))/dp;
  return createVector(dHdpx,dHdpy);

  //return momentum.copy();
}



// Method to display
Particle.prototype.display = function() {
  //opacity=this.lifespan*255/life;
  opacity=255*dt*10/num*1000;
  //opacity=255;
  noStroke();
  //stroke(200, 100);
  //strokeWeight(2);
  fill(255, opacity);
  ellipse(this.position.x, this.position.y, 2, 2);
};


let ParticleSystem = function(position) {
  this.origin = position.copy();
  this.particles = [];
};

ParticleSystem.prototype.addParticle = function() {
  this.particles.push(new Particle(this.origin));
};

ParticleSystem.prototype.run = function() {
  for (let i = this.particles.length-1; i >= 0; i--) {
    let p = this.particles[i];
    p.run();
    if (p.lifespan<0) {
      //this.particles.splice(i, 1);
    }
  }
};


function serialize(particles) {
  data = [];
  
  for (var i=0;i<particles.length;i++) {
    data.push(
      map(particles[i].position.x, -width/2, width/2, 0.0, 1.0), 
      map(particles[i].position.y, -height/2, height/2, 1.0, 0.0),100/width);
  }
  
  return data;
}
