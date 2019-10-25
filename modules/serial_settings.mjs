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
