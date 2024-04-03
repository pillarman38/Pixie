import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ClickedMovieService } from '../clicked-movie.service';
import { Router } from '@angular/router';
import { WebsocketService } from '../websocket.service';


@Component({
  selector: 'app-video-selection',
  templateUrl: './video-selection.component.html',
  styleUrls: ['./video-selection.component.scss']
})

export class VideoSelectionComponent implements OnInit {

  constructor(private http:HttpClient, private clickedMovie: ClickedMovieService, private router: Router, private trigger: WebsocketService) { }
  selection;
  isLoading = false;
  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    // console.log("scrolling: ", (window.innerHeight + window.scrollY + 16), event.srcElement.scrollingElement.scrollHeight)

    if((window.innerHeight + window.scrollY + 16) >= event.srcElement.scrollingElement.scrollHeight && this.isLoading == false) {
      const prom = this.http.post('http://192.168.0.64:4012/api/mov/moreMoviesOnScroll', (this.selection[this.selection.length - 1])).toPromise()
      console.log("waiting");
      this.isLoading = true

      prom.then((data: any[])=>{
        console.log(this.selection.length);
        this.isLoading = false
        for(var i = 0; i < data.length; i++) {
          this.selection.push(data[i])
          if(i + 1 == data.length) {
            this.isLoading = false
          }
        }
      })
    } else {
      console.log("Not retreiving");
    }
  }

  saveSelected(pic) {
    console.log(pic)
    this.clickedMovie.saveVideo = pic
    this.router.navigateByUrl('/overview')
  }

  ngOnInit(): void {
    this.http.get('http://192.168.0.64:4012/api/mov/movieListOnStartup').subscribe((res: any[]) => {
      console.log(res)
      this.selection = res
    })
    this.trigger.triggerMovieRequest.subscribe((res)=> {
      console.log(res);
      
      if(res === 'trigger') {
        this.http.get('http://192.168.0.64:4012/api/mov/movieListOnStartup').subscribe((res: any[]) => {
          console.log(res)
          this.selection = res
        })
      }
    })
  }
}
