    import { Component, Input } from '@angular/core';

    @Component({
    selector: 'flex-io',
    templateUrl: './flex-io.component.html',
    styleUrls: ['./flex-io.component.scss']  // optional, if you want styles
    })
    export class FlexIoComponent {
    @Input() property: any;
    @Input() data: any;

    getIo() {
        return this.property.io || [];
    }

    onAddIo() {
        if (!this.property.io) {
        this.property.io = [];
        }
        this.property.io.push({ name: '', type: 'input', default: '' });
    }
    }
