import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../websocket.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket'

@Component({
  selector: 'app-copier',
  templateUrl: './copier.component.html',
  styleUrls: ['./copier.component.css']
})
export class CopierComponent implements OnInit {

  // @HostListener('document:click', ['$event'])
  // clickout(event) {
  //   if(this.eRef.nativeElement.contains(event.target)) {
  //     this.text = "clicked inside";
  //   } else {
  //     this.text = "clicked outside";
  //   }
  // }
 
  filesystem = []
  usb = []
  dirList = []
  filesArr = []
  selected = false
  constructor(private http: HttpClient,  private webSocket: WebsocketService) { }
  
  eject() {
    this.http.get(`http://192.168.4.1:4012/api/mov/eject`).subscribe((res: any) => {
      console.log(res);
    })
  }

  delete(itm) {
    console.log(itm)
    this.http.post(`http://192.168.4.1:4012/api/mov/deleter`, {toDelete: itm}, {reportProgress: true, observe: 'events'}).subscribe((res) => {
      console.log(res);
    })
  }

  move(e) {
    console.log(e)
    this.http.post(`http://192.168.4.1:4012/api/mov/mover`, {toMove: e}).subscribe((res: any) => {
      console.log(res);

    })
  }
  ngOnInit(): void {
    var subject = webSocket('ws://192.168.4.1:4012');
    subject.subscribe(
      (msg) => console.log('message recieved', msg),
      (err) => console.log(err),
      () => console.log('complete')
    )
    this.http.get('http://192.168.4.1:4012/api/mov/dirinfogetter').subscribe((data: any) => {
      this.filesystem = data['filesystem']
      this.usb = data['usb']
      console.log(data);
    })
  }
}
