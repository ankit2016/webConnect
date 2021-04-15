import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import * as hark from '../../../../node_modules/hark/hark.js';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit, AfterViewInit {
  @Input() data;
  isPeerSpeeking: boolean;
  constructor() { }

  ngOnInit(): void {
    console.log('video input', this.data); 
    let speechEvents = hark(this.data.videoStream, {});
    speechEvents.on('speaking', ()=> {
      console.log('peer speaking');
      this.isPeerSpeeking = true;
    });

    speechEvents.on('stopped_speaking', ()=> {
      console.log('peer stopped_speaking');
      this.isPeerSpeeking = false;
    });
  }
  ngAfterViewInit(): void {
    const video = document.createElement('video');
    video.classList.add(this.data.peerId);
    video.srcObject = this.data.videoStream;
    video.play();
    document.getElementById(this.data.peerId).append(video);
  }
}
