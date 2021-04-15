import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScreenShareComponent } from './screen-share/screen-share.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SignalingService } from './services/signaling.service';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { JoinMeetingComponent } from './join-meeting/join-meeting.component';
import { MeetingRoutingModule } from './meeting-route';
import { ScreeSharePlayerComponent } from './scree-share-player/scree-share-player.component';


@NgModule({
  declarations: [
    ScreenShareComponent,
    HeaderComponent,
    FooterComponent,
    VideoPlayerComponent,
    JoinMeetingComponent,
    ScreeSharePlayerComponent
  ],
  imports: [
    CommonModule,
    MeetingRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [SignalingService]
})
export class SupportModule { }
