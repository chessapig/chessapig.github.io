
//Parent in file is "ifs_sketch"
let parent = "brion";
let points=[];
let res=700;
let FTscale=1; //scale for foourier transform (log coords)
let origin;
let imgRes = 100;
let img; 
let doLatticePolygon=true;
let doIntegerTransform=false;

const BKG = '#2c2621'; //background color
const FRG = '#E6CFB3'; //foreground color

function setup() {
	let elem = document.getElementById(parent);
	boundingRect = elem.getBoundingClientRect();
	canvasSize = min(boundingRect.width*0.9,windowHeight*0.8); //sets size of canvas.
	canvas = createCanvas(canvasSize , canvasSize , P2D);
	canvas.parent(parent);
	t=0;
	
	//noLoop();

	let w=0.2
	let h = 0.8
	points[0] = new Draggable(-w,h,res);
	points[1] = new Draggable(w,h,res);
	points[2] = new Draggable(w,-h,res);
	points[3] = new Draggable(-w,-h,res);
	// points[4] = new Draggable(-0.9,0,res);

	img= createImage(imgRes, imgRes);

	
}

function draw() {
	//background(255);
	scale(width/2,width/2);
	translate(1,1)
	scale(1,-1);


	let scaleRes=8;
	// let s = floor(pow(2,FTscale));
	let s = pow(2,floor(FTscale*scaleRes)/scaleRes);
	if(doIntegerTransform){
		s = floor(exp(FTscale));
	}
	
	fourierImg(img,s,{
		doIntegerTransform:doIntegerTransform,
		vertexScale:1});
	image(img,-1,-1,2,2);

	//console.log(points[0].x,points[0].y)
	//drawGrid(s*res,'#ffffff');
	

	
	stroke('#FFFFFF');
	strokeWeight(0.02);
	drawPolygon(points)
	
	stroke('#000000');
	strokeWeight(0.01);
	drawPolygon(points)	

	for(let p of points){
		p.over();
		p.update();
		p.show();
	}

	    stroke(FRG);
    strokeWeight(0.03);
    noFill();
    rect(-1,-1,2,2);

}

function drawPolygon(points){
	noFill();
	
	beginShape();
	for(let i=0;i<points.length;i++){
		p=points[i]
		//circle(p.x,p.y,0.03*i)
		vertex(p.x,p.y);
	}
	endShape(CLOSE);
}

//draw grid. Allow color as input. 
function drawGrid(scale, c="#ffffff"){
	col=color(c);
	col.setAlpha(100);
	stroke(col);
	strokeWeight(0.002);
	for(let i=-scale; i<scale; i++){
		line(i/scale,-1,i/scale,1);
		line(-1,i/scale,1,i/scale);
	}

	//draw axes
	// col.setAlpha(255);
	// stroke(col);
	// strokeWeight(0.01);
	// line(-1,0,1,0)
	// line(0,-1,0,1)
}

function fourierImg(image,scale,opts) {
	
	image.loadPixels();
	for (let i = 0; i < image.width; i++) {
		for (let j = 0; j < image.height; j++) {
			
			// map pixel coords → complex plane coords
			let x = map(i, 0, image.width, -scale, scale);
			let y = map(j, 0, image.height, -scale, scale);
			
			//offset slightly to avoid sinuglarities
			x+=PI/1000;
			y+=0.001;
			
			let f = polygonFT(points, [ x, y],opts);
			let c = colorMap(f);
			
			
			// assign pixel
			let idx = 4 * (j * image.width + i);
			image.pixels[idx + 0] = red(c);
			image.pixels[idx + 1] = green(c);
			image.pixels[idx + 2] = blue(c);
			image.pixels[idx + 3] = 255;
		}
	}

	image.updatePixels();
}




// For the nth point, return the adjacent edge vectors.
function getEdges(points,n){
	let i = n%points.length;
	p=points[i];
	//console.log("point p: ["+p.x+","+p.y+"]")
	pNext=points[(i+1)%points.length];
	//console.log("point pNext: ["+pNext.x+","+pNext.y+"]")
	pLast=points[(points.length+i-1)%points.length];
	//console.log("point pLast: ["+pLast.x+","+pLast.y+"]")
	e1=[pLast.x-p.x, pLast.y-p.y];
	e2=[p.x-pNext.x,p.y-pNext.y];
	return [e1,e2];
}



function polygonFT(points,xi,opts={}){
	const {
		doIntegerTransform = false,
	} = opts;

	let FT = [0,0];
	for(let n=0; n<points.length; n++){
		if(points[n].enabled){
			if(doIntegerTransform){
				FT = cAdd(FT,coneIntegerTransform(points[n],getEdges(points,n),xi));
			} else {
				FT = cAdd(FT,coneFT(points[n],getEdges(points,n),xi,opts));
			}
		}		
	}
	return FT;
}

//input is a point, an array of vectors, and an input vector xi
function coneFT(p,[w0,w1],xi,opts){
	const {
		vertexScale = 1,
	} = opts;
	
	det= w0[0]*w1[1]-w0[1]*w1[0];
	if(det==0){
		return [0,0] // return the complex number 0
	}
	denominator = (xi[0]*w0[0] + xi[1]*w0[1]) * (xi[0]*w1[0] + xi[1]*w1[1]);
	r = det/(denominator) / vertexScale; //scale amplitdue with zoom.
	theta=2*PI*(p.x*xi[0] + p.y*xi[1])*vertexScale;
	//console.log(theta)
	return polarToC(r,theta);
}

//assume that p,w0,w1 are in Z/res. 
function coneIntegerTransform(p,[w0,w1],xi,opts){

	w0=[res*w0[0],res*w0[1]]
	w1=[res*w1[0],res*w1[1]]
	
	det= w0[0]*w1[1]-w0[1]*w1[0];
	//console.log(det)
	if(det==0){
		return [0,0] // return the complex number 0
	}
	d0 =  cAdd([1,0],polarToC(-1,xi[0]*w0[0] + xi[1]*w0[1]));
	d1 =  cAdd([1,0],polarToC(-1,xi[0]*w1[0] + xi[1]*w1[1]))
	normalization=[det/(pow(2*PI,2)),0]
	denominator = cInverse(cMult(d0,d1));
	phase=polarToC(1,(p.x*xi[0] + p.y*xi[1]));
	return cMult(phase,cMult(denominator,normalization));
}





//for t between 0 and number of polygon points, get the point along the curve. 
function getPolygonPt(controlPts,t){
	let pointNum=floor(t)%controlPts.length;
	p=controlPts[pointNum];
	p2=controlPts[(pointNum+1)%controlPts.length];
	let tFrac= t-floor(t);
	let x = (1-tFrac)*p.x + tFrac*p2.x;
   let y = (1-tFrac)*p.y + tFrac*p2.y;
	return createVector(x,y);
}

//places n points around polygon
function makePolygonPoints(controls,n){
	let controlNum=controls.length;
	pts = []
	for(let i=0;i<n;i++){
		t=i/n*controlNum;
		append(pts,{
			pos: getPolygonPt(controls,t),
			t: t
		})
	}
	return pts;
}

//only add a bezier point if its within some distance of the preexissting curve.
function addPoint(controls){
	let selectRadius=0.1;
	let curvePts= makePolygonPoints(points,50);
	//console.log(curvePts)
	let mousePos=createVector(mouseX/height*2-1,-(mouseY/height*2-1));
	let appendPt;
	//take first point within select radius of the click
	for(let p of curvePts){
		if(dist(p.pos.x,p.pos.y,mousePos.x,mousePos.y)<selectRadius){
			appendPt={
					pos: mousePos,
					t: p.t
				};
			break;
		}
	}
	//console.log(appendPt)
	if(appendPt){
		ptOrder=floor(appendPt.t);
		newCtrl=new Draggable(appendPt.pos.x,appendPt.pos.y,res)
		controls.splice(ptOrder+1,0,newCtrl);
	}
	
	return controls;

}


function mousePressed() {
	for(let i=0;i<points.length;i++){
		points[i].pressed();
	}
}

function mouseReleased() {
	let newPoints=[];
	for(let i=0;i<points.length;i++){
		points[i].released();
		
		//make list of zeros within bounds
		if(!points[i].isOutsideScreen()){
			newPoints[newPoints.length]=points[i]
		}
	}
	
	points=newPoints;
	
}

function doubleClicked(){
	newPoints=[];
	let doNewPoint=true;
	for(let p of points){
		if(!p.rollover){
			append(newPoints,p)
		} else {
			doNewPoint=false;
		}
	}
	points=newPoints;
	if(doNewPoint){
		points=addPoint(points);
	}
}



function mouseWheel(event) {
//let scrollAmt=FTscale(event.delta, -scrollMax, scrollMax
if(mouseX>0 && mouseX < width && mouseY>0 && mouseY < height){
	FTscale += event.delta/1000;
	FTscale=constrain(FTscale,-1,5)
	event.preventDefault();

}

}