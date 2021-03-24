/// <reference path="../deploy/wonderland.js" />
/// <reference path="../deploy/DefaultScene-bundle.js" />
WL.registerComponent('freq', {
    synthObject: { type: WL.Type.Object },
    antenna: { type: WL.Type.Object, default: null },
    handedness: { type: WL.Type.Enum, default: 'left', values: ['left', 'right'] }
}, {
    init: function () {
        this.handedness = ['left', 'right'][this.handedness];

    },
    start: function () {
        this.synth = this.synthObject.getComponent('synth');
        this.antennaPosition = [0, 0, 0];
        this.antenna.getTranslationWorld(this.antennaPosition);
        this.joints = [];
        this.session = null;
        this.refSpace = null;
        this.hasPose = false;

        if (!('XRHand' in window)) {
            console.warn("WebXR Hand Tracking not supported by this browser.");
            this.active = false;
            return;
        }
    },
    update: function (dt) {
        if (!this.session) {
            if (WL.xrSession) this.setupVREvents(WL.xrSession);
        }
        this.hasPose = false;
        if (this.session && this.session.inputSources && this.refSpace) {
            for (let i = 0; i <= this.session.inputSources.length; ++i) {
                const inputSource = this.session.inputSources[i];
                if (!inputSource || !inputSource.hand || inputSource.handedness != this.handedness) continue;
                this.hasPose = true;
                if (inputSource.hand.get('wrist') !== null) {
                    const p = Module['webxr_frame'].getJointPose(inputSource.hand.get('wrist'), this.refSpace);


                    if (p) {
                        let dist = Math.abs(glMatrix.vec3.distance(
                            [p.transform.position.x, 0, p.transform.position.z],
                            [this.antennaPosition[0], 0, this.antennaPosition[2]])
                        );
                        if (dist > .5) {
                            this.synth.setFrequency(0);
                        } else {
                            let k = 1 - (dist * 2);
                            this.synth.setFrequency(k * 1500);
                        }
                    }
                }


            }
        }
    },

    setupVREvents: function (s) {
        s.requestReferenceSpace('local').then(function (refSpace) { this.refSpace = refSpace; }.bind(this));
        this.session = s;
    },
});