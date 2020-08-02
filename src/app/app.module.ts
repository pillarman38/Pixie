import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VideoSelectionComponent } from './video-selection/video-selection.component';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

const appRoutes = [
  {path: 'videoPlayer', component: VideoPlayerComponent},
  {path: 'videoSelection', component: VideoSelectionComponent}
]

@NgModule({
  declarations: [
    AppComponent,
    VideoSelectionComponent,
    VideoPlayerComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
