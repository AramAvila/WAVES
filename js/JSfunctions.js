/*
 * Developed by Aram Àvila Salvadó
 * for 3DigitalCooks
 * between 1st of March and 4 of april
 *   
 */


/**
 * current data contains the updated values of the app
 * @type data
 */
var currentData = {
    width: 100,
    height: 100,
    layers: 3,
    cols: 3,
    rows: 4,
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

function Point() {
    this.x = 0;
    this.y = 0;
    this.distance = function (point2) {
        var x = point2.x - this.x;
        var y = point2.y - this.y;
        var dist = Math.sqrt((x * x) + (y * y));
        return dist;
    };
}
;
function Line() {
    this.start = new Point();
    this.end = new Point();
    this.swapEnds = function () {
        var buffer = this.start;
        this.start = this.end;
        this.end = buffer;
    };

    this.length = function () {
        var x = this.end.x - this.start.x;
        var y = this.end.y - this.start.y;
        var dist = Math.sqrt((x * x) + (y * y));
        return dist;
    };
}


function toggleOptions() {
    var opts = document.getElementById("additionalOptions");
    if (opts.style.visibility !== "visible") {
        opts.style.visibility = "visible";
        window.scrollTo(0, 800);
    } else {
        opts.style.visibility = "hidden";
        window.scrollTo(0, 0);
    }
}

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

    //var lines will contain all the sorted lines
    var unsrotedLines = getCurrentDataPoints();
    var lines = sortLines(unsrotedLines);

    var zHeight = currentData.initialHeight;
    var extrusion = 0;

    fileData.push(";------- Start printing ----" + lBr);
    fileData.push(";---Homing all axis" + lBr);
    fileData.push("G28" + lBr);
    fileData.push(";---Reset extruder value" + lBr);
    fileData.push("G92 E0" + lBr);

    fileData.push(";---Move to first point" + lBr);
    fileData.push("G1 X" + roundNumber(lines[0].start.x) + " Y" + roundNumber(lines[0].start.y) + " Z" + roundNumber(zHeight) + " F" + currentData.feedrateTravel + lBr);

    fileData.push(";---Build up pressure" + lBr);
    fileData.push("G1 E" + currentData.buildUpPressExtrusion + " F" + currentData.extruderFeedrate + lBr);
    fileData.push("G92 E0" + lBr);

    for (var z = 0; z < currentData.layers; z++) {
        for (var c = 0; c < lines.length; c++) {

            var deltaExtrusion = (Math.PI * (currentData.nozzDiameter * currentData.nozzDiameter) * lines[c].length()) / (Math.PI * (currentData.matDiameter * currentData.matDiameter));
            extrusion += deltaExtrusion;

            fileData.push(";---Delta extrusion for next line: " + roundNumber(deltaExtrusion) + lBr);
            fileData.push(";---Printing move" + lBr);
            fileData.push("G1 X" + roundNumber(lines[c].end.x) + " Y" + roundNumber(lines[c].end.y) + " E" + roundNumber(extrusion) + " F" + currentData.feedratePrinting + lBr);

            if (c + 1 < lines.length) {//if it's not the last line we will move the extruder to the next line starting point
                fileData.push(";---Moving to next line start" + lBr);

                extrusion -= currentData.extruderRetraction;
                fileData.push("G1 E" + roundNumber(extrusion) + " F" + currentData.extruderFeedrate + lBr);

                zHeight += currentData.zTravelHeight;
                fileData.push("G1 Z" + roundNumber(zHeight) + " F" + currentData.feedrateTravel + lBr);
                fileData.push("G1 X" + roundNumber(lines[c + 1].start.x) + " Y" + roundNumber(lines[c + 1].start.y) + " F" + currentData.feedrateTravel + lBr);

                zHeight -= currentData.zTravelHeight;
                fileData.push("G1 Z" + roundNumber(zHeight) + " F" + currentData.feedrateTravel + lBr);

                extrusion += currentData.extruderRetraction;
                fileData.push("G1 E" + roundNumber(extrusion) + " F" + currentData.extruderFeedrate + lBr);
            }
        }
        zHeight += currentData.layerHeight;
        if (z !== currentData.layers) {//if it's not the last layer, we will have to move
            fileData.push(";---Moving to next line start" + lBr);

            extrusion -= currentData.extruderRetraction;
            fileData.push("G1 E" + roundNumber(extrusion) + " F" + currentData.extruderFeedrate + lBr);

            zHeight += currentData.zTravelHeight;
            fileData.push("G1 Z" + roundNumber(zHeight) + " F" + currentData.feedrateTravel + lBr);
            fileData.push("G1 X" + roundNumber(lines[0].start.x) + " Y" + roundNumber(lines[0].start.y) + " F" + currentData.feedrateTravel + lBr);

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


/**
 * Uses the current data to generate a list with all the lines neded to print in an array of lines:
 * 
 * @returns {Array|getCurrentDataPoints.lines}
 */
function getCurrentDataPoints() {

    var lines = [];
    var leftMargin = -(currentData.width / 2);
    var rightMargin = currentData.width / 2;
    var topMargin = currentData.height / 2;
    var botMargin = -(currentData.height / 2);
    
    //spaces between rows or columns, has to be + 1 to make sure that the center of rows or columns is in the middle
    var rowsSpacing = currentData.height / (currentData.rows + 1);
    var colsSpacing = currentData.width / (currentData.cols + 1);

    for (var c = 1; c <= currentData.rows; c++) {
        var start = new Point();
        start.x = leftMargin;
        start.y = topMargin - c * rowsSpacing;

        var end = new Point;
        end.x = rightMargin;
        end.y = topMargin - c * rowsSpacing;

        line = new Line;
        line.start = start;
        line.end = end;

        lines.push(line);
    }

    for (var r = 1; r <= currentData.cols; r++) {
        var start = new Point;
        start.x = leftMargin + r * colsSpacing;
        start.y = topMargin;

        var end = new Point;
        end.x = leftMargin + r * colsSpacing;
        end.y = botMargin;

        line = new Line;
        line.start = start;
        line.end = end;
        lines.push(line);
    }

    return lines;
}


/**
 * Sorts the lines to find the closest route between them
 * 
 * @param {type} unsortedLines
 * @returns {sortLines.sortedLines|type}
 */
function sortLines(unsortedLines) {

    var sortedLines = [];
    sortedLines[0] = unsortedLines[0];
    unsortedLines.shift();

    while (unsortedLines.length > 0) {

        var lastLine = sortedLines[sortedLines.length - 1];
        var closestLine = unsortedLines[0];

        var distToStart = lastLine.end.distance(closestLine.start);
        var distToEnd = lastLine.end.distance(closestLine.end);
        var shortestDist;

        if (distToStart > distToEnd) {
            closestLine.swapEnds();
            shortestDist = distToEnd;
        } else {
            shortestDist = distToStart;
        }

        var index = 0;
        for (var l = 0; l < unsortedLines.length; l++) {
            distToStart = lastLine.end.distance(unsortedLines[l].start);
            distToEnd = lastLine.end.distance(unsortedLines[l].end);

            if (distToStart < shortestDist || distToEnd < shortestDist) {
                closestLine = unsortedLines[l];
                index = l;
                if (distToStart < distToEnd) {
                    shortestDist = distToStart;
                } else {
                    closestLine.swapEnds();
                    shortestDist = distToEnd;
                }
            }
        }

        unsortedLines.splice(index, 1);
        sortedLines.push(closestLine);
    }

    return sortedLines;
}

function updateData(data) {
    
    var count = 0;
    for (var prop in data) {
        if (data.hasOwnProperty(prop)) {
            ++count;
            var value = Number(data[prop]);
            if (!Number.isNaN(value)) {
                currentData[prop] = value;
            }
        }
    }
}

function updateAddSettings() {
    
    var addSettings = {
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

function getCurrentData() {
    return currentData;
}