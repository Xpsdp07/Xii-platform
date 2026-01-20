import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-module',
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.scss']
})
export class ModuleComponent{
    private module: number;
    constructor(
        private router: Router,
        private translateService: TranslateService,
        private dialogRef: MatDialogRef<ModuleComponent>,
        private authService: AuthService,

    ){}
    
    onDesign(){
        if (!this.canAccessDesign()) return;
        this.module = ModuleType.design;
        this.dialogRef.close({ module: this.module });
    }

    onControls(){
        if (!this.canAccessControls()) return;
        this.module = ModuleType.controls;
        this.dialogRef.close({ module: this.module });
    }

    onPerformance(){
        if (!this.canAccessPerformance()) return;
        this.module = ModuleType.performance;
        this.dialogRef.close({ module: this.module });
    }

    onLifing(){
        if (!this.canAccessLifing()) return;
        this.module = ModuleType.lifing;
        this.dialogRef.close({ module: this.module });
    }

    onPrognostics(){
        if (!this.canAccessPrognostics()) return;
        this.module = ModuleType.prognostics;
        this.dialogRef.close({ module: this.module });
    }


    canAccessDesign(): boolean {
    return this.authService.hasPermission('Design.Read');
    }

    canAccessControls(): boolean {
    return this.authService.hasPermission('Controls.Read');
    }

    canAccessPerformance(): boolean {
    return this.authService.hasPermission('Performance.Read');
    }

    canAccessLifing(): boolean {
    return this.authService.hasPermission('Lifing.Read');
    }

    canAccessPrognostics(): boolean {
    return this.authService.hasPermission('Prognostics.Read');
    }

}

export enum ModuleType{
    "design",
    "controls",
    "performance",
    "lifing",
    "prognostics"
} 

export interface ModuleComponentData{};

export interface ModuleComponentResult{
    module: number
};