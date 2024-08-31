import { Component, OnInit, ViewChild } from '@angular/core';
import { FeaturesService, Network } from '../features.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WebSocketService } from '../websocket.service';

@Component({
  selector: 'app-enter-password',
  templateUrl: './enter-password.component.html',
  styleUrls: ['./enter-password.component.css']
})
export class EnterPasswordComponent implements OnInit{
  password = ""
  networkSwitched = false
  network: Network = {
    ssid: "",
    signaleStrength: ""
  }

  constructor(private features: FeaturesService, private http: HttpClient, private wss: WebSocketService) {}
  
  sendMsg() {
    console.log("PINGING");
    
    setTimeout(() => {
      this.http.get(`http://pixie.local:4012/api/mov/ping`, { headers: new HttpHeaders({ timeout: '5000' }) }).subscribe((res) => {
        console.log(res);
        this.sendMsg()
      }, (error) => {
        this.networkSwitched = true
      })
    }, 1000)
  }

  async connect() {
    console.log(this.password);
    console.log("POSTED");
    
    this.http.post('http://pixie.local:4012/api/mov/connect', {ssid: this.network.ssid, password: this.password}).subscribe((res)=>{
      console.log(res);
    })

    this.sendMsg()
  }

  ngOnInit(): void {
    this.network = this.features.network
  }
}
