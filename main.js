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

import { LineSplitterStream } from './modules/streams.js';
import { NMEAParseStream, NMEAFilterStream } from './modules/nmea.js';
import { kAISMessageTypes, AISPayloadDecoderStream, AISParseStream } from './modules/ais.js';
import { formatVesselData } from './modules/formatter.js';

function getContainer(mmsi) {
    const id = 'mmsi_' + mmsi;
    let div = document.getElementById(id);
    if (!div) {
        div = document.createElement('div');
        div.id = id;
        div.className = 'vessel';
        div.innerHTML = 'MMSI: ' + mmsi;
        div.vesselData = {};
        try {
            let data = JSON.parse(localStorage[mmsi]);
            div.vesselData = data;
        } catch (error) {
            // Ignore
        }
        document.getElementById('data').appendChild(div);
    }
    return div;
}

async function doWork() {
    const port = await navigator.serial.requestPort();
    await port.open({ baudrate: 38400 });
    let [forYou, forLog] = port.readable.tee();
    forLog.pipeTo(new WritableStream({
        write: function (chunk) {
            console.log(chunk);
        }
    }));
    self.pipe = forYou.
        pipeThrough(new TextDecoderStream('ascii')).
        pipeThrough(new LineSplitterStream()).
        pipeThrough(new NMEAParseStream()).
        pipeThrough(new NMEAFilterStream(kAISMessageTypes)).
        pipeThrough(new AISPayloadDecoderStream()).
        pipeThrough(new AISParseStream());
    self.piperesult = self.pipe.pipeTo(new WritableStream({
            write: function (value) {
                console.log(value);
                if('mmsi' in value) {
                    const div = getContainer(value.mmsi);
                    div.vesselData = { ...div.vesselData, ...value, lastUpdate: new Date()};
                    if ('lat' in value && 'lon' in value) {
                        if (!('track' in div.vesselData))
                            div.vesselData.track = [];
                        div.vesselData.track.push({lat: value.lat, lon: value.lon, ts: div.vesselData.lastUpdate});
                    }
                    localStorage[value.mmsi] = JSON.stringify(div.vesselData);
                    div.innerHTML = formatVesselData(div.vesselData);
                }
            }
        }));
    self.piperesult.then(() => "Done reading", () => "Failed reading");
}

document.getElementById('selectPort').addEventListener('click', doWork);
