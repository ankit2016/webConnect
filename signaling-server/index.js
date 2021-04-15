var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
const { v4: uuidv4 } = require('uuid');

app.get('get_meeting_uri', (req, res) => {
    res.status(200, {data: 'abc-def-ghi'});
})

io.on('connection', socket => {
    const meetURL = uuidv4();
    console.log('meet-url', meetURL);
    socket.on('room_join_request', payload => {
        socket.join(payload.roomName, err => {
            if (!err) {
                io.in(payload.roomName).clients((err, clients) => {
                    if (!err) {
                        io.in(payload.roomName).emit('room_users', {clients, joinedUserData:payload.userData})
                        // console.log('socket data', socket.rooms);
                    }
                });
            }
        });
    });
    socket.on('get-meet-url', payload=> {
        io.to(payload.socketId).emit('set-meet-url', {url: meetURL});
    });
    socket.on('disconnecting', () => {
        // console.log(socket.rooms); // the Set contains at least the socket ID
        for(let item in socket.rooms){
            if (socket.rooms[item] != socket){
                io.in(item).emit('room_left', { type: 'disconnected', socketId: socket.id });
                break;
            }
        }
    });
    
    socket.on('one-to-one', payload => {
        io.to(payload.connectTo).emit('from-one-peer', payload);
    });

    socket.on('all_participant_list', payload => {
        io.in(payload.roomName).clients((err, clients) => {
            if (!err) {
                io.to(payload.socketId).emit('all_room_users', clients);
                console.log('on request: sendign all participant list', clients, payload);
            }
        });
    });

    socket.on('ask_peerId_by_socketId', payload => {
        console.log('ask_peerId_by_socketId', payload);
        io.to(payload.socketId).emit('someone_asking_your_peerId', payload);
    });

    socket.on('someOne_send_his_peerId', payload => {
        io.to(payload.socketId).emit('get_peerId_from_socketId', payload.data);
    })

    socket.on('offer_signal', payload => {
        io.to(payload.calleeId).emit('offer', { signalData: payload.signalData, callerId: payload.callerId });
    });

    socket.on('answer_signal', payload => {
        io.to(payload.callerId).emit('answer', { signalData: payload.signalData, calleeId: socket.id });
    });

    socket.on('disconnect', () => {
        io.emit('room_left', { type: 'disconnected', socketId: socket.id })
    })
});

http.listen(port, () => console.log('server listening on port *:' + port)); 
