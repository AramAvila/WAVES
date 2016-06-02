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

function updateCanvas(activeShape, activeWave) {

    preVisLayer.activate();
    preVisLayer.removeChildren();

    wavePoints = activeWave.points;

    paper = canvas[0];

    var canvasScale = 3;
    var canvasOrigin = new Coord(300, 100);

    var lines = [];

    var end = activeShape.points.length - 2;
    if (activeShape.closed) {
        end = activeShape.points.length - 1;
    }

    var finalPoints = [];

    for (var c = 0; c < end; c++) {

        var v1s = new Coord(activeShape.points[c][0], activeShape.points[c][1]);
        var v1e = new Coord(activeShape.points[c + 1][0], activeShape.points[c + 1][1]);

        var v2s = new Coord(activeShape.points[c + 1][0], activeShape.points[c + 1][1]);

        var v2e;
        if (activeShape.closed && c === activeShape.points.length - 2) {
            v2e = new Coord(activeShape.points[1][0], activeShape.points[1][1]);
        } else {
            v2e = new Coord(activeShape.points[c + 2][0], activeShape.points[c + 2][1]);
        }

        var v1 = new Vector(v1e, v1s);
        var v2 = new Vector(v2e, v2s);

        var v1RotPos = v1.rotate(Math.PI / 2).sum(v1s);         //sin and cos is expected to be in radians 90º = PI/2
        var v1RotNeg = v1.rotate(3 * Math.PI / 2).sum(v1s);     //-90 degrees = 270 degrees = 3 * Math.PI / 2

        var v2RotPos = v2.rotate(Math.PI / 2).sum(v2s);
        var v2RotNeg = v2.rotate(3 * Math.PI / 2).sum(v2s);

        var closerV1, closerV2;

        if (v1RotPos.distance(v2e) < v1RotNeg.distance(v2e)) {
            closerV1 = v1RotPos;
        } else {
            closerV1 = v1RotNeg;
        }

        if (v2RotPos.distance(v1s) < v2RotNeg.distance(v1s)) {
            closerV2 = v2RotPos;
        } else {
            closerV2 = v2RotNeg;

        }

        var cV1Reduction = new Vector(v1s, closerV1);
        var cV2Reduction = new Vector(v2s, closerV2);

        var k = activeWave.minTurn / Math.sqrt(Math.pow(cV1Reduction.x, 2) + Math.pow(cV1Reduction.y, 2));
        var v = activeWave.minTurn / Math.sqrt(Math.pow(cV2Reduction.x, 2) + Math.pow(cV2Reduction.y, 2));

        var closer1Corrected = new Coord(v1s.x + k * cV1Reduction.x, v1s.y + k * cV1Reduction.y);
        var closer2Corrected = new Coord(v2s.x + v * cV2Reduction.x, v2s.y + v * cV2Reduction.y);

        var intersection = findLineIntersection(closer1Corrected, v1, closer2Corrected, v2);

        var archStart = findLineIntersection(intersection, cV1Reduction, v1s, v1);
        var archEnd = findLineIntersection(intersection, cV2Reduction, v2s, v2);

        var arch = new Arch(archStart, intersection, archEnd);

        finalPoints.push(arch);

        /*var color = new paper.Color(Math.random(), Math.random(), Math.random());
         
         var path = new paper.Path(new paper.Point(v1s[0], v1s[1]), new paper.Point(archStart[0], archStart[1]));
         path.strokeWidth = 2;
         path.strokeColor = color;
         lines.push(path);
         
         path = new paper.Path(new paper.Point(archStart[0], archStart[1]), new paper.Point(archEnd[0], archEnd[1]));
         path.strokeWidth = 2;
         path.strokeColor = color;
         lines.push(path);
         
         path = new paper.Path(new paper.Point(archEnd[0], archEnd[1]), new paper.Point(v2e[0], v2e[1]));
         path.strokeWidth = 2;
         path.strokeColor = color;
         lines.push(path);
         
         var color = new paper.Color(Math.random(), Math.random(), Math.random());
         var path = new paper.Path(new paper.Point(closerV1.x, closerV1.y), new paper.Point(closer1Corrected.x, closer1Corrected.y));
         path.strokeWidth = 2;
         path.strokeColor = color;
         lines.push(path);
         
         var path = new paper.Path(new paper.Point(closerV2.x, closerV2.y), new paper.Point(closer2Corrected.x, closer2Corrected.y));
         path.strokeWidth = 2;
         path.strokeColor = color;
         lines.push(path);
         */


        //var angle = Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (Math.sqrt(Math.pow(v1[0], 2) + Math.pow(v1[1], 2)) * Math.sqrt(Math.pow(v2[0], 2) + Math.pow(v2[1], 2))));
        //1 rad = 180/pi degrees
    }

    var finalShape = [];

    if (activeShape.closed) {

        for (var i = 0; i < finalPoints.length; i++) {

            finalShape.push(finalPoints[i]);

            var start = new Coord(finalPoints[i].end.x, finalPoints[i].end.y);
            var end;
            if (typeof finalPoints[i + 1] !== 'undefined') {
                end = new Coord(finalPoints[i + 1].start.x, finalPoints[i + 1].start.y);
            } else {
                end = new Coord(finalPoints[0].start.x, finalPoints[0].start.y);
            }

            finalShape.push(new Line(start, end));
        }

    } else if (finalPoints.length > 0) {

        var start = new Coord(activeShape.points[0][0], activeShape.points[0][1]);

        var end = new Coord(finalPoints[0].start.x, finalPoints[0].start.y);

        finalShape.push(new Line(start, end));

        for (var i = 0; i < finalPoints.length; i++) {

            finalShape.push(finalPoints[i]);

            var start = new Coord(finalPoints[i].end.x, finalPoints[i].end.y);
            var end;
            if (typeof finalPoints[i + 1] !== 'undefined') {
                end = new Coord(finalPoints[i + 1].start.x, finalPoints[i + 1].start.y);
            } else {
                end = new Coord(activeShape.points[activeShape.points.length - 1][0], activeShape.points[activeShape.points.length - 1][1]);
            }

            finalShape.push(new Line(start, end));
        }

    } else {
        var start = new Coord(activeShape.points[0][0], activeShape.points[0][1]);

        var end = new Coord(activeShape.points[1][0], activeShape.points[1][1]);

        finalShape.push(new Line(start, end));
    }


    //PrintScale is the size at wich the shape should be printed, (mm)
    var printScale = 100;
    for (var i = 0; i < finalShape.length; i++) {
        finalShape[i].scale(printScale);
    }

    var perimeter = 0;
    for (var i = 0; i < finalShape.length; i++) {
        perimeter += finalShape[i].size();
    }

    var optimalNumber = Math.round(perimeter / activeWave.optimalSize);
    console.log("optimalNumber: " + optimalNumber);

    var waveLength = perimeter / optimalNumber;
    console.log("waveLength: " + waveLength);

    var segmentedShape = [];
    for (var i = 0; i < finalShape.length; i++) {
        var wavesPerPart = finalShape[i].size() / waveLength;
        segmentedShape = segmentedShape.concat(finalShape[i].fragment(wavesPerPart * activeWave.points.length));
    }

    var p = 0;
    var pointsToDraw = [];
    var pointsToDrawMirror = [];

    for (var i = 0; i < segmentedShape.length - 1; i++) {
        var p1 = new Coord(segmentedShape[i].x * canvasScale + canvasOrigin.x, segmentedShape[i].y * canvasScale + canvasOrigin.y);
        var p2 = new Coord(segmentedShape[i + 1].x * canvasScale + canvasOrigin.x, segmentedShape[i + 1].y * canvasScale + canvasOrigin.y);
        var vec = new Vector(p1, p2);

        var norm = vec.rotate(Math.PI / 2);
        var pointsInSegment = activeWave.points[p];

        for (var c = 0; c < pointsInSegment.length; c++) {
            pointsToDraw.push(norm.scale(pointsInSegment[c] * waveLength).sum(p2));

            if (activeWave.simetrical) {
                pointsToDrawMirror.push(norm.scale(pointsInSegment[c] * -waveLength).sum(p2));
            }
        }

        if (p < activeWave.points.length - 1) {
            p++;
        } else {
            p = 0;
        }
    }

    for (var i = 0; i < pointsToDraw.length - 1; i++) {
        var path = new paper.Path(
                new paper.Point(pointsToDraw[i].x, pointsToDraw[i].y),
                new paper.Point(pointsToDraw[i + 1].x, pointsToDraw[i + 1].y));
        path.strokeWidth = 1;
        path.strokeColor = "red";
        lines.push(path);
    }

    if (activeShape.closed) {
        var path = new paper.Path(
                new paper.Point(pointsToDraw[pointsToDraw.length - 1].x, pointsToDraw[pointsToDraw.length - 1].y),
                new paper.Point(pointsToDraw[0].x, pointsToDraw[0].y));
        path.strokeWidth = 1;
        path.strokeColor = "red";
        lines.push(path);

        if (activeWave.simetrical) {
            var path = new paper.Path(
                    new paper.Point(pointsToDrawMirror[pointsToDrawMirror.length - 1].x, pointsToDrawMirror[pointsToDraw.length - 1].y),
                    new paper.Point(pointsToDrawMirror[0].x, pointsToDrawMirror[0].y));
            path.strokeWidth = 1;
            path.strokeColor = "red";
            lines.push(path);
        }
    }

    if (activeWave.simetrical) {
        for (var i = 0; i < pointsToDrawMirror.length - 1; i++) {
            var path = new paper.Path(
                    new paper.Point(pointsToDrawMirror[i].x, pointsToDrawMirror[i].y),
                    new paper.Point(pointsToDrawMirror[i + 1].x, pointsToDrawMirror[i + 1].y));
            path.strokeWidth = 1;
            path.strokeColor = "red";
            lines.push(path);
        }

        if (activeShape.closed) {
            var path = new paper.Path(
                    new paper.Point(pointsToDrawMirror[pointsToDrawMirror.length - 1].x, pointsToDrawMirror[pointsToDrawMirror.length - 1].y),
                    new paper.Point(pointsToDrawMirror[0].x, pointsToDrawMirror[0].y));
            path.strokeWidth = 1;
            path.strokeColor = "red";
            lines.push(path);
        }
    }

    preVisLayer = new canvas[0].Layer({
        children: lines
    });

    canvas[0].view.draw();
    canvas[1].view.draw();
    console.log("-----");
}


function findLineIntersection(l1P, l1Vd, l2P, l2Vd) {

    return new Coord(
            l2P.x + ((l1P.y * l1Vd.x - l1P.x * l1Vd.y + l1Vd.y * l2P.x - l1Vd.x * l2P.y) * l2Vd.x) / (-l1Vd.y * l2Vd.x + l1Vd.x * l2Vd.y),
            l2P.y + ((l1P.y * l1Vd.x - l1P.x * l1Vd.y + l1Vd.y * l2P.x - l1Vd.x * l2P.y) * l2Vd.y) / (-l1Vd.y * l2Vd.x + l1Vd.x * l2Vd.y)
            );
}


function finalPointsDebug(finalPoints, activeShape, scale, origin) {

    var lines = [];
    if (activeShape.closed) {


        for (var i = 0; i < finalPoints.length; i++) {

            var center = new paper.Point(finalPoints[i].center.x * scale + origin.x, finalPoints[i].center.y * scale + origin.y);
            var circle = new paper.Path.Circle(center, finalPoints[i].center.distance(finalPoints[i].end) * scale);

            var start = new paper.Point(finalPoints[i].end.x * scale + origin.x, finalPoints[i].end.y * scale + origin.y);
            var end;
            if (typeof finalPoints[i + 1] !== 'undefined') {
                end = new paper.Point(finalPoints[i + 1].start.x * scale + origin.x, finalPoints[i + 1].start.y * scale + origin.y);
            } else {
                end = new paper.Point(finalPoints[0].start.x * scale + origin.x, finalPoints[0].start.y * scale + origin.y);
            }

            var path = new paper.Path(start, end);

            circle.strokeWidth = 2;
            path.strokeWidth = 2;
            circle.strokeColor = "red";
            path.strokeColor = "red";
            lines.push(circle, path);
        }

    } else if (finalPoints.length > 0) {

        var start = new paper.Point(activeShape.points[0][0] * scale + origin.x, activeShape.points[0][1] * scale + origin.y);

        var end = new paper.Point(finalPoints[0].start.x * scale + origin.x, finalPoints[0].start.y * scale + origin.y);

        var path = new paper.Path(start, end);
        path.strokeWidth = 2;
        path.strokeColor = "blue";
        lines.push(path);

        for (var i = 0; i < finalPoints.length; i++) {

            var center = new paper.Point(finalPoints[i].center.x * scale + origin.x, finalPoints[i].center.y * scale + origin.y);
            var circle = new paper.Path.Circle(center, finalPoints[i].center.distance(finalPoints[i].end) * scale);

            var start = new paper.Point(finalPoints[i].end.x * scale + origin.x, finalPoints[i].end.y * scale + origin.y);
            var end;

            if (typeof finalPoints[i + 1] !== 'undefined') {
                end = new paper.Point(finalPoints[i + 1].start.x * scale + origin.x, finalPoints[i + 1].start.y * scale + origin.y);
            } else {
                end = new paper.Point(activeShape.points[activeShape.points.length - 1][0] * scale + origin.x, activeShape.points[activeShape.points.length - 1][1] * scale + origin.y);
            }

            var path2 = new paper.Path(start, end);

            circle.strokeWidth = 2;
            path2.strokeWidth = 2;
            circle.strokeColor = "red";
            path2.strokeColor = "green";
            lines.push(circle, path2);
        }

    } else {
        var start = new paper.Point(activeShape.points[0][0] * scale + origin.x, activeShape.points[0][1] * scale + origin.y);

        var end = new paper.Point(activeShape.points[1][0] * scale + origin.x, activeShape.points[1][1] * scale + origin.y);

        var path = new paper.Path(start, end);
        path.strokeWidth = 2;
        path.strokeColor = "red";
        lines.push(path);
    }

    return lines;
}