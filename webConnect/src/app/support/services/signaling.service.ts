import { Injectable } from '@angular/core';
import io from "socket.io-client";
import * as APP_END_POINT from '../../shared/constant/api-constant';

@Injectable({
  providedIn: 'root'
})
export class SignalingService {
  private socket: any;
  get socketId() {
    return this.socket.id
  }

  constructor() { }

  connect() {
    this.socket = io.connect(APP_END_POINT.API.WS_URI);
  }

  private listen(channel: string, fn: Function) {
    this.socket.on(channel, fn)
  }

  private send(chanel: string, message) {
    this.socket.emit(chanel, message)
  }

  onConnect(fn: () => void) {
    this.listen('connect', fn)
  }

  requestForJoiningRoom(msg) {
    this.send('room_join_request', msg)
  }

  onRoomParticipants(fn: (participants: Array<string>) => void) {
    this.listen('room_users', fn)
  }

  getAllParticipantsByRoomId(payload){
    this.send('all_participant_list', payload);
  }
  getListOfAllParticipant(fn){
    this.listen('all_room_users', fn);
  }

  askPeerIdBySocketId(payload){
    this.send('ask_peerId_by_socketId', payload);
  }

  someOneAskingPeerId(fn){
    this.listen('someone_asking_your_peerId', fn);
  }

  sendPeerIdToSomeOne(data){
    this.send('someOne_send_his_peerId', data);
  }

  getPeerIdFromSocketId(fn){
    this.listen('get_peerId_from_socketId', fn);
  }

  oneToOne(payload){
    this.send('one-to-one', payload)
  }

  fromOnePeer(fn: (msg) => void) {
    this.listen('from-one-peer', fn)
  }

  sendOfferSignal(msg) {
    this.send('offer_signal', msg)
  }

  onOffer(fn: (msg) => void) {
    this.listen('offer', fn)
  }

  sendAnswerSignal(msg) {
    this.send('answer_signal', msg)
  }

  onAnswer(fn: (msg) => void) {
    this.listen('answer', fn)
  }

  onRoomLeft(fn: (socketId: string) => void) {
    this.listen('room_left', fn)
  }
}
