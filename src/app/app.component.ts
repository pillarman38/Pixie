import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import{ Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { webSocket } from 'rxjs/webSocket'
import { WebsocketService } from './websocket.service';

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
  powerMsgs = "Power off"
  showsUI = true
  @ViewChild('progressBar') progressBAr: ElementRef;
  @ViewChild('searchBar') searchBar: ElementRef;
  isSyncing = false
  isDownloading = false
  syncingMovie = {
    backOrFront: 'frontend',
    title: undefined,
    percentage: undefined
  }
  constructor(private router: Router, private http: HttpClient, private trigger: WebsocketService) { }
  
  power(){
    this.powerMsgs = "Off"
    this.showsUI = false
    this.http.get('http://192.168.4.1:4012/api/mov/power').subscribe((res: any[]) => {
      console.log(res)
    })
  }

  ngOnInit() {
    const subject = webSocket('ws://192.168.4.1:4015');

    // this.subject.message(JSON.stringify(this.syncingMovie));
    subject.subscribe({
      next: (msg: any) => {
        this.isSyncing = true
        console.log(msg)
        this.syncingMovie = {
          backOrFront: 'frontend',
          title: msg.title,
          percentage: Math.floor(msg.percentDone)
        }
        if(msg.type === 'Syncing') {
          this.isSyncing = true
          this.isDownloading = false
        }
        if(msg.type === 'Downloading') {
          this.isSyncing = true
          this.isDownloading = true
        }
        if(msg.type === 'Downloading' && this.syncingMovie.percentage === 100) {
          this.isSyncing = false
          this.isDownloading = false
          this.trigger.triggerMovieRequest.next('trigger')
        }
        if(msg.type === "Syncing complete") {
          this.isSyncing = false
          this.isDownloading = false
        }
        if(msg.type === "Movie finished transcoding") {
          this.isSyncing = true
          this.isDownloading = true
        }
        if(!msg.percentDone) {
          this.isSyncing = false
          this.isDownloading = false
        }
        
      }, // Called whenever there is a message from the server.
      error: err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
      complete: () => console.log('complete') // Called when connection is closed (for whatever reason).
     });
    // this.http.get('http://192.168.4.1:4012/api/mov/overviewupdate').subscribe((res) => {
    //   console.log(res);
    // })
    this.router.navigateByUrl('/videoSelection')
  }
}