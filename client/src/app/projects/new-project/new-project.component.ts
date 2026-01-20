import { Component, inject, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ProjectProperties } from '../projects-list/projects-list.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.css']
})

export class NewProjectComponent implements OnInit {
  formGroup: UntypedFormGroup;

  constructor(
    private translateService: TranslateService,
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<NewProjectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProjectProperties
  ){};

  ngOnInit(): void {
    this.formGroup = this.fb.group({ 
      name: [{ value: this.data.name, disabled: this.data.name }, Validators.required] 
    })

    if(!this.data.name){
      this.formGroup.controls.name.addValidators(this.isValidName())
    }
    this.formGroup.updateValueAndValidity();
  }

  isValidName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (this.data.existingNames?.indexOf(control.value) !== -1) {
            return { msg: this.translateService.instant('msg.project-name-exist') };
        }
        return null;
    };
  }
  onClose(): void { 
    this.dialogRef.close(); 
  }

  onCreate(): void {
    this.data.name = this.formGroup.controls.name.value;
    this.dialogRef.close(this.data);
  }
}
