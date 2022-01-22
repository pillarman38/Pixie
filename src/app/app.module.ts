import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VideoSelectionComponent } from './video-selection/video-selection.component';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { PhotoBoothComponent } from './photo-booth/photo-booth.component';
import { PhotoViewerComponent } from './photo-viewer/photo-viewer.component';
import { CopierComponent } from './copier/copier.component';
import { OverviewComponent } from './overview/overview.component';
import { TvShowsComponent } from './tv-shows/tv-shows.component';

const appRoutes = [
  {path: 'videoPlayer', component: VideoPlayerComponent},
  {path: 'videoSelection', component: VideoSelectionComponent},
  {path: 'photoBooth', component: PhotoBoothComponent},
  {path: 'photoViewer', component: PhotoViewerComponent},
  {path: "copier", component: CopierComponent},
  {path: "overview", component: OverviewComponent}
]

@NgModule({
  declarations: [
    AppComponent,
    VideoSelectionComponent,
    VideoPlayerComponent,
    PhotoBoothComponent,
    PhotoViewerComponent,
    CopierComponent,
    OverviewComponent,
    TvShowsComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' }),
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
