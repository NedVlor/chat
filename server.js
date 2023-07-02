const adminHost='localhost:3000';

const log = console.log;

// Включаємо Express.js, популярний фреймворк для веб-розробки.
const express = require('express');

// Створюємо новий екземпляр додатка Express.
const app = express();

// Включаємо модуль http для створення HTTP сервера.
const server = require('http').createServer(app);

// Включаємо Socket.IO для реалізації реального часу веб застосунку.
const io = require('socket.io')(server);

// Встановлюємо порт для сервера з змінної середовища або за замовчуванням 3000.
const port = process.env.PORT || 3000;

// Включаємо модуль файлової системи для роботи з файлами.
const fs = require('fs');

// import path utilite
const path = require('path')
// create static server
app.use('/static', express.static(path.join(__dirname, 'public')))

// Запускаємо сервер на попередньо встановленому порту.
log('Server listening at port %d', port);
server.listen(port, () => {
});

// Встановлюємо обробник маршруту "/" для GET запитів. Коли користувач відкриває сайт, ми надсилаємо йому файл index.html.
app.get('/', (req, res) => {
    fs.readFile('index.html', 'utf8', (err, data) => {
        res.send(data);
    })
})


//////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// SOCKET /////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

const connectedSockets = {};
const chatHistory = {};

// Функція для отримання списку підключених сокетів
function getConnectedSockets() {
    return Object.entries(connectedSockets); // [  ['eruit6yw459t6y45', {...}], [...socket...]  ]
}

//clear data about users
function getConnectedUsers(socket) {
    const socketList = getConnectedSockets();
    const userList = socketList.map((double) => {
        const obj = {
            id: double[0],
            username: double[1].username
        };
        const host = socket.handshake.headers.host;
        if(host==adminHost) obj.host = host;
        return obj
    })
    return userList
}

// for connection, disconnect  events
function changeConnections(socket) {
    io.emit('fresh-users-list', getConnectedUsers(socket))
}
// Обробник події з'єднання нового клієнта через Socket.IO
io.on('connection', (socket) => {
    
    const host = socket.handshake.headers.host;
    log('connect.....', socket.id, host);

    //console.log(clientIpAddress);
    //var clientIpAddress = socket.request.connection.remoteAddress;


    socket.username = 'Anonymous';
    socket.status='guest';
    if (host==adminHost)socket.status='admin';
    connectedSockets[socket.id] = socket; // add socket(user)to object // connectedSockets.45jklg6hw45jklg6 = {Soket}
    changeConnections(socket)

    socket.join('main');
    if (!chatHistory.main) chatHistory.main = []
    io.to('main').emit('refresh-chat-list', chatHistory['main'])

    //log('Користувач від’єднався, ID сокета: ' + socket.id);
    socket.on('disconnect', () => {
        delete connectedSockets[socket.id]; // Очищення сокета зі списку
        changeConnections(socket)
    });

    // При отриманні повідомлення з каналу "chanel1", вивести дані у консоль.
    // log(data);
    socket.on('chanel1', (data) => {
        socket.emit('chanel1', 'hello from server')
    });

    //log(username);
    socket.on('set-username', (username) => {
        connectedSockets[socket.id].username = username;
        io.emit('fresh-users-list', getConnectedUsers(socket))
    });

    // log(message);
    socket.on('message', (message) => {
        socket.rooms.forEach(r => {
            if (!chatHistory[r]) chatHistory[r] = [];
            chatHistory[r].push({
                message,
                username: socket.username,
                userID: socket.id
            });
            io.to(r).emit('refresh-chat-list', chatHistory[r])
        });
        // io.emit('refresh-chat-list', chatHistory)
    });

    // log(room);
    socket.on('set-room', (room) => {
        socket.rooms.forEach(r => {
            socket.leave(r);
        });
        // log('room', socket.rooms)
        socket.join(room);
        socket.rooms.forEach(r => {
            if (!chatHistory[r]) chatHistory[r] = [];
            io.to(r).emit('refresh-chat-list', chatHistory[r])
        });
    })

});