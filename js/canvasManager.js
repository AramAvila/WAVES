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

function updateCanvas(activeShape, activeWave) {

    preVisLayer.activate();
    preVisLayer.clear();

    wavePoints = activeWave.points;

    paper = canvas[0];

    var scale = 50;
    var origin = new paper.Point(100, 100);

    var line = new paper.Path();
    for (var c = 0; c < activeShape.points.length; c++) {
        var disp = new paper.Point(activeShape.points[c][0] * scale, activeShape.points[c][1] * scale);

        for (var i = 0; i < activeWave.points.length; i++) {
            var bp = new paper.Point(activeWave.basePoints[i][0] * scale, activeWave.basePoints[i][1] * scale);
            var rf = new paper.Point((activeWave.refPoints[i][0] * activeWave.points[i]) * scale + origin.x, (activeWave.refPoints[i][1] * activeWave.points[i]) * scale + origin.y);
            var cp = new paper.Point(disp.x + bp.x + rf.x, disp.y + bp.y + rf.y);
            line.add(cp);
        }
    }

    preVisLayer = new canvas[0].Layer({
        children: [line],
        strokeColor: "red",
        strokeWidth: 5
    });

    canvas[0].view.draw();
    canvas[1].view.draw();
}