

var json=
{
presets:{
	grey:{
		myNumber: 3,
		myColor: '#999999',
	},

	red: {
		myNumber: 6,
		myColor: '#FF0000',
	},

	mauve: {"myNumber":7.3,"myColor":"#460707","myNumber2":2.4},
},

params: {
	test1:{
		displayName: "this is a test",
		otherParameter: "something else",

		myNumber: {
			type: "number",
			default: 5,
			min: 0,
			max: 10,
			step: .1,
			interpolateType: 'exp',
			minValue: -4,
			maxValue: 1,
			},
	
		myColor: {
			type: "color",
			default: "#00BB22"
			},
	},

	test2:{
		displayName: "this is a test2",

		myNumber2: {
			type: "number",
			default: 5,
			min: 0,
			max: 10,
			step: .1
			},
	}
},

}
