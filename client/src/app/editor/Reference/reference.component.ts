import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ProjectService } from '../../_services/project.service';

@Component({
  selector: 'app-reference-viewer',
  templateUrl: './reference.component.html',
  styleUrls: ['./reference.component.scss']
})
export class ReferenceViewerComponent implements OnInit, OnDestroy {

  safeFullSvg?: SafeHtml;

  zoom = 1;
  panX = 0;
  panY = 0;

  isPanning = false;
  startX = 0;
  startY = 0;

  viewsList: any[] = [];
  selectedView: any = null;

  private hmiSub?: Subscription;

  constructor(
    private sanitizer: DomSanitizer,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {

    const hmi = this.projectService.getHmi();

    // If editor loaded HMI already
    if (hmi && hmi.views) {
      this.viewsList = hmi.views.filter(v => v.type === 'svg');
    }

    // Listen when HMI loads
    this.hmiSub = this.projectService.onLoadHmi.subscribe(() => {
      const loaded = this.projectService.getHmi();
      if (loaded?.views) {
        this.viewsList = loaded.views.filter(v => v.type === 'svg');
      }
    });

    // Force load if not loaded yet
    try { this.projectService.reload(); } catch {}
  }

  ngOnDestroy(): void {
    this.hmiSub?.unsubscribe();
  }

  // Upload JSON
  triggerUpload() {
    const input = document.getElementById('refFileInput') as HTMLInputElement;
    if (!input) return;
    input.value = '';
    input.click();
  }

  onFileUpload(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const json = JSON.parse(e.target.result);
        this.loadSvgFromJson(json);
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  }

  loadSvgFromJson(json: any) {
    if (!json.svgcontent) {
      alert('JSON has no svgcontent');
      return;
    }

    let svg = json.svgcontent;

    // Replace black background
    svg = svg.replace(
      /<rect[^>]*fill="#000000"[^>]*>/gi,
      tag => tag.replace(/fill="#000000"/gi, 'fill="#ffffff"')
    );

    if (!svg.includes('background:')) {
      svg = svg.replace('<svg', `<svg style="background:white"`);
    }

    this.safeFullSvg = this.sanitizer.bypassSecurityTrustHtml(svg);

    this.resetView();
  }

  onSelectView(view: any) {
    if (!view?.svgcontent) return;

    let svg = view.svgcontent;

    svg = svg.replace(
      /<rect[^>]*fill="#000000"[^>]*>/gi,
      tag => tag.replace(/fill="#000000"/gi, 'fill="#ffffff"')
    );

    if (!svg.includes('background:')) {
      svg = svg.replace('<svg', `<svg style="background:white"`);
    }

    this.safeFullSvg = this.sanitizer.bypassSecurityTrustHtml(svg);

    this.resetView();
  }

  // Zoom
  onWheel(event: WheelEvent) {
    event.preventDefault();
    const dir = Math.sign(event.deltaY);

    if (dir < 0) this.zoom = Math.min(this.zoom + 0.1, 5);
    else this.zoom = Math.max(this.zoom - 0.1, 0.2);
  }

  // Pan
  startPan(event: MouseEvent) {
    this.isPanning = true;
    this.startX = event.clientX - this.panX;
    this.startY = event.clientY - this.panY;
  }

  pan(event: MouseEvent) {
    if (!this.isPanning) return;
    this.panX = event.clientX - this.startX;
    this.panY = event.clientY - this.startY;
  }

  endPan() {
    this.isPanning = false;
  }

  resetView() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
  }
}
