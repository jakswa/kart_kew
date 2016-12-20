var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var SlackWeb = require('@slack/client').WebClient;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// var token = process.env['SLACK_TOKEN'];
// var slackWeb = new SlackWeb(token);

var matches = [];
var idCounter = 1;

var big_json = function(match) {
  var actions = [];
  var usersIn = [];
  Object.keys(match.actions).forEach(function(k) {
    if (!match.actions[k]) {
      actions.push({
        "name": match.id,
        "text": "Count me in!",
        "type": "button",
        "value": k
      });
    } else {
      usersIn.push(":" + match.actions[k] + ":");
    }
  });
  if (usersIn.length < 3) {
    var inAlready = usersIn.length && "Racers include " + usersIn.join(", ") + "! " || '';
    var question = usersIn.length ? "Who else?" : "Anyone up for a game of Mario?";
    var messageText = inAlready + question;
  } else {
    var allUsers = usersIn.concat([":" + match.creator + ":"]);
    var inAlready = usersIn.length && "Racers include " + allUsers + "! " || '';
    var messageText = "The race is on! " + inAlready;
  }

  return {
    "text": messageText,
    "attachments": actions.length ? [
        {
            "text": "Claim your spot:",
            "fallback": "You are unable to choose a game",
            "callback_id": "mario_game",
            "color": "#e30003",
            "attachment_type": "default",
            "actions": actions
        }
    ] : null,
    "icon_emoji": ":mario:",
    "response_type": "in_channel",
    "username": "MarioBot"
  };
};

var matchFor = function(matchID, user) {
  for (var i = 0; i < matches.length; i++) {
    if (matches[i].id == matchID)
      return matches[i];
  }
  var newMatch = {
    id: matchID,
    creator: user,
    actions: {spot1: false, spot2: false, spot3: false}
  };
  matches.unshift(newMatch);
  //matches = matches.slice(0,5);
  return newMatch;
};

app.get("/kart", function(req, res) {
  res.send('HIII');
})
app.post("/go", function(req, res) {
  var matchID = idCounter++;
  var user = req.body.user_name;
  res.send(big_json(matchFor(matchID, user)));
})
app.post('/buttons', function(req, res) {
  var payload = JSON.parse(req.body.payload);
  var channelID = payload.channel.id;
  var messageID = payload.message_ts;
  var matchID = payload.actions[0].name;
  var user = payload.user.name;
  var match = matchFor(matchID);
  var spot = Object.keys(match.actions).find(function(a) {
    return !match.actions[a];
  });
  match.actions[spot] = user;
  console.log("UPDATING", messageID, channelID, payload);
  //slackWeb.chat.update(messageID, channelID, "WOO");
  res.status(200).send(big_json(match));
});
app.get('/auth', function(req, res) {
  res.send("OK")
});


var port = process.env['PORT'] || 3000;
app.listen(port, function() {
  console.log("Listenin' for kart on port " + port);
});
