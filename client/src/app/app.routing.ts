import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './auth.guard';

import { HomeComponent } from './home/home.component';
// custom page 
import { LandingComponent } from './landingpage/landing.component';


import { EditorComponent } from './editor/editor.component';
import { DeviceComponent } from './device/device.component';
import { LabComponent } from './lab/lab.component';
import { UsersComponent } from './users/users.component';
import { ViewComponent } from './view/view.component';
import { AlarmViewComponent } from './alarms/alarm-view/alarm-view.component';
import { LogsViewComponent } from './logs-view/logs-view.component';
import { AlarmListComponent } from './alarms/alarm-list/alarm-list.component';
import { NotificationListComponent } from './notifications/notification-list/notification-list.component';
import { ScriptListComponent } from './scripts/script-list/script-list.component';
import { DEVICE_READONLY } from './_models/hmi';
import { ReportListComponent } from './reports/report-list/report-list.component';
import { UsersRolesComponent } from './users/users-roles/users-roles.component';
import { MapsLocationListComponent } from './maps/maps-location-list/maps-location-list.component';
import { LanguageTextListComponent } from './language/language-text-list/language-text-list.component';
import { ProjectsListComponent } from './projects/projects-list/projects-list.component';
import { ViewListComponent } from './view/view-list/view-list.component';
// custom
//sdp rbac start
import {UserCreateComponent } from './users/user-create/user-create.component';
//sdp rbac end
const appRoutes: Routes = [ 
    // custom page 
    { path: '', component: LandingComponent},
    //sdp rbac start
    { path: 'users/create', component: UserCreateComponent },//, canActivate: [AuthGuard]
    //sdp rbac end
    { path: 'projects', component: ProjectsListComponent, canActivate: [AuthGuard] },
    { path: 'viewList', component: ViewListComponent, canActivate: [AuthGuard] },
    { path: 'home', component: HomeComponent},//, canActivate: [AuthGuard] },
    { path: 'home/:viewName', component: HomeComponent},//, canActivate: [AuthGuard] },
    { path: 'editor', component: EditorComponent, canActivate: [AuthGuard]},
    { path: 'lab', component: LabComponent, canActivate: [AuthGuard] },
    { path: 'device', component: DeviceComponent, canActivate: [AuthGuard] },
    { path: DEVICE_READONLY, component: DeviceComponent, canActivate: [AuthGuard] },
    { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
    { path: 'userRoles', component: UsersRolesComponent, canActivate: [AuthGuard] },
    { path: 'alarms', component: AlarmViewComponent, canActivate: [AuthGuard] },
    { path: 'messages', component: AlarmListComponent, canActivate: [AuthGuard] },
    { path: 'notifications', component: NotificationListComponent, canActivate: [AuthGuard] },
    { path: 'scripts', component: ScriptListComponent, canActivate: [AuthGuard] },
    { path: 'reports', component: ReportListComponent, canActivate: [AuthGuard] },
    { path: 'language', component: LanguageTextListComponent, canActivate: [AuthGuard] },
    { path: 'logs', component: LogsViewComponent, canActivate: [AuthGuard] },
    { path: 'events', component: LogsViewComponent, canActivate: [AuthGuard] },
    { path: 'view', component: ViewComponent },
    { path: 'mapsLocations', component: MapsLocationListComponent, canActivate: [AuthGuard] },


    


    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes, {});
