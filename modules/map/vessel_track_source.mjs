import Feature from 'ol/Feature.js';
import VectorSource from 'ol/source/Vector.js';
import LineString from 'ol/geom/LineString.js';
import {fromLonLat} from 'ol/proj.js';

export default class VesselTrackSource extends VectorSource {
    constructor() {
        super();
    }

    addOrUpdateVessel(vessel) {
        if (!('track' in vessel && vessel.track.length > 0))
            return;

        let feature = this.getFeatureById("track" + vessel.mmsi);
        if (!feature) {
            feature = new Feature({
                name: "track" + vessel.mmsi
            });
            feature.setId("track" + vessel.mmsi);
            this.addFeature(feature);
        }
        let points = [];
        for (const point of vessel.track.slice(-100)) {
            let coord = fromLonLat([point.lon, point.lat]);
            if (!isFinite(coord[0]) || !isFinite(coord[1]))
                continue;
            points.push(coord);
        }
        if (points.length == 0)
            return;

        feature.setGeometry(new LineString(points));
        feature.set('data', vessel);
        feature.setStyle(undefined);
    }

    setVisible(mmsi) {
        let feature = this.getFeatureById("track" + vessel.mmsi);
        if (!feature)
            return;

        feature.setStyle(trackStyle);
    }
};



