
class Loop {
  constructor(points, strokeColor,fillColor, strokeThickness) {
    this.strokeThickness=strokeThickness;
    this.points=points;
    this.numPoints=points.length;
    this.strokeColor=strokeColor;
    this.fillColor=fillColor;
    
  }

  update() {
    for(var i=0;i<this.numPoints;i++){
      this.points[i].update();
    }
  }

  display() {
    push();
    if(this.strokeColor == null){stroke(0);}
    else{stroke(this.strokeColor);}
    
    if(this.fillColor == null){fill(0,0); }
    else{fill(this.fillColor);}
    
    if(this.strokeThickness==null){strokeWeight(1);}
    else{strokeWeight(this.strokeThickness);}

    
    beginShape();
    
    let newPoints = this.loopPoints();
    for(var i=0;i<newPoints.length;i++){
      curveVertex(newPoints[i].p.x, newPoints[i].p.y);
    }
    endShape();
    pop();
  
    if(doShowPoints){
     for(i=0;i<this.points.length;i++){
        this.points[i].display();
      }
    }
  }  
 
  loopPoints() {
    var newPoints = this.points.slice();
    var point0=this.points[0];
    var point1=this.points[1];
    newPoints.splice(0,0,this.points[this.points.length-1]); //add end point at the start
    newPoints.push(point0);
    newPoints.push(point1);
    return newPoints;
  }
  
  setStrokeColor(strokeColor){ this.strokeColor=strokeColor;}
  setStrokeThickness(strokeThickness){ this.strokeThickness=strokeThickness;}
  setFillColor(fillColor){ this.fillColor=fillColor;}
  

  getCopy(){
    let newPoints=[];
    for(var i=0;i<this.points.length;i++){
      newPoints.push(this.points[i].getCopy());
    }
    let newLoop = new Loop(newPoints,this.strokeColor,this.fillColor,this.strokeThickness);
    return newLoop;
  }
  

}



//loop that keeps track of center and radius
class Circle extends Loop{
  constructor(strokeColor,fillColor,randomScale, center, radius, numPoints,strokeThickness) {
    super([createVector(0,0)],strokeColor,fillColor,strokeThickness);
    this.center=center;
    this.radius=radius;
    this.numPoints=max(numPoints,3);//so it doesnt get too low
    this.randomScale=randomScale;
   
    this.constructCircle();
  }
  
  setCenter(newCenter){
    var newCenterVector = new p5.Vector(newCenter.p.x,newCenter.p.y);
    var diff = p5.Vector.sub(newCenterVector,this.center.p);
    for(var i=0;i<this.numPoints;i++){
        this.points[i].move(diff);
    }
    this.center.move(diff);
  }
  
  setRadius(newRadius){
    for(var i=0;i<this.numPoints;i++){
      if(this.radius!=0){
        var pt = this.points[i].scalePoint(this.center.p,newRadius/this.radius);
      }
    }
    this.radius=max(newRadius,0);
  }
  
  
  setRandomScale(randomScale){ this.randomScale=randomScale;}
  
  //forget the points you gave, jsut strat over
  constructCircle(){
    this.points=[];
    var startPos = createVector(this.center.p.x+this.radius,this.center.p.y);
    for (var i=0;i<this.numPoints;i++){ //Might want to add back in +1
      let p=createVector(startPos.x,startPos.y);
      p.sub(this.center.p);
      p.rotate(2*PI*i/this.numPoints);
      p.add(this.center.p); //rotate by certian ammount
      this.points.push(new Point(p.x,p.y)); //append this to the list
      
      //print(new Point(p.x,p.y));
      // print(this.points[i]);
    }
    //print(this.points.length);
  }
  
  getCopy(){
    let newCircle = new Circle(this.strokeColor,this.fillColor, this.randomScale, this.center.getCopy(), this.radius, this.numPoints,this.strokeThickness);
    return newCircle;
  }
  
  perturb(noiseOptions){
    for(var i=0;i<this.points.length;i++){
      this.points[i].perturb(this.center, this.randomScale,noiseOptions);
    }
    // if(noiseOptions.doPerturbCenter){
    //   this.center.perturb(new p5.Vector(mouseX,mouseY), this.randomScale,noiseOptions);
    //   print(new p5.Vector(mouseX,mouseY));
    // }
  }
  
  update(strokeColor,fillColor,randomScale, center, radius, numPoints,strokeThickness){
    this.strokeColor=strokeColor;
    this.strokeThickness=strokeThickness;
    this.fillColor=fillColor;
    this.randomScale=randomScale;
    this.setCenter(center);
    this.setRadius(radius);
    if(this.numPoints!=numPoints){ //only reconstruct if necessary
      this.numPoints=numPoints;
      this.constructCircle();
    }
  }
  
}
  






class Point{
  constructor(x,y) {
    // this.x=x;
    // this.y=y;
    this.p=createVector(x,y);
	this.diameter=5;
  }
  
  
  display() {
    push();
    ellipseMode(CENTER);
    ellipse(this.p.x, this.p.y, this.diameter, this.diameter);
    pop();
  }
  
perturb(center, randomScale, noiseOptions){
	switch(noiseOptions.type){
		case 'none':
			break;

		case 'radial':
      var random=0;
			if(noiseOptions.doMove){ //if dont loop, then continue to move the center
				//print(noiseOptions.center);
				noiseOptions.center += 2*Math.PI*animLoop.elapsedFramesTotal/animLoop.framesPerLoop*noiseOptions.velocity/animLoop.framesPerSecond*noiseOptions.radius*noiseOptions.scale;
      }
			random = animLoop.noise2D(noiseOptions.center+this.p.x*noiseOptions.scale, this.p.y*noiseOptions.scale,noiseOptions);
      random = map(random,1,-1,1+randomScale,1 -randomScale);
      
      this.scalePoint(center.p,random);
      break;

    case '2D':
      var random1=animLoop.noise2D(noiseOptions.center+this.p.x*noiseOptions.scale, this.p.y*noiseOptions.scale,noiseOptions);
      var random2=animLoop.noise2D(noiseOptions.center+this.p.x*noiseOptions.scale, (this.p.y+1000)*noiseOptions.scale,noiseOptions); //move far enough over to be independent
      var randVect=new p5.Vector(random1,random2);
      randVect.mult(randomScale*noiseOptions.randomScale2D);
      this.p.add(randVect);
    }
}
  
  scalePoint(center, scale){
    this.p.sub(center);
    this.p.mult(scale);
    this.p.add(center);

    // this.x=this.p.x;
    // this.y=this.p.y;
  }
  
  getCopy(){
    return new Point(this.p.x,this.p.y);
  }
  
  move(v){
    this.p.add(v);
  }
}





//  loops=[];
//  var numLoops = 50;
//  var spacing = 200/numLoops;
//  for(var i=0;i<numLoops;i++){
//    var newLoop = generateCircle(p5.Vector.add(center,createVector(spacing*i,0)), center, 12);
//    newLoop.setStrokeColor(color(255*i/30,0,0,50));
//    newLoop.setFillColor(color(0,1)); //no fill
//    newLoop.setRandomScale(.05);
//    //newLoop.setRandomScale(exp(map(-i,0,numLoops,-0.1,0.1)-1));
//    //newLoop.setRandomScale(0.2);
//    loops.push(newLoop);
//  }
   //baseLoop = generateCircle(createVector(width/2,height/3), center, 12);
  //baseLoop.setColor(color(255,0,0));
  //perturbedLoop = baseLoop.getCopy();
  //perturbedLoop.perturb(1);




  //let points = [];
  //points.push(new Point(width/2,height/2));
  //points.push(new Point(width/3,height/3));
  //points.push(new Point(width/4,height/4));
  //points.push(new Point(width/6,height/2));
  //points.push(new Point(width/3,height/3));
  //points.push(new Point(width/5,height/4));
  //points.push(new Point(width/2,height/2));
  //points.push(new Point(width/3,height/6));
  //points.push(new Point(width/7,height/4));
  //loop = new Loop(color(255,0,0),points);
