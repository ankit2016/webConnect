import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, AfterViewInit {
  @Input() localStream;
  @Input() showLocalVideo;
  @Input() audioOnly;
  @Output() shareScreen = new EventEmitter();
  @Output() toggleVideo = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    
    console.log('showLocalVideo', this.showLocalVideo);
    
  }
  ngAfterViewInit(): void {
    const video = document.createElement('video');
    video.classList.add('local-video');
    video.srcObject = this.localStream;
    video.play();
    document.getElementById('video-id').append(video); 
  }
}
