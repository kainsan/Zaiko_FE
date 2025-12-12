import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetailModalComponent } from '../product-detail-modal/product-detail-modal.component';

export interface Product {
  no: number;
  code: string;
  name: string;
  upc1: string;
  upc2: string;
  spec: string;
  info1: string;
  info2: string;
  info3: string;
}

@Component({
  selector: 'list-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-product-component.html',
  styleUrls: ['./list-product-component.scss']
})
export class ListProductComponent {
  constructor(private dialog: MatDialog) { }

  openProductDetail(product: Product): void {
    const dialogRef = this.dialog.open(ProductDetailModalComponent, {
      width: '720px',
      maxHeight: '760px',
      data: product,
      panelClass: 'custom-dialog-container' // Optional: for global styles if needed
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      // Handle result (save/delete) if needed
    });
  }
  // products: Product[] = [];
  products = ([
    { no: 1, code: "JS41049", name: "セット", upc1: "-", upc2: "-", spec: "-", info1: "-", info2: "-", info3: "-" },
    { no: 2, code: "JS41059", name: "", upc1: "-", upc2: "-", spec: "-", info1: "-", info2: "-", info3: "-" },
    { no: 3, code: "JS41049", name: "", upc1: "-", upc2: "-", spec: "-", info1: "-", info2: "-", info3: "-" },
    { no: 4, code: "JS41059", name: "", upc1: "-", upc2: "-", spec: "-", info1: "-", info2: "-", info3: "-" },
    { no: 5, code: "JS41049", name: "セット", upc1: "-", upc2: "-", spec: "-", info1: "-", info2: "-", info3: "-" },
    { no: 6, code: "JS41059", name: "", upc1: "-", upc2: "-", spec: "-", info1: "-", info2: "-", info3: "-" },
    { no: 7, code: "JS41049", name: "セット", upc1: "-", upc2: "-", spec: "-", info1: "-", info2: "-", info3: "-" },
    { no: 8, code: "JS41059", name: "", upc1: "-", upc2: "-", spec: "-", info1: "-", info2: "-", info3: "-" },
    { no: 9, code: "JS41049", name: "", upc1: "-", upc2: "-", spec: "-", info1: "-", info2: "-", info3: "-" },
    { no: 10, code: "JS41059", name: "セット", upc1: "-", upc2: "-", spec: "-", info1: "-", info2: "-", info3: "-" },
    { no: 11, code: "JS41159", name: "", upc1: "-", upc2: "-", spec: "-", info1: "-", info2: "-", info3: "-" },
    { no: 12, code: "JS41259", name: "セット", upc1: "-", upc2: "-", spec: "-", info1: "-", info2: "-", info3: "-" },
    { no: 13, code: "JS41359", name: "", upc1: "-", upc2: "-", spec: "-", info1: "-", info2: "-", info3: "-" },
    { no: 14, code: "JS41459", name: "", upc1: "-", upc2: "-", spec: "-", info1: "-", info2: "-", info3: "-" },
    { no: 15, code: "JS41559", name: "", upc1: "-", upc2: "-", spec: "-", info1: "-", info2: "-", info3: "-" },
    { no: 16, code: "JS41659", name: "", upc1: "-", upc2: "-", spec: "-", info1: "-", info2: "-", info3: "-" }
  ]);
}
