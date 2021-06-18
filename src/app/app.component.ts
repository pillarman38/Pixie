import { Component, OnInit } from '@angular/core';
import{ Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'pibox';
  hotspotornot = true
  constructor(private router: Router, private http: HttpClient) { }
  
  power(){
    this.http.get('http://192.168.4.1:4012/api/mov/power').subscribe((res: any[]) => {
      console.log(res)
    })
  }
  ngOnInit() {
    this.router.navigateByUrl('/videoSelection')
  }
}
