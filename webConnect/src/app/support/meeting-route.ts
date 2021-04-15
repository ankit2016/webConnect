import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScreenShareComponent } from './screen-share/screen-share.component';
import { JoinMeetingComponent } from './join-meeting/join-meeting.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'join-meeting'
  },
  {
      path: 'meeting-room/:id',
      component: ScreenShareComponent
  },
  {
    path: 'join-meeting',
    component: JoinMeetingComponent
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeetingRoutingModule { }