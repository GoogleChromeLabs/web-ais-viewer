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


