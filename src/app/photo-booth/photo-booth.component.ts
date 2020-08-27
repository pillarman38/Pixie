import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { PhotoUploaderService } from '../photo-uploader.service';
import { WebsocketService } from '../websocket.service';
import { ClickedMovieService } from '../clicked-movie.service';
import { from } from 'rxjs';
import{ Router } from '@angular/router';
import { PhotoViewService } from '../photo-view.service';
import { map, catchError } from "rxjs/operators";
import { throwError } from "rxjs";

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

  arrOfPhotos = []
  arrOfVideos = []
  videosBefore = []
  videos = []
  photosBefore = []
  photos = []

  constructor(private http: HttpClient, private photoServ: PhotoUploaderService, private webSocket: WebsocketService, private clickedMovie: ClickedMovieService, private router: Router, private photoViewServ: PhotoViewService) { }
  getExtention(filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
  }
  counter(e) {
    if(this.i != e.target.files.length){
      this.i++;
      this.handleDrop(e)
    } 
  }
  handleDrop(e) {
    
    var formData = new FormData();

    formData.append("photos", e.target.files[this.i]);
    
    var web = this.webSocket
    var extention = this.getExtention(e.target.files[this.i]['name'])
    console.log(extention)
    var uploadObj = {
      percent: 0,
      index: this.i,
      type: extention,
      location: `http://192.168.1.86:4012/${e.target.files[this.i]['name'].replace(new RegExp(' ', 'g'), '%20')}`,
      title: e.target.files[this.i]['name']
    }
    if(uploadObj['type'] == "png" || uploadObj['type'] == "jpeg") {
     this.arrOfPhotos.push(uploadObj)
    }
    if(uploadObj['type'] == "mov" || uploadObj['type'] == "mp4" || uploadObj['type'] == "MOV") {
      this.arrOfVideos.push(uploadObj)
    }
    this.http.post("http://192.168.1.86:4012/api/mov/uploadmedia", formData, {
        reportProgress: true,
        observe: "events"
      }).subscribe((data) => {
        console.log(this.i, data)
          
          var uploadProgress = 0
          uploadProgress =  Math.ceil((data['loaded'] / data['total']) * 100)
          
          if(!isNaN(uploadProgress)) {
            var foundPhoto = this.arrOfPhotos.find(function(post, index) {
              if(post.title == uploadObj['title']){
                post['percent'] = uploadProgress
              }
            });
            var foundVideo = this.arrOfVideos.find(function(post, index) {
              if(post.title == uploadObj['title']){
                post['percent'] = uploadProgress
              }
            });
            if(uploadObj['type'] == "png" || uploadObj['type'] == "jpeg") {
              console.log("picture")
              web.emit("photoUpdater", this.arrOfPhotos)
            }
            if(uploadObj['type'] == "mov" || uploadObj['type'] == "mp4" || uploadObj['type'] == "MOV") {
              console.log("video");
              
              web.emit("videoUpdater", this.arrOfVideos)
            }
          }
      })
    this.counter(e)
  }

  photoView(e) {
    this.photoViewServ.selectedPhoto = e.location
    this.router.navigateByUrl('/photoViewer')
  }
  saveSelected(e) {
    this.clickedMovie.saveVideo = e
    this.router.navigateByUrl('/videoPlayer')
  }
  ngOnInit(): void {
    this.http.get('http://192.168.1.86:4012/api/mov/getmedia').subscribe((data) => {
      console.log(data)
      this.videos = data['video']
      this.photosBefore = data['photo']
      this.videosBefore = data['video']
      this.photoViewServ.photosArr = data['photo']
    })
    this.webSocket.listen('photoUpdate').subscribe((data: any[]) => {
      console.log(data)
      this.photos = data
    })
    this.webSocket.listen('videoUpdate').subscribe((data: any[]) => {
      console.log(data)
      this.videos = data
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
