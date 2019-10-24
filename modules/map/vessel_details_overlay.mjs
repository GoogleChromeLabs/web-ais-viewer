import Overlay from 'ol/Overlay.js';
import {getCenter} from 'ol/extent.js';
import {formatVesselData} from '../formatter.mjs';

export default class VesselDetailsOverlay extends Overlay {
    #featurePropertyChanged = (e => {
        const feature = e.target;
        if (e.key == 'geometry') {
            const geometry = feature.getGeometry();
            this.setPosition(getCenter(geometry.getExtent()));
        } else if (e.key == 'data') {
            const data = feature.get('data');
            this.getElement().innerHTML = formatVesselData(data);
        }
    }).bind(this);

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
