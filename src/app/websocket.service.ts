import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  triggerMovieRequest = new Subject();
  socket: any;
  uri = "ws://localhost:4015"

  constructor() {}

}
