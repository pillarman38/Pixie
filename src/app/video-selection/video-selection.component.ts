import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ClickedMovieService } from '../clicked-movie.service';
import{ Router } from '@angular/router';

@Component({
  selector: 'app-video-selection',
  templateUrl: './video-selection.component.html',
  styleUrls: ['./video-selection.component.scss']
})

export class VideoSelectionComponent implements OnInit {

  constructor(private http:HttpClient, private clickedMovie: ClickedMovieService, private router: Router) { }
  selection;

  saveSelected(pic) {
    console.log(pic)
    this.clickedMovie.saveVideo = pic
    this.router.navigateByUrl('/videoPlayer')
  }

  ngOnInit(): void {
    this.http.get('http://192.168.4.1:4012/api/mov/movieList').subscribe((res: any[]) => {
      console.log(res)
      this.selection = res
    })
  }
}
