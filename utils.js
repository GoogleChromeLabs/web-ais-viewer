
function formatLatLon(val, labels) {
    let degrees = Math.trunc(val);
    let minutes = Math.abs(val - degrees) * 60;
    if (labels) degrees = Math.abs(degrees);
    let result = degrees + "° " + (minutes).toFixed(3) + '\'';
    if (labels) {
        result += ' ' + labels[val < 0 ? 1 : 0];
    }
    return result;
}

function formatDegrees(degrees) {
    return degrees + "°";
}

function formatShipType(type) {
    if (type >= 20 && type <= 29) {
        return 'Wing in ground: ' + type;
    }
    if (type >= 40 && type <= 49) {
        return 'High speed craft: ' + type;
    }
    if (type >= 60 && type <= 69) {
        return 'Passenger: ' + type;
    }
    if (type >= 70 && type <= 79) {
        return 'Cargo: ' + type;
    }
    if (type >= 80 && type <= 89) {
        return 'Tanker: ' + type;
    }
    switch (type) {
        case 30: return 'Fishing';
        case 31: return 'Towing';
        case 32: return 'Large Towing';
        case 33: return 'Dredging';
        case 34: return 'Diving';
        case 35: return 'Military';
        case 36: return 'Sailing';
        case 37: return 'Pleasure Craft';
        case 50: return 'Pilot';
        case 51: return 'SAR';
        case 52: return 'Tug';
        case 53: return 'Port Tender';
        case 54: return 'Anti-pollution equipment';
        case 55: return 'Law enforcement';
        case 58: return 'Medical Transport';
        case 59: return 'Noncombatant ship';
    }
    return 'Other: ' + type;
}

function formatVesselData(data) {
    let result = '<h3>' + (data.shipname ? data.shipname : data.mmsi) + '</h3>';
    result += '<dl>';
    result += '<dt>MMSI</dt><dd>' + data.mmsi + '</dd>';
    if ('callsign' in data && data.callsign) {
        result += '<dt>Callsign</dt><dd>' + data.callsign + '</dd>';
    }
    if ('shiptype' in data) {
        result += '<dt>Type</dt><dd>' + formatShipType(data.shiptype) + '</dd>';
    } else if ('type' in data) {
        result += '<dt>Type</dt><dd>' + data.type + '</dd>';
    }
    result += '<dt>Longitude</dt><dd>' + formatLatLon(data.lon, 'EW') + '</dd>';
    result += '<dt>Latitude</dt><dd>' + formatLatLon(data.lat, 'NS') + '</dd>';
    if ('speed' in data) {
        result += '<dt>Speed</dt><dd>' + data.speed + ' kts</dd>';
    }
    if ('course' in data) {
        result += '<dt>Course</dt><dd>' + formatDegrees(data.course) + '</dd>';
    }
    if ('heading' in data && data.heading != 511) {
        result += '<dt>Heading</dt><dd>' + formatDegrees(data.heading) + '</dd>';
    }
    if ('destination' in data && data.destination) {
        result += '<dt>Destination</dt><dd>' + data.destination + '</dd>';
    }
    if ('to_bow' in data && 'to_stern' in data) {
        result += '<dt>Length</dt><dd>' + (data.to_bow + data.to_stern) + ' m</dd>';
    }
    if ('to_port' in data && 'to_starboard' in data) {
        result += '<dt>Beam</dt><dd>' + (data.to_port + data.to_starboard) + ' m</dd>';
    }

    result += '</dl>';
    result += '<i>' + data.lastUpdate.toLocaleDateString(undefined, {dateStyle: 'short', timeStyle: 'medium'}) + '</i>';
    return result;
}
