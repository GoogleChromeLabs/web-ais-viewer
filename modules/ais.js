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

export const kAISMessageTypes = ['VDM', 'VDO'];

// Decodes payload into bit stream.
function DecodePayload(payload, padding) {
    let result = '';
    for (let i = 0; i < payload.length; ++i) {
        let val = payload.charCodeAt(i) - 48;
        if (val > 40) val -= 8;
        result += (val).toString(2).padStart(6, '0');
    }
    if (padding != 0)
        result = result.slice(0, -padding);
    return result;
}

// Combines multi-sentence AIS messages into one, and decodes their payload.
class AISPayloadDecoder {
    start(controller) {
        this.current_fragment_count = 0;
        this.last_fragment_number = 0;
        this.current_message_id = null;
    }

    async transform(chunk, controller) {
        let [fragment_count, fragment_number, message_id, radio_channel, payload, padding] = chunk;

        if (fragment_count == 1) {
            payload = DecodePayload(payload, padding);
            controller.enqueue({radio_channel, payload});
            return;
        }

        if (fragment_number == 1) {
            this.current_fragment_count = fragment_count;
            this.current_message_id = message_id;
            this.last_fragment_number = fragment_number;
            this.accumulated_payload = payload;
            return;
        }

        if (message_id != this.current_message_id || fragment_count != this.current_fragment_count) {
            // Ignore this chunk, as it continues something we missed the
            // start of.
            // TODO: support interleaved multi-sentence messages
            return;
        }

        this.accumulated_payload += payload;

        if (fragment_number == fragment_count) {
            payload = DecodePayload(this.accumulated_payload, padding);
            controller.enqueue({radio_channel, payload});

            this.current_fragment_count = 0;
            this.last_fragment_number = 0;
            this.current_message_id = null;
            this.accumulated_payload = null;
        }
    }

    flush(controller) {}
}

export class AISPayloadDecoderStream extends TransformStream {
    constructor() {
        super(new AISPayloadDecoder());
    }
}

function reverse(str){
  return str.split("").reverse().join("");
}

function extractUInt(bitstring) {
    return parseInt(bitstring, 2);
}

function extractInt(bitstring) {
    const is_neg = bitstring[0] == '1';
    if (is_neg) {
        let s = '';
        for (let i = 0; i < bitstring.length; ++i)
            s += bitstring[i] == '0' ? '1' : '0';
        bitstring = s;
    }
    let val = extractUInt(bitstring);
    if (is_neg) {
        val = -(val - 1);
    }
    return val;
}

function extractString(bitstring) {
    let result = '';
    for (let i = 0; i < bitstring.length-5; i += 6) {
        let nibble = parseInt(bitstring.substring(i, i+6), 2);
        if (nibble < 32) {
            nibble += 64;
        }
        result += String.fromCharCode(nibble);
    }
    let end = result.length;
    while (end > 0 && result[end-1] == '@') --end;
    return result.substring(0, end);
}

function ParseCNB(payload, chunk) {
    let result = {type: "CNB"};

    result.repeat = extractUInt(payload.substring(6, 8));
    result.mmsi = extractUInt(payload.substring(8, 38));
    result.status = extractUInt(payload.substring(38, 42));
    result.turn = extractInt(payload.substring(42, 50));
    result.speed = extractUInt(payload.substring(50, 60)) / 10;
    result.accuracy = extractUInt(payload.substring(60, 61));
    result.lon = extractInt(payload.substring(61, 89)) / 600000;
    result.lat = extractInt(payload.substring(89, 116)) / 600000;
    result.course = extractUInt(payload.substring(116, 128)) / 10;
    result.heading = extractUInt(payload.substring(128, 137));
    result.second = extractUInt(payload.substring(137, 143));
    result.maneuver = extractUInt(payload.substring(143, 145));

    return result;
}

function ParseBaseStation(payload, chunk) {
    let result = {type: "Base Station"};

    result.repeat = extractUInt(payload.substring(6, 8));
    result.mmsi = extractUInt(payload.substring(8, 38));
    const year = extractInt(payload.substring(38, 52));
    const month = extractInt(payload.substring(52, 56));
    const day = extractInt(payload.substring(56, 61));
    const hour = extractInt(payload.substring(61, 66));
    const minute = extractInt(payload.substring(66, 72));
    const second = extractInt(payload.substring(72, 78));
    result.month = month;
    result.date = new Date(year, month - 1, day, hour, minute, second);
    result.accuracy = extractUInt(payload.substring(78, 79));
    result.lon = extractInt(payload.substring(79, 107)) / 600000;
    result.lat = extractInt(payload.substring(107, 134)) / 600000;

    return result;
}

function ParseVoyageData(payload, chunk) {
    let result = {type: "Voyage Data"};

    result.repeat = extractUInt(payload.substring(6, 8));
    result.mmsi = extractUInt(payload.substring(8, 38));
    result.ais_version = extractUInt(payload.substring(38, 40));
    result.imo = extractUInt(payload.substring(40, 70));
    result.callsign = extractString(payload.substring(70, 112)).trim();
    result.shipname = extractString(payload.substring(112, 232)).trim();
    result.shiptype = extractUInt(payload.substring(232, 240));
    result.to_bow = extractUInt(payload.substring(240, 249));
    result.to_stern = extractUInt(payload.substring(249, 258));
    result.to_port = extractUInt(payload.substring(258, 264));
    result.to_starboard = extractUInt(payload.substring(264, 270));
    result.epfd = extractUInt(payload.substring(270, 274));
    result.month = extractUInt(payload.substring(274, 278));
    result.day = extractUInt(payload.substring(278, 283));
    result.hour = extractUInt(payload.substring(283, 288));
    result.minute = extractUInt(payload.substring(288, 294));
    result.draught = extractUInt(payload.substring(294, 302)) / 10;
    result.destination = extractString(payload.substring(302, 422)).trim();

    return result;
}

function ParseStandardClassB(payload, chunk) {
    let result = {type: "ClassB"};

    result.repeat = extractUInt(payload.substring(6, 8));
    result.mmsi = extractUInt(payload.substring(8, 38));
    result.speed = extractUInt(payload.substring(46, 56)) / 10;
    result.accuracy = extractUInt(payload.substring(56, 57));
    result.lon = extractInt(payload.substring(57, 85)) / 600000;
    result.lat = extractInt(payload.substring(85, 112)) / 600000;
    result.course = extractUInt(payload.substring(112, 124)) / 10;
    result.heading = extractUInt(payload.substring(124, 133));
    result.second = extractUInt(payload.substring(133, 139));

    return result;
}

function ParseExtendedClassB(payload, chunk) {
    let result = ParseStandardClassB(payload, chunk);
    result.shipname = extractString(payload.substring(143, 263));
    result.shiptype = extractUInt(payload.substring(263, 271));
    result.to_bow = extractUInt(payload.substring(271, 280));
    result.to_stern = extractUInt(payload.substring(280, 289));
    result.to_port = extractUInt(payload.substring(289, 295));
    result.to_starboard = extractUInt(payload.substring(295, 301));
    result.epfd = extractUInt(payload.substring(301, 305));

    return result;
}

const AISMessageParsers = {
    1: ParseCNB,
    2: ParseCNB,
    3: ParseCNB,
    4: ParseBaseStation,
    5: ParseVoyageData,
    18: ParseStandardClassB,
    19: ParseExtendedClassB
}

class AISParser {
    start(controller) {

    }

    async transform(chunk, controller) {
        let payload = chunk.payload;

        let message_type = parseInt(payload.substring(0, 6), 2);

        let parser = AISMessageParsers[message_type];
        if (parser) chunk = parser(payload, chunk);

        controller.enqueue({message_type, ...chunk});
    }

    flush(controller) {}
}

export class AISParseStream extends TransformStream {
    constructor() {
        super(new AISParser());
    }
}
