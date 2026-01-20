import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef, MAT_LEGACY_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { GaugesManager } from '../../gauges/gauges.component';
import { AuthService, UserProfile } from '../../_services/auth.service';
import { GaugesUtils } from '../../gauges/gauges-utils';

import { ISvgElement } from '../../_models/hmi';

export interface AddCustomAttrData {
  widget: any; // Selected widget instance
  svgElements?: ISvgElement[];
  
}

@Component({
  selector: 'app-add-custom-attr-dialog',
  templateUrl: './add-custom-attr-dialog.component.html',
  styleUrls: ['./add-custom-attr-dialog.component.css']
})

export class AddCustomAttrDialogComponent implements OnInit {

  /** New attributes being added */
  attributes = [
    { name: '', type: '', value: '', addedBy: '', group: '' }
  ];

  /** Attributes already existing on widget */
  existingAttributes: { name: string; type: string; value: any; isEditing?: boolean; oldValue?: any; oldName?: string; }[] = [];

  constructor(
    public dialogRef: MatLegacyDialogRef<AddCustomAttrDialogComponent>,
    @Inject(MAT_LEGACY_DIALOG_DATA) public data: AddCustomAttrData,
    private authService: AuthService
  ) {}

  // ==============================
  // 🔹 Load Selected Widget Attributes into Table
  // ==============================
  ngOnInit(): void {
    if (this.data?.widget?.customAttributes) {
      const existing = this.data.widget.customAttributes;

      this.existingAttributes = Object.keys(existing).map(key => {
        console.log("VIEW DATA:", existing);

        return {
          name: key,
          type: existing[key].type || '',   // ✅ UNIT shown correctly
          value: existing[key].value ?? existing[key], // ✅ SUPPORTS old saved data (string only)
          isEditing: false
        };
      });
    }
  }

  // ==============================
  // 🔹 Add new attribute row dynamically
  // ==============================
  addAttribute(): void {
    const currentUser: UserProfile = this.authService.getUserProfile();
    this.attributes.push({
      name: '',
      type: '',
      value: '',
      addedBy: currentUser?.username || '',
      group: currentUser?.groups?.toString() || ''
    });
  }

  // ==============================
  // 🔹 Remove an unsaved attribute row
  // ==============================
  removeAttribute(index: number): void {
    if (this.attributes.length > 1) {
      this.attributes.splice(index, 1);
    }
  }

  // ==============================
  // 🔹 Cancel dialog
  // ==============================
  onCancel(): void {
    this.dialogRef.close();
  }

  // ==============================
  // 🔹 Save (Add New Attributes)
  // ==============================
  onSave(): void {
    const filteredAttributes = this.attributes
      .filter(attr => attr.name.trim() !== '' && attr.value !== '');

    const processedAttributes = filteredAttributes.map(attr => {
      console.log("saving :", "name:", attr.name, "unit:", attr.type, "value:", attr.value);

      return {
        name: attr.name,
        type: attr.type,
        value: attr.value,
        addedBy: attr.addedBy,
        group: attr.group
      };
    });

    if (processedAttributes.length > 0) {

      // ✅ Ensure widget has a customAttributes object
      if (!this.data.widget.customAttributes || typeof this.data.widget.customAttributes !== 'object') {
        this.data.widget.customAttributes = {};
      }

      // ✅ Save to widget (IMPORTANT CHANGE)
      processedAttributes.forEach(attr => {
        this.data.widget.customAttributes[attr.name] = {
          type: attr.type,   // ✅ store UNIT
          value: attr.value  // ✅ store VALUE
        };
      });

      // ✅ Sync attributes into SVG Element object
      if (this.data.svgElements && Array.isArray(this.data.svgElements)) {
        const svgEl = this.data.svgElements.find(el => el.id === this.data.widget.id);
        if (svgEl) {
          svgEl.customAttributes = {
            ...svgEl.customAttributes,
            ...this.data.widget.customAttributes
          };

          console.log("✅ Custom Attributes saved for SVG element:", svgEl.id);
          console.log("Widget Custom Attributes:", this.data.widget.customAttributes);
        }
      }

      // ✅ Update global widget registry for BOM
      const availableTags = GaugesManager.Gauges.map(g => g.TypeTag);

      GaugesManager.mergeCustomAttributesForWidget(
        this.data.widget.id,
        this.data.widget.type || this.data.widget.TypeTag,
        processedAttributes,
        availableTags
      );

      console.log("Registry after merge:", GaugesUtils.listAllWidgets());

      this.dialogRef.close(processedAttributes);
    } else {
      this.dialogRef.close(null);
    }
  }

  // ==============================
  // 🔹 Edit / Save Existing Attributes
  // ==============================

  startEdit(index: number): void {
    this.existingAttributes[index].isEditing = true;
    this.existingAttributes[index].oldValue = this.existingAttributes[index].value;
    this.existingAttributes[index].oldName = this.existingAttributes[index].name;  // ✅ store original name
  }

  saveEdit(index: number): void {
    const attr = this.existingAttributes[index];
    attr.isEditing = false;

    const oldName = attr.oldName;  // ⬅ we will store old name
    const newName = attr.name;

    // ✅ rename key if name changed
    if (oldName && oldName !== newName) {
      delete this.data.widget.customAttributes[oldName];
    }

    // ✅ update stored attribute with both unit and value
    this.data.widget.customAttributes[newName] = {
      type: attr.type,
      value: attr.value
    };

    const availableTags = GaugesManager.Gauges.map(g => g.TypeTag);

    GaugesManager.setCustomAttributesForWidget(
      this.data.widget.id,
      this.data.widget.type || this.data.widget.TypeTag,
      this.data.widget.customAttributes,
      availableTags
    );
  }

  cancelEdit(index: number): void {
    const attr = this.existingAttributes[index];
    attr.value = attr.oldValue;
    attr.isEditing = false;
  }

  // ==============================
  // 🔹 Delete existing attribute
  // ==============================
  deleteAttribute(attrName: string): void {
    if (this.data.widget.customAttributes[attrName]) {
      delete this.data.widget.customAttributes[attrName];
    }

    this.existingAttributes = this.existingAttributes.filter(a => a.name !== attrName);

    const updated = { ...this.data.widget.customAttributes };
    const availableTags = GaugesManager.Gauges.map(g => g.TypeTag);

    GaugesManager.setCustomAttributesForWidget(
      this.data.widget.id,
      this.data.widget.type || this.data.widget.TypeTag,
      updated,
      availableTags
    );
  }
}
