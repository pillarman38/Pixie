import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ClickedMovieService } from '../clicked-movie.service';
import{ Router } from '@angular/router';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, AfterViewInit {
  video;
  cast;
  @ViewChild('somecontent') somecontent;
  constructor(private clickedMovie: ClickedMovieService, private router: Router) { }
  saveSelected(pic) {
    this.router.navigateByUrl('/videoPlayer')
  }
  ngOnInit(): void {
    this.video = this.clickedMovie.saveVideo
    this.cast = this.clickedMovie.saveVideo['cast'] ? JSON.parse(this.clickedMovie.saveVideo['cast']) : {}
  }
  ngAfterViewInit() {
    console.log(this.cast, this.somecontent, this.clickedMovie.saveVideo['poster_path'])
    this.somecontent.nativeElement.style.backgroundImage = `url('${this.clickedMovie.saveVideo['poster_path']}')`
    this.somecontent.nativeElement.style.backgroundSize = "cover"
    this.somecontent.nativeElement.style.backgroundRepeat = "no-repeat"
    this.somecontent.nativeElement.style.zIndex = "-20"
    this.somecontent.nativeElement.style.position = 'absolute'
    this.somecontent.nativeElement.style.backgroundAttachment = "fixed"
    window.scrollTo(0,0)
  }
}
