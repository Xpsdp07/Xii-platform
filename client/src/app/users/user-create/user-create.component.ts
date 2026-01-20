import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../_services/user.service';
import { ToastrService } from 'ngx-toastr';
import { SelOptionsComponent } from '../../gui-helpers/sel-options/sel-options.component';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss']
})
export class UserCreateComponent implements OnInit {

  username = '';
  fullName = '';
  password = '';
  showPassword = false;

  // Data loaded from API
  groups: any[] = [];
  selectedGroups: any[] = [];
  modules: any[] = [];

  // Store permissions state: { [moduleId]: { C: boolean, R: boolean, ... } }
  permissions: { [key: string]: { [key: string]: boolean } } = {};

  @ViewChild(SelOptionsComponent) seloptions: SelOptionsComponent;


  constructor(
    private userService: UserService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadRbacData();
  }

  loadRbacData() {
    // 1. Load Modules
    this.userService.getModules().subscribe(modules => {
      this.modules = modules;
      // Initialize permissions object based on loaded modules
      this.modules.forEach(m => {
        this.permissions[m.id] = {};
        m.available.forEach(p => {
          this.permissions[m.id][p] = false;
        });
      });
    }, err => console.error("Failed to load modules", err));

    // 2. Load Groups
    this.userService.getGroups().subscribe(groups => {
      // Map to format expected by sel-options {id, label}
      this.groups = groups.map(g => ({ id: g.id, label: g.name }));
    }, err => console.error("Failed to load groups", err));
  }

  // ===========================
  // GROUP SELECTION LOGIC
  // ===========================

  applyGroupPermissions() {
    // Use setTimeout to allow the SelectionList to update its model before we read it
    setTimeout(() => {
      const selected = this.seloptions ? this.seloptions.selected : [];
      this.selectedGroups = selected; // Sync local var

      // Reset permissions to ensure we only show currently selected group permissions
      this.resetPermissions();

      if (selected.length === 0) return;

      const groupIds = selected.map(g => g.id);
      this.userService.resolveGroupPermissions(groupIds).subscribe(perms => {
        // perms is { [moduleId]: { 'Create': true... } }
        Object.keys(perms).forEach(modId => {
          const modPerms = perms[modId];
          if (this.permissions[modId]) {
            Object.keys(modPerms).forEach(p => {
              this.permissions[modId][p] = true;
            });
          }
        });
      }, err => console.error("Failed to resolve group permissions", err));
    }, 50);
  }

  resetPermissions() {
    Object.keys(this.permissions).forEach(mId => {
      Object.keys(this.permissions[mId]).forEach(op => {
        this.permissions[mId][op] = false;
      });
    });
  }

  // ===========================
  // UI HELPERS
  // ===========================

  togglePermission(moduleId: string, op: string) {
    if (this.permissions[moduleId]) {
      this.permissions[moduleId][op] = !this.permissions[moduleId][op];
    }
  }

  getPermissionLabel(op: string): string {
    const map = { 'C': 'Create', 'R': 'Read', 'U': 'Update', 'D': 'Delete' };
    return map[op] || op;
  }

  // ===========================
  // CREATE USER
  // ===========================

  createUser() {
    // Basic validation
    if (!this.username) {
      this.toastr.warning('Username is required');
      return;
    }

    const payload: any = {
      username: this.username,
      fullName: this.fullName,
      password: this.password,
      groups: this.selectedGroups.map(g => g.id),
      permissions: this.permissions
    };

    console.log("PAYLOAD TO SAVE:", payload);

    this.userService.setUser(payload).subscribe(() => {
      this.toastr.success('User created successfully!');
      // Optionally reset form or navigate back
      this.resetForm();
    }, err => {
      console.error("Failed to create user", err);
      // Toast error is already handled in UserService usually, but we can add more context
    });
  }

  resetForm() {
    this.username = '';
    this.fullName = '';
    this.password = '';
    this.selectedGroups = [];
    this.resetPermissions();
    if (this.seloptions) {
      this.seloptions.selected = [];
    }
  }

}
