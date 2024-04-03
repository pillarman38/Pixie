import { Component, OnInit, ViewChild, ElementRef, AfterViewInit  } from '@angular/core';
import { ClickedMovieService } from '../clicked-movie.service';
import { HttpClient } from '@angular/common/http';
import{ Router } from '@angular/router';

@Component({
  selector: 'app-season-selection',
  templateUrl: './season-selection.component.html',
  styleUrls: ['./season-selection.component.css']
})

export class SeasonSelectionComponent implements OnInit, AfterViewInit {
  @ViewChild('container') container: ElementRef;
  @ViewChild('somecontent') somecontent;
  constructor(private clickedMovie: ClickedMovieService, private http: HttpClient, private router: Router) { }
  show
  seasons = []
  seasonNumbers = []
  episodes = []

  onSeasonChange(event) {
    const season = parseInt(event.target.value)
    console.log(season);
    console.log(this.seasons[season - 1]);
    this.episodes = this.seasons[season - 1].episodes
  }

  selectedEpisode(event) {
    console.log(event);
    
    this.clickedMovie.saveVideo = event
    this.router.navigateByUrl('/videoPlayer')
  }

  ngAfterViewInit() {
    console.log(this.somecontent, this.clickedMovie.saveVideo['backdropPhotoUrl'])
    this.somecontent.nativeElement.style.backgroundImage = `url('${this.clickedMovie.saveVideo['backdropPhotoUrl']}')`
    this.somecontent.nativeElement.style.backgroundSize = "cover"
    this.somecontent.nativeElement.style.backgroundRepeat = "no-repeat"
    this.somecontent.nativeElement.style.zIndex = "-20"
    // this.somecontent.nativeElement.style.position = 'absolute'
    this.somecontent.nativeElement.style.backgroundAttachment = 'fixed'
    window.scrollTo(0,0)
  }

  ngOnInit(): void {
    this.show = this.clickedMovie.saveVideo
    console.log(this.show);

    this.http.post(`http://192.168.0.64:4012/api/mov/show`, this.show).subscribe((res: any) => {
      console.log(res);
      this.seasonNumbers = res.seasonsList.map(season => season.seasonNum + 1)
      this.seasons = res.seasonsList
      this.episodes = res.seasonsList[0].episodes
    })
  }
}
