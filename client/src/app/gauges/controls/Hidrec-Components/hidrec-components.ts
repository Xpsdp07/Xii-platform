import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-Hidrec',
  template: `
    <div>
      <ng-content></ng-content>
    </div>
  `
})
export class HidrecComponent implements OnInit {
  @Input() config: any;

  public static TypeTag = 'hidrec-block';
  public static LabelTag = 'Hidrec Block';

  constructor() {}

  ngOnInit() {
    if (this.config) {
      // Ensure interactivity object exists
      this.config.interactivity = this.config.interactivity || {};

      // Register with global editor's gaugesManager
      const editor = (window as any).editor;
      if (editor && editor.gaugesManager && typeof editor.gaugesManager.registerGauge === 'function') {
        editor.gaugesManager.registerGauge(this.config.layerId, this);
      }
    }
  }

  // Supported actions
  public static getActions(type: string) {
    return ['navigate', 'showDialog'];
  }

  // Supported events
  public static getEvents(type: string) {
    return ['click', 'dblclick'];
  }
}

// Expose globally for shapes.js
(window as any).HidrecComponentRef = HidrecComponent;
