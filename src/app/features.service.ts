import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


export interface Network {
  ssid: string,
  signaleStrength: string
}

@Injectable({
  providedIn: 'root'
})
export class FeaturesService {
  network: Network = {
    ssid: "",
    signaleStrength: ""
  }
  dataSubject = new BehaviorSubject<any>(null);

  constructor() { }

  setData(data: any) {
    this.dataSubject.next(data);
  }

  getData(): Observable<any> {
    return this.dataSubject.asObservable();
  }
}
