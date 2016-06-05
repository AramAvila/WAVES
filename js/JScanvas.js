/*
 * Developed by Aram Àvila Salvadó
 * for 3DigitalCooks
 * between 1st of March and 4 of april
 *   
 */

//-------Those are the minimum and maximum range of values
var maxSize = new Point(120, 120);
var minSize = new Point(10, 10);
var rowsRange = new Point(1, 10);
var colsRange = new Point(1, 10);
var layersRange = new Point(1, 100);

//-------Those are the starting values of the crosshatch
var width = 100;
var height = 100;
var cols = 3;
var rows = 4;
var layers = 3;

/**
 * layerHeight this value is not used currently, as soon as updadeVis() runs it is updated
 */
var layerHeight = 1.5;

/**
 * @canvasLayers this array contains the layers with the diferent items to draw. Global variable to ease modification
 */
var canvasLayers = [];

/**
 * @crosshatch this var will contain the Paper.js project
 */
var crosshatch;

/**
 * Max grid size is 120 * 120. It looks small on the screen, this multiplier is added to the axis to comensate the size
 */
var multiplier = 5;

/**
 * @axisX X axis used to translate the grid points to a 3D like space: [x,y] 
 */
var axisX = new Point(1, 0) * multiplier;
/**
 * @axisY Y axis used to translate the grid points to a 3D like space: [x,y] 
 */
var axisY = new Point(0.5, 0.5) * multiplier;  //<---- if the ratio axisY.x / axisY.y != 1 the way circleHeight behaves will have to be changed!
/**
 * @axisZ Z axis used to translate the grid points to a 3D like space: [x,y] 
 */
var axisZ = new Point(0, -1) * multiplier;

/**
 * @drawStart indicates the point at which the drawing has to start. All the gui and crosspathc items will be realtive to this point
 */
var drawStart = new Point(170, 250);

//All of the colors of the items
var wallColor = "#ffd24d";
var shadowColor = "#cc9900";
var lineColor = "#cc6600";
var gridColor = "#3366ff";
var plateColor = "#b3b3b3";

/**
 * This method uses the current crosshatch settings to update the canvas
 */
var updateVis = function () {

    canvasLayers[2].activate();
    canvasLayers[2].clear();

    var paths = [];

    var path = new Path();
    path.add(drawStart + axisX * (-25) + axisY * height, drawStart + axisY * height + axisX * width);
    path.strokeColor = "green";
    path.dashArray = [5, 6];
    path.strokeWidth = 1;
    paths.push(path);

    var path = new Path();
    path.add(drawStart + axisX * width, drawStart + axisX * width + axisY * (maxSize.y + 20));
    path.strokeColor = "black";
    path.dashArray = [5, 6];
    path.strokeWidth = 1;
    paths.push(path);

    //spaces between rows or columns, has to be +1 to make sure that the first row or column is in the middle
    var rowsSpacing = height / (rows + 1);
    var colsSpacing = width / (cols + 1);

    var recC1 = drawStart;
    var recC2 = drawStart + axisY * maxSize.x;
    var recC3 = drawStart + axisY * maxSize.x + axisX * maxSize.y;
    var recC4 = drawStart + axisX * maxSize.y;
    var recC = new Path(recC1, recC2, recC3, recC4);
    recC.closed = true;
    recC.fillColor = plateColor;
    recC.strokeColor = "gray";
    recC.strokeJoin = 'round';
    paths.push(recC);

    /*
     * To draw the crosshatch we will begin drawing the first columns of the lowest layer.
     * Then we will add the first row of the lowest layer. Repeat for all columns, rows and layers.
     */

    var l = layerHeight * layers;

    for (var c = cols; c > 0; c--) {
        //We find the 4 points that will form the wall rectangle (See image docImg1.jpg)
        var recC1 = drawStart + axisZ * l + axisX * colsSpacing * c;
        var recC2 = drawStart + axisZ * l + axisY * rowsSpacing + axisX * colsSpacing * c;
        var recC3 = drawStart + axisY * rowsSpacing + axisX * colsSpacing * c;
        var recC4 = drawStart + axisX * colsSpacing * c;
        var recC = new Path(recC1, recC2, recC3, recC4);
        recC.closed = true;
        recC.strokeJoin = 'round';
        recC.fillColor = shadowColor;
        recC.strokeColor = lineColor;
        paths.push(recC);
    }

    for (var r = 1; r <= rows; r++) {//first is drawn the furthest wall, (the lowest first row)
        var recR1 = drawStart + axisZ * layerHeight * l + axisY * r * rowsSpacing;
        var recR2 = drawStart + axisZ * layerHeight * l + axisY * r * rowsSpacing + axisX * width;
        var recR3 = drawStart + axisY * r * rowsSpacing + axisX * width;
        var recR4 = drawStart + axisY * r * rowsSpacing;
        var recR = new Path(recR1, recR2, recR3, recR4);
        recR.closed = true;
        recR.fillColor = wallColor;
        recR.strokeJoin = 'round';
        recR.strokeColor = lineColor;

        for (var c = cols; c > 0; c--) { //after the first row is drawn the columns are added
            var recC1 = drawStart + axisZ * layerHeight * l + axisY * (r - 1) * rowsSpacing + axisX * colsSpacing * c;
            var recC2 = drawStart + axisZ * layerHeight * l + axisY * (r) * rowsSpacing + axisX * colsSpacing * c;
            var recC3 = drawStart + axisY * (r) * rowsSpacing + axisX * colsSpacing * c;
            var recC4 = drawStart + axisY * (r - 1) * rowsSpacing + axisX * colsSpacing * c;
            var recC = new Path(recC1, recC2, recC3, recC4);
            recC.closed = true;
            recC.fillColor = shadowColor;
            recC.strokeJoin = 'round';
            recC.strokeColor = lineColor;
            paths.push(recC);
        }
        paths.push(recR);
    }
    
    
    for (var c = cols; c > 0; c--) { //after the first row is drawn the columns are added
        var recC1 = drawStart + axisZ * layerHeight * l + axisY * (rows + 1) * rowsSpacing + axisX * colsSpacing * c;
        var recC2 = drawStart + axisZ * layerHeight * l + axisY * (rows) * rowsSpacing + axisX * colsSpacing * c;
        var recC3 = drawStart + axisY * (rows) * rowsSpacing + axisX * colsSpacing * c;
        var recC4 = drawStart + axisY * (rows + 1) * rowsSpacing + axisX * colsSpacing * c;
        var recC = new Path(recC1, recC2, recC3, recC4);
        recC.closed = true;
        recC.fillColor = shadowColor;
        recC.strokeColor = lineColor;
        recC.strokeJoin = 'round';
        paths.push(recC);
    }

    var newData = {
        width: width,
        height: height,
        layers: layers,
        cols: cols,
        rows: rows
    };

    updateData(newData);//a call to the method updateData, located at JSfunctions.js

    canvasLayers[2] = new Layer({
        children: paths
    });

    crosshatch.view.draw();
};

var drawGui = function () {

    canvasLayers[0].activate();
    canvasLayers[0].clear();
    canvasLayers[1].activate();
    canvasLayers[1].clear();

    //----grawing gui items------------------------------------------------------
    var guiItems = [];
    var textItems = [];

    //---Lower part of the grid: Width scroll, and columns
    var path1 = new Path();
    g1 = drawStart + axisY * (maxSize.x + 20);
    var c3 = drawStart + axisX * maxSize.x + axisY * (maxSize.x + 20);
    path1.add(g1, c3); //base Line
    guiItems.push(path1);

    var p1 = (c3 - g1) / 12;
    for (var i = 0; i <= 12; i++) {
        var p2 = new Point(g1 + p1 * i - axisY);//10u marker
        c3 = new Point(g1 + p1 * i + axisY);
        var path = new Path(p2, c3);
        guiItems.push(path);
    }

    for (var i = 0; i < 12; i++) {
        var p2 = g1 + p1 * (i + 0.5); //5u marker
        c3 = g1 + p1 * (i + 0.5) + axisY;
        var path = new Path(p2, c3);
        guiItems.push(path);
    }

    var widthScrollStart = drawStart + axisX * width + axisY * (maxSize.x + 20); //Position at witch the width scroller has to start, to simplify lines later on

    var widthText = new PointText(widthScrollStart + axisZ * (-8)); //descriptive width text, moved down from the start point
    widthText.fontSize = 20;
    widthText.content = Math.round(width);
    widthText.justification = "center";

    var widthPointer = new crosshatch.Path.RegularPolygon(widthScrollStart + axisZ * (-2), 3, -10);
    widthPointer.fillColor = gridColor;
    widthPointer.rotate(180);

    var widthRectangle = new crosshatch.Shape.Rectangle(widthScrollStart + axisX * (-4) + axisZ * (-4), new Size(40, 25));
    widthRectangle.fillColor = "white";

    groupW = new Group([widthPointer, widthRectangle, widthText]); //Group those items to assign events all on one

    groupW.onMouseEnter = function () {
        document.body.style.cursor = "grab";
        widthPointer.fillColor = "red";
    };
    groupW.onMouseLeave = function () {
        document.body.style.cursor = "default";
        widthPointer.fillColor = gridColor;
    };
    groupW.onMouseUp = function () {
        document.body.style.cursor = "default";
        widthPointer.fillColor = gridColor;
    };

    groupW.onMouseDrag = function (event) {
        document.body.style.cursor = "grabbing";
        width += event.delta.x / multiplier;
        if (width < minSize.x) {
            width = minSize.x;
        }
        if (width > maxSize.x) {
            width = maxSize.x;
        }
        widthPointer.fillColor = "red";
        widthPointer.position = new Point(drawStart + axisX * width + axisY * (maxSize.x + 20) + axisZ * (-2));     //When creating an item, the position is relative to it's center
        widthRectangle.position = new Point(drawStart + axisX * width + axisY * (maxSize.x + 20) + axisZ * (-6));   //When repositioning an item, the position is relative to it's top-right corner
        widthText.content = Math.round(width);
        widthText.position = new Point(drawStart + axisX * width + axisY * (maxSize.x + 20) + axisZ * (-6));//So, this position will be diferent than the one the item was created
        updateVis();
        event.preventDefault();
    };
    guiItems.push(groupW);


    //------Left side of gui, Height scroll and rows
    var path2 = new Path();
    g1 = drawStart + axisX * (-25);
    var c3 = drawStart + axisX * (-25) + axisY * maxSize.y;
    path2.add(g1, c3);  //height ruler
    guiItems.push(path2);

    var p1 = (c3 - g1) / 12;
    for (var i = 0; i <= 12; i++) {
        var p2 = new Point(g1 + p1 * i - axisX); //10u points line
        c3 = new Point(g1 + p1 * i + axisX);
        var path = new Path(p2, c3);
        guiItems.push(path);
    }

    for (var i = 0; i < 12; i++) {
        var p2 = g1 + p1 * (i + 0.5);   //5u point line
        c3 = g1 + p1 * (i + 0.5) - axisX;
        var path = new Path(p2, c3);
        guiItems.push(path);
    }

    var heightText = new PointText(g1 + axisY * height + [-53, 7]); //descriptive height text
    heightText.fontSize = 20;
    heightText.content = Math.round(height);
    heightText.align = "center";

    var heightPointer = new crosshatch.Path.RegularPolygon(g1 + axisY * height + [-12, 0], 3, -10);
    heightPointer.fillColor = gridColor;
    heightPointer.rotate(30);

    var heightRectangle = new crosshatch.Shape.Rectangle(g1 + axisY * height + [-55, -12], new Size(40, 25));
    heightRectangle.strokeColor = gridColor;
    heightRectangle.fillColor = "white";
    heightRectangle.strokeWidth = 2;

    groupH = new Group([heightPointer, heightRectangle, heightText]);

    groupH.onMouseEnter = function () {
        document.body.style.cursor = "grab";
        heightPointer.fillColor = "red";
    };
    groupH.onMouseLeave = function () {
        document.body.style.cursor = "default";
        heightPointer.fillColor = gridColor;
    };
    groupH.onMouseUp = function () {
        document.body.style.cursor = "default";
        heightPointer.fillColor = gridColor;
    };

    groupH.onMouseDrag = function (event) {
        document.body.style.cursor = "grabbing";
        height += event.delta.y / multiplier;
        if (height < minSize.y) {
            height = minSize.y;
        }
        if (height > maxSize.y) {
            height = maxSize.y;
        }
        heightPointer.position = new Point(g1 + axisY * height + [-10, 0]);
        heightRectangle.position = new Point(g1 + axisY * height + [-35, 0]);
        heightText.content = Math.round(height);
        heightText.position = new Point(g1 + axisY * height + [-35, 0]);
        heightPointer.fillColor = "red";
        updateVis();
        event.preventDefault();
    };

    guiItems.push(groupH);


    //-----------------------------Rows gui:
    var rowLine = new Path();
    var p1 = drawStart - axisX * 2 + axisY * (height / 4);
    var p2 = drawStart - axisX * 2 + axisY * (5 * height / 6);
    rowLine.add(p1, p2);    //rows line

    var textStart = (p1 + p2) / 2;
    var rowsText = new PointText(textStart + [-35, 15]); //descriptive row text
    rowsText.fontSize = 25;
    rowsText.content = Math.round(rows);
    rowsText.fillColor = gridColor;
    rowsText.align = "center";

    var moreRows = new PointText(textStart + [-10, 40]); //add row
    moreRows.fontSize = 30;
    moreRows.content = "+";
    moreRows.align = "center";
    moreRows.fillColor = gridColor;
    moreRows.onMouseUp = function () {
        if (rows < rowsRange.y) {
            rows += 1;
            rowsText.content = rows;
            updateVis();
        }
    };
    moreRows.onMouseEnter = function () {
        document.body.style.cursor = "pointer";
    };
    moreRows.onMouseLeave = function () {
        document.body.style.cursor = "default";
    };

    var lessRows = new PointText(textStart + [-45, -10]); //remove row
    lessRows.fontSize = 30;
    lessRows.content = "-";
    lessRows.align = "center";
    lessRows.fillColor = gridColor;
    lessRows.onMouseUp = function () {
        if (rows > rowsRange.x) {
            rows -= 1;
            rowsText.content = rows;
            updateVis();
        }
    };
    lessRows.onMouseEnter = function () {
        document.body.style.cursor = "pointer";
    };
    lessRows.onMouseLeave = function () {
        document.body.style.cursor = "default";
    };

    guiItems.push(rowLine);
    guiItems.push(rowsText, moreRows, lessRows);


    //-----------------------------Columns gui:
    var colLine = new Path();
    p1 = drawStart + axisY * (maxSize.y + 3) + axisX * (width / 4);
    p2 = drawStart + axisY * (maxSize.y + 3) + axisX * (5 * width / 6);
    colLine.add(p1, p2);

    textStart = (p1 + p2) / 2;
    var colText = new PointText(textStart + [0, 25]); //number of columns text
    colText.fontSize = 25;
    colText.content = Math.round(cols);
    colText.fillColor = gridColor;
    colText.align = "center";

    var moreCols = new PointText(textStart + [30, 28]); //add column
    moreCols.fontSize = 30;
    moreCols.content = "+";
    moreCols.align = "center";
    moreCols.fillColor = gridColor;
    moreCols.onMouseUp = function () {
        if (cols < colsRange.y) {
            cols += 1;
            colText.content = cols;
            updateVis();
        }
    };
    moreCols.onMouseEnter = function () {
        document.body.style.cursor = "pointer";
    };
    moreCols.onMouseLeave = function () {
        document.body.style.cursor = "default";
    };

    var lessCols = new PointText(textStart + [-20, 25]); //remove column
    lessCols.fontSize = 30;
    lessCols.content = "-";
    lessCols.align = "center";
    lessCols.fillColor = gridColor;
    lessCols.onMouseUp = function () {
        if (cols > colsRange.x) {
            cols -= 1;
            colText.content = cols;
            updateVis();
        }
    };
    lessCols.onMouseEnter = function () {
        document.body.style.cursor = "pointer";
    };
    lessCols.onMouseLeave = function () {
        document.body.style.cursor = "default";
    };

    guiItems.push(colLine);
    guiItems.push(colText, moreCols, lessCols);



    //--------------------------Layers gui:
    var layersLine = new Path();
    p1 = drawStart + axisY * (maxSize.y + 3) + axisX * (maxSize.x + 3);
    p2 = drawStart + axisY * (maxSize.y + 3) + axisX * (maxSize.x + 3) + axisZ * 30;
    layersLine.add(p1, p2);

    textStart = (p1 + p2) / 2;
    var layersText = new PointText(textStart + [15, 10]); //number of layers text
    layersText.fontSize = 25;
    layersText.content = Math.round(layers);
    layersText.fillColor = gridColor;
    layersText.align = "center";

    var moreLayers = new PointText(textStart + [20, -10]); //add column
    moreLayers.fontSize = 30;
    moreLayers.content = "+";
    moreLayers.align = "center";
    moreLayers.fillColor = gridColor;
    moreLayers.onMouseDown = function () {
        if (layers < layersRange.y) {
            layers += 1;
            layersText.content = layers;
            updateVis();
        }
    };
    moreLayers.onMouseEnter = function () {
        document.body.style.cursor = "pointer";
    };
    moreLayers.onMouseLeave = function () {
        document.body.style.cursor = "default";
    };

    var lessLayers = new PointText(textStart + [25, 30]); //remove column
    lessLayers.fontSize = 30;
    lessLayers.content = "-";
    lessLayers.align = "center";
    lessLayers.fillColor = gridColor;
    lessLayers.onMouseUp = function () {
        if (layers > layersRange.x) {
            layers -= 1;
            layersText.content = layers;
            updateVis();
        }
    };
    lessLayers.onMouseEnter = function () {
        document.body.style.cursor = "pointer";
    };
    lessLayers.onMouseLeave = function () {
        document.body.style.cursor = "default";
    };

    guiItems.push(layersLine);
    guiItems.push(layersText, moreLayers, lessLayers);


    canvasLayers[0] = new crosshatch.Layer({
        children: guiItems,
        strokeColor: gridColor,
        strokeWidth: 2
    });

    canvasLayers[1] = new crosshatch.Layer({
        children: textItems
    });
};

function onKeyDown(event) {
    switch (event.key) {
        case 'up':
            height += 1;
            event.preventDefault();
            break;
        case 'down':
            height -= 1;
            event.preventDefault();
            break;
        case 'left':
            width -= 1;
            event.preventDefault();
            break;
        case 'right':
            width += 1;
            event.preventDefault();
            break;
    }
    if (height < minSize.y) {
        height = minSize.y;
    }
    if (height > maxSize.y) {
        height = maxSize.y;
    }
    if (width < minSize.x) {
        width = minSize.x;
    }
    if (width > maxSize.x) {
        width = maxSize.x;
    }
    crosshatch.project.clear();
    updateVis();
    drawGui();
}

function onMouseUp() {
    document.body.style.cursor = "default";
}

var docLoaded = function (fn) {

    // If document is already loaded, run method
    if (document.readyState === 'complete') {
        return fn();
    }

    // Otherwise, wait until document is loaded.
    // The document has finished loading and the document has been parsed but 
    // sub-resources such as images, stylesheets and frames are still loading. 
    // The state indicates that the DOMContentLoaded event has been fired.
    document.addEventListener('interactive', fn, false);

    // Alternative: The document and all sub-resources have finished loading. 
    // The state indicates that the load event has been fired.
    // document.addEventListener( 'complete', fn, false );
};

docLoaded(function () {

    // Get a reference to the canvas object
    var canvas = document.getElementById('myCanvas');
    paper.setup(canvas);

    crosshatch = paper;

    //the layers have to be defied for the updateVis() to work  
    canvasLayers[0] = new crosshatch.Layer({children: []});
    canvasLayers[1] = new crosshatch.Layer({children: []});
    canvasLayers[2] = new crosshatch.Layer({children: []});

    updateVis();
    drawGui();
});
