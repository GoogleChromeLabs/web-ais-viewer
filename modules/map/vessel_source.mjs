import Feature from 'ol/Feature.js';
import VectorSource from 'ol/source/Vector.js';
import Point from 'ol/geom/Point.js';
import {fromLonLat} from 'ol/proj.js';

export default class VesselSource extends VectorSource {
    constructor() {
        super();
    }

    addOrUpdateVessel(vessel) {
        let feature = this.getFeatureById(vessel.mmsi);
        if (!feature) {
            feature = new Feature({
                name: vessel.mmsi
            });
            feature.setId(vessel.mmsi);
            this.addFeature(feature);
        }
        feature.setGeometry(new Point(fromLonLat([vessel.lon, vessel.lat])));
        feature.set('data', vessel);
    }
};


