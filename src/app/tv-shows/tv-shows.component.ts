import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ClickedMovieService } from '../clicked-movie.service';

@Component({
  selector: 'app-tv-shows',
  templateUrl: './tv-shows.component.html',
  styleUrls: ['./tv-shows.component.css']
})
export class TvShowsComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router, private clickedMovie: ClickedMovieService) { }
  
  selection;

  toSeasonSelection(show) {
    console.log(show);
    this.clickedMovie.saveVideo = show
    this.router.navigateByUrl('/seasonSelection')
  }

  ngOnInit(): void {
    this.http.get('http://192.168.0.64:4012/api/mov/tvList').subscribe((res) => {
      console.log(res);
      
      this.selection =  res
    })
  }
}
