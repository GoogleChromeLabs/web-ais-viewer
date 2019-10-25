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

// Expects chunks are individual NMEA sentences.
class NMEAParser {
    start(controller) {}

    async transform(chunk, controller) {
        let result = {
            raw: chunk,
            valid: true
        };
        if (chunk.length < 6 || chunk.length > 82) {
            result.valid = false;
            controller.enqueue(result);
            return;
        }
        result.start = chunk[0];
        if (result.start != '!' && result.start != '$') {
            result.valid = false;
            controller.enqueue(result);
            return;
        }
        result.talker = chunk.substring(1, 3);
        result.type = chunk.substring(3, 6);
        const checked_data_start = 1;
        let checked_data_end = chunk.length;
        if (chunk[chunk.length-3] == '*') {
            result.expected_crc = parseInt(chunk.slice(-2), 16);
            checked_data_end = chunk.length - 3;
        }
        result.crc = 0;
        for (let i = checked_data_start; i < checked_data_end; ++i) {
            result.crc = result.crc ^ chunk.charCodeAt(i);
        }
        result.valid = result.expected_crc && result.expected_crc == result.crc;
        result.data = chunk.substring(7, checked_data_end);
        delete result.raw;
        result.fields = result.data.split(',');
        controller.enqueue(result);
    }

    flush(controller) {}
}

export class NMEAParseStream extends TransformStream {
    constructor() {
        super(new NMEAParser());
    }
}

class NMEAFilter {
    constructor(types) {
        this.types = types;
    }

    start(controller) {}

    async transform(chunk, controller) {
        // Ignore invalid chunks.
        if (!chunk.valid) return;

        if (!this.types.includes(chunk.type)) return;

        controller.enqueue(chunk.fields);
    }

    flush(controller) {}
}

export class NMEAFilterStream extends TransformStream {
    constructor(types) {
        super(new NMEAFilter(types));
    }
}
