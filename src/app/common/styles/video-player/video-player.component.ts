import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @Input() videoUrl: string = '';
  @Output() videoCompleted = new EventEmitter<void>();
  @Output() progressUpdate = new EventEmitter<number>();
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  isPlaying: boolean = false;
  currentTime: number = 0;
  duration: number = 0;
  volume: number = 1;
  isMuted: boolean = false;
  isFullscreen: boolean = false;
  showControls: boolean = true;
  buffered: number = 0;
  isLoading: boolean = true;
  hasEmittedCompletion: boolean = false;

  private hideControlsTimeout: any;

  ngOnInit(): void {
    // Listener para mudanças de fullscreen
    document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    clearTimeout(this.hideControlsTimeout);
  }

  get formattedCurrentTime(): string {
    return this.formatTime(this.currentTime);
  }

  get formattedDuration(): string {
    return this.formatTime(this.duration);
  }

  get progressPercentage(): number {
    return (this.currentTime / this.duration) * 100 || 0;
  }

  togglePlay(): void {
    const video = this.videoElement.nativeElement;
    if (this.isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  onTimeUpdate(): void {
    const video = this.videoElement.nativeElement;
    this.currentTime = video.currentTime;
    if (video.buffered.length > 0) {
      this.buffered = (video.buffered.end(0) / video.duration) * 100;
    }

    // Emite progresso
    const progressPercentage = (this.currentTime / this.duration) * 100;
    this.progressUpdate.emit(progressPercentage);

    // Verifica se atingiu 95% para marcar como concluído
    if (progressPercentage >= 95 && !this.hasEmittedCompletion) {
      this.hasEmittedCompletion = true;
      this.videoCompleted.emit();
    }
  }

  onLoadedMetadata(): void {
    const video = this.videoElement.nativeElement;
    this.duration = video.duration;
    this.isLoading = false;
    this.hasEmittedCompletion = false; // Reset ao carregar novo vídeo
  }

  onWaiting(): void {
    this.isLoading = true;
  }

  onCanPlay(): void {
    this.isLoading = false;
  }

  seek(event: MouseEvent): void {
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    const video = this.videoElement.nativeElement;
    video.currentTime = pos * this.duration;
  }

  changeVolume(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.volume = parseFloat(input.value);
    this.videoElement.nativeElement.volume = this.volume;
    this.isMuted = this.volume === 0;
    (input as HTMLElement).style.setProperty('--volume-percentage', `${this.volume * 100}%`);
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.videoElement.nativeElement.muted = this.isMuted;
    if (this.isMuted) {
      this.volume = 0;
    } else {
      this.volume = this.videoElement.nativeElement.volume || 1;
    }
    const volumeSlider = this.videoElement.nativeElement.parentElement?.querySelector('.volume-slider') as HTMLElement;
    if (volumeSlider) {
      volumeSlider.style.setProperty('--volume-percentage', `${this.volume * 100}%`);
    }
  }

  toggleFullscreen(): void {
    const container = this.videoElement.nativeElement.parentElement;
    if (!this.isFullscreen) {
      if (container?.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  private onFullscreenChange(): void {
    this.isFullscreen = !!document.fullscreenElement;
  }

  skip(seconds: number): void {
    const video = this.videoElement.nativeElement;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, this.duration));
  }

  onMouseMove(): void {
    this.showControls = true;
    clearTimeout(this.hideControlsTimeout);
    this.hideControlsTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.showControls = false;
      }
    }, 3000);
  }

  onMouseLeave(): void {
    if (this.isPlaying) {
      clearTimeout(this.hideControlsTimeout);
      this.hideControlsTimeout = setTimeout(() => {
        this.showControls = false;
      }, 1000);
    }
  }

  private formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
