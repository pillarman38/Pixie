import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PhotoUploaderService } from '../photo-uploader.service';

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
  
  constructor(private http: HttpClient, private photoServ: PhotoUploaderService) { }
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

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
    	if(request.readyState == XMLHttpRequest.DONE) {
	    console.log(request.responseText)
	}
    }
    request.open("POST", 'http://192.168.4.1:4012/api/mov/uploadmedia')
    request.send(formData)
    this.counter(e)
  }
  
  
  ngOnInit(): void {
  }

}
