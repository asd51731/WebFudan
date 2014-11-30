var express = require('express'),
    io = require('socket.io');
var app = express();

app.use(express.static(__dirname));

var server = app.listen(11111, 'localhost');


var ws = io.listen(server);


// Check if user name is existed?
var checkNickname = function (name) {
    for (var k in ws.sockets.sockets) {
        if (ws.sockets.sockets.hasOwnProperty(k)) {
            if (ws.sockets.sockets[k] && ws.sockets.sockets[k].nickname == name) {
                return true;
            }
        }
    }
    return false;
};
// Fetch all user names
var getAllNickname = function () {
    var result = [];
    for (var k in ws.sockets.sockets) {
        if (ws.sockets.sockets.hasOwnProperty(k)) {
            result.push({
                name: ws.sockets.sockets[k].nickname
            });
        }
    }
    return result;
};

// WebGL related data collection
var packs = [];

ws.on('connection', function (client) {
    console.log('\033[96msomeone is connect\033[39m \n');
    client.on('join', function (msg) {
        // Check is nickname existed
        if (checkNickname(msg)) {
            client.emit('nickname', '昵称有重复!');
        } else {
            // Initialize user
            client.nickname = msg;
            client.webgldata = null;
            ws.sockets.emit('announcement', '聊天助手', msg + ' 加入了聊天室!', {type: 'join', name: getAllNickname()});
        }
    });
    // Listen sent messages
    client.on('send.message', function (msg) {
        client.broadcast.emit('send.message', client.nickname, msg);
    });

    // Listen WebGL data get_update
    client.on('user.update', function (data) {
        client.broadcast.emit('user.update', client.nickname, data);
    });

    client.on('disconnect', function () {
        if (client.nickname) {
            client.broadcast.emit('send.message', '聊天助手', client.nickname + '离开聊天室!', {
                type: 'disconnect',
                name: client.nickname
            });
        }
    })

});

