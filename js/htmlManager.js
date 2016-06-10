var waveList = new Map();
var shapeList = new Map();

var activeWave;
var activeShape;

/**
 * When the document is ready we will, first of all, get the shapes and waves from the
 * json. Then, they will be added to it's containers. After that, a random pair will 
 * be selected for the first previsualization. Lastly the events will be added.
 * 
 * An asyncornous event takes place here, check the waves book for more info.
 */

$(document).ready(function () {

    $.getJSON("data/data.json", function (json) {

        $(json.wavesData).each(function (index) {

            var wave = new Wave();
            wave.name = json.wavesData[index].name;
            wave.description = json.wavesData[index].description;
            wave.previewImage = json.wavesData[index].imageSrc;
            wave.symmetrical = json.wavesData[index].symmetrical;

            var segments = json.wavesData[index].segments;
            var parsedSegs = [];
            for (var s = 0; s < segments.length; s++) {

                var seg = new Segment();
                seg.size = segments[s][0];
                seg.points = segments[s][1];

                parsedSegs.push(seg);
            }
            wave.segments = parsedSegs;


            var ranges = json.wavesData[index].modifierRanges;
            var rangeMap = new Map();
            var valMap = new Map();

            for (var r = 0; r < ranges.length; r++) {
                rangeMap.set(ranges[r][0], ranges[r][1]);

                var min = ranges[r][1][0];
                var max = ranges[r][1][1];
                var dist = (Math.random() * (max - min)) + min;

                valMap.set(ranges[r][0], dist);
            }
            wave.modRanges = rangeMap;
            wave.currentValues = valMap;

            wave.minTurn = json.wavesData[index].minTurn;

            waveList.set(wave.name, wave);

            var img = $('<img />', {
                id: json.wavesData[index].name,
                src: json.wavesData[index].imageSrc,
                alt: json.wavesData[index].description
            });
            img.appendTo($("#waveImageContainer"));
        });

        $(json.shapesData).each(function (index) {

            var shape = new Shape();
            shape.name = json.shapesData[index].name;
            shape.description = json.shapesData[index].description;
            shape.previewImage = json.shapesData[index].imageSrc;
            shape.closed = json.shapesData[index].closed;
            shape.points = json.shapesData[index].points;

            shapeList.set(shape.name, shape);

            var img = $('<img />', {
                id: json.shapesData[index].name,
                src: json.shapesData[index].imageSrc,
                alt: json.shapesData[index].description
            });
            img.appendTo($("#shapeImageContainer"));
        });

        jsonLoaded(json);

    }).fail(function (d, textStatus, error) {
        console.error(d);
        console.error("getJSON failed, status: " + textStatus + ", error: " + error);
    });

    $(window).resize(function () {
        updateShapeSettings(activeShape);
        updateWaveSettings(activeWave);
        updatePrevis();
    });

    $("#waveSelector").on("click", function () {
        $("#waveImageContainer").slideToggle("slow");
    });
    $("#waveImageContainer").on("click", function (event) {
        activeWave = waveList.get($(event.target).attr("id")) || activeWave;
        $("#waveSelector").css("background-image", "url(" + activeWave.previewImage + ")");
        updateWaveSettings(activeWave);
        updatePrevis();
    });

    $("#shapeSelector").on("click", function () {
        $("#shapeImageContainer").slideToggle("slow");
    });
    $("#shapeImageContainer").on("click", function (event) {
        activeShape = shapeList.get($(event.target).attr("id")) || activeShape;
        $("#shapeSelector").css("background-image", "url(" + activeShape.previewImage + ")");
        //updateShapeSettings();
        updatePrevis();
    });

    $("#settings").on("click", function () {
        $("#additionalOptions").slideToggle("slow");
        $('html, body').animate({
            scrollTop: $("#additionalOptions").offset().top
        }, 500);
    });


    //inside each div the images will be draged using mouse wheel
    //not the same event is used in every browser
    var wheelEvent = isEventSupported('mousewheel') ? 'mousewheel' : 'wheel';
    // Once we know wich event works it will be binded to the div
    $('#waveSelector').on(wheelEvent, function (e) {
        var oEvent = e.originalEvent;
        var delta = oEvent.deltaY || oEvent.wheelDelta;
        //if the event is of the type "wheel", the wheel movement will be in the "oEvent.deltaY"
        //otherwise it will be in the variable "oEvent.wheelDelta"
        //Since only one of the two will be set, the condition will be var delta equals someValue or null, at wich point, the someValue will be picked.

        if (delta < 0) {
            $("#waveImageContainer").animate({
                top: "+=15px"
            }, 50);
        } else {
            $("#waveImageContainer").animate({
                top: "-=15px"
            }, 50);
        }
        e.preventDefault();
    });

    $('#shapeSelector').on(wheelEvent, function (e) {
        var oEvent = e.originalEvent;
        var delta = oEvent.deltaY || oEvent.wheelDelta;
        //if the event is of the type "wheel", the wheel movement will be in the "oEvent.deltaY"
        //otherwise it will be in the variable "oEvent.wheelDelta"
        //Since only one of the two will be set, the condition will be var delta equals someValue or null, at wich point, the someValue will be picked.

        if (delta < 0) {
            $("#shapeImageContainer").animate({
                top: "+=15px"
            }, 50);
        } else {
            $("#shapeImageContainer").animate({
                top: "-=15px"
            }, 50);
        }
        e.preventDefault();
    });

    $("#print").on("click", function (event) {
        updateAddSettings();
        saveGcode();
    });

    setUpCanvas();
    console.log("Done setting asincronous mehtods");
});


/**
 * Not all browsers suport the same type of mouse wheel event, that is why we need
 * this function. It detects wich type will be used.
 * 
 * @param {type} eventName
 * @returns {Boolean}
 */
function isEventSupported(eventName) {
    var el = document.createElement('div');
    eventName = 'on' + eventName;
    var isSupported = (eventName in el);
    if (!isSupported) {
        el.setAttribute(eventName, 'return;');
        isSupported = typeof el[eventName] === 'function';
    }
    el = null;
    return isSupported;
}

function jsonLoaded(json) {
    console.log("the json has finished loading");

    var selectedWave = $("#waveImageContainer").children()[Math.floor(Math.random() * $(json.wavesData).length)];
    activeWave = waveList.get($(selectedWave).attr("id"));
    $("#waveSelector").css("background-image", "url(" + $(selectedWave).attr("src") + ")"); //random wave image added as background
    $("#waveImageContainer").hide(); //the image selection is hidden

    var selectedShape = $("#shapeImageContainer").children()[Math.floor(Math.random() * $(json.shapesData).length)];
    activeShape = shapeList.get($(selectedShape).attr("id"));
    $("#shapeSelector").css("background-image", "url(" + $(selectedShape).attr("src") + ")"); //random wave image added as background
    $("#shapeImageContainer").hide(); //the image selection is hidden

    var li = $('<li />');
    $(li).css("border", "1px");
    $(li).css("border-style", "solid");
    $(li).css("border-color", "black");
    $(li).css("background-color", "lightgray");
    $(li).css("margin-top", "1%");
    $(li).css("border-radius", "5px");

    var ranges = [20, 120];
    var printSize = (Math.random() * (ranges[1] - ranges[0])) + ranges[0];

    var div = $('<div />', {
        id: "printSize",
        text: roundNumber(printSize)
    });

    $(div).css("background-color", "gray");
    $(div).css("padding", "1%");
    $(div).css("width", "20%");
    $(div).css("border-radius", "5px");
    $(div).css("text-align", "center");

    $(div).draggable({
        axis: 'x',
        containment: "parent",
        drag: function () {
            var thisLeft = $(this).position().left;
            var parentLeft = $(this).parent().position().left;
            var thisWidth = $(this).outerWidth();
            var parentWidth = $(this).parent().outerWidth();
            var limit = ranges;

            var moveRange = parentWidth - thisWidth;
            var currentPos = thisLeft - parentLeft;

            var currRange = (-currentPos * limit[0] + moveRange * limit[0] + currentPos * limit[1]) / moveRange;

            $(this).text(roundNumber(currRange));

            activeWave.currentValues.set($(this).attr('id'), currRange);
            updatePrevis();
        }
    });

    li.append(div);
    li.appendTo($("#shapeSettings"));

    updateShapeSettings(activeShape);

    updatePrevis();
}

function updatePrevis() {
    updateCanvas(activeShape, activeWave);
}

function updateShapeSettings(shape) {

    var ranges = [20, 120];

    var div = $("#printSize");

    var thisWidth = $(div).outerWidth();
    var parentWidth = $(div).parent().outerWidth();

    var moveRange = parentWidth - thisWidth;
    var currentRange = $(div).val();

    var currRange = (-currentRange * moveRange + moveRange * ranges[0]) / (ranges[0] - ranges[1]);
    $(div).css("left", -currRange);

}

function updateWaveSettings(wave) {

    $("#waveSettings").empty();

    wave.currentValues.forEach(function (value, key) {
        var li = $('<li />');
        $(li).css("border", "1px");
        $(li).css("border-style", "solid");
        $(li).css("border-color", "black");
        $(li).css("background-color", "lightgray");
        $(li).css("margin-top", "1%");
        $(li).css("border-radius", "5px");


        var div = $('<div />', {
            id: key,
            text: roundNumber(value)
        });

        $(div).css("background-color", "gray");
        $(div).css("padding", "1%");
        $(div).css("width", "20%");
        $(div).css("border-radius", "5px");
        $(div).css("text-align", "center");

        var ranges = activeWave.modRanges.get(key);

        $(div).draggable({
            axis: 'x',
            containment: "parent",
            cursor: "grabbing",
            drag: function () {
                var thisLeft = $(this).position().left;
                var parentLeft = $(this).parent().position().left;
                var thisWidth = $(this).outerWidth();
                var parentWidth = $(this).parent().outerWidth();

                var moveRange = parentWidth - thisWidth;
                var currentPos = thisLeft - parentLeft;

                var currRange = (-currentPos * ranges[0] + moveRange * ranges[0] + currentPos * ranges[1]) / moveRange;

                $(this).text(roundNumber(currRange));

                activeWave.currentValues.set($(this).attr('id'), currRange);
                updatePrevis();
            }
        });

        $(div).css('cursor', 'grab');

        li.append(div);
        li.appendTo($("#waveSettings"));

        var thisWidth = $(div).outerWidth();
        var parentWidth = $(div).parent().outerWidth();

        var moveRange = parentWidth - thisWidth;
        var currentRange = value;

        var currRange = (-currentRange * moveRange + moveRange * ranges[0]) / (ranges[0] - ranges[1]);
        $(div).css("left", currRange);

    });
}