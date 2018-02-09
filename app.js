'use strict';

// Enable actions client library debugging
process.env.DEBUG = 'actions-on-google:*';

let App = require('actions-on-google').DialogflowApp;
let express = require('express');
let bodyParse = require('body-parser');
let sprintf = require('sprintf-js').sprintf;

let app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParse.json({ type: 'application/json' }));

const FINDBY_PLACE_ACTION = 'find_by_place';
const FINDBY_TIME_ACTION = 'find_by_time';

let actionMap = new Map();
actionMap.set(FINDBY_PLACE_ACTION, findByPlace);
actionMap.set(FINDBY_TIME_ACTION, findByTime);

app.post('/', function (request, response) {
    console.log('header: ' + JSON.stringify(request.headers));
    console.log('body: ' + JSON.stringify(response.body));

    const app = new App({ request: request, response: response });
    app.handleRequest(actionMap);
    // response.sendStatus(200); // reponse OK
});


// Start the server
var server = app.listen(app.get('port'), function () {
    console.log('App listening on port %s', server.address().port);
    console.log('Press Ctrl+C to quit.');
});

// handler api
function findByPlace(app) {
    let place = app.getArgument('place');
    if (place) {
        app.tell("Bạn đã yêu cầu tìm ghi chú tại " + place.toUpperCase());
    } else {
        app.ask("Bạn muốn tìm univoice note ở đâu?");
    }
}

function findByTime(app) {
    let day = app.getArgument('date');
    let month = app.getArgument('month');
    let year = app.getArgument('year');
    let aboutTime = app.getArgument('about_time'); // trước,...
    let dynamicTime = app.getArgument('dynamic_time'); // hôm qua, tuần trước

    if (day == null) {
        // case tuần trước có univoice gì?
        // case có univoice gì vào tuần trước?

        if (dynamicTime) {
            app.tell("Bạn đã yêu cầu tìm univoice note vào " + dynamicTime);
        } else {
            app.ask("Không hiểu");
        }
    } else {
        var fullDate = " ngày " + day;
        if (month) {
            fullDate += " tháng " + month;
        }
        if (year) {
            fullDate += " năm " + year;
        }

        app.tell("Bạn đã yêu cầu tìm univoice note vào " + aboutTime + fullDate);
    }
}
