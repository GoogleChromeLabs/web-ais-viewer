# Web AIS Viewer

This is a demonstration of using the Web [Serial API](https://wicg.github.io/serial/)
to connect to a AIS receiver, such as the dAISy or dAISy 2+ receivers from https://wegmatt.com/.

It uses the [OpenLayers API](https://openlayers.org/) to draw the locations of nearby vessels on
a map.

## Requirements

To try this out (for example on https://googlechromelabs.github.io/web-ais-viewer/), you'll need
a fairly recent version of Chrome (M79 should work). On top of that this demo depends on a number
of unreleased features, which means you'll need to turn on the Experimental Web Platform features
flag at chrome://flags#enable-experimental-web-platform-features to enable both the Web Serial API
as well as the experimental import map feature.

## Disclaimer

This is not an official Google product.
