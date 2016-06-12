/* global gCodeData */

var currentData = {
    layers: 1,
    initialHeight: 10,
    layerHeight: 1,
    zTravelHeight: 4,
    matDiameter: 38,
    nozzDiameter: 1.5,
    feedrateTravel: 5000,
    feedratePrinting: 2000,
    extruderRetraction: 2,
    extruderFeedrate: 600,
    buildUpPressExtrusion: 1,
    releasePressExtrusion: 1
};

gCodeData = [];


function saveGcode() {

    //lbr will be a macro to print a line Break
    var lBr = "\r\n";
    var fileData = [];

    //all the propertries we got from the app will be added as comments. Just in case something goes wrong
    fileData.push(";------- Current propertries ----" + lBr);
    var count = 0;
    for (var prop in currentData) {
        if (currentData.hasOwnProperty(prop))
            ++count;
        fileData.push(";-------" + prop + ": " + currentData[prop] + lBr);
    }
    fileData.push(";-------------------- " + lBr);
    fileData.push(lBr);
    fileData.push(lBr);

    var zHeight = currentData.initialHeight;
    var extrusion = 0;

    fileData.push(";------- Start printing ----" + lBr);
    fileData.push(";---Homing all axis" + lBr);
    fileData.push("G28" + lBr);
    fileData.push(";---Reset extruder value" + lBr);
    fileData.push("G92 E0" + lBr);

    for (var z = 0; z < currentData.layers; z++) {

        //fileData.push(";---Move to first point" + lBr);
        fileData.push("G1 X" + roundNumber(gCodeData[0].start.x) + " Y" + roundNumber(gCodeData[0].start.y) + " Z" + roundNumber(gCodeData[0].start.z + zHeight) + " F" + currentData.feedrateTravel + lBr);

        //fileData.push(";---Build up pressure" + lBr);
        fileData.push("G1 E" + currentData.buildUpPressExtrusion + " F" + currentData.extruderFeedrate + lBr);
        fileData.push("G92 E0" + lBr);
        for (var c = 0; c < gCodeData.length; c++) {

            var deltaExtrusion = (Math.PI * (currentData.nozzDiameter * currentData.nozzDiameter) * gCodeData[c].size()) / (Math.PI * (currentData.matDiameter * currentData.matDiameter));
            extrusion += deltaExtrusion;

            //fileData.push(";---Delta extrusion for next line: " + roundNumber(deltaExtrusion) + lBr);
            //fileData.push(";---Printing move" + lBr);
            fileData.push("G1 X" + roundNumber(gCodeData[c].end.x) + " Y" + roundNumber(gCodeData[c].end.y) + " Z" + roundNumber(gCodeData[c].start.z + zHeight) + " E" + roundNumber(extrusion) + " F" + currentData.feedratePrinting + lBr);

            if (c + 1 < gCodeData.length) {//if it's not the last line we will move the extruder to the next line starting point
                //fileData.push(";---Moving to next line start" + lBr);

                if (gCodeData[c].end.distance(gCodeData[c + 1].start) > 2) { //if the next point is not farther away than 2mm, the extrusor will not move.
                    extrusion -= currentData.extruderRetraction;
                    fileData.push("G1 E" + roundNumber(extrusion) + " F" + currentData.extruderFeedrate + lBr);

                    zHeight += currentData.zTravelHeight;
                    fileData.push("G1 Z" + roundNumber(zHeight) + " F" + currentData.feedrateTravel + lBr);
                    fileData.push("G1 X" + roundNumber(gCodeData[c + 1].start.x) + " Y" + roundNumber(gCodeData[c + 1].start.y) + " Z" + roundNumber(gCodeData[c].start.z + zHeight) + " F" + currentData.feedrateTravel + lBr);

                    zHeight -= currentData.zTravelHeight;
                    fileData.push("G1 Z" + roundNumber(zHeight) + " F" + currentData.feedrateTravel + lBr);

                    extrusion += currentData.extruderRetraction;
                    fileData.push("G1 E" + roundNumber(extrusion) + " F" + currentData.extruderFeedrate + lBr);
                }
            }
        }
        zHeight += currentData.layerHeight;
        if (z !== currentData.layers) {//if it's not the last layer, we will have to move
            //fileData.push(";---Moving to next line start" + lBr);

            extrusion -= currentData.extruderRetraction;
            fileData.push("G1 E" + roundNumber(extrusion) + " F" + currentData.extruderFeedrate + lBr);

            zHeight += currentData.zTravelHeight;
            fileData.push("G1 Z" + roundNumber(zHeight) + " F" + currentData.feedrateTravel + lBr);
            fileData.push("G1 X" + roundNumber(gCodeData[0].start.x) + " Y" + roundNumber(gCodeData[0].start.y) + " Z" + roundNumber(gCodeData[0].start.z + zHeight) + " F" + currentData.feedrateTravel + lBr);

            zHeight -= currentData.zTravelHeight;
            fileData.push("G1 Z" + roundNumber(zHeight) + " F" + currentData.feedrateTravel + lBr);

            extrusion += currentData.extruderRetraction;
            fileData.push("G1 E" + roundNumber(extrusion) + " F" + currentData.extruderFeedrate + lBr);
        }
    }


    fileData.push(";---Done printing" + lBr + lBr);
    fileData.push(";---Releasing pressure" + lBr);
    extrusion -= currentData.buildUpPressExtrusion;
    fileData.push("G1 E" + roundNumber(extrusion) + " F" + currentData.extruderFeedrate + lBr);
    fileData.push(";---finishing" + lBr);
    fileData.push("G28" + lBr);
    fileData.push("M84" + lBr);


    var blob = new Blob(fileData, {type: "text/plain;charset=utf-8"});
    saveAs(blob, "testFile.gcode");
}

function roundNumber(n) {
    return Math.round(n * 1000) / 1000;
}

function updateAddSettings() {

    var addSettings = {
        layers: Number(document.getElementById('layerNumber').value),
        initialHeight: Number(document.getElementById('initialHeight').value),
        layerHeight: Number(document.getElementById('layerHeight').value),
        zTravelHeight: Number(document.getElementById('zTravelHeight').value),
        matDiameter: Number(document.getElementById('matDiameter').value),
        nozzDiameter: Number(document.getElementById('nozzDiameter').value),
        feedrateTravel: Number(document.getElementById('feedrateTravel').value),
        feedratePrinting: Number(document.getElementById('feedratePrinting').value),
        extruderRetraction: Number(document.getElementById('extruderRetraction').value),
        extruderFeedrate: Number(document.getElementById('extruderFeedrate').value),
        buildUpPressExtrusion: Number(document.getElementById('buildUpPressExtrusion').value),
        releasePressExtrusion: Number(document.getElementById('releasePressExtrusion').value)
    };

    var count = 0;
    for (var prop in addSettings) {
        if (addSettings.hasOwnProperty(prop)) {
            ++count;
            var value = Number(addSettings[prop]);
            if (!Number.isNaN(value)) {
                currentData[prop] = value;
            }
        }
    }
}
