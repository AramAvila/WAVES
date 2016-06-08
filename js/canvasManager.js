/* global paper */


var canvas = [];
var preVisLayer;
var editLayer;

function setUpCanvas() {

    canvas[0] = new paper.PaperScope();
    canvas[1] = new paper.PaperScope();

    var preVis = document.getElementById('preVis');
    var edit = document.getElementById('editor');

    canvas[0].setup(preVis);
    canvas[1].setup(edit);

    preVisLayer = new canvas[0].Layer({children: []});
    editLayer = new canvas[1].Layer({children: []});

}

/*var angle = Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (Math.sqrt(Math.pow(v1[0], 2) + Math.pow(v1[1], 2)) * Math.sqrt(Math.pow(v2[0], 2) + Math.pow(v2[1], 2))));
 var color = new paper.Color(Math.random(), Math.random(), Math.random());
 var path = new paper.Path(new paper.Point(closerV1.x, closerV1.y), new paper.Point(closer1Corrected.x, closer1Corrected.y));
 path.strokeWidth = 2;
 path.strokeColor = color;
 lines.push(path);
 
 var path = new paper.Path(new paper.Point(closerV2.x, closerV2.y), new paper.Point(closer2Corrected.x, closer2Corrected.y));
 path.strokeWidth = 2;
 path.strokeColor = color;
 lines.push(path);
 
 1 rad = 180/pi degrees*/

function updateCanvas(activeShape, activeWave) {

    preVisLayer.activate();
    preVisLayer.removeChildren();

    wavePoints = activeWave.points;

    paper = canvas[0];

    var points = [];

    //printSize is the size at wich the shape should be printed, (mm)
    var printSize = 100;
    for (var i = 0; i < activeShape.points.length; i++) {

        points.push(new Coord(activeShape.points[i][0], activeShape.points[i][1]).scale(printSize));

    }

    activeShape.activePoints = points;

    var canvasScale = 3;
    var canvasOrigin = new Coord(300, 100);

    var tangentCompositon = getShapeTangents(activeShape, activeWave.minTurn);

    var waveComposition = getComposition(tangentCompositon, activeWave, activeShape.closed);

    gCodeData = [];

    var lines = [];
    var printLine = [];

    for (var i = 0; i < waveComposition.length - 1; i++) {

        if (waveComposition[i] !== 'b' && waveComposition[i + 1] !== 'b') {
            var line = new Line(waveComposition[i], waveComposition[i + 1]);
            var path = new paper.Path(
                    new paper.Point(waveComposition[i].x * canvasScale + canvasOrigin.x, waveComposition[i].y * canvasScale + canvasOrigin.y),
                    new paper.Point(waveComposition[i + 1].x * canvasScale + canvasOrigin.x, waveComposition[i + 1].y * canvasScale + canvasOrigin.y));
            var color = new paper.Color(Math.random(), Math.random(), Math.random());
            path.strokeWidth = 2;
            path.strokeColor = color;
            lines.push(path);
            printLine.push(line);
        }
    }

    var max = new Coord(0, 0);
    var min = new Coord(0, 0);

    for (var i = 0; i < printLine.length - 1; i++) {

        if (printLine[i].start.x > max.x) {
            max.x = printLine[i].start.x;
        }
        if (printLine[i].start.y > max.y) {
            max.y = printLine[i].start.y;
        }

        if (printLine[i].start.x < min.x) {
            max.x = printLine[i].start.x;
        }
        if (printLine[i].start.y < min.y) {
            max.y = printLine[i].start.y;
        }

        if (printLine[i].end.x > max.x) {
            max.x = printLine[i].end.x;
        }
        if (printLine[i].end.y > max.y) {
            max.y = printLine[i].end.y;
        }

        if (printLine[i].end.x < min.x) {
            max.x = printLine[i].end.x;
        }
        if (printLine[i].end.y < min.y) {
            max.y = printLine[i].end.y;
        }
    }

    var center = new Vector(min, max);
    console.log(min);
    console.log(max);
    console.log(center);
    center = center.mult(0.5);
    console.log(center);

    for (var i = 0; i < printLine.length; i++) {
        gCodeData.push(new Line(printLine[i].start.subs(center), printLine[i].end.subs(center)));
    }


    preVisLayer = new canvas[0].Layer({
        children: lines
    });

    canvas[0].view.draw();
    canvas[1].view.draw();
}


function findLineIntersection(l1P, l1Vd, l2P, l2Vd) {

    return new Coord(
            l2P.x + ((l1P.y * l1Vd.x - l1P.x * l1Vd.y + l1Vd.y * l2P.x - l1Vd.x * l2P.y) * l2Vd.x) / (-l1Vd.y * l2Vd.x + l1Vd.x * l2Vd.y),
            l2P.y + ((l1P.y * l1Vd.x - l1P.x * l1Vd.y + l1Vd.y * l2P.x - l1Vd.x * l2P.y) * l2Vd.y) / (-l1Vd.y * l2Vd.x + l1Vd.x * l2Vd.y)
            );
}

function test() {
    var point3D = [0, 0, 0];

    var points = [];

    var scale = 5;

    for (var c = 0; c < 100; c++) {
        points.push([(Math.sin(c) + c / 3) * 4 - Math.cos(c) * 4, Math.sin(c) * 10, Math.cos(c) * 10]);
    }


    //lbr will be a macro to print a line Break
    var lBr = "\r\n";
    var fileData = [];

    var initialHeight = Number(document.getElementById('initialHeight').value);
    var layerHeight = Number(document.getElementById('layerHeight').value);
    var zTravelHeight = Number(document.getElementById('zTravelHeight').value);
    var matDiameter = Number(document.getElementById('matDiameter').value);
    var nozzDiameter = Number(document.getElementById('nozzDiameter').value);
    var feedrateTravel = Number(document.getElementById('feedrateTravel').value);
    var feedratePrinting = Number(document.getElementById('feedratePrinting').value);
    var extruderRetraction = Number(document.getElementById('extruderRetraction').value);
    var extruderFeedrate = Number(document.getElementById('extruderFeedrate').value);
    var buildUpPressExtrusion = Number(document.getElementById('buildUpPressExtrusion').value);
    var releasePressExtrusion = Number(document.getElementById('releasePressExtrusion').value);

    var zHeight = initialHeight;
    var extrusion = 0;

    fileData.push(";------- Start printing ----" + lBr);
    fileData.push(";---Homing all axis" + lBr);
    fileData.push("G28" + lBr);
    fileData.push(";---Reset extruder value" + lBr);
    fileData.push("G92 E0" + lBr);

    //fileData.push(";---Move to first point" + lBr);
    fileData.push("G1 X" + roundNumber(points[0][0]) + " Y" + roundNumber(points[0][1]) + " Z" + roundNumber(points[0][2]) + " F" + feedrateTravel + lBr);

    //fileData.push(";---Build up pressure" + lBr);
    fileData.push("G1 E" + buildUpPressExtrusion + " F" + extruderFeedrate + lBr);
    fileData.push("G92 E0" + lBr);

    for (var a = 1; a < points.length; a++) {

        var dist = Math.sqrt(Math.pow(points[a][0] - points[a - 1][0], 2) + Math.pow(points[a][0] - points[a - 1][1], 2) + Math.pow(points[a][0] - points[a - 1][2], 2));

        var deltaExtrusion = (Math.PI * (nozzDiameter * nozzDiameter) * dist) / (Math.PI * (matDiameter * matDiameter));
        extrusion += deltaExtrusion;

        fileData.push("G1 X" + roundNumber(points[a][0]) + " Y" + roundNumber(points[a][1]) + " Z" + roundNumber(points[a][2]) + " E" + roundNumber(extrusion) + " F" + feedratePrinting + lBr);
    }

    fileData.push(";---Done printing" + lBr + lBr);
    fileData.push(";---Releasing pressure" + lBr);
    extrusion -= buildUpPressExtrusion;
    fileData.push("G1 E" + roundNumber(extrusion) + " F" + extruderFeedrate + lBr);
    fileData.push(";---finishing" + lBr);
    fileData.push("G28" + lBr);
    fileData.push("M84" + lBr);


    var blob = new Blob(fileData, {type: "text/plain;charset=utf-8"});
    saveAs(blob, "testFile.gcode");
}