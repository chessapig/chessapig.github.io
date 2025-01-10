//uses quaternion.js For documentation, see https://github.com/rawify/Quaternion.js?tab=readme-ov-file

let p;
let t;
function setup() {
  createCanvas(windowWidth,windowHeight,WEBGL);
  background(100);




  v1=new Vec4(0,1,0,1);
  v2=new Vec4(0,1,0,0.1);

  p=new TwoPlane(v1,v2);

  t=0;
}

function draw() {
  background(100);
  scale(height/10);

  t=mouseX/width; //goes from 0 to 1
  //apply a sigmoid
  t=tan((t-0.5)*PI);
  v1=new Vec4(t,t,1,t);
  let I=new Complex(0,1);
  v2=v1.copy().cMult(I);
  //console.log(v2);
  //v2=new Vec4(0.1,0,t,1);

  p=new TwoPlane(v1,v2);
  
  let greatCircle=p.greatCircle(100);
  strokeWeight(1);
  fill(255);
  for(let v of greatCircle){
    v.stereographic();
    circle(v.x,v.y,0.1);
  }

  //t+=0.1;
}



//class for 2-planes in R4
class TwoPlane{

  //takes in 2 Vec4, which are the basis elements. 
  constructor(v1,v2){
   this.basis=[v1.copy(),v2.copy()];
  }

  //applies grahm-schmidt orthonormalization to the basis vectors
  orthonormalize(){
    v1=this.basis[0];
    v2=this.basis[1];

    v1.normalize(); //normalize first vector

    //component of v2 projected onto v1
    let projVec=v2.copy().proj(v1);
    v2.add(projVec.mult(-1));

    v2.normalize(); //nromalize second vector
  }

  //returns the great circle, the intesection of the 2-plane field with the 3-sphere. 
  //retunrs an array of N vec4 elements
  greatCircle(N=8){
    this.orthonormalize();

    let result=new Array(N);
    let t=0; //angle
    let v1;
    let v2;
    for(let i=0;i<N;i++){
      v1=this.basis[0].copy();
      v2=this.basis[1].copy();
      t=2*PI*i/N;
      result[i] = v1.mult(cos(t)).add(v2.mult(sin(t)));
    }

    return result;
  }
}




//class for 4D vectors, thought of as R4, C2, or H
class Vec4{
  constructor(x=0,y=0,z=0,w=0){
    this.x=x;
    this.y=y;
    this.z=z;
    this.w=w;
  }

  //sets vec4 to match v
  set(v){
    this.x=v.x;
    this.y=v.y;
    this.z=v.z;
    this.w=v.w;
  }

  normSq(){
    return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w;
  }

  norm(){
    return sqrt(this.normSq());
  }

  normalize(){
    this.mult(1/this.norm());
    return this;
  }

  //adds two vec4 
  add(v){
    this.x+=v.x;
    this.y+=v.y;
    this.z+=v.z;
    this.w+=v.w;

    return this;
  }

  copy(){
    let v1 = new Vec4(this.x,this.y,this.z,this.w);
    return v1;
  }

  //compute dot product
  dot(v){
    return  this.x*v.x + this.y*v.y + this.z*v.z+this.w*v.w;
  }

  //projects this onto v
  proj(v){
    let u=v.copy();
    u.mult(u.dot(this)/u.normSq());
    
    this.set(u);
    return u;
  }

  //scale by a real number, thinking of vector space as R4
  mult(s){
    this.x*=s;
    this.y*=s;
    this.z*=s;
    this.w*=s;

    return this;
  }

  //scale by a complex number, thinking of vector space as C2
  //x,y,z,w come in complex pairs (x,y) and (z,w)
  //z is a Complex class
  cMult(z){
    

    let z1 = new Complex(this.x,this.y);
    let z2 = new Complex(this.z,this.w);

    z1.mult(z);
    z2.mult(z);

    let v=new Vec4(z1.x,z1.y,z2.x,z2.y);
    this.set(v);

    return this;
  }

  //scale by a quaternion, thinking of vector space as H
  //imaginary quaternions are FIRST 3 COORDINATES (x,y,z), the unit is w. 
  //multiplication copied from https://en.wikipedia.org/wiki/Quaternion#Hamilton_product
  qMult(q){
    let v=new Vec4();

    v.w =  this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z;

    v.x =  this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y;
    v.y =  this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x;
    v.z =  this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w;


    this.set(v);

    return this;
  }

  //thinking of vector space as H, conjugate
  conjugate(){
    this.x *=-1;
    this.y *=-1;
    this.z *=-1;

    return this;
  }

  //returns image under hopf fibration as a unit imaginary quaternion
  hopf(){
    this.normalize();
    let I = new Vec4(1,0,0,0);
    this.set(this.copy().conjugate().qMult(I).qMult(this))
    return this;
  }

  //sends C^2 to P^1, in affine chart where [z1,z2] where z2 is not 0. Sends (z1,z2) to z1/z2. 
  stereographic(){
    let z = new Complex(this.z,this.w); //choose the senond coordinate

    this.cMult(z.inv()); //divide by the second coordinates
  }
  
}

class Complex{
  constructor(x=0,y=0){
    this.x=x;
    this.y=y;
  }

   //sets vec4 to match v
   set(z){
    this.x=z.x;
    this.y=z.y;
  }
  
  //multiplies with another complex number
  mult(z){
    let v=new Complex();

    v.x =  this.x*z.x - this.y * z.y ;
    v.y =  this.x*z.y + this.y * z.x ;

    this.set(v);

    return this;
  }

  normSq(){
    return this.x*this.x+this.y*this.y;
  }

  inv(){
    let v=new Complex();
    let nmSq=this.normSq();

    v.x =  this.x/nmSq;
    v.y =  -this.y/nmSq;

    this.set(v);

    return this;
  }

   //divides this by z
   div(z){
    this.mult(z.copy().inv());
    return this;
  }

  copy(){
    let z1 = new Complex(this.x,this.y);
    return z1;
  }


}