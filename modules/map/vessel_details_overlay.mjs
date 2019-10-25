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

import Overlay from 'ol/Overlay.js';
import {getCenter} from 'ol/extent.js';
import {formatVesselData} from '../formatter.mjs';

export default class VesselDetailsOverlay extends Overlay {
    #featurePropertyChanged = e => {
        const feature = e.target;
        if (e.key == 'geometry') {
            const geometry = feature.getGeometry();
            this.setPosition(getCenter(geometry.getExtent()));
        } else if (e.key == 'data') {
            const data = feature.get('data');
            this.getElement().innerHTML = formatVesselData(data);
        }
    }

    constructor() {
        const element = document.createElement('div');
        element.className = 'vessel';

        super({
            element: element,
            autoPan: true
        });
    }

    setFeature(feature) {
        const old_feature = this.get('feature');
        if (old_feature === feature)
            return;
        if (old_feature)
            old_feature.un('propertychange', this.#featurePropertyChanged);
        if (!feature) {
            this.setPosition(undefined);
            return;
        }
        this.set('feature', feature);
        feature.on('propertychange', this.#featurePropertyChanged);

        const data = feature.get('data');
        this.getElement().innerHTML = formatVesselData(data);

        const geometry = feature.getGeometry();
        this.setPosition(getCenter(geometry.getExtent()));
    }
};
