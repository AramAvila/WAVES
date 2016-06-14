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

            var start = tangentArches[i].end;
            var end = tangentArches[i + 1].start;

            tangentComposition.push(new Line(start, end));
        }

        tangentComposition.push(tangentArches[tangentArches.length - 1]);

        var start = tangentArches[tangentArches.length - 1].end;
        var end = tangentArches[0].start;

        tangentComposition.push(new Line(start, end));


    } else {

        var tangentArches = getOpenTangents(activeShape, turnRadius);

        if (tangentArches.length > 0) {

            //first line, shapeStart to first arch start
            var start = activeShape.activePoints[0];
            var end = tangentArches[0].start;
            tangentComposition.push(new Line(start, end));

            //all the lines that join the arches
            for (var i = 0; i < tangentArches.length - 1; i++) {

                tangentComposition.push(tangentArches[i]);

                var start = tangentArches[i].end;
                var end = tangentArches[i + 1].start;

                tangentComposition.push(new Line(start, end));
            }

            //Adding the last arch and the line that joins it's end to the shape's end
            tangentComposition.push(tangentArches[tangentArches.length - 1]);

            var start = tangentArches[tangentArches.length - 1].end;
            var end = activeShape.activePoints[activeShape.activePoints.length - 1];

            tangentComposition.push(new Line(start, end));

        } else {
            //if the shape does not have tangecies, tangentArches will be empty
            var start = activeShape.activePoints[0];
            var end = activeShape.activePoints[1];
            tangentComposition.push(new Line(start, end));
        }
    }

    return tangentComposition;

}

function getClosedTangents(activeShape, turnRadius) {

    var end = activeShape.activePoints.length - 1;
    var tangentArches = [];

    for (var c = 0; c < end; c++) {

        var v1s = activeShape.activePoints[c];
        var v1e = activeShape.activePoints[c + 1];

        var v2s = activeShape.activePoints[c + 1];

        var v2e;
        if (c === activeShape.activePoints.length - 2) {
            v2e = activeShape.activePoints[1];
        } else {
            v2e = activeShape.activePoints[c + 2];
        }

        var v1, v2;

        try {
            var v1 = new Vector(v1e, v1s);
        } catch (e) {
            console.log(e);
        }

        try {
            var v2 = new Vector(v2e, v2s);
        } catch (e) {
            console.log(e);
        }

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

        try {
            var cV1Reduction = new Vector(v1s, closerV1);
        } catch (e) {
            console.log(e);
        }

        try {
            var cV2Reduction = new Vector(v2s, closerV2);
        } catch (e) {
            console.log(e);
        }

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

    var end = activeShape.activePoints.length - 2;
    var tangentArches = [];

    for (var c = 0; c < end; c++) {

        var v1s = activeShape.activePoints[c];
        var v1e = activeShape.activePoints[c + 1];

        var v2s = activeShape.activePoints[c + 1];
        var v2e = activeShape.activePoints[c + 2];

        try {
            var v1 = new Vector(v1e, v1s);
        } catch (e) {
            console.log(e);
        }

        try {
            var v2 = new Vector(v2e, v2s);
        } catch (e) {
            console.log(e);
        }

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

        cV1Reduction.changeLength(turnRadius);
        cV2Reduction.changeLength(turnRadius);

        var closer1Corrected = cV1Reduction.sum(v1s);
        var closer2Corrected = cV2Reduction.sum(v2s);

        var intersection = findLineIntersection(closer1Corrected, v1, closer2Corrected, v2);

        var archStart = findLineIntersection(intersection, cV1Reduction, v1s, v1);
        var archEnd = findLineIntersection(intersection, cV2Reduction, v2s, v2);

        var arch = new Arch(archStart, intersection, archEnd);

        tangentArches.push(arch);
    }
    return tangentArches;
}

function getComposition(tangentComposition, wave, closed) {

    var perimeter = 0;
    for (var i = 0; i < tangentComposition.length; i++) {
        perimeter += tangentComposition[i].size();
    }

    var optimalNumber = Math.round(perimeter / wave.size());

    var optimalWaveLength = perimeter / optimalNumber;

    var waveSegs = [];
    var waveLength = 0;
    for (var c = 0; c < wave.segments.length; c++) {
        if (isNaN(wave.segments[c].size)) {
            waveSegs.push(wave.currentValues.get(wave.segments[c].size));
            waveLength += wave.currentValues.get(wave.segments[c].size);
        } else {
            waveSegs.push(wave.segments[c].size);
            waveLength += wave.segments[c].size;
        }
    }

    for (var c = 0; c < wave.segments.length; c++) {
        waveSegs[c] = waveSegs[c] * optimalWaveLength / waveLength;
    }

    var totalSegments = waveSegs;

    for (var s = 1; s < optimalNumber; s++) {
        totalSegments = totalSegments.concat(waveSegs);
    }

    var fragmentedShape = [];

    var segmentList = [];
    var segmentSum = 0;
    var a = 0;
    for (var i = 0; i < tangentComposition.length - 1; i++) {
        var segmentsPerPart = tangentComposition[i].size();
        var done = false;

        while (totalSegments.length > 0 && !done) {
            a = totalSegments[0];
            if ((segmentSum + a) < segmentsPerPart) {
                segmentSum += a;
                totalSegments.shift();
                segmentList.push(a);
            } else {
                done = true;
                fragmentedShape = fragmentedShape.concat(tangentComposition[i].fragment(segmentList));
                a = (segmentSum + a) - segmentsPerPart;
                segmentSum = a;
                segmentList = [a];
                totalSegments.shift();
            }
        }
    }
    totalSegments.unshift(a);
    fragmentedShape = fragmentedShape.concat(tangentComposition[tangentComposition.length - 1].fragment(totalSegments));

    if (closed) {
        fragmentedShape.push(fragmentedShape[0], fragmentedShape[1]);
    }

    var p = 0;

    var shapedWave = [];
    var symmetryWave = [];

    for (var i = 0; i < fragmentedShape.length - 1; i++) {

        var p1 = fragmentedShape[i];
        var p2 = fragmentedShape[i + 1];

        var vec = new Vector(p1, p2);
        var norm = vec.rotate(Math.PI / 2);
        vec.changeLength(1);
        norm.changeLength(1);

        var segment = wave.segments[p];

        for (var c = 0; c < segment.points.length; c++) {
            if (segment.points[c] !== 'b') {
                if (Array.isArray(segment.points[c])) {
                    var dX, dY, dZ;
                    if (isNaN(segment.points[c][0])) {
                        dX = wave.currentValues.get(segment.points[c][0]);
                    } else {
                        dX = segment.points[c][0];
                    }
                    if (isNaN(segment.points[c][1])) {
                        dY = wave.currentValues.get(segment.points[c][1]);
                    } else {
                        dY = segment.points[c][1];
                    }
                    if (isNaN(segment.points[c][2])) {
                        dZ = wave.currentValues.get(segment.points[c][2]);
                    } else {
                        dZ = segment.points[c][2];
                    }

                    var vX = vec.mult(-dX);
                    var vY = norm.mult(-dY);
                    var vZ = new Coord(0, 0, -dZ);

                    var point = vX.sum(vY.sum(vZ)).sum(p1);
                    shapedWave.push(point);
                } else {
                    var heigth = 0;
                    if (isNaN(segment.points[c])) {
                        heigth = wave.currentValues.get(segment.points[c]);
                    } else {
                        heigth = segment.points[c];
                    }
                    shapedWave.push(norm.mult(heigth).sum(p2));
                    if(wave.symmetrical){
                        symmetryWave.push(norm.mult(-heigth).sum(p2));
                    }
                }
            } else {
                shapedWave.push('b');
            }
        }

        if (p < wave.segments.length - 1) {
            p++;
        } else {
            p = 0;
        }
    }
    shapedWave.push('b');
    shapedWave = shapedWave.concat(symmetryWave);
    
    return shapedWave;
}

function findLineIntersection(l1P, l1Vd, l2P, l2Vd) {

    return new Coord(
            l2P.x + ((l1P.y * l1Vd.x - l1P.x * l1Vd.y + l1Vd.y * l2P.x - l1Vd.x * l2P.y) * l2Vd.x) / (-l1Vd.y * l2Vd.x + l1Vd.x * l2Vd.y),
            l2P.y + ((l1P.y * l1Vd.x - l1P.x * l1Vd.y + l1Vd.y * l2P.x - l1Vd.x * l2P.y) * l2Vd.y) / (-l1Vd.y * l2Vd.x + l1Vd.x * l2Vd.y)
            );
}