import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  triggerMovieRequest = new Subject();
  socket: any;
  uri = "ws://192.168.0.64:4015"

  constructor() {}

}
