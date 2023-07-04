///////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////// Socket /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////    

import {
    io
} from "https://cdn.socket.io/4.3.0/socket.io.esm.min.js";
const log = console.log;

// Встановлення з'єднання з сервером
// const socket = io('http://localhost:3000'); якщо  бек на іншому порті
const socket = io();

socket.emit("chanel1", "world");

// Обробник події 'chanel1', яка приходить з сервера
socket.on('chanel1', (data) => {
    console.log(data);
    // Ваш код для обробки даних тут
});
let userListGlobal = []
socket.on('fresh-users-list', (userList) => {
    console.log(userList);
    userListGlobal = userList;
    const userListDOM = document.querySelector('.user-list');
    console.log(userListDOM);
    userListDOM.innerHTML = '';
    userList.forEach((user, i) => {
        console.log(user.username);
        //userListDOM.innerHTML += '<div class="user">' + user.username + '</div>';
        const hostHTML = `<div class="host">${user.host}</div>`;
        userListDOM.innerHTML += `
            <div class="user" name="${i}" style="background:rgb(${user.color})">
                <div  class="username">${user.username}</div>
                ${(user.host) ? hostHTML : ''}
            </div>
        `;

    });
    // connectUsersListeners();
    // check if the user Anonimous or not and unblock UI
    console.log(socket.id)
    const myself = userList.find(u => u.id === socket.id)
    console.log(myself, 'myself')
    if (myself.username != 'Anonymous') {
        const fieldsetDOM = document.querySelector('.form-main fieldset')
        fieldsetDOM.disabled = false
    }
    //userListDOM.innerHTML='hgjhgjh';
    // Ваш код для обробки даних тут
});

const dialogDOM = document.querySelector('.dialog'); // підєднуємось до блоку в яком виводим повідмлення

function clearDialog() {
    dialogDOM.innerHTML = ''; // очищуєм цей блок
}

//refresh-chat-list
socket.on('refresh-chat-list', (history) => {
    console.log('history:::', history);
    clearDialog();
    history.forEach((msg) => { // перебираючи історію повідомлень, наповнюєм цей блок повідомленнями
        dialogDOM.innerHTML += '<div class="message">' + msg.username + ' : ' + msg.message + '</div>';
    })
});

///////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// other logic ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

/*
    Start form
*/
const formStartDOM = document.querySelector('.form-start');
formStartDOM.addEventListener('submit', (event) => {
    event.preventDefault();
    var username = event.target.elements['username'].value;
    console.log(username)
    socket.emit("set-username", username);
})

/*
    Main form
*/
const formMainDOM = document.querySelector('.form-main');
formMainDOM.addEventListener('submit', (event) => {
    event.preventDefault();
    var message = event.target.elements['message'].value;
    console.log(message)
    socket.emit("message", message);
    formMainDOM.reset()
})

document.querySelector('.room-list').addEventListener('click', (event) => {
    log(event.target.name)
    const room = event.target.name
    socket.emit('set-room', room)
    //
    const buttons = document.querySelectorAll('.room-list .room') // []
    buttons.forEach(button => {
        button.classList.remove('selected')
    })
    event.target.classList.add('selected')
    //
    clearDialog();
})

function copyToBufer(i) {
    var copyText = userListGlobal[i].host;
    navigator.clipboard.writeText(copyText);
}
function connectUsersListeners() {
    document.querySelector('.user-list').addEventListener('click', (e) => {
        const wrapElement = e.target.closest(".user");
        if (wrapElement) {
            log(wrapElement.getAttribute("name"));
        }
        const userIndex = wrapElement.getAttribute("name")
        copyToBufer(userIndex)
    })
}
connectUsersListeners()


