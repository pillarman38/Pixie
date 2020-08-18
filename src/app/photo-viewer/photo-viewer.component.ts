import { Component, OnInit } from '@angular/core';
import { PhotoViewService } from '../photo-view.service';

@Component({
  selector: 'app-photo-viewer',
  templateUrl: './photo-viewer.component.html',
  styleUrls: ['./photo-viewer.component.css']
})
export class PhotoViewerComponent implements OnInit {
  img
  constructor(private photoViewServ: PhotoViewService) { }

  ngOnInit(): void {
    this.img = this.photoViewServ.selectedPhoto
  }

}
