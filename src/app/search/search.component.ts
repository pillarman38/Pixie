import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ClickedMovieService } from '../clicked-movie.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  results = []
  constructor(private http: HttpClient, private clickedMovie: ClickedMovieService, private router: Router) { }

  selected(res) {
    console.log(res)
    this.clickedMovie.saveVideo = res
    if(res.type === 'tv') {
      this.router.navigateByUrl('/seasonSelection')
    }
    if(res.type === 'movie') {
      this.router.navigateByUrl('/overview')
    }
  }

  onKeypressEvent(e: any) {
    console.log("EVENT: ", e.target.value.length);
    
    this.http.post(`http://192.168.0.64:4012/api/mov/search`, {searchVal: e.target.value}).subscribe((res: any) => {
      this.results = res
    })
  }

  ngOnInit(): void {
  }

}
