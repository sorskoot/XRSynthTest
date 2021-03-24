/// <reference path="../deploy/wonderland.js" />
/// <reference path="../deploy/DefaultScene-bundle.js" />
WL.registerComponent('vol', {
    synthObject: { type: WL.Type.Object },
    antenna: { type: WL.Type.Object, default: null },
    handedness: { type: WL.Type.Enum, default: 'left', values: ['left', 'right'] },
    debug: {type: WL.Type.Object, default: null}
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
                        this.object.resetTranslationRotation();
                        this.object.transformLocal.set([
                            p.transform.orientation.x,
                            p.transform.orientation.y,
                            p.transform.orientation.z,
                            p.transform.orientation.w]);
                        this.object.translate([
                            p.transform.position.x,
                            p.transform.position.y,
                            p.transform.position.z]);

                        handPos = [0, 0, 0];
                        this.object.getTranslationWorld(handPos);

                         let dist = glMatrix.vec3.distance(
                             [0, handPos[1], 0],
                             [0, this.antennaPosition[1],0])-.1;
                         //console.log(dist);
                          if (dist > .25) {
                             this.synth.setVolume(1);
                          } else {
                             let k = dist*4;
                             this.synth.setVolume(Math.max(0,k));
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