import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  socket: any;
  uri = "http://192.168.4.1:4013"

  constructor() { 
    this.socket = io(this.uri)
  }

  message(eventName: string) {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data) =>{
        console.log(eventName,data)
        subscriber.next(data)
      })
    })
  }
  
  listen(eventName: string) {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data) =>{
        console.log(eventName,data)
        subscriber.next(data)
      })
    })
  }
  emit(eventName, data) {
    console.log(this.socket)
    this.socket.emit(eventName, data);
  }
  emitToServer(eventName, data) {
    console.log(this.socket)
      this.socket.emit(eventName, data);

  }
}
