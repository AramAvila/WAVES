/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var NumberException = function (number) {
    this.value = number;
    this.message = " is not a number";
    this.toString = function () {
        return this.value + this.message;
    };
};

var VectorException = function (object) {
    this.value = object;
    this.message = " vector origin and end is the same point";
    this.toString = function () {
        return this.value + this.message;
    };
};

var Coord = function (x, y) {

    if (typeof x !== 'number') {
        throw new NumberException(x);
    }

    if (typeof y !== 'number') {
        throw new NumberException(y);
    }

    this.x = x;
    this.y = y;
    this.distance = function (point2) {
        if (isNaN(point2.x) || isNaN(point2.y)) {
            console.error("Distance is NAN!" + point2);
        }
        var x = point2.x - this.x;
        var y = point2.y - this.y;
        var dist = Math.sqrt((x * x) + (y * y));
        return dist;
    };

    this.sum = function (coord2) {
        if (isNaN(coord2.x) || isNaN(coord2.y)) {
            console.error("Coord sum is NAN!" + coord2);
        }
        return new Coord(this.x + coord2.x, this.y + coord2.y);
    };
    this.subs = function (coord2) {
        if (isNaN(coord2.x) || isNaN(coord2.y)) {
            console.error("Coord subs is NAN!" + coord2);
        }
        return new Coord(coord2.x - this.x, coord2.y - this.y);
    };
    this.scale = function (scale) {
        if (isNaN(scale)) {
            console.error("Coord scale is NAN!" + scale);
        }
        return new Coord(this.x * scale, this.y * scale);
    };
};

var Vector = function (start, end) {

    /*if (typeof end.y !== 'number') {
     throw new VectorException(end.y);
     }
     
     if (typeof end.x !== 'number') {
     throw new VectorException(end.x );
     }
     
     if (typeof start.x !== 'number') {
     throw new VectorException(start.x);
     }
     
     if (typeof start.y !== 'number') {
     throw new VectorException(start.y);
     }
     
     if (end.x === start.x && end.y === start.y) {
     console.log(start);
     console.log(end);
     console.log("end.x === start.x && end.y === start.y");
     console.log(end.x + "===" + start.x + "&&" + end.y + "===" + start.y);
     throw new VectorException(0);
     }*/

    this.x = end.x - start.x;
    this.y = end.y - start.y;

    this.length = function () {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    };

    this.rotate = function (angle) {
        if (isNaN(angle)) {
            console.error("Vector rotation is NAN! " + angle);
        }
        return new Vector(new Coord(0, 0),
                new Coord(
                        this.x * Math.cos(angle) - this.y * Math.sin(angle),
                        this.x * Math.sin(angle) + this.y * Math.cos(angle))
                );
    };

    this.sum = function (coord) {
        if (isNaN(coord.x) || isNaN(coord.y)) {
            console.error("Vector sum is NAN! " + coord);
        }
        return new Coord(this.x + coord.x, this.y + coord.y); //moving a vector from the origin turns it in to a coordinate.
    };

    this.changeLength = function (newLength) {
        if (isNaN(newLength)) {
            console.error("Vector change length is NAN! " + newLength);
        }
        var k = newLength / Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        this.x = k * this.x;
        this.y = k * this.y;
    };

    this.mult = function (n) {
        if (isNaN(n)) {
            console.error("Vector mult is NAN! " + n);
        }
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

    this.fragment = function (segmentList) {

        var v1 = new Vector(this.center, this.start);
        var v2 = new Vector(this.center, this.end);

        var angle = Math.acos((v1.x * v2.x + v1.y * v2.y) / (Math.sqrt(Math.pow(v1.x, 2) + Math.pow(v1.y, 2)) * Math.sqrt(Math.pow(v2.x, 2) + Math.pow(v2.y, 2))));
        var length = this.size();

        var rotations = [];
        for (var a = 0; a < segmentList.length; a++) {
            rotations.push(segmentList[a] * angle / length);
        }

        var test = new Vector(this.center, this.start).rotate(angle / 2);
        var side = new Vector(this.center, new Vector(this.start, this.end).mult(0.5).sum(this.start));

        var ref = new Coord(0, 1);
        var angleSide = Math.acos((side.x * ref.x + side.y * ref.y) / (Math.sqrt(Math.pow(side.x, 2) + Math.pow(side.y, 2)) * Math.sqrt(Math.pow(ref.x, 2) + Math.pow(ref.y, 2))));
        var angleTest = Math.acos((test.x * ref.x + test.y * ref.y) / (Math.sqrt(Math.pow(test.x, 2) + Math.pow(test.y, 2)) * Math.sqrt(Math.pow(ref.x, 2) + Math.pow(ref.y, 2))));

        var inverse = false;
        if (Math.abs(angleSide - angleTest) < 0.1) {
            inverse = true;
        }

        var fragments = [];
        var rot = 0;
        var vec = new Vector(this.center, this.start);
        if (inverse) {
            for (var i = 0; i < rotations.length; i++) {
                rot += rotations[i];
                fragments.push(vec.rotate(rot).sum(this.center));
            }
        } else {
            for (var i = 0; i < rotations.length; i++) {
                rot -= rotations[i];
                fragments.push(vec.rotate(rot).sum(this.center));
            }
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
    this.fragment = function (segmentList) {

        var vec = new Vector(this.start, this.end);
        vec.changeLength(1);

        var fragments = [];
        var dist = 0;

        for (var i = 0; i < segmentList.length; i++) {
            dist += segmentList[i];
            fragments.push(vec.mult(dist).sum(this.start));
        }

        return fragments;
    };
};

var Segment = function () {
    size = 0;
    points = [];
};

var Wave = function () {
    name = "";
    description = "";
    previewImage = "";
    symmetrical = false;
    segments = [];
    modRanges = new Map();
    currentValues = new Map();
    minTurn = 0;

    this.size = function () {
        var dist = 0;
        for (var a = 0; a < this.segments.length; a++) {
            if (isNaN(this.segments[a].size)) {
                dist += this.currentValues.get(this.segments[a].size);
            } else {
                dist += this.segments[a].size;
            }
        }
        return dist;
    };
};

var Shape = function () {
    name = "";
    description = "";
    previewImage = "";
    closed = false;
    points = [];
    activePoints = [];
};