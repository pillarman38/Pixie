import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tv-shows',
  templateUrl: './tv-shows.component.html',
  styleUrls: ['./tv-shows.component.css']
})
export class TvShowsComponent implements OnInit {

  constructor(private http: HttpClient) { }
  
  selection;

  ngOnInit(): void {
    this.http.get('http://192.168.4.1:4012/api/mov/tvList').subscribe((res) => {
      this.selection =  res
    })
  }

}
