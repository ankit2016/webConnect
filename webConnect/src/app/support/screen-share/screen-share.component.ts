import { Component, OnInit } from '@angular/core';
import { SignalingService } from '../services/signaling.service';
import Peer from 'peerjs';
import * as hark from '../../../../node_modules/hark/hark.js';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-screen-share',
  templateUrl: './screen-share.component.html',
  styleUrls: ['./screen-share.component.scss']
})
export class ScreenShareComponent implements OnInit {
  private peer: Peer;
  peerIdShare: string;
  peerId: string;
  localStream: MediaStream;
  currentPeer: any;
  private peerList: Array<any> = [];
  remoteStream: MediaStream;
  isSpeeking = false
  isPeerSpeeking = false;
  totalParticipant = {};
  counter = 0;
  allConnectedSockets: any[];
  roomId: any;
  showLocalVideo: boolean = false;
  localPeerData: { userName: string; name: string; peerId: any; imageUrl: string; roomName: any; socketId: any; };
  isSharingScreen: boolean;
  mediaStream: any;
  audioOnly: boolean;
  constructor(private signalingService: SignalingService, private route: ActivatedRoute) {
    this.peer = new Peer();
    this.route.params.subscribe(params => {
      this.roomId = params['id'];
    });
  }

  ngOnInit(): void {
    this.getPeerId();
    this.peer.on('disconnected', () => {
      console.log('connection closed');
    });
  }

  getPeerId = () => {
    this.peer.on('open', (id) => { 
      this.peerId = id;
      this.initWebSocket(id);
    });

    this.peer.on('call', (call) => {
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      }).then((stream) => {
        console.log('getting incomming call...');
        this.streamRemoteVideo(stream, 'local-video', this.peerId);
        this.localStream = stream;
        this.showLocalVideo = true;
        call.answer(this.isSharingScreen ? this.mediaStream : this.localStream);
        call.on('stream', (remoteStream) => {
          this.streamRemoteVideo(remoteStream, 'remote-video', call.peer);
          for(let myPeer in this.totalParticipant){
            if (this.totalParticipant[myPeer]['peerId'] == call.peer) {
              this.totalParticipant[myPeer]['currentPeer'] = call.peerConnection;
            }
          }
          // if (!this.peerList.includes(call.peer)) {
          //   this.streamRemoteVideo(remoteStream, 'remote-video', call.peer);
          //   this.currentPeer = call.peerConnection;
          //   this.peerList.push(call.peer);
          // }
        });
      }).catch(err => {
        console.log(err + 'Unable to get media');
      });
    });
  }

  connectWithPeer(): void {
    this.callPeer(this.peerIdShare);
  }
  /**
   * Method for calling the remote peer and accepts reverse stream and play video
   * @param id 
   * @param peerData 
   */
  callPeer(id: string, peerData = {}): void {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then((stream) => {
      this.localStream = stream;
      this.showLocalVideo = true;
      this.streamRemoteVideo(stream, 'local-video', this.peerId);
      /* --------------------------------------------------------- */
      const call = this.peer.call(id, stream); // calling remote peer
      call.on('stream', (remoteStream) => {
        peerData['alreadyConnected'] = true;
        peerData['currentPeer'] = call.peerConnection;
        console.log('getting answer from peer', call.peer);
        this.streamRemoteVideo(remoteStream, 'remote-video', call.peer);
        this.counter += 1;
        if (this.allConnectedSockets.length > this.counter) {
          this.callNextPeer();
        }
      });
      
    }).catch(err => {
      console.log(err + 'Unable to connect');
    });
  }

  private streamRemoteVideo(stream: any, id='remote-video', idValue): void {
    console.log('peer id: ', idValue);
    
    const video = document.createElement('video');
    video.classList.add('video');
    video.setAttribute('id', idValue);
    video.srcObject = stream;
    video.play();
    if (id == 'local-video') { 
      // video.muted = true;
      // let el = document.getElementById(id);
      // el.innerHTML = "";
      // document.getElementById(id).append(video);
    } else {
      // document.getElementById(id).append(video);
      this.assignStreamToParticipant(idValue, stream);
    }
    console.log('creating video tag for: ', idValue);
  }

  assignStreamToParticipant(peerId, videoStream){
    for(let eachPeer in this.totalParticipant){
      if(this.totalParticipant[eachPeer]['peerId'] == peerId) {
        this.totalParticipant[eachPeer]['videoStream'] = videoStream;
        console.log('assigned video sream for :', this.totalParticipant[eachPeer]['peerId']);
        
        break
      }
    }
  }

  private removeVideoStream(id){
    var elem = document.getElementById(id);
    elem.parentElement.removeChild(elem);
  }

  screenShare(): void {
    this.shareScreen();
  }

  private shareScreen(): void {
    // @ts-ignore
    navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'always'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    }).then(mediaStream => {
      this.isSharingScreen = true;
      this.mediaStream = mediaStream;
      const videoTrack = mediaStream.getVideoTracks()[0];
      videoTrack.onended = () => {
        this.stopScreenShare();
      };
      for(let eachPeer in this.totalParticipant) {
        if (this.totalParticipant[eachPeer]['currentPeer']) {
          const sender = this.totalParticipant[eachPeer]['currentPeer'].getSenders().find(s => s.track.kind === videoTrack.kind);
          sender.replaceTrack(videoTrack);
        }
      }
      // const sender = this.currentPeer.getSenders().find(s => s.track.kind === videoTrack.kind);
      // sender.replaceTrack(videoTrack);
    }).catch(err => {
      console.log('Unable to get display media ' + err);
    });
  }

  private stopScreenShare(): void {
    this.isSharingScreen = false;
    console.log('stoping scree share...');
    const videoTrack = this.localStream.getVideoTracks()[0];
    for(let eachPeer in this.totalParticipant) {
      if (this.totalParticipant[eachPeer]['currentPeer']) {
        const sender = this.totalParticipant[eachPeer]['currentPeer'].getSenders().find(s => s.track.kind === videoTrack.kind);
        sender.replaceTrack(videoTrack);
      }
    }
    // const sender = this.currentPeer.getSenders().find(s => s.track.kind === videoTrack.kind);
    // sender.replaceTrack(videoTrack);
  }
  replaceVideoToAudio(){
    const tracks = this.localStream.getTracks();
    tracks.forEach((track) => {
      track.stop();
    });

    navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    }).then((stream) => {
      this.localStream = stream;
      this.audioOnly = true;
      const audioTrack = this.localStream.getAudioTracks()[0];
      for(let eachPeer in this.totalParticipant) {
        if (this.totalParticipant[eachPeer]['currentPeer']) {
          const sender = this.totalParticipant[eachPeer]['currentPeer'].getSenders().find(s => s.track.kind === audioTrack.kind);
          sender.replaceTrack(audioTrack);
        }
      }
    })
  }

  toggleVideo(){
    this.localStream.getVideoTracks()[0].enabled = !(this.localStream.getVideoTracks()[0].enabled);
  }
  toggleAudio(){
    this.localStream.getAudioTracks()[0].enabled = !(this.localStream.getAudioTracks()[0].enabled);
    console.log('audio', this.localStream.getAudioTracks()[0]);
    // this.localStream.getAudioTracks()[0].muted = !(this.localStream.getAudioTracks()[0].muted);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.currentPeer.destroy();
  }

  initWebSocket(peerId){
    this.signalingService.connect();
    this.signalingService.onConnect(() => {
      console.log(`My Socket Id ${this.signalingService.socketId}`);
      let userData = {
        userName: 'ankitkeshri2013@gmail.com',
        name: 'Ankit Kumar',
        peerId: peerId,
        imageUrl: '',
        roomName: this.roomId,
        socketId: this.signalingService.socketId,
      }
      this.localPeerData = userData;
      this.signalingService.requestForJoiningRoom({ roomName: userData.roomName, userData });

      this.signalingService.getAllParticipantsByRoomId({roomName:this.roomId, socketId: this.signalingService.socketId});
      // the one who joined letter
      this.signalingService.getListOfAllParticipant( res => {
        this.allConnectedSockets = res;
        let localSocketInd = this.allConnectedSockets.findIndex(socket => socket == this.signalingService.socketId);
        if (localSocketInd > -1) {
          this.allConnectedSockets.splice(localSocketInd, 1); //socket id list without local socket(all peer only)
        }
        this.refreshPeerList();

        this.allConnectedSockets.forEach(eachSocket => {
          this.signalingService.askPeerIdBySocketId({socketId: eachSocket, callBackSocketId : this.signalingService.socketId, remoteUserData: this.localPeerData});
          console.log('asked to send peer id', eachSocket);
        })

      });

      // the one who joined earlier
      this.signalingService.someOneAskingPeerId(remotePeerData => {
        this.signalingService.sendPeerIdToSomeOne({data: this.localPeerData, socketId: remotePeerData.callBackSocketId});
        console.log('someone asking to send your peer id');
        this.totalParticipant[remotePeerData.remoteUserData.socketId] = remotePeerData.remoteUserData;
        this.allConnectedSockets.push(remotePeerData.remoteUserData.socketId);
        console.log('all participant', this.totalParticipant, this.allConnectedSockets);
      });
      // the one who joined letter(getting data of all existing user one by one)
      this.signalingService.getPeerIdFromSocketId(res => {
        console.log('get Peer data From SocketId');
        this.totalParticipant[res.socketId] = res;
        console.log('all participant', this.totalParticipant, this.allConnectedSockets);
        this.checkIfGetDataOfAllParticipant();
      });

      this.signalingService.onRoomLeft(res => {
        console.log('user ledt', res);
        if (!this.totalParticipant[res['socketId']]) return;
        delete this.totalParticipant[res['socketId']];
        console.log('onRoomLeft total connection', this.totalParticipant);
      })
    });
  }

  connectToEachPeer(){
    for(let eachConnection in this.totalParticipant){
      if (this.totalParticipant[eachConnection]['socketId'] != this.signalingService.socketId && 
        !this.totalParticipant[eachConnection]['alreadyConnected']
      ) { // make sure, not connecting with local peer
        console.log('connection with: ', eachConnection);
        this.callPeer(this.totalParticipant[eachConnection]['peerId'], this.totalParticipant[eachConnection]);
      }
    }
  }

  callNextPeer(){
    const socketId = this.allConnectedSockets[this.counter];
    const peerDetails = this.totalParticipant[socketId];
    console.log('calling next peer', socketId);
    
    if (socketId && peerDetails && peerDetails.peerId){
      this.callPeer(peerDetails.peerId, peerDetails);
      console.log('connecting to peer:', peerDetails.peerId);
    }
  }

  getCopy(data){
    if(!data) return null;
    return JSON.parse(JSON.stringify(data));
  }

  refreshPeerList(){
    let newPeerList = {};
    for(let i = 0 ; i < this.allConnectedSockets.length; i++) {
      let socketId = this.allConnectedSockets[i];
      if (this.totalParticipant[socketId]) {
        newPeerList[socketId] = this.totalParticipant[socketId];
      }
    }
    this.totalParticipant = newPeerList;
    console.log('total connection', this.totalParticipant);
  }

  checkIfGetDataOfAllParticipant(){
    let count = 0;
    for(let item in this.totalParticipant){
      count++;
    }
    if (count == this.allConnectedSockets.length) {
      console.log('got data from all sockets, now starting webRTC connection...');
      this.callNextPeer();
    }
  }

}
