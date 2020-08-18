import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PhotoUploaderService } from '../photo-uploader.service';
import { WebsocketService } from '../websocket.service';
import { ClickedMovieService } from '../clicked-movie.service';
import { from } from 'rxjs';
import{ Router } from '@angular/router';
import { PhotoViewService } from '../photo-view.service';

@Component({
  selector: 'app-photo-booth',
  templateUrl: './photo-booth.component.html',
  styleUrls: ['./photo-booth.component.css']
})
export class PhotoBoothComponent implements OnInit {

  
  @ViewChild('dropArea') dropArea: ElementRef;
  @ViewChild('progressBar') progressBar: ElementRef;
  @ViewChild('gallery') gallery: ElementRef;

  i = 0;

  uploadProgress = []
  videos = []
  photos = []

  constructor(private http: HttpClient, private photoServ: PhotoUploaderService, private webSocket: WebsocketService, private clickedMovie: ClickedMovieService, private router: Router, private photoViewServ: PhotoViewService) { }

  counter(e) {
    if(this.i != e.target.files.length){
      this.i++;
      this.handleDrop(e)
    }
  }
  handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    console.log(e)

    var formData = new FormData();

    formData.append("photos", e.target.files[this.i]);
    // formData.append("photos", e.target.files[this.i]['name'])
    var web = this.webSocket
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      request.upload.onprogress = function(e) {
        
        var percentComplete = Math.ceil((e.loaded / e.total) * 100);
        console.log(percentComplete)
        
      }
    	if(request.readyState == XMLHttpRequest.DONE) {
        var str = JSON.parse(request.responseText)
        console.log(str)
        setTimeout(() => {
        web.emit('test event', str)
        },1000)
        
      }
    }
    request.open("POST", 'http://192.168.1.86:4012/api/mov/uploadmedia')
    request.send(formData)
    // this.webSocket.emit('test event', "whaaaaa")
    this.counter(e)
  }

  saveSelected(pic) {
    console.log(pic)
    this.clickedMovie.saveVideo = pic
    this.router.navigateByUrl('/videoPlayer')
  }
  photoView(e) {
    this.photoViewServ.selectedPhoto = e
    this.router.navigateByUrl('/photoViewer')
  }
  ngOnInit(): void {
    this.http.get('http://192.168.1.86:4012/api/mov/getmedia').subscribe((data) => {
      console.log(data)
      this.videos = data['video']
      this.photos = data['photo']
    })
    this.webSocket.listen('test event').subscribe((data: any[]) => {
      console.log(data)
      this.videos = data['video']
      this.photos = data['photo']
      console.log(this.videos, this.photos)
    })
    this.webSocket.message('message').subscribe((data: any[]) => {
      console.log(data)
      this.videos = data['video']
      this.photos = data['photo']
      console.log(this.videos, this.photos)
    })
  }
}
