import { Manager, Socket } from 'socket.io-client';

enum WsEvents {
  CLIENTS_UPDATED = 'clients-updated',
  CLIENT_CONNECT = 'connect',
  CLIENT_DISCONNECT = 'disconnect',
  MESSAGE_FROM_CLIENT = 'message-from-client',
  MESSAGE_FROM_SERVER = 'message-from-server',
}

export const connectToServer = (token: string) => {
  const manager = new Manager('http://localhost:3000/socket.io/socket.io.js', {
    extraHeaders: {
      hola: 'Mundo',
      authentication: token,
    },
  });
  const socket = manager.socket('/');

  addListener(socket);
};

const addListener = (socket: Socket) => {
  const serverStatusLabel = document.querySelector<HTMLSpanElement>('#server-status')!;
  const clientsUl = document.querySelector<HTMLUListElement>('#clients-ul')!;
  const messagesUl = document.querySelector<HTMLUListElement>('#messages-ul')!;
  const messageForm = document.querySelector<HTMLFormElement>('#message-form')!;
  const messageInput = document.querySelector<HTMLInputElement>('#message-input')!;

  socket.on(WsEvents.CLIENT_CONNECT, () => {
    serverStatusLabel.innerHTML = 'Connected';
  });

  socket.on(WsEvents.CLIENT_DISCONNECT, () => {
    serverStatusLabel.innerHTML = 'Disconnected';
  });

  socket.on(WsEvents.CLIENTS_UPDATED, (clients: string[]) => {
    let clientsHtml = '';

    clients.forEach((clientId) => {
      clientsHtml += `<li>${clientId}</li>`;
    });

    clientsUl.innerHTML = clientsHtml;
  });

  messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (messageInput.value.trim().length <= 0) return;

    // console.log({ id: 'YO!', message: messageInput.value });
    socket.emit(WsEvents.MESSAGE_FROM_CLIENT, { id: 'YO!', message: messageInput.value });
    messageInput.value = '';
  });

  socket.on(WsEvents.MESSAGE_FROM_SERVER, (payload: { fullName: string; message: string }) => {
    const newMessage = `
    <li>
        <strong>${payload.fullName}</strong>
        <span>${payload.message}</span>
    </li>
    `;
    const li = document.createElement('li');
    li.innerHTML = newMessage;
    console.log(li.innerHTML);
    messagesUl.append(li);
  });
};
