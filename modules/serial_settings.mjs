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

import {Control} from 'ol/control.js';

export default class SerialSettingsControl extends Control {
    port = null;

    constructor(port_handler) {
        const element = document.createElement('div');
        element.className = 'ol-control ol-unselectable ol-uncollapsible';
        element.id = 'serialcontrol';
        const btn = document.createElement('button');
        btn.innerHTML = 'Select serial port';
        btn.style = 'width: auto; padding: 5px;'
        element.appendChild(btn);
        super({element: element});

        btn.addEventListener('click', async () => {
            this.port = await navigator.serial.requestPort();
            await this.port.open({ baudrate: 38400 });
            btn.innerHTML = "Receiving data";
            port_handler(this.port);
        });
    }
};
