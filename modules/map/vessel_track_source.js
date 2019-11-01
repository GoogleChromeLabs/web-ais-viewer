/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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



