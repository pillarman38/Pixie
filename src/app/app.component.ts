import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import{ Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { webSocket } from 'rxjs/webSocket'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'pibox';
  hotspotornot = true
  percentDone
  progressIsDone = false
  @ViewChild('progressBar') progressBAr: ElementRef;

  constructor(private router: Router, private http: HttpClient) { }
  
  power(){
    this.http.get('http://192.168.4.1:4012/api/mov/power').subscribe((res: any[]) => {
      console.log(res)
    })
  }
  ngOnInit() {
    // this.http.get('http://192.168.4.1:4012/api/mov/overviewupdate').subscribe((res) => {
    //   console.log(res);
    // })
    let subject = webSocket(`ws://192.168.4.1:4013`)

    subject.subscribe((msg) => {
      console.log(msg);
      this.percentDone = msg
      this.progressBAr.nativeElement.style.width = msg
      if(this.percentDone == "100%") {
        this.percentDone = "done!"
        setTimeout(()=>{
          this.percentDone = ""
          this.progressBAr.nativeElement.style.width = "0%"
        }, 1000)
      }
    })
    this.router.navigateByUrl('/videoSelection')
  }
}
