import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ChangeDetectorRef, ElementRef, Inject, Output, EventEmitter } from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ActivatedRoute, Route } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA  } from '@angular/material/legacy-dialog';
import { ModuleComponent } from '../../module/module.component';
import { ModuleType, ModuleComponentData, ModuleComponentResult } from '../../module/module.component';
import { DocProfile, View, ViewModuleType, ViewType } from '../../_models/hmi';
import { ViewPropertyComponent, ViewPropertyType } from '../../editor/view-property/view-property.component';
import { ProjectService } from '../../_services/project.service';
import { Hmi } from '../../_models/hmi';
import { Utils } from '../../_helpers/utils';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../gui-helpers/confirm-dialog/confirm-dialog.component';
import { HmiService } from '../../_services/hmi.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EditNameComponent, EditNameData } from '../../gui-helpers/edit-name/edit-name.component';

//sdp rbac
import { AuthService } from '../../_services/auth.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-view-list',
  templateUrl: './view-list.component.html',
  styleUrls: ['./view-list.component.css']
})
export class ViewListComponent implements OnInit, OnDestroy{

    moduleName: string;
    viewModuleType: ViewModuleType;
    errorMsg: String; 
    isLoading: boolean = false;
    viewList: View[] = [];
    hmi: Hmi = new Hmi();
    subscriptionLoad: Subscription;
    renderSvg: SafeHtml;
    private destroy = new Subject<void>(); 

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private sanitizer: DomSanitizer,
        private translateService: TranslateService,
        private changeDetector: ChangeDetectorRef,
        private projectService: ProjectService, 
        private hmiService: HmiService,
        private dialog: MatDialog,
        private authService: AuthService,     // ✅
        private toastr: ToastrService         // ✅

    ){}

    ngOnInit(): void {

        const dialogRef = this.dialog.open<ModuleComponent, ModuleComponentData, ModuleComponentResult>(ModuleComponent,{
            disableClose: true
        });

        dialogRef.afterClosed().subscribe({
            next: (res)=>{
                if(!res){    
                    console.error("Error: res undefined");
                    return;
                }
                this.moduleName = ModuleType[res.module];
                if(this.moduleName === "design"){
                    this.viewModuleType = ViewModuleType.design;
                    this.hmiService.onModuleSelection.next(this.viewModuleType);
                    localStorage.setItem('@xcada.webmodule.currentmodule', this.viewModuleType.toString());
                }
                else if(this.moduleName === "controls"){
                    this.moduleName = "controls";
                    this.viewModuleType = ViewModuleType.controls;
                    this.hmiService.onModuleSelection.next(this.viewModuleType);
                    localStorage.setItem('@xcada.webmodule.currentmodule', this.viewModuleType.toString());
                }
                /**
                 * Handle other module selection here.
                 */
                
                this.onFiltersLoadViewList();
            },
            error: (err: any)=>{
                this.errorMsg = err;
                console.error(`Error: ${this.errorMsg}`);
            }
        })

    }

    ngAfterViewInit() {
        
        /**
         * force fetch the project data.
         */
        this.projectService.reload(); 
        this.subscriptionLoad = this.projectService.onLoadHmi.pipe(takeUntil(this.destroy)).subscribe({
            next: (load)=>{
                this.onLoadViews();
            },
            error: ()=>{
                console.error('Error: loadViews')
            }
        })

        this.changeDetector.detectChanges();
    }

    ngOnDestroy(): void {
        this.destroy.next();
        this.destroy.complete();
    }

    onNewView() {
        //rbac sdp
        if (!this.canCreateView()) {
            this.toastr.error('You do not have permission to create views');
            return;
        }
        //rbac end 

        let dialogRef = this.dialog.open(ViewPropertyComponent, {
            position: { top: '30px' },
            data: <ViewPropertyType & { newView: boolean}> {
                name: '',
                profile: new DocProfile(),
                type: ViewType.svg,
                existingNames: this.hmi.views.map((v) => v.name),
                newView: true
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                let view = new View(Utils.getShortGUID('v_'), result.type, result.name);
                view.moduleType = ViewModuleType.design;
                if(this.viewModuleType){
                    view.moduleType = this.viewModuleType;
                }
                view.profile = result.profile;
                this.hmi.views.push(view);
                this.saveView(view);
            }
        });
    }
    
    onOpenView(view: View) {
        //rbac sdp 
        if (!this.canReadView()) {
            this.toastr.error('You do not have permission to open views');
            return;
        }
        //rbac end 

        if(!view){
            console.log("Error: view not found");
            return;
        }
        let viewName: string = view.name;
        this.router.navigate(['/home'],{
            queryParams:{
                viewName: viewName
            }
        });
    }

    onLoadViews() {
        this.isLoading = true;
        let hmi = this.projectService.getHmi();
        if(hmi){
            this.hmi = hmi;
            this.viewList = this.hmi.views;
        }
        this.isLoading = false;
    }

    onFiltersLoadViewList() {
        this.isLoading = true;

        // 🔐 RBAC: Views.Read check
        console.log("checking for Views.Read");
        if (!this.canReadView()) {
            console.log("user doesnt have");
            
            this.viewList = [];
            this.isLoading = false;
            return;
        }

        this.viewList = this.hmi.views.filter(
            item => item.moduleType === this.viewModuleType
        );

        this.isLoading = false;
    }


    onDeleteView(view: View) {
        //rbac sdp 
        if (!this.canDeleteView()) {
            this.toastr.error('You do not have permission to delete views');
            return;
        }
        //rbac end 

        let msg = '';
        this.translateService.get('msg.view-remove', { value: view.name }).subscribe((txt: string) => { msg = txt; });
        let dialogRef = this.dialog.open(ConfirmDialogComponent, {
            position: { top: '60px' },
            data: <ConfirmDialogData> { msg: this.translateService.instant('msg.view-remove', { value: view.name }) }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && this.viewList) {
                this.projectService.removeView(view);
                this.hmi.views = this.hmi.views.filter((item)=>{ return item.id !== view.id});
                this.onFiltersLoadViewList();
            }
        });
    }

    onSelectModule() {
        //rbac sdp

        //rbac end 
        const dialogRef = this.dialog.open<ModuleComponent, ModuleComponentData, ModuleComponentResult>(ModuleComponent,{
            disableClose: true
        });

        dialogRef.afterClosed().subscribe({
            next: (res)=>{
                if(!res){    
                    console.error("Error: res undefined");
                    return;
                }
                this.moduleName = ModuleType[res.module];
                if(this.moduleName === "design"){
                    this.moduleName = "design";
                    this.viewModuleType = ViewModuleType.design;
                    this.hmiService.onModuleSelection.next(this.viewModuleType);
                }
                else if(this.moduleName === "controls"){
                    this.moduleName = "controls";
                    this.viewModuleType = ViewModuleType.controls;
                    this.hmiService.onModuleSelection.next(this.viewModuleType);
                }

                /**
                 * Handle further module selection.
                 */
                this.onFiltersLoadViewList();
            },
            error: (err: any)=>{
                this.errorMsg = err;
                console.error(`Error: ${this.errorMsg}`);
            }
        })
    }

    onGetSvgContent(view: View): SafeHtml {
        const THUMB_HEIGHT = 150;
        let svgContent = view.svgcontent || '';

        // If it’s escaped like your example: \" and \n
        svgContent = svgContent
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"');

        // Optional: tweak black background rects
        svgContent = svgContent.replace(
            /<rect[^>]*fill="#000000"[^>]*>/gi,
            tag => tag.replace(/fill="#000000"/gi, 'fill="#ffffff"')
        );

        svgContent = svgContent.replace(/<svg([^>]*?)>/i, (match, attrs) => {
            let newAttrs = attrs;

            const widthMatch = attrs.match(/width="([^"]+)"/i);
            const heightMatch = attrs.match(/height="([^"]+)"/i);

            if (widthMatch && heightMatch) {
            const origW = parseFloat(widthMatch[1]);
            const origH = parseFloat(heightMatch[1]);

                if (origW && origH) {
                    const newH = THUMB_HEIGHT;
                    const newW = (origW / origH) * newH; // keep aspect ratio

                    // overwrite width/height on the root <svg>
                    newAttrs = newAttrs.replace(/width="[^"]*"/i, `width="${newW}"`);
                    newAttrs = newAttrs.replace(/height="[^"]*"/i, `height="${newH}"`);

                    // optional but nice: add viewBox so it stays crisp/responsive
                    if (!/viewBox="/i.test(newAttrs)) {
                    newAttrs += ` viewBox="0 0 ${origW} ${origH}"`;
                    }

                    // optional background
                    if (!/style="/i.test(newAttrs)) {
                    newAttrs += ` style="background:white"`;
                    }
                }
            }

            return `<svg${newAttrs}>`;
        });

        return this.sanitizer.bypassSecurityTrustHtml(svgContent);
    }

    onProjects(){
        this.router.navigate(['/projects']);
    }

    onRenameView(view: View){
        //rbac sdp
        if (!this.canUpdateView()) {
            this.toastr.error('You do not have permission to rename views');
            return;
        }
        //rbac end 
        let existingName: String[] = this.hmi.views.filter((v) => v.id !== view.id).map((v) => v.name);
        let dialogRef = this.dialog.open(EditNameComponent, {
            disableClose: true,
            position: { top: '60px' },
            data: <EditNameData> {
                title: this.translateService.instant('dlg.docname-title'),
                name: view.name,
                exist: existingName
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.name) {
                view.name = result.name;
                this.projectService.setView(view, false);
            }
        });
    }


    // rbac sdp 
    canReadView(): boolean {
        return this.authService.hasPermission('Views.Read');
    }

    canCreateView(): boolean {
        return this.authService.hasPermission('Views.Create');
    }

    canUpdateView(): boolean {
        return this.authService.hasPermission('Views.Update');
    }

    canDeleteView(): boolean {
        return this.authService.hasPermission('Views.Delete');
    }

    canChangeModule(): boolean {
        return this.authService.hasPermission('Module.Read');
    }

    private saveView(view: View, notify = false) {
        this.projectService.setView(view, notify);
        this.onFiltersLoadViewList();
    }
}
