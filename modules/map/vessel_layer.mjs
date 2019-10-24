import VectorLayer from 'ol/layer/Vector.js';
import Circle from 'ol/style/Circle.js';
import Fill from 'ol/style/Fill.js';
import Icon from 'ol/style/Icon.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';


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
    let heading = null;
    if ('heading' in vessel && vessel.heading != 511) {
        heading = vessel.heading;
    } else if ('course' in vessel) {
        heading = vessel.course;
    }
    if (heading == null)
        return vesselStyle;
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
    let opacity = 1;
    const now = new Date();
    if (now - vessel.lastUpdate > 1000*60*5)
        opacity = 0.5;
    else if (now - vessel.lastUpdate > 1000*60*10)
        opacity = 0.2;
    return new Style({
        image: new Icon({
            src: "vessel.png",
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

