import { Component, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatLegacyDialogRef, MAT_LEGACY_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { ISvgElement } from '../../_models/hmi';
import * as XLSX from 'xlsx'; // ✅ Import XLSX for Excel export


export interface BOMItem {
  slno: number;
  item: string;
  quantity: number;
  remarks: string;
  id: string;
  customAttributes?: { [key: string]: any };
}

@Component({
  selector: 'app-bom-modal',
  templateUrl: './bom-selector.component.html',
  styleUrls: ['./bom-selector.component.scss']
})
export class BomModalComponent {
  displayedColumns: string[] = ['slno', 'item', 'attributes', 'quantity', 'remarks', 'id'];
  bomData = new MatTableDataSource<BOMItem>([]);

  constructor(
    public dialogRef: MatLegacyDialogRef<BomModalComponent>,
    @Inject(MAT_LEGACY_DIALOG_DATA)
    public data: { svgElements: ISvgElement[]; viewName?: string } // ✅ fixed
  ) {
    console.log('BOM Modal data received:', data);

    this.bomData.data = (data?.svgElements || []).map((el: any, index) => ({
      slno: el.slno || index + 1,
      item: el.name || '-',
      quantity: el.quantity ?? 1,
      remarks: el.remarks ?? '',
      id: el.id || '-',
      customAttributes: el.customAttributes || {}
    }));
  }

  // confirmDelete(index: number) {
  //   const item = this.bomData.data[index];
  //   const confirmed = window.confirm(`⚠️ Are you sure you want to delete "${item.item}" (ID: ${item.id})?`);

  //   if (confirmed) {
  //     this.bomData.data.splice(index, 1);
  //     this.bomData.data = [...this.bomData.data];
  //     console.log(`🗑️ Deleted entry: ${item.id}`);
  //   }
  // }

  save() {
    const bomData = this.bomData.data;
    console.log('💾 BOM data saved in modal:', bomData);
    this.dialogRef.close(bomData); // ✅ send data back to parent
  }

  // 🔽 Unified Download Function
  download(format: 'json' | 'xlsx' | 'csv') {
    const data = this.bomData.data;

    if (format === 'json') {
      const bomJson = JSON.stringify(data, null, 2);
      const blob = new Blob([bomJson], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'BOM_Data.json';
      link.click();
      URL.revokeObjectURL(link.href);
      console.log('💾 Downloaded JSON');
    }

    else if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'BOM Data');
      XLSX.writeFile(workbook, 'BOM_Data.xlsx');
      console.log('💾 Downloaded Excel');
    }

    else if (format === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'BOM_Data.csv';
      link.click();
      URL.revokeObjectURL(link.href);
      console.log('💾 Downloaded CSV');
    }
  }
}

