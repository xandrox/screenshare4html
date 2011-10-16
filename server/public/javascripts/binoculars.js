/**
 * Polifills
 */
window.requestAnimationFrame || (window.requestAnimationFrame = (function
() {
    var w = window;
    return w.webkitRequestAnimationFrame ||
        w.mozRequestAnimationFrame ||
        w.oRequestAnimationFrame ||
        w.msRequestAnimationFrame ||
        function(callback, element) {
            w.setTimeout(callback, 125);
        };
})());

window.console || (window.console = ({
    log: function (msg) {
        //NOOP
    }
}));

function Binoculars(opts) {

    const that = {};

    opts = opts || {};
    that.sessionId = opts.sessionId || guidGenerator();
    opts.transmitterUrl = opts.transmitterUrl || 'http://localhost:3000/transmitter';

    function guidGenerator() {
        function S4() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

    that.transmit = function(elem) {
        console.log("connect to transmitter url: " + opts.transmitterUrl);
        const socket = io.connect(opts.transmitterUrl).on("connect", function() {
            console.log("connected as transmitter with sessionId: " + that.sessionId);
        });

        html2canvas.Preload(elem, {complete: function(images) {

            function screenshot() {
                const start = new Date().getTime(),
                    scrollTop = document.body.scrollTop,
                    scrollLeft = document.body.scrollLeft,
                    queue = html2canvas.Parse(elem, images),
                    canvas = html2canvas.Renderer(queue),
                    dataURL = canvas.toDataURL("image/jpg");

                socket.emit('image', {
                    image: dataURL,
                    sessionId: that.sessionId,
                    scrollTop: scrollTop,
                    scrollLeft: scrollLeft
                });

                console.log("time for picture " + (new Date().getTime() - start) + " ms");
                window.setTimeout(screenshot, 2000);
            }
            screenshot();
        }});
    };

    const MONITOR_IMG_ID = "monitor-img";

    that.show = function(container) {

        var monitorImg = document.getElementById(MONITOR_IMG_ID);
        if (monitorImg) {
            return;
        }
        monitorImg = new Image();
        monitorImg.id = MONITOR_IMG_ID;
        container.appendChild(monitorImg);

        const socket = io.connect(opts.transmitterUrl);
        console.log("transmitterUrl: " + opts.transmitterUrl);

        socket.on("connect", function() {
            console.log("connected to session: " + that.sessionId);
            socket.emit("observe", {sessionId: that.sessionId});

            socket.on("image", function(data) {
                console.log("got image");
                monitorImg.src = data.image;
                document.body.scrollTop = data.scrollTop;
                document.body.scrollLeft = data.scrollLeft;
            });
        });


    };

    return that;
}