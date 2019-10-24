import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import {fromLonLat} from 'ol/proj.js';

import VesselLayer from "./modules/map/vessel_layer.mjs";
import VesselSource from "./modules/map/vessel_source.mjs";
import VesselDetailsOverlay from "./modules/map/vessel_details_overlay.mjs";


// Don't show vessels that haven't updated in 15 minutes.
function shouldShowVessel(vessel) {
    const now = new Date();
    return (now - vessel.lastUpdate) < 1000*60*15;
}

function getVesselData(mmsi) {
    const data = localStorage[mmsi];
    if (!data) return null;
    const vessel = JSON.parse(data);
    if (!(vessel.lon && vessel.lat && vessel.mmsi && vessel.lastUpdate))
        return null;
    vessel.lastUpdate = new Date(vessel.lastUpdate);
    return vessel;
}

const vesselSource = new VesselSource();

for (let i = 0; i < localStorage.length; ++i) {
    const vessel = getVesselData(localStorage.key(i));
    if (!vessel) continue;
    if (!shouldShowVessel(vessel))
        continue;
    vesselSource.addOrUpdateVessel(vessel);
}
self.addEventListener('storage', e => {
    if (e.storageArea != localStorage) return;
    const vessel = getVesselData(e.key);
    if (!vessel) return;
    vesselSource.addOrUpdateVessel(vessel);
});

const vessel_layer = new VesselLayer({source: vesselSource});

const vessel_details_overlay = new VesselDetailsOverlay();

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM()
        }),
        vessel_layer
    ],
    overlays: [
        vessel_details_overlay
    ],
    view: new View({
        center: fromLonLat([-122.348, 37.798]),
        zoom: 13
    })
});


map.on('click', e => {
    let gotFeature = false;
    const closestFeature = vesselSource.getClosestFeatureToCoordinate(e.coordinate);
    map.forEachFeatureAtPixel(e.pixel, feature => {
        if (feature != closestFeature)
            return;
        gotFeature = true;

        vessel_details_overlay.setFeature(feature);
    }, {layerFilter: layer => layer == vessel_layer, hitTolerance: 16});

    if (!gotFeature)
        vessel_details_overlay.setFeature(undefined);
});


// Every 30 seconds, remove features that haven't been updated recently.
self.setInterval(() => {
    const now = new Date();
    for (const feature of vesselSource.getFeatures()) {
        const vessel = feature.get('data');
        if (!shouldShowVessel(vessel)) {
            if (vessel_details_overlay.get('feature') == feature)
                vessel_details_overlay.setFeature(undefined);
            vesselSource.removeFeature(feature);
        }
    }
}, 1000*30);
