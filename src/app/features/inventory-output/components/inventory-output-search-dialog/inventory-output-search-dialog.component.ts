import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../master-product/services/product.service';
import { MasterProductDTO } from '../../../master-product/model/product.model';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-inventory-output-search-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, FormsModule],
    templateUrl: './inventory-output-search-dialog.component.html',
    styleUrls: ['./inventory-output-search-dialog.component.scss']
})
export class InventoryOutputSearchDialogComponent implements OnInit {
    items: any[] = [];
    filteredItems: any[] = [];
    searchQuery: string = '';
    searchType: 'product' | 'supplier' | 'delivery' | 'customer' | 'owner' = 'product';
    title: string = '';
    placeholder: string = '';

    constructor(
        public dialogRef: MatDialogRef<InventoryOutputSearchDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private productService: ProductService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        if (this.data) {
            this.searchType = this.data.searchType || 'product';
            this.items = this.data.items || [];
            this.filteredItems = [...this.items];

            switch (this.searchType) {
                case 'product':
                    this.title = '商品検索';
                    this.placeholder = 'コード、名称で検索';
                    break;
                case 'supplier':
                    this.title = '供給元検索';
                    this.placeholder = 'コード、名称で検索';
                    break;
                case 'delivery':
                    this.title = '納品先検索';
                    this.placeholder = 'コード、名称で検索';
                    break;
                case 'customer':
                    this.title = '得意先検索';
                    this.placeholder = 'コード、名称で検索';
                    break;
                case 'owner':
                    this.title = '所有者検索';
                    this.placeholder = 'コード、名称で検索';
                    break;
            }
        }

    }

    search(): void {
        if (!this.searchQuery) {
            this.filteredItems = this.items;
            return;
        }
        const query = this.searchQuery.toLowerCase();

        switch (this.searchType) {
            case 'product':
                // Call API to search products by name OR code
                const searchByName = this.productService.searchProducts({ name1: query });
                // Search by Code (Starts With logic: From query to query + high char)
                const searchByCode = this.productService.searchProducts({
                    productCodeFrom: query,
                    productCodeTo: query + '\uffff'
                });

                forkJoin([searchByName, searchByCode]).subscribe({
                    next: ([nameRes, codeRes]) => {
                        // Merge results and remove duplicates
                        const allContent = [...nameRes.content, ...codeRes.content];
                        const uniqueProducts = new Map();

                        allContent.forEach(dto => {
                            if (dto.productEntity?.productId && !uniqueProducts.has(dto.productEntity.productId)) {
                                uniqueProducts.set(dto.productEntity.productId, dto);
                            }
                        });

                        this.filteredItems = Array.from(uniqueProducts.values()).map((dto: MasterProductDTO) => {
                            const product = { ...dto.productEntity } as any;
                            product.packCsUnitName = dto.packCsUnitName?.unitName || '';
                            product.packBlUnitName = dto.packBlUnitName?.unitName || '';
                            product.pieceUnitName = dto.pieceUnitName?.unitName || '';
                            product.packCsAmount = dto.productEntity.packCsAmount || 0;
                            product.packBlAmount = dto.productEntity.packBlAmount || 0;
                            product.totalPlanQuantity = dto.totalPlanQuantity;
                            return product;
                        });
                        this.cdr.detectChanges();
                    },
                    error: (err) => {
                        console.error('Error searching products:', err);
                    }
                });
                break;
            case 'supplier':
                this.filteredItems = this.items.filter((item: any) =>
                    item.supplierCode?.toLowerCase().includes(query) ||
                    item.supplierName?.toLowerCase().includes(query)
                );
                break;
            case 'delivery':
                this.filteredItems = this.items.filter((item: any) =>
                    item.destinationCode?.toLowerCase().includes(query) ||
                    item.departmentName?.toLowerCase().includes(query)
                );
                break;
            case 'customer':
                this.filteredItems = this.items.filter((item: any) =>
                    item.supplierCode?.toLowerCase().includes(query) ||
                    item.supplierName?.toLowerCase().includes(query)
                );
                break;
            case 'owner':
                this.filteredItems = this.items.filter((item: any) =>
                    item.customerCode?.toLowerCase().includes(query) ||
                    item.customerName?.toLowerCase().includes(query)
                );
                break;
        }
    }

    selectItem(item: any): void {
        this.dialogRef.close(item);
    }

    close(): void {
        this.dialogRef.close();
    }
}
