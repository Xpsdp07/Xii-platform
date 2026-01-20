import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ChangeDetectorRef, Inject } from '@angular/core';
import { DOCUMENT, Location } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, fromEvent, interval, merge, switchMap, tap } from 'rxjs';

import { environment } from '../environments/environment';

import { ProjectService } from './_services/project.service';
import { SettingsService } from './_services/settings.service';
import { UserGroups } from './_models/user';
import { AppService } from './_services/app.service';
import { HeartbeatService } from './_services/heartbeat.service';
import { SidenavComponent } from './sidenav/sidenav.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'app';
  location: Location;
  showdev = false;
  isLoading = false;

  @ViewChild('fabmenu', { static: false }) fabmenu: any;
  @ViewChild(SidenavComponent, { static: false }) sidenavComponent: SidenavComponent;

  private subscriptionLoad: Subscription;
  private subscriptionShowLoading: Subscription;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private appService: AppService,
    private projectService: ProjectService,
    private settingsService: SettingsService,
    private translateService: TranslateService,
    private heartbeatService: HeartbeatService,
    private cdr: ChangeDetectorRef,
    location: Location
  ) {
    this.location = location;
  }

  ngOnInit() {
    console.log(`FUXA v${environment.version}`);
    this.heartbeatService.startHeartbeatPolling();

    // capture events for the token refresh
    const inactivityDuration = 1 * 60 * 1000;
    const activity$ = merge(
      fromEvent(document, 'click'),
      fromEvent(document, 'touchstart')
    );
    activity$.pipe(
      tap(() => this.heartbeatService.setActivity(true)),
      switchMap(() => interval(inactivityDuration))
    ).subscribe(() => {
      this.heartbeatService.setActivity(false);
    });
  }

  ngAfterViewInit() {
    try {
      this.settingsService.init();

      const hmi = this.projectService.getHmi();
      if (hmi) {
        this.checkSettings();
        // ✅ Dynamically add Simulation menu if layout exists
        if (this.sidenavComponent && hmi.layout) {
          this.sidenavComponent.setLayout(hmi.layout);
        }
      }

      this.subscriptionLoad = this.projectService.onLoadHmi.subscribe((load: any) => {
        this.checkSettings();
        this.applyCustomCss();

        // ✅ Set layout to sidenav so Simulation menu is added dynamically
        if (this.sidenavComponent && load?.layout) {
          this.sidenavComponent.setLayout(load.layout);
        }
      }, error => {
        console.error('Error loadHMI');
      });

      // define user groups text
      this.translateService.get('general.usergroups').subscribe((txt: string) => {
        const grpLabels = txt.split(',');
        if (grpLabels && grpLabels.length > 0) {
          for (let i = 0; i < grpLabels.length && i < UserGroups.Groups.length; i++) {
            UserGroups.Groups[i].label = grpLabels[i];
          }
        }
      });

      // show loading manager
      this.subscriptionShowLoading = this.appService.onShowLoading.subscribe(show => {
        this.isLoading = show;
        this.cdr.detectChanges();
      }, error => {
        this.isLoading = false;
        console.error('Error to show loading');
      });

    } catch (err) {
      console.error(err);
    }
  }

  ngOnDestroy() {
    try {
      if (this.subscriptionLoad) {
        this.subscriptionLoad.unsubscribe();
      }
      if (this.subscriptionShowLoading) {
        this.subscriptionShowLoading.unsubscribe();
      }
    } catch (e) {
      console.error(e);
    }
  }

  applyCustomCss() {
    const hmi = this.projectService.getHmi();
    if (hmi?.layout?.customStyles) {
      const style = this.document.createElement('style');
      style.textContent = hmi.layout.customStyles;
      this.document.head.appendChild(style);
    }
  }

  checkSettings() {
    const hmi = this.projectService.getHmi();
    this.showdev = !(hmi && hmi.layout && hmi.layout.showdev === false);
  }

  isHidden() {
    const urlEnd = this.location.path();
    return !urlEnd || urlEnd.startsWith('/home') || urlEnd === '/lab';
  }
  isLandingPage(){
    return this.router.url ==='/'|| this.router.url.startsWith('/landing');

  }

  getClass() {
    const route = this.location.path();
    if (route.startsWith('/view')) {
      return 'work-void';
    }
    return this.isHidden() ? 'work-home' : 'work-editor';
  }

  showDevNavigation() {
    const route = this.location.path();
    if (route.startsWith('/view')) return false;
    return this.showdev;
  }

  onGoTo(goto: string) {
    if (!goto) return;

    // Toggle the FAB menu if exists
    if (this.fabmenu) {
      this.fabmenu.toggle();
    }

    // Navigate to the route dynamically
    switch (goto) {
      case 'home':
        this.router.navigate(['/home']);
        break;
      case 'editor':
        this.router.navigate(['/editor']);
        break;
      case 'lab':
        this.router.navigate(['/lab']);
        break;
      case 'simulationpage':
        this.router.navigate(['/simulationpage']);
        break;
      default:
        this.router.navigate([goto]);
        break;
    }
  }
}
