//earlier defined parameters overwritten by later ones

var json = {




params: {
	master: {
		displayName: "Master",
	  },


	style: {
		displayName: "Style Controls",

		blendMode: {
			type: 		"dropdown",
			options:	["normal","difference","lighter","multiply","screen","hard light", "color burn","color dodge","overlay"],
			default: 	{index:0,value:"source-over"},
			lookup: {
				"normal":"source-over",
				//"remove":"destination-out",
				"hard light":"hard-light",
				"color burn":"color-burn",
				"color dodge":"color-dodge"
			}
		},

		doShowPoints: {
			type: 		"boolean",
			default: 	false,	
		},
	
		bgColor: {
			type: 		"color",
			default: 	[200,200,200]
		},
	
		bgOpacity: {
			type: 		"number",
			default: 	.27,
			min: 		0,
			max: 		1,
			step: 		.001,
			interpolateType: 'exp',
			minValue:0, 
			maxValue:2.5	
		},
	  
		strokeColorStart: {
			type: 		"color",
			default: 	[255,117,117]
		},
	
		strokeColorEnd: {
			type: 		"color",
			default: 	[118,102,163]
		},
	  
		strokeOpacity: {
			type: 		"number",
			default: 	1,
			min: 		0,
			max: 		1,
			step: 		.001,	
			interpolateType: 'exp',
			minValue:0, 
			maxValue:2.5
		},
	  
		strokeThicknessStart: {
			type: 		"number",
			default: 	1,
			min: 		0,
			max: 		20,
			step: 		0.1,
		},
	
		strokeThicknessEnd: {
			type: 		"number",
			default: 	1,
			min: 		0,
			max: 		20,
			step: 		0.1	
		},
	
	  
		fillColorStart: {
			type: 		"color",
			default: 	[255,255,255]
		},
	
		fillColorEnd: {
			type: 		"color",
			default: 	[69,69,69]
		},
	
		fillOpacity: {
			type: 		"number",
			default: 	0,
			min: 		0,
			max: 		1,
			step: 		.001,	
			interpolateType: 'exp',
			minValue:0, 
			maxValue:2.5,
		},
	},



	ani: {
		displayName: "Animation controls",
		loopDuration: 5,
		frameRate: 60,
	  
		radiusStart: {
			type: 		"number",
			default: 	200,
			min: 		0,
			max: 		600,
			step: 		1	
		}, 
	
		radiusEnd: {
			type: 		"number",
			default: 	0,
			min: 		0,
			max: 		600,
			step: 		1	
		}, 
	
		numLoops: {
			type: 		"number",
			default: 	5,
			min: 		1,
			max: 		100,
			step: 		1	
		}, 
	  
		numPointsStart: {
			type: 		"number",
			default: 	8,
			min: 		3,
			max: 		20,
			step: 		1	
		},  
	
		numPointsEnd: {
			type: 		"number",
			default: 	8,
			min: 		3,
			max: 		20,
			step: 		1	
		},  
	},

	noise: {
		displayName: "Noise Controls",
		randomScale2D : 100,
	
		noiseType: {
			type: 		"dropdown",
			options:	["radial","2D","none"],
			default: 	{index:0,value:"radial"},
		},
		
		doStayPut: {
			type: 		"boolean",
			default: 	"true"	
		},

		// doPerturbCenter: {
		// 	type: 		"boolean",
		// 	default: 	"false"	
		// },

		randomScaleStart: {
			type: 		"number",
			default: 	1,
			min: 		0,
			max: 		1,
			step: 		0.001,	
			interpolateType: 'exp',
			minValue:-1, 
			maxValue:1
		},
	
		randomScaleEnd: {
			type: 		"number",
			default: 	1,
			min: 		0,
			max: 		1,
			step: 		0.001,				
			interpolateType: 'exp',
			minValue:-1, 
			maxValue:1
		}, 
	
		noiseRadius: {
			type: 		"number",
			default: 	0.2,
			min: 		0,
			max: 		1,
			step: 		.001	
		},   
	
		noiseScale: {
			type: 		"number",
			default: 	.65,
			min: 		0,
			max: 		1,
			step: 		.001,	
			interpolateType: 'exp',
			minValue:-4, 
			maxValue:-1
		},   
	
		doMoveNoise: {
			type: 		"boolean",
			default: 	"false"	
		},

		noiseCenterVelocity: {
			type: 		"number",
			default: 	.2,
			min: 		0,
			max: 		1,
			step: 		.001,	
			interpolateType: 'exp',
			minValue:-3, 
			maxValue:-1
		},  
	},
},

presets: {
	"default": {
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
		},

	"Moir‌é": {"doShowPoints":false,"bgColor":"#c2bce7","bgOpacity":1,"strokeColorStart":"#ff0000","strokeColorEnd":"#2c302c","strokeOpacity":1,"strokeThicknessStart":0.6,"strokeThicknessEnd":1.4,"fillColorStart":"#000000","fillColorEnd":"#000000","fillOpacity":0,"radiusStart":0,"radiusEnd":147,"numLoops":100,"numPointsStart":19,"numPointsEnd":19,"noiseType":{"index":0,"label":"radial","value":"radial"},"randomScaleStart":1.26,"randomScaleEnd":0,"noiseRadius":0.48,"noiseScale":0,"doMoveNoise":true,"noiseCenterVelocity":0.129},

	"sunquake":	{"doShowPoints":false,"bgColor":"#000000","bgOpacity":0.308,"strokeColorStart":"#d6eef0","strokeColorEnd":"#dcd138","strokeOpacity":0.83,"strokeThicknessStart":2.5,"strokeThicknessEnd":0,"fillColorStart":"#000000","fillColorEnd":"#000000","fillOpacity":0,"radiusStart":0,"radiusEnd":200,"numLoops":100,"numPointsStart":8,"numPointsEnd":8,"noiseType":{"index":0,"label":"radial","value":"radial"},"randomScaleStart":1,"randomScaleEnd":1,"noiseRadius":0.433,"noiseScale":0.724,"doMoveNoise":false,"noiseCenterVelocity":0.08},

	"amoeba": {"doShowPoints":false,"bgColor":"#1c1212","bgOpacity":1,"strokeColorStart":"#50663d","strokeColorEnd":"#000000","strokeOpacity":1,"strokeThicknessStart":20,"strokeThicknessEnd":0,"fillColorStart":"#0e4e1e","fillColorEnd":"#1e0a3e","fillOpacity":1,"radiusStart":337,"radiusEnd":0,"numLoops":16,"numPointsStart":20,"numPointsEnd":3,"noiseType":{"index":0,"label":"radial","value":"radial"},"doLoopNoise":true,"randomScaleStart":2,"randomScaleEnd":2,"noiseRadius":0.77,"noiseScale":1,"noiseCenterVelocity":0.093},


	"caustics": {"doShowPoints":false,"bgColor":"#000000","bgOpacity":0,"strokeColorStart":"#feffb3","strokeColorEnd":"#000000","strokeOpacity":0.083,"strokeThicknessStart":1,"strokeThicknessEnd":1,"fillColorStart":"#ffffff","fillColorEnd":"#ffffff","fillOpacity":0,"radiusStart":200,"radiusEnd":200,"numLoops":1,"numPointsStart":8,"numPointsEnd":8,"noiseType":{"index":0,"label":"radial","value":"radial"},"randomScaleStart":0.596,"randomScaleEnd":0.5,"noiseRadius":0.22,"noiseScale":0.845,"doMoveNoise":true,"noiseCenterVelocity":0.143},

	"iridescent":{"blendMode":{"index":6,"label":"hard light","value":"hard light"},"doShowPoints":false,"bgColor":"#000000","bgOpacity":0.272,"strokeColorStart":"#a8e6ff","strokeColorEnd":"#b96e6e","strokeOpacity":0.568,"strokeThicknessStart":6,"strokeThicknessEnd":0,"fillColorStart":"#00ff33","fillColorEnd":"#ffffff","fillOpacity":0.073,"radiusStart":0,"radiusEnd":200,"numLoops":100,"numPointsStart":8,"numPointsEnd":8,"noiseType":{"index":0,"label":"radial","value":"radial"},"randomScaleStart":1,"randomScaleEnd":0,"noiseRadius":0.399,"noiseScale":0.662,"doMoveNoise":true,"noiseCenterVelocity":0.144},

	"startbursts":{"blendMode":{"index":1,"label":"difference","value":"difference"},"doShowPoints":false,"bgColor":"#ffffff","bgOpacity":1,"strokeColorStart":"#000000","strokeColorEnd":"#000000","strokeOpacity":1,"strokeThicknessStart":0,"strokeThicknessEnd":0,"fillColorStart":"#001975","fillColorEnd":"#1e2f6c","fillOpacity":1,"radiusStart":241,"radiusEnd":20,"numLoops":10,"numPointsStart":20,"numPointsEnd":3,"noiseType":{"index":0,"label":"radial","value":"radial"},"randomScaleStart":1,"randomScaleEnd":0.605,"noiseRadius":0.938,"noiseScale":1,"doMoveNoise":false,"noiseCenterVelocity":0.093},

	"technicolor": {"blendMode":{"index":1,"label":"difference","value":"difference"},"doShowPoints":false,"bgColor":"#ffffff","bgOpacity":1,"strokeColorStart":"#ffffff","strokeColorEnd":"#ffffff","strokeOpacity":1,"strokeThicknessStart":1,"strokeThicknessEnd":1,"fillColorStart":"#ff2424","fillColorEnd":"#4f268c","fillOpacity":1,"radiusStart":187,"radiusEnd":228,"numLoops":15,"numPointsStart":8,"numPointsEnd":8,"noiseType":{"index":0,"label":"radial","value":"radial"},"randomScaleStart":0,"randomScaleEnd":1,"noiseRadius":0.586,"noiseScale":0.68,"doMoveNoise":true,"noiseCenterVelocity":0},

	"V A P O R W A V E": {"blendMode":{"index":2,"label":"lighter","value":"lighter"},"doShowPoints":false,"bgColor":"#000000","bgOpacity":1,"strokeColorStart":"#ffffff","strokeColorEnd":"#ffffff","strokeOpacity":0.778,"strokeThicknessStart":0.2,"strokeThicknessEnd":1.8,"fillColorStart":"#ff2424","fillColorEnd":"#5800db","fillOpacity":0.595,"radiusStart":125,"radiusEnd":349,"numLoops":100,"numPointsStart":20,"numPointsEnd":20,"noiseType":{"index":0,"label":"radial","value":"radial"},"randomScaleStart":0,"randomScaleEnd":0.148,"noiseRadius":0.084,"noiseScale":0.791,"doMoveNoise":true,"noiseCenterVelocity":0},

	"octopus": {"blendMode":{"index":0,"label":"normal","value":"normal"},"doShowPoints":true,"bgColor":"#c7c7c7","bgOpacity":0.784,"strokeColorStart":"#000000","strokeColorEnd":"#000000","strokeOpacity":0.756,"strokeThicknessStart":0,"strokeThicknessEnd":1.5,"fillColorStart":"#ffffff","fillColorEnd":"#ffffff","fillOpacity":0,"radiusStart":197,"radiusEnd":9,"numLoops":100,"numPointsStart":8,"numPointsEnd":8,"noiseType":{"index":1,"label":"2D","value":"2D"},"randomScaleStart":0.266,"randomScaleEnd":0.137,"noiseRadius":0.835,"noiseScale":0.773,"doMoveNoise":true,"noiseCenterVelocity":0},

	"cone":{"blendMode":{"index":0,"label":"normal","value":"normal"},"doShowPoints":false,"bgColor":"#c8c8c8","bgOpacity":1,"strokeColorStart":"#000000","strokeColorEnd":"#000000","strokeOpacity":1,"strokeThicknessStart":1,"strokeThicknessEnd":1,"fillColorStart":"#ffffff","fillColorEnd":"#ffffff","fillOpacity":0,"radiusStart":200,"radiusEnd":0,"numLoops":63,"numPointsStart":8,"numPointsEnd":8,"noiseType":{"index":0,"label":"radial","value":"radial"},"doStayPut":true,"doPerturbCenter":false,"randomScaleStart":0.5,"randomScaleEnd":0.5,"noiseRadius":0.25,"noiseScale":0.648,"doMoveNoise":true,"noiseCenterVelocity":0},
}

}