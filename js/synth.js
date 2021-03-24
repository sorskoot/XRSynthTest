/// <reference path="../deploy/wonderland.js" />
/// <reference path="../deploy/tone.js" />

WL.registerComponent('synth', {
    param: {type: WL.Type.Float, default: 1.0},
}, {
    init: function() {
		this.gainNode = new Tone.Gain(0);
		this.synth = new Tone.Synth();			
		// 	Tone.MonoSynth, {
		// 	volume: -8,
		// 	oscillator: {
		// 		type: "square8"
		// 	},
		// 	envelope: {
		// 		attack: 0.05,
		// 		decay: 0.3,
		// 		sustain: 0.4,
		// 		release: 0.8,
		// 	},
		// 	filterEnvelope: {
		// 		attack: 0.001,
		// 		decay: 0.7,
		// 		sustain: 0.1,
		// 		release: 0.8,
		// 		baseFrequency: 300,
		// 		octaves: 4
		// 	}
		// });
		this.synth.connect(this.gainNode);
		this.gainNode.toDestination();
      WL.onXRSessionStart.push(this.startSynth.bind(this));   
	  WL.onXRSessionEnd.push(this.stopSynth.bind(this));   
	  
    },    
	stopSynth:function(){
		this.synth.triggerRelease(".5");
	},
    startSynth:function(){
		this.gainNode.gain.value=0;
        this.synth.triggerAttack(100, 0, 1);
    },
	setFrequency:function(freq){		
		this.synth.frequency.rampTo(freq,.05);
	},
	setVolume:function(vol){		
		this.gainNode.gain.rampTo(vol,.05);
	}

});


