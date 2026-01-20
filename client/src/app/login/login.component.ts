import { Component, ElementRef, Inject, Optional, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { AuthService } from '../_services/auth.service';
import { ProjectService } from '../_services/project.service';
import { TranslateService } from '@ngx-translate/core';
import { NgxTouchKeyboardDirective } from '../framework/ngx-touch-keyboard/ngx-touch-keyboard.directive';
import { LoginOverlayColorType } from '../_models/hmi';
import { Router } from '@angular/router';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})

export class LoginComponent {

	@ViewChild('touchKeyboard', { static: false }) touchKeyboard: NgxTouchKeyboardDirective;

	loading = false;
	showPassword = false;
	submitLoading = false;
	messageError: string;
	username: UntypedFormControl = new UntypedFormControl();
	password: UntypedFormControl = new UntypedFormControl();
	errorEnabled = false;
	disableCancel = false;

	constructor(
		private authService: AuthService,
		private projectService: ProjectService,
		private translateService: TranslateService,
		private router: Router,    // ✅ inject Router
		@Optional() private dialogRef?: MatDialogRef<LoginComponent>,       // 👈 now optional
		@Optional() @Inject(MAT_DIALOG_DATA) private data?: any               // 👈 now optional
	) {
		const hmi = this.projectService.getHmi();
		this.disableCancel = hmi?.layout?.loginonstart &&
			hmi.layout?.loginoverlaycolor !== LoginOverlayColorType.none;
	}

	onNoClick(): void {
		// ✅ Only close if running inside a dialog
		if (this.dialogRef) {
			this.dialogRef.close();
		}
	}

	onOkClick(): void {
		this.errorEnabled = true;
		this.messageError = '';
		this.signIn();
	}

	isValidate(): boolean {
		return !!(this.username.value && this.password.value);
	}

	signIn(): void {
		this.submitLoading = true;
		this.authService.signIn(this.username.value, this.password.value).subscribe(result => {
			this.submitLoading = false;

			// ✅ Only close if running inside a dialog
			if (this.dialogRef) {
				this.dialogRef.close(true);
			}else{
				this.router.navigate(['projects'])
			}

			this.projectService.reload();
		}, error => {
			this.submitLoading = false;
			this.translateService.get('msg.signin-failed')
				.subscribe((txt: string) => this.messageError = txt);
		});
	}

	keyDownStopPropagation(event): void {
		event.stopPropagation();
	}

	onFocus(event: FocusEvent): void {
		const hmi = this.projectService.getHmi();
		if (hmi?.layout?.inputdialog?.includes('keyboard')) {
			if (hmi.layout.inputdialog === 'keyboardFullScreen') {
				this.touchKeyboard.ngxTouchKeyboardFullScreen = true;
			}
			this.touchKeyboard.closePanel();
			const targetElement = event.target as HTMLInputElement;
			const elementRef = new ElementRef<HTMLInputElement>(targetElement);
			this.touchKeyboard.openPanel(elementRef);
		}
	}
}



















