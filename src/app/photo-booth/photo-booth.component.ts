import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { PhotoUploaderService } from '../photo-uploader.service';
import { WebSocketService } from '../websocket.service';
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

  constructor(private http: HttpClient, private photoServ: PhotoUploaderService, private webSocket: WebSocketService, private clickedMovie: ClickedMovieService, private router: Router, private photoViewServ: PhotoViewService) { }
  getExtention(filename) {
    var parts = filename.split('.');
    return filename
  }
  counter(e) {
    if(this.i + 1 != e.target.files.length){
      this.i += 1;
      this.handleDrop(e)
    } else {
      console.log("DONE!");
      
    }
  }
  handleDrop(e) {
    var formData = new FormData();
    console.log("I: ", this.i);
    
    for(var l = 0; l < e.target.files.length; l++) {
      formData.append("photos", e.target.files[l]);
    }
    var web = this.webSocket
    var extention = e.target.files[this.i]['type']
    var fileName = e.target.files[this.i]['name']
    console.log(extention, e.target.files)
    if(extention) {
      var uploadObj = {
        percent: 0,
        index: this.i,
        type: extention,
        location: `http://pixie.local:4012/${fileName.replace(new RegExp(' ', 'g'), '%20')}`,
        title: e.target.files[this.i]['name']
      }
      if(uploadObj['type'] === "image/png" || uploadObj['type'] === "image/jpeg" || uploadObj['type'] === "HEIC") {
       this.arrOfPhotos.push(uploadObj)
      }
      if(uploadObj['type'] === "video/quicktime" || uploadObj['type'] === "mp4" || uploadObj['type'] === "MOV") {
        this.arrOfVideos.push(uploadObj)
      }
      this.http.post("http://pixie.local:4012/api/mov/uploadmedia", formData, {
          reportProgress: true,
          observe: "events"
        }).subscribe((data) => {
          // console.log(this.i, data, this.arrOfVideos)
          //   console.log("PHOTOS AND VIDEOS ARRAY: ", this.arrOfPhotos, this.arrOfVideos, uploadObj);
            
          //   var uploadProgress = 0
          //   uploadProgress =  Math.ceil((data['loaded'] / data['total']) * 100)
            
          //   if(!isNaN(uploadProgress)) {
          //     var foundPhoto = this.arrOfPhotos.find(function(post, index) {
          //       if(post.title == uploadObj['title']){
          //         post['percent'] = uploadProgress
          //       }
          //     });
          //     var foundVideo = this.arrOfVideos.find(function(post, index) {
          //       if(post.title == uploadObj['title']){
          //         post['percent'] = uploadProgress
          //       }
          //     });
          //     if(uploadObj['type'] == "image/png" || uploadObj['type'] == "image/jpeg") {
          //       console.log("picture")
          //       web.emit("photoUpdater", this.arrOfPhotos)
          //     }
          //     if(uploadObj['type'] == "video/quicktime" || uploadObj['type'] == "mp4" || uploadObj['type'] == "MOV") {
          //       console.log("video");
                
          //       web.emit("videoUpdater", this.arrOfVideos)
          //     }
          //   }
        })
      this.counter(e)
    }
  }

  photoView(e) {
    this.photoViewServ.selectedPhoto = e.location
    this.router.navigateByUrl('/photoViewer')
  }
  saveSelected(e) {
    this.clickedMovie.saveVideo = e
    this.router.navigateByUrl('/videoPlayer')
  }

  getPhotos() {
    this.http.get('http://pixie.local:4012/api/mov/getmedia').subscribe((data: any[]) => {
      console.log(data)
      this.videos = data.filter(itm => itm.type != "image/jpeg")
      this.photosBefore = data.filter(itm => itm.type != "video/quicktime")
      this.videosBefore = data.filter(itm => itm.type != "video/quicktime")
      this.photoViewServ.photosArr = data.filter(itm => itm.type != "image/jpeg")
      this.photos = data.filter(itm => itm.type != "video/quicktime")
      console.log(this.photosBefore);
      console.log(this.photos);
      
    })
  }

  ngOnInit(): void {
  //   this.getPhotos()
  //   this.webSocket.listen('photoUpdate').subscribe((data: []) => {
  //     console.log(data)
  //     this.photos = this.photosBefore.concat(data)

      
  //   })
  //   this.webSocket.listen('videoUpdate').subscribe((data: any[]) => {
  //     console.log(data)
  //     this.videos = data
  //   })
  //   this.webSocket.listen('test event').subscribe((data: any[]) => {
  //     console.log(data)
  //     this.videos = data.filter(itm => itm.type != "video/quicktime")
  //     this.photos = data.filter(itm => itm.type != "image/jpeg")
  //     console.log(this.videos, this.photos)
  //   })
  //   this.webSocket.message('message').subscribe((data: any[]) => {
  //     console.log(data)
  //     this.videos = data.filter(itm => itm.type != "video/quicktime")
  //     this.photos = data.filter(itm => itm.type != "image/jpeg")
  //     console.log(this.videos, this.photos)
  //   })
  }
}
