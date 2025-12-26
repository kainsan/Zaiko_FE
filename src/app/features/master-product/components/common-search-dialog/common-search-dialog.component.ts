import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '../../model/product.model';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-common-search-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, FormsModule],
    templateUrl: './common-search-dialog.component.html',
    styleUrls: ['./common-search-dialog.component.scss']
})
export class CommonSearchDialogComponent implements OnInit {
    items: any[] = [];
    filteredItems: any[] = [];
    searchQuery: string = '';
    searchType: 'product' | 'unit' | 'category' | 'supplier' = 'product';
    title: string = '';
    placeholder: string = '';

    constructor(
        public dialogRef: MatDialogRef<CommonSearchDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit(): void {
        if (this.data) {
            this.searchType = this.data.searchType || 'product';
            this.items = this.data.items || this.data.products || this.data.suppliers || [];
            this.filteredItems = [...this.items];

            if (this.searchType === 'product') {
                this.title = '商品検索';
                this.placeholder = 'コード、名称で検索';
            } else if (this.searchType === 'unit') {
                this.title = '単位検索';
                this.placeholder = '単位コード、名称で検索';
            } else if (this.searchType === 'category') {
                this.title = '商品分類検索';
                this.placeholder = 'コード、名称で検索';
            } else if (this.searchType === 'supplier') {
                this.title = '供給元検索';
                this.placeholder = 'コード、名称で検索';
            }
        }
    }

    search(): void {
        if (!this.searchQuery) {
            this.filteredItems = this.items;
            return;
        }
        const query = this.searchQuery.toLowerCase();

        if (this.searchType === 'product') {
            this.filteredItems = this.items.filter((item: any) =>
                item.productCode?.toLowerCase().includes(query) ||
                item.name1?.toLowerCase().includes(query)
            );
        } else if (this.searchType === 'unit') {
            this.filteredItems = this.items.filter((item: any) =>
                item.unitCode?.toLowerCase().includes(query) ||
                item.unitName?.toLowerCase().includes(query)
            );
        } else if (this.searchType === 'category') {
            this.filteredItems = this.items.filter((item: any) =>
                item.categoryCode?.toLowerCase().includes(query) ||
                item.categoryName?.toLowerCase().includes(query)
            );
        } else if (this.searchType === 'supplier') {
            this.filteredItems = this.items.filter((item: any) =>
                item.supplierCode?.toLowerCase().includes(query) ||
                item.supplierName?.toLowerCase().includes(query)
            );
        }

    }

    selectItem(item: any): void {
        this.dialogRef.close(item);
    }

    close(): void {
        this.dialogRef.close();
    }
}
