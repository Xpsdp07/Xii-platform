import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Subject, takeUntil } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';
import { ProjectService } from '../../_services/project.service';

import { NewProjectComponent } from '../new-project/new-project.component';
import { ConfirmDialogComponent } from '../../gui-helpers/confirm-dialog/confirm-dialog.component';
import { ProjectData } from '../../_models/project';

@Component({
  selector: 'app-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.css']
})
export class ProjectsListComponent implements OnInit, OnDestroy {
  isLoading = false;
  errorMsg = '';

  projects: ProjectData[];
  selectedProject: ProjectData;
  private destroy = new Subject<void>();

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private projectService: ProjectService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadProjects();

    // If your app emits this when project data loads/changes, refresh list:
    this.projectService.onLoadProjects
      .pipe(takeUntil(this.destroy))
      .subscribe(() => this.loadProjects());
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  onNewProject() {
    const ref = this.dialog.open(NewProjectComponent, {
      width: '520px',
    });

    ref.afterClosed().subscribe(data=>{
      const projectName = data?.name?.trim();
      if(!projectName) return;
      try {
            this.projectService.setNewProject();
            if (projectName !== this.projectService.getProjectName()) {
                this.projectService.setProjectName(data.name.replace(/ /g,''));
            }
            this.router.navigate(['/editor']);
        } catch (err) {
            console.error(err);
        }

    })
  }

  onOpenProject(project: ProjectData) {
    this.selectedProject = project;
    this.projectService.setProject(project, true);
    this.router.navigate(['/editor']);
    // this.router.navigate(['/']);
  }

  onDeleteProject(project: ProjectData) {
    const msg = this.translateService.instant('msg.projects-confirm-remove', { value: project.name });
    const dialogRef = this.dialog.open(ConfirmDialogComponent,{
      data: { msg: msg },
    })
    dialogRef.afterClosed().subscribe(res=>{
      if(res && project){
        this.projectService.removeProject(project);
      }
      else{
        console.error("msg.project-delete err: no project found!");
      }
    })
  }

  onOpenLastProject(){
    this.router.navigate(['/editor']);
  }

  private loadProjects() {
    this.isLoading = true;
    this.errorMsg = '';
    this.projectService.getProjects()
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (list) => {
          this.projects = Array.isArray(list) ? list : [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('loadProjects error', err);
          this.errorMsg = this.translateService.instant('msg.load-projects-error') || 'Failed to load projects';
          this.isLoading = false;
        }
    });
  }
}
