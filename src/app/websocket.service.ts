import { Injectable } from "@angular/core";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";

@Injectable({
  providedIn: "root"
})
export class WebSocketService {
  private socket: WebSocketSubject<any> = webSocket("ws://pixie.local:4444")

  constructor() {}

  public messages = this.socket.asObservable()

  public sendMessage(msg: any): void {
    this.socket.next(msg)
  }
}