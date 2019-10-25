import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import {fromLonLat} from 'ol/proj.js';
import TileArcGISRest from 'ol/source/TileArcGISRest.js';

import VesselLayer from "./modules/map/vessel_layer.mjs";
import VesselSource from "./modules/map/vessel_source.mjs";
import VesselDetailsOverlay from "./modules/map/vessel_details_overlay.mjs";

import SerialSettingsControl from "./modules/serial_settings.mjs";

function getVesselData(mmsi) {
    const data = localStorage[mmsi];
    if (!data) return null;
    const vessel = JSON.parse(data);
    if (!(vessel.lon && vessel.lat && vessel.mmsi && vessel.lastUpdate))
        return null;
    vessel.lastUpdate = new Date(vessel.lastUpdate);
    return vessel;
}

const vessel_source = new VesselSource();

for (let i = 0; i < localStorage.length; ++i) {
    const vessel = getVesselData(localStorage.key(i));
    if (!vessel) continue;
    vessel_source.addOrUpdateVessel(vessel);
}
self.addEventListener('storage', e => {
    if (e.storageArea != localStorage) return;
    const vessel = getVesselData(e.key);
    if (!vessel) return;
    vessel_source.addOrUpdateVessel(vessel);
});

const vessel_layer = new VesselLayer({source: vessel_source});

const vessel_details_overlay = new VesselDetailsOverlay();

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            //source: new OSM()
            source: new TileArcGISRest({url: "https://seamlessrnc.nauticalcharts.noaa.gov/arcgis/rest/services/RNC/NOAA_RNC/ImageServer"})
        }),
        vessel_layer
    ],
    overlays: [
        vessel_details_overlay
    ],
    view: new View({
        center: fromLonLat([-122.348, 37.798]),
        zoom: 14
    })
});


map.on('click', e => {
    let gotFeature = false;
    const closestFeature = vessel_source.getClosestFeatureToCoordinate(e.coordinate);
    map.forEachFeatureAtPixel(e.pixel, feature => {
        if (feature != closestFeature)
            return;
        gotFeature = true;

        vessel_details_overlay.setFeature(feature);
    }, {layerFilter: layer => layer == vessel_layer, hitTolerance: 16});

    if (!gotFeature)
        vessel_details_overlay.setFeature(undefined);
});

map.addControl(new SerialSettingsControl());
