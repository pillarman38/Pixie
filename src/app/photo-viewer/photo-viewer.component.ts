import { Component, OnInit } from '@angular/core';
import { PhotoViewService } from '../photo-view.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-photo-viewer',
  templateUrl: './photo-viewer.component.html',
  styleUrls: ['./photo-viewer.component.css']
})
export class PhotoViewerComponent implements OnInit {
  img
  constructor(private photoViewServ: PhotoViewService, private router: Router) { }

  ngOnInit(): void {
    // this.router.navigateByUrl('/photoBooth')
    this.img = this.photoViewServ.selectedPhoto
  }
}
