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
  updateMovieList() {
    
  }

  ngOnInit(): void {
    this.http.get('http://pixie.local:4012/api/mov/tvList').subscribe((res) => {
      console.log(res);
      
      this.selection =  res
    })
  }
}
