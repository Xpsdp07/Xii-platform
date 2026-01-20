import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Subject, takeUntil } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';
import { ProjectService } from '../../_services/project.service';

import { NewProjectComponent } from '../new-project/new-project.component';
import { ConfirmDialogComponent } from '../../gui-helpers/confirm-dialog/confirm-dialog.component';
import { ProjectData } from '../../_models/project';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.css']
})
export class ProjectsListComponent implements OnInit, OnDestroy {

  isLoading = false;
  errorMsg = '';

  projects: ProjectData[] = [];
  selectedProject: ProjectData;
  private destroy = new Subject<void>();

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private authService: AuthService   // ✅ ADD THIS LINE
  ) {}

  ngOnInit(): void {

    // 🔥 Load permissions from localStorage
    // ❌ If user doesn't have read permission → block page
    if (!this.authService.hasPermission("Projects.Read")) {
      this.toastr.error("You do not have permission to view projects");
      return; // stop further loading
    }

    this.loadProjects();

    this.projectService.onLoadProjects
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (res)=> { if (res) this.loadProjects(); },
        error: (err)=> console.error(`err, ${err}`)
      });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }



  // -----------------------------
  // CREATE NEW PROJECT
  // -----------------------------
  onNewProject() {

    if (!this.authService.hasPermission("Projects.Create")) {
      this.toastr.error("You do not have permission to create projects");
      return;
    }

    const ref = this.dialog.open(NewProjectComponent, {
      width: '520px',
      data: <ProjectProperties>{
        name: '',
        existingNames: this.projects.map(p => p.name)
      }
    });

    ref.afterClosed().subscribe(data => {
      const projectName = data?.name?.trim();
      if (!projectName) return;

      try {
        this.projectService.setNewProject();

        if (projectName !== this.projectService.getProjectName()) {
          this.projectService.setProjectName(projectName.replace(/ /g,''));
        }

        this.router.navigate(['/viewList']);
      } catch (err) {
        console.error(err);
      }
    });
  }

  // -----------------------------
  // OPEN PROJECT
  // -----------------------------
  onOpenProject(project: ProjectData) {

    if (!this.authService.hasPermission("Projects.Read")) {
      this.toastr.error("You do not have permission to open projects");
      return;
    }

    this.selectedProject = project;
    this.projectService.setProject(project, true);
    this.router.navigate(['/viewList']);
  }

  // -----------------------------
  // DELETE PROJECT
  // -----------------------------
  onDeleteProject(project: ProjectData) {

    if (!this.authService.hasPermission("Projects.Delete")) {
      this.toastr.error("You do not have permission to delete projects");
      return;
    }

    const msg = this.translateService.instant(
      'msg.projects-confirm-remove',
      { value: project.name }
    );

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { msg: msg },
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res && project) {
        this.projectService.removeProject(project);
      } else {
        console.error("msg.project-delete err: no project found!");
      }
    });
  }

  // -----------------------------
  // OPEN LAST PROJECT
  // -----------------------------
  onOpenLastProject() {
    if (!this.authService.hasPermission("Projects.Read")) {
      this.toastr.error("You do not have permission to open projects");
      return;
    }
    this.router.navigate(['/viewList']);
  }

  // -----------------------------
  // LOAD PROJECT LIST
  // -----------------------------
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
          this.errorMsg = this.translateService.instant('msg.load-projects-error')
            || 'Failed to load projects';
          this.isLoading = false;
        }
      });
  }
}

export interface ProjectProperties {
  name: String;
  existingNames: String[];
}
