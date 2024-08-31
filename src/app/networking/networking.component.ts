import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FeaturesService } from '../features.service';
import{ Router } from '@angular/router';

@Component({
  selector: 'app-networking',
  templateUrl: './networking.component.html',
  styleUrls: ['./networking.component.css']
})
export class NetworkingComponent implements OnInit{
  networksList = []
  switchedToHotSpot = false

  constructor(private http: HttpClient, private features: FeaturesService, private router: Router) {}

  selectedNetwork(network) {
    console.log(network);
    
    this.features.network = network
    this.router.navigateByUrl('/enterPassword')
  }
  // (error) => {
  //   this.switchedToHotSpot = true
  // }

  sendMsg() {
    console.log("PINGING");
    
    setTimeout(() => {
      this.http.get(`http://pixie.local:4012/api/mov/ping`, { headers: new HttpHeaders({ timeout: '5000' }) }).subscribe((res) => {
        console.log(res);
        this.sendMsg()
      }, (error) => {
        this.switchedToHotSpot = true
      })
    }, 1000)
  }


  switchToHotSpot() {
    this.http.get('http://pixie.local:4012/api/mov/switchtohotspot').subscribe((res) => {
      console.log(res);
    })
    this.sendMsg()
  }

  ngOnInit(): void {
    this.http.get(`http://pixie.local:4012/api/mov/networks`).subscribe((res: any) => {
      console.log(res);
      
      this.networksList = res
      console.log(this.networksList);
      
    })
  }
}
