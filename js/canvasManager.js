/* global paper */

var Coord = function (x, y) {
    this.x = x;
    this.y = y;
    this.distance = function (point2) {
        var x = point2.x - this.x;
        var y = point2.y - this.y;
        var dist = Math.sqrt((x * x) + (y * y));
        return dist;
    };

    this.sum = function (coord2) {
        return new Coord(this.x + coord2.x, this.y + coord2.y);
    };
    this.subs = function (coord2) {
        return new Coord(coord2.x - this.x, coord2.y - this.y);
    };
    this.scale = function (scale) {
        return new Coord(this.x * scale, this.y * scale);
    };
};

var Vector = function (start, end) {
    this.x = end.x - start.x;
    this.y = end.y - start.y;

    this.length = function () {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    };

    this.rotate = function (angle) {
        return new Coord(
                this.x * Math.cos(angle) - this.y * Math.sin(angle),
                this.x * Math.sin(angle) + this.y * Math.cos(angle)
                );
    };

    this.sum = function (coord) {
        return new Coord(this.x + coord.x, this.y + coord.y); //moving a vector from the origin turns it in to a coordinate.
    };

    this.changeLength = function (newLength) {

        var k = newLength / Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));

        this.x = k * this.x;
        this.y = k * this.y;
    };

    this.mult = function (n) {
        return new Vector(new Coord(0, 0), new Coord(this.x * n, this.y * n));
    };
};

var Arch = function (start, center, end) {
    this.start = start;
    this.center = center;
    this.end = end;

    this.size = function () {
        var radius = this.start.distance(this.center);

        var v1 = new Vector(this.center, this.end);
        var v2 = new Vector(this.center, this.start);

        var angle = Math.acos((v1.x * v2.x + v1.y * v2.y) / (Math.sqrt(Math.pow(v1.x, 2) + Math.pow(v1.y, 2)) * Math.sqrt(Math.pow(v2.x, 2) + Math.pow(v2.y, 2))));

        var length = radius * angle;
        return length;
    };

    this.scale = function (scale) {
        this.start = this.start.scale(scale);
        this.center = this.center.scale(scale);
        this.end = this.end.scale(scale);
    };

    this.fragment = function (qtty) {

        var v1 = new Vector(this.center, this.start);
        var v2 = new Vector(this.center, this.end);

        var angle = Math.acos((v1.x * v2.x + v1.y * v2.y) / (Math.sqrt(Math.pow(v1.x, 2) + Math.pow(v1.y, 2)) * Math.sqrt(Math.pow(v2.x, 2) + Math.pow(v2.y, 2))));
        var fragLength = angle / qtty;

        var test = new Vector(this.center, this.start).rotate(fragLength * qtty / 2);
        var side = new Vector(this.center, new Vector(this.start, this.end).mult(0.5).sum(this.start));

        var ref = new Coord(0, 1);
        var angleSide = Math.acos((side.x * ref.x + side.y * ref.y) / (Math.sqrt(Math.pow(side.x, 2) + Math.pow(side.y, 2)) * Math.sqrt(Math.pow(ref.x, 2) + Math.pow(ref.y, 2))));
        var angleTest = Math.acos((test.x * ref.x + test.y * ref.y) / (Math.sqrt(Math.pow(test.x, 2) + Math.pow(test.y, 2)) * Math.sqrt(Math.pow(ref.x, 2) + Math.pow(ref.y, 2))));

        var inverse = false;
        if (Math.abs(angleSide - angleTest) < 0.1) {
            inverse = true;
        }

        var fragments = [];
        if (inverse) {
            var vec = new Vector(this.center, this.start);
            for (var i = 1; i < qtty; i++) {
                fragments.push(vec.rotate(fragLength * i).sum(this.center));
            }
            fragments.push(this.end);

        } else {
            var vec = new Vector(this.center, this.end);
            for (var i = qtty - 1; i >= 1; i--) {
                fragments.push(vec.rotate(fragLength * i).sum(this.center));
            }
            fragments.push(this.end);

        }

        return fragments;
    };
};

var Line = function (start, end) {
    this.start = start;
    this.end = end;
    this.size = function () {
        var vec = this.end.subs(this.start);
        return Math.sqrt((vec.x * vec.x) + (vec.y * vec.y));
    };
    this.scale = function (scale) {
        this.start = this.start.scale(scale);
        this.end = this.end.scale(scale);
    };
    this.fragment = function (qtty) {
        var fragLength = this.size() / qtty;

        var vec = new Vector(this.start, this.end);
        vec.changeLength(fragLength);
        var fragments = [];
        for (var i = 1; i <= qtty; i++) {
            fragments.push(vec.mult(i).sum(this.start));
        }
        return fragments;
    };
};

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

    var canvasScale = 3;
    var canvasOrigin = new Coord(300, 100);

    var tangentArches = getShapeTangents(activeShape, activeWave.minTurn);

    //printSize is the size at wich the shape should be printed, (mm)
    var printSize = 100;
    for (var i = 0; i < tangentArches.length; i++) {
        tangentArches[i].scale(printSize);
    }

    var tangentComposition = getComposition(tangentArches, activeWave, activeShape.closed);

    gCodeData = [];

    var lines = [];
    for (var c = 0; c < tangentComposition.length; c++) {
        var printLine = [];
        for (var i = 0; i < tangentComposition[c].length - 1; i++) {
            if (tangentComposition[c][i] !== 'b' && tangentComposition[c][i + 1] !== 'b') {
                var line = new Line(tangentComposition[c][i], tangentComposition[c][i + 1]);
                var path = new paper.Path(
                        new paper.Point(tangentComposition[c][i].x * canvasScale + canvasOrigin.x, tangentComposition[c][i].y * canvasScale + canvasOrigin.y),
                        new paper.Point(tangentComposition[c][i + 1].x * canvasScale + canvasOrigin.x, tangentComposition[c][i + 1].y * canvasScale + canvasOrigin.y));

                path.strokeWidth = 1;
                path.strokeColor = "red";
                lines.push(path);
                printLine.push(line);
            }
        }
        gCodeData.push(printLine);
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