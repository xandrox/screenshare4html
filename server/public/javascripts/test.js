
$(document).ready(function() {
    const hash = document.location.href.split("#");

    const bio = new Binoculars({sessionId: hash[1]});
    bio.transmit($("body")[0]);

    $("body").append("Session URL: " + bio.sessionUrl);
    document.location.href = hash[0] + "#" + bio.sessionId;

});
