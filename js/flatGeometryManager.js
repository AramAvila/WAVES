/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function getShapeTangents(activeShape, turnRadius) {

    var tangentComposition = [];

    if (activeShape.closed) {

        var tangentArches = getClosedTangents(activeShape, turnRadius);

        for (var i = 0; i < tangentArches.length - 1; i++) {

            tangentComposition.push(tangentArches[i]);

            var start = new Coord(tangentArches[i].end.x, tangentArches[i].end.y);
            var end = new Coord(tangentArches[i + 1].start.x, tangentArches[i + 1].start.y);

            tangentComposition.push(new Line(start, end));
        }

        tangentComposition.push(tangentArches[tangentArches.length - 1]);

        var start = new Coord(tangentArches[tangentArches.length - 1].end.x, tangentArches[tangentArches.length - 1].end.y);
        var end = new Coord(tangentArches[0].start.x, tangentArches[0].start.y);

        tangentComposition.push(new Line(start, end));


    } else {

        var tangentArches = getOpenTangents(activeShape, turnRadius);



        if (tangentArches.length > 0) {

            //first line, shapeStart to first arch start
            var start = new Coord(activeShape.points[0][0], activeShape.points[0][1]);
            var end = new Coord(tangentArches[0].start.x, tangentArches[0].start.y);
            tangentComposition.push(new Line(start, end));

            //all the lines that join the arches
            for (var i = 0; i < tangentArches.length - 1; i++) {

                tangentComposition.push(tangentArches[i]);

                var start = new Coord(tangentArches[i].end.x, tangentArches[i].end.y);
                var end = new Coord(tangentArches[i + 1].start.x, tangentArches[i + 1].start.y);

                tangentComposition.push(new Line(start, end));
            }

            //Adding the last arch and the line that joins it's end to the shape's end
            tangentComposition.push(tangentArches[tangentArches.length - 1]);
            var start = new Coord(tangentArches[tangentArches.length - 1].end.x, tangentArches[tangentArches.length - 1].end.y);
            var end = new Coord(activeShape.points[activeShape.points.length - 1][0], activeShape.points[activeShape.points.length - 1][1]);
            tangentComposition.push(new Line(start, end));

        } else {
            //if the shape does not have tangecies, tangentArches will be empty
            var start = new Coord(activeShape.points[0][0], activeShape.points[0][1]);
            var end = new Coord(activeShape.points[1][0], activeShape.points[1][1]);
            tangentComposition.push(new Line(start, end));
        }
    }

    return tangentComposition;

}

function getClosedTangents(activeShape, turnRadius) {

    var end = activeShape.points.length - 1;

    var tangentArches = [];

    for (var c = 0; c < end; c++) {

        var v1s = new Coord(activeShape.points[c][0], activeShape.points[c][1]);
        var v1e = new Coord(activeShape.points[c + 1][0], activeShape.points[c + 1][1]);

        var v2s = new Coord(activeShape.points[c + 1][0], activeShape.points[c + 1][1]);

        var v2e;
        if (c === activeShape.points.length - 2) {
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

        var k = turnRadius / Math.sqrt(Math.pow(cV1Reduction.x, 2) + Math.pow(cV1Reduction.y, 2));
        var v = turnRadius / Math.sqrt(Math.pow(cV2Reduction.x, 2) + Math.pow(cV2Reduction.y, 2));

        var closer1Corrected = new Coord(v1s.x + k * cV1Reduction.x, v1s.y + k * cV1Reduction.y);
        var closer2Corrected = new Coord(v2s.x + v * cV2Reduction.x, v2s.y + v * cV2Reduction.y);

        var intersection = findLineIntersection(closer1Corrected, v1, closer2Corrected, v2);

        var archStart = findLineIntersection(intersection, cV1Reduction, v1s, v1);
        var archEnd = findLineIntersection(intersection, cV2Reduction, v2s, v2);

        var arch = new Arch(archStart, intersection, archEnd);

        tangentArches.push(arch);
    }

    return tangentArches;
}

function getOpenTangents(activeShape, turnRadius) {

    var end = activeShape.points.length - 2;

    var tangentArches = [];

    for (var c = 0; c < end; c++) {

        var v1s = new Coord(activeShape.points[c][0], activeShape.points[c][1]);
        var v1e = new Coord(activeShape.points[c + 1][0], activeShape.points[c + 1][1]);

        var v2s = new Coord(activeShape.points[c + 1][0], activeShape.points[c + 1][1]);
        var v2e = new Coord(activeShape.points[c + 2][0], activeShape.points[c + 2][1]);

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

        var k = turnRadius / Math.sqrt(Math.pow(cV1Reduction.x, 2) + Math.pow(cV1Reduction.y, 2));
        var v = turnRadius / Math.sqrt(Math.pow(cV2Reduction.x, 2) + Math.pow(cV2Reduction.y, 2));

        var closer1Corrected = new Coord(v1s.x + k * cV1Reduction.x, v1s.y + k * cV1Reduction.y);
        var closer2Corrected = new Coord(v2s.x + v * cV2Reduction.x, v2s.y + v * cV2Reduction.y);

        var intersection = findLineIntersection(closer1Corrected, v1, closer2Corrected, v2);

        var archStart = findLineIntersection(intersection, cV1Reduction, v1s, v1);
        var archEnd = findLineIntersection(intersection, cV2Reduction, v2s, v2);

        var arch = new Arch(archStart, intersection, archEnd);

        tangentArches.push(arch);
    }

    return tangentArches;
}

function getComposition(tangentComposition, shape) {
    
    var perimeter = 0;
    for (var i = 0; i < tangentComposition.length; i++) {
        perimeter += tangentComposition[i].size();
    }

    var optimalNumber = Math.round(perimeter / shape.optimalSize);

    var waveLength = perimeter / optimalNumber;

    var totalSegments = optimalNumber * shape.points.length;

    var waveHeigth = [waveLength];

    if (shape.symmetrical) {
        waveHeigth.push(-waveLength);
    }

    var segmentedShape = [];
    for (var i = 0; i < tangentComposition.length; i++) {
        var wavesPerPart = totalSegments * tangentComposition[i].size() / perimeter;
        segmentedShape = segmentedShape.concat(tangentComposition[i].fragment(wavesPerPart));
    }

    var p = 0;
    var linesToDraw = [];

    for (var a = 0; a < waveHeigth.length; a++) {
        var shapedWave = [];

        for (var i = 0; i < segmentedShape.length - 1; i++) {

            var p1 = new Coord(segmentedShape[i].x, segmentedShape[i].y);
            var p2 = new Coord(segmentedShape[i + 1].x, segmentedShape[i + 1].y);
            var vec = new Vector(p1, p2);

            var norm = vec.rotate(Math.PI / 2);
            var pointsInSegment = shape.points[p];

            for (var c = 0; c < pointsInSegment.length; c++) {
                if (pointsInSegment[c] !== 'b') {
                    shapedWave.push(norm.scale(pointsInSegment[c] * waveHeigth[a]).sum(p2));
                } else {
                    shapedWave.push('b');
                }
            }

            if (p < shape.points.length - 1) {
                p++;
            } else {
                p = 0;
            }
        }

        linesToDraw.push(shapedWave);
    }
    
    return linesToDraw;
}