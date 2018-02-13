'use strict';

// Enable actions client library debugging
process.env.DEBUG = 'actions-on-google:*';

let App = require('actions-on-google').DialogflowApp;
let express = require('express');
let bodyParse = require('body-parser');
let sprintf = require('sprintf-js').sprintf;


// const FINDBY_TIME_PROMPT = ["Không hiểu. Để tìm theo thời gian, bạn có thể nói \"tìm univoice files vào ngày xxx\"."
//     + " Để tìm theo địa điểm, bạn có thể nói \"tìm univoice files tại xxx\""];

const SAMPLE_NOTES = [
    "In 21/10/2017, find and book train for Tet festival",
    "On 10:30 morning, metting in my company",
    "Evening, go to coffeshop and make payment",
    "20/10/2017, metting old friend and party",
    "On 14:30, 30/10/2017, check healty at Adan Hopital",
    "Join to football club at Phu Tho stadium",
    "No found"
];

const UNKNOWN_PROMPT = ["I don't understand. To find by time, you can say \"Find univoice files plus day.\""
    + " To find by place, you can say \"Find univoice files plus place name\"", "Say \"Find univoice files plus anything you think\""];

const WELCOME_PROMPT = [
    "I'm Univoice. Can i help u?",
    "I can find you note. Please ask me",
    "Nice to meet u",
    "Ask me to your note"
];


let app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParse.json({ type: 'application/json' }));

const WELCOME_ACTION = 'input.welcome';
const UNKOWN_ACTION = 'input.unknown';
const FINDBY_PLACE_ACTION = 'find_by_place';
const FINDBY_TIME_ACTION = 'find_by_time';

let actionMap = new Map();

actionMap.set(WELCOME_ACTION, welcome);
actionMap.set(UNKOWN_ACTION, unknown);
actionMap.set(FINDBY_PLACE_ACTION, findByPlace);
actionMap.set(FINDBY_TIME_ACTION, findByTime);


var userId;
var accessToken;

app.post('/', function (request, response) {
    console.log('header: ' + JSON.stringify(request.headers));
    console.log('body: ' + JSON.stringify(response.body));
    
    accessToken = request.body.originalRequest.data.user.accessToken;
    userId = request.body.originalRequest.data.user.userId;
    
    if (accessToken) {
        console.log('accessToken is ' + accessToken);
        console.log('userId is ' + userId);
    }

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
function welcome(app) {
    let endId = userId ? userId.substr(userId.length - 3) : "Guest";
    app.ask('Hi ' + endId + '. ' + getRandomPrompt(app, WELCOME_PROMPT));
}

function unknown(app) {
    app.ask(getRandomPrompt(app, UNKNOWN_PROMPT));
}

function findByPlace(app) {
    let place = app.getArgument('place');
    if (place) {
        app.tell("Find note at " + place.toUpperCase() + ". " + getRandomPrompt(app, SAMPLE_NOTES));
    } else {
        app.ask("Where do you want to find the note?");
    }
}

function findByTime(app) {
    let day = app.getArgument('date');
    let month = app.getArgument('month');
    let year = app.getArgument('year');
    let aboutTime = app.getArgument('about_time'); // trước,...
    let dynamicTime = app.getArgument('dynamic_time'); // hôm qua, tuần trước

    if (day || month || year) {
        var fullDate = "";
        if (day) {
            fullDate += "/" + day;
        }
        if (month) {
            fullDate += "/" + month;
        }
        if (year) {
            fullDate += "/" + year;
        }

        if (aboutTime) {
            app.tell("Find note at " + aboutTime.toUpperCase() + fullDate.toLocaleUpperCase() + ". " + getRandomPrompt(app, SAMPLE_NOTES));
        } else {
            app.tell("Find note at " + fullDate.toLocaleUpperCase()+ ". " + getRandomPrompt(app, SAMPLE_NOTES));
        }
    } else {
        // case tuần trước có univoice gì?
        // case có univoice gì vào tuần trước?

        if (dynamicTime) {
            app.tell("Find note at " + dynamicTime.toUpperCase() + ". " + getRandomPrompt(app, SAMPLE_NOTES));
        } else {
            app.ask("I miss a bit. Please say again");
        }
    }
}

// Utility function to pick prompts
function getRandomPrompt(app, array) {
    let lastPrompt = app.data.lastPrompt;
    let prompt;
    if (lastPrompt) {
        for (let index in array) {
            prompt = array[index];
            if (prompt != lastPrompt) {
                break;
            }
        }
    } else {
        prompt = array[Math.floor(Math.random() * (array.length))];
    }
    return prompt;
}

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParse.urlencoded({ extended: false })
app.post('/token', urlencodedParser, function (request, response) {
    let clientId = request.body.client_id;
    let clientSecret = request.body.client_secret;
    let grantType = request.body['grant_type'];

    console.log('client: ' + clientId);
    console.log('secret: ' + clientSecret);
    // verify clientid & clientsceret in db

    if (grantType == 'authorization_code') {
        // get code
        let code = request.body['code'];
        console.log('code: ' + code);

        // generate refresh token
        let refToken = 'YmNkZWZnaGlqa2xtbm9wcQ';
        response.send({
            token_type: "bearer",
            access_token: "YmNkZWZnaGlqa2xtbm9wcQ132",
            refresh_token: "YmNkZWZnaGlqa2xtbm9wcQ456",
            expires_in: 300
        });
    } else {
        // refresh token
        let ref2Token = request.body['refresh_token'];
        console.log('refresh token: ' + ref2Token);
        response.send({
            token_type: "bearer",
            access_token: "YmNkZWZnaGlqa2xtbm9wcQ789",
            expires_in: 300
        })
    }
});

app.get('/auth', function (request, response) {
    console.log('auth called');
    let responseType = request.query['response_type'];
    let clientId = request.query['client_id'];
    let redirectUrl = request.query['redirect_uri'];
    let scope = request.query['scope'];
    let state = request.query['state'];

    console.log('redirect: ' + redirectUrl);
    console.log('state: ' + state);

    response.redirect(redirectUrl + '?code=Y2RlZmdoaWprbG1ub3asdasd' + '&state=' + state);
});