
function setPreset(preset){
	v=getDefault(this,params);
	Object.assign(v,getPreset(preset));
}

getPreset=function(preset){
	if(typeof preset == 'number'){preset = master_params.preset.options[preset] }
	switch(preset){
		case "grey":
		return {
			preset: 0,
			bgColor: "#c8c8c8",
			bgOpacity: 1,
			doLoopNoise: "false",
			doShowPoints: false,
			fillColorEnd: "#ffffff",
			fillColorStart: "#ffffff",
			fillOpacity: 0,
			frameRate: undefined,
			loopDuration: undefined,
			noiseCenterVelocity: 0,
			noiseRadius: 0.25,
			noiseScale: 0.845,
			noiseType: {index:0,value:"radial"},
			numLoops: 1,
			numPointsEnd: 8,
			numPointsStart: 8,
			radiusEnd: 200,
			radiusStart: 200,
			randomScaleEnd: 0.5,
			randomScaleStart: 0.5,
			strokeColorEnd: "#000000",
			strokeColorStart: "#000000",
			strokeOpacity: 1,
			strokeThicknessEnd: 1,
			strokeThicknessStart: 1,
		}
		break;

		case "red":
		return {
			preset: 1,
			bgColor: "#FF0000",
			bgOpacity: 1,
			doLoopNoise: "false",
			doShowPoints: false,
			fillColorEnd: "#ffffff",
			fillColorStart: "#ffffff",
			fillOpacity: 0,
			frameRate: undefined,
			loopDuration: undefined,
			noiseCenterVelocity: 0,
			noiseRadius: 0.25,
			noiseScale: 0.845,
			noiseType: {index:0,value:"radial"},
			numLoops: 1,
			numPointsEnd: 8,
			numPointsStart: 8,
			radiusEnd: 200,
			radiusStart: 200,
			randomScaleEnd: 0.5,
			randomScaleStart: 0.5,
			strokeColorEnd: "#FF0000",
			strokeColorStart: "#000000",
			strokeOpacity: 1,
			strokeThicknessEnd: 1,
			strokeThicknessStart: 1,
		}
		break;

		case "test":
			return {"preset":2,"doShowPoints":false,"bgColor":"#ff2929","bgOpacity":0.27,"strokeColorStart":"#ff7575","strokeColorEnd":"#000000","strokeOpacity":1,"strokeThicknessStart":1,"strokeThicknessEnd":1,"fillColorStart":"#ffffff","fillColorEnd":"#454545","fillOpacity":0,"radiusStart":73,"radiusEnd":421,"numLoops":43,"numPointsStart":15,"numPointsEnd":8,"doLoopNoise":false,"noiseType":"radial","randomScaleStart":0.15,"randomScaleEnd":1,"noiseRadius":0.67,"noiseScale":0.259,"noiseCenterVelocity":0.642};
		
	}
}