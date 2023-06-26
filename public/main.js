///////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////// Socket /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////    

import {
    io
} from "https://cdn.socket.io/4.3.0/socket.io.esm.min.js";

// Встановлення з'єднання з сервером
// const socket = io('http://localhost:3000'); якщо  бек на іншому порті
const socket = io();

socket.emit("chanel1", "world");

// Обробник події 'chanel1', яка приходить з сервера
socket.on('chanel1', (data) => {
    console.log(data);
    // Ваш код для обробки даних тут
});
socket.on('fresh-users-list', (userList) => {
    console.log(userList);
    const userListDOM = document.querySelector('.user-list');
    console.log(userListDOM);
    userListDOM.innerHTML = '';
    userList.forEach((user) => {
        console.log(user.username);
        userListDOM.innerHTML += '<div class="user">' + user.username + '</div>';
    })
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