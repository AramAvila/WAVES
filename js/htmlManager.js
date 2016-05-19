$(document).ready(function () {

    $.getJSON("data.json", function (json) {
        $('#waveSelector').ddslick({
            data: json.wavesData,
            width: 300,
            selectText: "This is the wave selector",
            imagePosition: "right",
            onSelected: function (selectedData) {
                //callback function: do something with selectedData;
            }
        });
    }).fail(function (d, textStatus, error) {
        console.error(d);
        console.error("getJSON failed, status: " + textStatus + ", error: " + error);
    });

    console.log("Done");
});
