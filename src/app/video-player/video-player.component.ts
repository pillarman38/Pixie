import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { ClickedMovieService } from '../clicked-movie.service';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit, AfterViewInit {
  @ViewChild('videoPlayer') videoPlayer: ElementRef;
  
  constructor(private clickedMovie: ClickedMovieService) { }
  video;

ngAfterViewInit() {
  console.log(this.videoPlayer);
  // this.videoPlayer.nativeElement.webkitEnterFullScreen();
}

  ngOnInit(): void {
    this.video = this.clickedMovie.saveVideo['location']
    console.log(this.video)
  }
}
