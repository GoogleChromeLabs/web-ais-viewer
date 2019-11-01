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


