import VectorLayer from 'ol/layer/Vector.js';
import {Circle, Fill, Icon, Stroke, Style} from 'ol/style.js';

function shouldShowVessel(vessel) {
    const now = new Date();
    return true;
    return (now - vessel.lastUpdate) < 1000*60*30;
}

// Style for non-moving vessels.
const defaultVesselStyle = new Style({
    image: new Circle({
      radius: 6,
      fill: new Fill({color: 'rgba(255,255,255,0.4)'}),
      stroke: new Stroke({
        color: '#3399CC', width: 1.25
      })
    })
});

function getVesselStyle(feature, resolution) {
    const vessel = feature.get('data');

    if (!shouldShowVessel(vessel))
        return null;

    let heading = null;
    if ('heading' in vessel && vessel.heading != 511) {
        heading = vessel.heading;
    } else if ('course' in vessel) {
        heading = vessel.course;
    }
    if (heading == null)
        return defaultVesselStyle;

    heading = heading / 180 * Math.PI;
    let color = '#000000';
    if (vessel.shiptype >= 50 && vessel.shiptype < 60)
        color = '#ff9200';
    else if (vessel.shiptype >= 60 && vessel.shiptype < 70)
        color = '#0000ff';
    let scale = 0.3;
    if ('to_bow' in vessel && 'to_stern' in vessel) {
        let length = vessel.to_bow + vessel.to_stern;
        if (length > 40)
            scale = 0.35;
        if (length > 100)
            scale = 0.4;
        if (length > 200)
            scale = 0.45;
    }
    let opacity = 0.9;
    const now = new Date();
    if (now - vessel.lastUpdate > 1000*60*5)
        opacity = 0.5;
    else if (now - vessel.lastUpdate > 1000*60*10)
        opacity = 0.2;
    else if (now - vessel.lastUpdate > 1000*60*20)
        opacity = 0.1;
    return new Style({
        image: new Icon({
            src: "vessel2.png",
            scale: scale,
            rotation: heading,
            color: color,
            opacity: opacity
        })
    });
}

export default class VesselLayer extends VectorLayer {
    constructor(options) {
        super({style: getVesselStyle, ...options});
    }
};

