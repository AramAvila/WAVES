var Wave = function () {
    name = "";
    description = "";
    previewImage = "";
    symmetrical = false;
    points = [];
    minTurn = 0;
    optimalSize = 0;
};

var Shape = function () {
    name = "";
    description = "";
    previewImage = "";
    closed = false;
    points = [];
};

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

//<script type="text/paperscript" canvas="editor" src="js/canvasManager.js"></script>

$(document).ready(function () {

    $.getJSON("data/data.json", function (json) {

        $(json.wavesData).each(function (index) {

            var wave = new Wave();
            wave.name = json.wavesData[index].name;
            wave.description = json.wavesData[index].description;
            wave.previewImage = json.wavesData[index].imageSrc;
            wave.symmetrical = json.wavesData[index].symmetrical;
            wave.points = json.wavesData[index].points;
            wave.minTurn = json.wavesData[index].minTurn;
            wave.optimalSize = json.wavesData[index].optimalSize;

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


    $("#waveSelector").on("click", function () {
        $("#waveImageContainer").slideToggle("slow");
    });
    $("#waveImageContainer").on("click", function (event) {
        activeWave = waveList.get($(event.target).attr("id")) || activeWave;
        $("#waveSelector").css("background-image", "url(" + activeWave.previewImage + ")");
        updatePrevis();
    });

    $("#shapeSelector").on("click", function () {
        $("#shapeImageContainer").slideToggle("slow");
    });
    $("#shapeImageContainer").on("click", function (event) {
        activeShape = shapeList.get($(event.target).attr("id")) || activeShape;
        $("#shapeSelector").css("background-image", "url(" + activeShape.previewImage + ")");
        updatePrevis();
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

    setUpCanvas();
    console.log("Done setting asincronous mehtods");
});


/**
 * Not all browsers suport the same type of mouse wheel event, that is why we need
 * this function. It detects wich type will be used.
 * 
 * @param {type} eventName
 * @returns {String|Element|Boolean|isEventSupported.el}
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

    var selectedShape = $("#shapeImageContainer").children()[Math.floor(Math.random() * $(json.wavesData).length)];
    activeShape = shapeList.get($(selectedShape).attr("id"));
    $("#shapeSelector").css("background-image", "url(" + $(selectedShape).attr("src") + ")"); //random wave image added as background
    $("#shapeImageContainer").hide(); //the image selection is hidden

    updatePrevis();
}

function updatePrevis() {
    updateCanvas(activeShape, activeWave);
}