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
server.listen(port, () => {
    log('Server listening at port %d', port);
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
const chatHistory = [];

// Функція для отримання списку підключених сокетів
function getConnectedSockets() {
    return Object.entries(connectedSockets); // [  ['eruit6yw459t6y45', {...}], [...socket...]  ]
}

//clear data about users
function getConnectedUsers() {
    const socketList = getConnectedSockets();
    const userList = socketList.map((double) => ({
        id: double[0],
        username: double[1].username
    }))
    return userList
}

// for connection, disconnect  events
function changeConnections(socket) {
    //log('amount of users', getConnectedSockets().length)
    socket.broadcast.emit('fresh-users-list', getConnectedUsers())
    socket.emit('fresh-users-list', getConnectedUsers())
    //log(getConnectedUsers())
}
// Обробник події з'єднання нового клієнта через Socket.IO
io.on('connection', (socket) => {
    //log('connect.....', socket.id);
    socket.username = 'Anonymous';
    connectedSockets[socket.id] = socket; // add socket(user)to object // connectedSockets.45jklg6hw45jklg6 = {Soket}
    changeConnections(socket)

    // При отриманні повідомлення з каналу "chanel1", вивести дані у консоль.
    socket.on('chanel1', (data) => {
        log(data);
        socket.emit('chanel1', 'hello from server')
    });

    socket.on('set-username', (username) => {
        //log(username);
        connectedSockets[socket.id].username = username;
        socket.emit('fresh-users-list', getConnectedUsers())
    });

    socket.on('message', (message) => {
        //log(message);
        chatHistory.push( {
            message, 
            username: socket.username, 
            userID:   socket.id
        } );
        socket.emit('refresh-chat-list', chatHistory )
        socket.broadcast.emit('refresh-chat-list', chatHistory )
        //log(chatHistory)
    });

    socket.on('disconnect', () => {
        //log('Користувач від’єднався, ID сокета: ' + socket.id);
        delete connectedSockets[socket.id]; // Очищення сокета зі списку
        changeConnections(socket)
    });

});