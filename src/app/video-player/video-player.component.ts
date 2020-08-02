import { Component, OnInit } from '@angular/core';
import { ClickedMovieService } from '../clicked-movie.service';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit {

  constructor(private clickedMovie: ClickedMovieService) { }
  video;
  ngOnInit(): void {
    this.video = this.clickedMovie.saveVideo['location']
    console.log(this.video)
  }

}
