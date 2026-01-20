import { Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { WidgetsCatalogService } from '../../_services/widgets-catalog.service';
import { WidgetsCatalogGroup } from '../../_models/widgets-catalog';

@Component({
    selector: 'app-kiosk-widgets',
    templateUrl: './kiosk-widgets.component.html',
    styleUrls: ['./kiosk-widgets.component.scss']
})
export class KioskWidgetsComponent implements OnInit {

    // ✅ ONLY NEW CATALOG STATE
    catalogGroups: WidgetsCatalogGroup[] = [];
    catalogLoading = false;
    changed = false;

    constructor(
        public dialogRef: MatDialogRef<KioskWidgetsComponent>,
        private widgetsCatalog: WidgetsCatalogService
    ) {}

    ngOnInit(): void {
        this.catalogLoading = true;

        this.widgetsCatalog.getCatalog().subscribe({
            next: res => {
                console.log('✅ CUSTOM WIDGETS CATALOG:', res);
                this.catalogGroups = res.groups || [];
                this.catalogLoading = false;
            },
            error: err => {
                console.error('❌ Failed to load widgets catalog', err);
                this.catalogLoading = false;
            }
        });
    }

    onNoClick(): void {
        this.dialogRef.close(this.changed);
    }

    onOkClick(): void {
        this.dialogRef.close(this.changed);
    }
}
