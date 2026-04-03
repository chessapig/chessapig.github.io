let zeros=[];
let M = []
const degree=3;
const numPencil=12;
let numZeros=8;
let frame=0;

let Shader;

const BKG = '#2c2621'; //background color
const FRG = '#E6CFB3'; //foreground color


//Parent in file is "ifs_sketch"
let parent = "pencil";

function setup() {
    let elem = document.getElementById(parent);
	boundingRect = elem.getBoundingClientRect();
	canvasSize = min(boundingRect.width*0.9,windowHeight*0.7); //sets size of canvas.
	canvas = createCanvas(canvasSize , canvasSize , WEBGL);
	canvas.parent(parent);

    Shader=getShader(this._renderer);
	//background(200);
	
	shaderLayer = createGraphics(700, 700, WEBGL);

	for(let i=0;i<numZeros;i++){
		zeros[i]=new Draggable(random(-1,1),random(-1,1));
        
	}
}   

function draw() {
	M=[];
    for(let pt of zeros){
        append(M,evalPoly(pt,degree))
    }
    M=rowReduce(M);
    kernel=getKernel(M);


    shaderLayer.shader(Shader);
	Shader.setUniform("cubic1",kernel[0]);
    Shader.setUniform("cubic2",kernel[1]);
    Shader.setUniform("iTime",millis() / 1000.0);
    //shaderLayer.resetShader();
    //shaderLayer.background(0, 0, 0)
    shaderLayer.push();
    shaderLayer.resetMatrix();
    shaderLayer.rectMode(CORNER);      // origin at top-left
    shaderLayer.rect(0, 0, width, height);  // fill entire offscreen buffer
    shaderLayer.pop();

    // draw shaderLayer fullscreen
    image(shaderLayer, -width/2, -height/2, width, height);
    

	scale(width/2,width/2);
	//translate(1,1)
	scale(1,-1);
	
	for(let z of zeros){
		z.over();
		z.update();
		z.show();
	}

    stroke(FRG);
    strokeWeight(6);
    noFill();
    rect(-1,-1,2,2);

    frame+=1;
}


//outputs lost of evaluations. Takes order: 1,x,y,x^2,xy,y^2,...
function evalPoly(pt,degree){
    let evals=[];
    let currentDegree=0;
    let c=1;
    while(currentDegree<= degree){
        for(let i=0;i<=currentDegree;i++){
            iy= i;
            ix=currentDegree-i;
            //compute normalization coeffiecnts (these make the monomials an ONB)
            c=sqrt( factorial(degree)/(factorial(ix)*factorial(iy))); 
            c=1;
            evals[evals.length] = pow(pt.x,ix)*pow(pt.y,iy)*c;
        }
        currentDegree+=1;
    }
    return evals;
    
}

function factorial(n){
  if(n<=1) {
	return(1);
  }
  else {
    return(n*factorial(n-1));
  }
  
}

//add array of numbers
function vectorAdd(v,w){
    let add=[]
    for(let i=0;i<v.length;i++){
        add[i]=v[i]-w[i]
    }
    return add;
}

function vectorSub(v,w){
    let sub=[]
    for(let i=0;i<v.length;i++){
        sub[i]=v[i]-w[i]
    }
    return sub;
}

function vectorScale(v,c){
    let scaled=[]
    for(let i=0;i<v.length;i++){
        scaled[i]=v[i]*c
    }
    return scaled; 
}

function vectorNorm(v){
    let mag=0;
    for(let i=0;i<v.length;i++){
        mag+= v[i]*v[i];
    }
    return sqrt(mag);
}

function vectorDot(v,w){
    let dot=0;
    for(let i=0;i<v.length;i++){
        dot+= v[i]*w[i];
    }
    return dot;
}

//takes in array of arrays M
function rowReduce(M){
    let row=0;
    let col=0;
    for(let i =0; i<M.length;i++){
        
        row=i;
        col=i;
        while(M[row][col]==0){ //if the coefficnets are zero, go down colum and row until i fix it
            row+=1;
            if(row>=M.length){
                row=i;
                col+=1;
            }

            if(col==M[0].length){
                 
                return M // If only habe zeros in lower left block, finish gaussian elimination
            }   
        }
        if(row != i){ //swap rows to make the row into where its supposed to be
            let temp=[];
            temp=M[i];
            M[i]=M[row];
            M[row]=temp;

            row=i
        }

       
        M[row] = vectorScale(M[row],1/ M[row][col]) //rescale to make 1
        for(let j = 0; j<M.length;j++){
            if(j != i){
                M[j]=vectorSub(M[j],vectorScale(M[row],M[j][col]) ) //subtract off current row
            }
        }
    }
    return M;

}

//takes in a RREF form M, with all pivot columns assumed to be left justified. 
// This is always the output of rowReduce for points derived from evaluation maps. Im p sure.
// as long as theres not an overdetermined number of points
// assumes i used all by one point, so returns 2 vectors in the kernel
function getKernel(M){
    let k1=[];
    let k2=[];
    let height=M.length;
    let width=M[0].length
    for(let i=0;i<height;i++){
        k1[i] = -M[i][width-2];
        k2[i] = -M[i][width-1];
    }
    k1[height]=1; k1[height+1]=0; 
    k2[height]=0; k2[height+1]=1; 

    //next, orthonormalize k1 and k2
    k1=vectorScale(k1,1/vectorNorm(k1));
    k2=vectorSub(k2,vectorScale(k1, vectorDot(k1,k2)))
    k2=vectorScale(k2,1/vectorNorm(k2));
    return [k1,k2]
}


function mousePressed() {
	for(let i=0;i<zeros.length;i++){
		zeros[i].pressed();
	}
}

function mouseReleased() {
	//let newZeros=[];
	for(let i=0;i<zeros.length;i++){
		zeros[i].released();
		
	}
}


function getShader(_renderer) {
    const vert = `
    precision highp float;
    attribute vec3 aPosition;
    attribute vec2 aTexCoord;
    varying vec2 fragCoord;
    void main() {
        fragCoord = aTexCoord;
        vec4 positionVec4=vec4(aPosition,1.);
        positionVec4.xy=positionVec4.xy*2.-1.; 
        gl_Position = positionVec4;
    }
    `;

    const frag = `
precision highp float;
varying vec2 fragCoord;

uniform float iTime;
uniform float cubic1[10];
uniform float cubic2[10];

#define PI 3.1415926538

vec3 oklch_to_rgb(vec3 oklch) {
    // OKLCH -> OKLab
    float L = oklch.x;
    float C = oklch.y;
    float h = oklch.z;
    float a = C * cos(h);
    float b = C * sin(h);
    vec3 lab = vec3(L, a, b);

    // OKLab -> linear RGB
    float L_ = lab.x + 0.3963377774*lab.y + 0.2158037573*lab.z;
    float M_ = lab.x - 0.1055613458*lab.y - 0.0638541728*lab.z;
    float S_ = lab.x - 0.0894841775*lab.y - 1.2914855480*lab.z;

    float l = L_ * L_ * L_;
    float m = M_ * M_ * M_;
    float s = S_ * S_ * S_;

    float r = +4.0767416621*l - 3.3077115913*m + 0.2309699292*s;
    float g = -1.2684380046*l + 2.6097574011*m - 0.3413193965*s;
    float b_ = -0.0041960863*l - 0.7034186147*m + 1.7076147010*s;

    vec3 rgb = vec3(r, g, b_);

    // linear -> sRGB
    rgb = pow(clamp(rgb, 0.0, 1.0), vec3(1.0/2.4));

    return rgb;
}


float softMax(float a,float b,float alpha){

    return  (a*exp(alpha*a) + b*exp(alpha*b))/(exp(alpha*a) + exp(alpha*b));
}

float evalPolynomial(
    vec2 uv,
    float c,
    float c0,
    float c1,
    float c00,
    float c01,
    float c11,
    float c000,
    float c001,
    float c011,
    float c111){
    
    float value = 
        c       + 
        c0   * uv.x + 
        c1   * uv.y + 
        c00  * uv.x*uv.x + 
        c01  * uv.x*uv.y + 
        c11  * uv.y*uv.y +
        c000 * uv.x*uv.x*uv.x + 
        c001 * uv.x*uv.x*uv.y + 
        c011 * uv.x*uv.y*uv.y +
        c111 * uv.y*uv.y*uv.y;
        
    return value;
}

float plotPolynomial(
    vec2 uv,
    float c,
    float c0,
    float c1,
    float c00,
    float c01,
    float c11,
    float c000,
    float c001,
    float c011,
    float c111,
    float thickness){
    
    
    float value = evalPolynomial(uv,c,c0,c1,c00,c01,c11,c000,c001,c011,c111);
   
    vec2 gradient = 
        vec2(c0,c1)  + 
        vec2( c00  * 2.* uv.x + c01* uv.y , c01* uv.x + c11* 2.*uv.y)+
        vec2( c000 * 3.* uv.x*uv.x + c001 * 2.* uv.x*uv.y + c011 * uv.y *uv.y,
              c111 * 3.* uv.y*uv.y + c011 * 2.* uv.x*uv.y + c001 * uv.x*uv.x);
        
        
    
    float scaledValue = abs(value)/max(length(gradient),0.5);
    //float scaledValue = abs(value)/length(gradient);
    float brightness = smoothstep(0.,0.001,thickness); //if thickness is very small, make it bright
    brightness=min(pow(brightness,0.4),1.);
    //brightness  =1.;

    //if thickness very small, make it thick again!
    
    return brightness*(1.-smoothstep(thickness*softMax(thickness,0.8,10.),thickness,scaledValue));
}

void main() 
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = vec2( (fragCoord.x*2.-1.) , 
                    (fragCoord.y*2.-1.)  );

    
    //input normalized coefficents
    float a    = cubic1[0];
    float a0   = cubic1[1];
    float a1   = cubic1[2];
    float a00  = cubic1[3];
    float a01  = cubic1[4];
    float a11  = cubic1[5];
    float a000 = cubic1[6];
    float a001 = cubic1[7];
    float a011 = cubic1[8];
    float a111 = cubic1[9];
   
    
    float b    = cubic2[0]; 
    float b0   = cubic2[1];
    float b1   = cubic2[2];
    float b00  = cubic2[3];
    float b01  = cubic2[4];
    float b11  = cubic2[5];
    float b000 = cubic2[6];
    float b001 = cubic2[7];
    float b011 = cubic2[8];
    float b111 = cubic2[9];
    
     
    float c   = 0.;
    float c0  = 0.;
    float c1  = 0.;
    float c00 = 0.;
    float c01 = 0.;
    float c11 = 0.;
    float c000 = 0.;
    float c001 = 0.;
    float c011 = 0.;
    float c111 = 0.;
    
    
    //r will capture the rate of change
    float d   = 0.;
    float d0  = 0.;
    float d1  = 0.;
    float d00 = 0.;
    float d01 = 0.;
    float d11 = 0.;
    float d000 = 0.;
    float d001 = 0.;
    float d011 = 0.;
    float d111 = 0.;
    
    vec3 pencil = vec3(0.);
    float pencilParam = 0.;
    
    float strandSeperation;
    
    for(int i=0;i<${numPencil};i++){
        float dt = 1./${numPencil}.;
        float t = float(i)*dt;
        pencilParam = PI*t +iTime*dt*2.;
        float rx = cos(pencilParam);
        float ry = sin(pencilParam);

        c    = a    * rx + b    * ry;
        c0   = a0   * rx + b0   * ry;
        c1   = a1   * rx + b1   * ry;
        c00  = a00  * rx + b00  * ry;
        c01  = a01  * rx + b01  * ry;
        c11  = a11  * rx + b11  * ry;
        c000 = a000 * rx + b000 * ry;
        c001 = a001 * rx + b001 * ry;
        c011 = a011 * rx + b011 * ry;
        c111 = a111 * rx + b111 * ry;

        //rate of change of family of conics
        d    = a    *-ry + b    * rx;
        d0   = a0   *-ry + b0   * rx;
        d1   = a1   *-ry + b1   * rx;
        d00  = a00  *-ry + b00  * rx;
        d01  = a01  *-ry + b01  * rx;
        d11  = a11  *-ry + b11  * rx;
        d000 = a000 *-ry + b000 * rx;
        d001 = a001 *-ry + b001 * rx;
        d011 = a011 *-ry + b011 * rx;
        d111 = a111 *-ry + b111 * rx;


        float poly = evalPolynomial(uv,c,c0,c1,c00,c01,c11,c000,c001,c011,c111);
        float perpPoly = evalPolynomial(uv,d,d0,d1,d00,d01,d11,d000,d001,d011,d111);

        strandSeperation+=log((1.-smoothstep(0.,0.001,abs(perpPoly*poly))));


        float percentFilled=0.4;
        float thickness=min(dt*percentFilled,pow(abs(perpPoly),1.)*dt*percentFilled); 
        float cubicStrand= plotPolynomial(uv,c,c0,c1,c00,c01,c11,c000,c001,c011,c111,thickness);
        cubicStrand=clamp(cubicStrand,0.,1.);
            
        vec3 oklch = vec3(cubicStrand*cubicStrand,0.25,6.28*dt*float(i));
        vec3 rgb= smoothstep(0.05,0.1,cubicStrand)*clamp(oklch_to_rgb(oklch),0.,1.);
        pencil+=rgb;
    }

    //strandSeperation=smoothstep(-0.02,0.,strandSeperation);
    // Output to screen
    //vec3 rgb=strandSeperation*clamp(oklch_to_rgb(pencil),0.,1.);

    pencil=pencil*smoothstep(0.,-0.2,strandSeperation);
    vec3 outputColor = 1.-(1.-pencil)*(1.-vec3(smoothstep(-0.02,0.,strandSeperation)));
    vec3 background = vec3(44./255., 38./255.,33./255.);
    vec3 foreground = vec3(230./255., 207./255.,179./255.);
    gl_FragColor = vec4(outputColor,1.0);
    //gl_FragColor = vec4( (outputColor*foreground + background),1.0);
    

}
    `;

    return new p5.Shader(_renderer, vert, frag);
}