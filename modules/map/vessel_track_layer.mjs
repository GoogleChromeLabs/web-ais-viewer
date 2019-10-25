import VectorLayer from 'ol/layer/Vector.js';
import {Circle, Fill, Icon, Stroke, Style} from 'ol/style.js';

const trackStyle = new Style({
    stroke: new Stroke({
        color: '#3399CC', width: 2
    })
});


export default class VesselTrackLayer extends VectorLayer {
    current_mmsi = null;

    constructor(options) {
        super({style: feature => {
            const vessel = feature.get('data');
            if (vessel.mmsi == this.current_mmsi)
                return trackStyle;
            return null;
        }, ...options});
    }

    set_vessel(mmsi) {
        this.current_mmsi = mmsi;
        this.changed();
    }
};


