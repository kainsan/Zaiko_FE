// src/app/admin/master-product/components/search-product.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonSearchDialogComponent } from '../common-search-dialog/common-search-dialog.component';
import { Product } from '../../model/product.model';
import { ProductService } from '../../services/product.service';
import { ProductType } from '../list-product-component/list-product.component';
import { ProductSearchParams } from '../../request/ProductSearchRequest';

@Component({
  selector: 'search-product', // <--- Đây là tên thẻ bạn sẽ dùng
  standalone: true, // <--- QUAN TRỌNG: Để true để dùng như React
  imports: [CommonModule, MatSelectModule, FormsModule, MatDialogModule], // Import các module cần thiết riêng cho component này
  templateUrl: './search-product-component.html',
  styleUrls: ['./search-product.component.scss'],
})
export class SearchProductComponent implements OnChanges {
  @Input() products: Product[] = [];
  repositoryId: number = 0;
  locationId: number = 0;
  repositories: number[] = [];
  locations: number[] = [];

  // Search fields
  productCodeFrom: string = '';
  productCodeTo: string = '';
  name1: string = '';
  upcCd1: string = '';
  upcCd2: string = '';
  categoryCode1: string = '';
  categoryCode2: string = '';
  categoryCode3: string = '';
  categoryCode4: string = '';
  categoryCode5: string = '';
  isSet: string = '';
  @Input() selectedType!: ProductType;
  @Output() searchProducts = new EventEmitter<Product[]>();
  @Output() onSearchParams = new EventEmitter<ProductSearchParams>();

  constructor(private dialog: MatDialog, private productService: ProductService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedType'] && !changes['selectedType'].firstChange) {
      this.searchProduct(); // auto search khi radio đổi
    }
    if (changes['products'] && this.products) {
      this.extractDistinctValues();
    }
  }

  private extractDistinctValues(): void {
    const repoSet = new Set<number>();
    const locSet = new Set<number>();

    this.products.forEach(p => {
      if (p.repositoryId != null) repoSet.add(p.repositoryId);
      if (p.locationId != null) locSet.add(p.locationId);
    });

    this.repositories = Array.from(repoSet).sort((a, b) => a - b);
    this.locations = Array.from(locSet).sort((a, b) => a - b);
  }
  searchProduct(): void {
    const searchParams: ProductSearchParams = {
      productCodeFrom: this.productCodeFrom,
      productCodeTo: this.productCodeTo,
      name1: this.name1,
      upcCd1: this.upcCd1,
      upcCd2: this.upcCd2,
      categoryCode1: this.categoryCode1,
      categoryCode2: this.categoryCode2,
      categoryCode3: this.categoryCode3,
      categoryCode4: this.categoryCode4,
      categoryCode5: this.categoryCode5,
      repositoryId: this.repositoryId !== 0 ? this.repositoryId : undefined,
      locationId: this.locationId !== 0 ? this.locationId : undefined,
      isSet: this.selectedType === 'ALL' ? undefined : (this.selectedType === 'SET' ? '1' : '0')
    };
    this.onSearchParams.emit(searchParams);
    this.productService.searchProducts(searchParams).subscribe((products) => {
      this.searchProducts.emit(products);
    });
  }

  openCodeProduct1Search(inputCodeProduct1: string): void {
    this.dialog.open(CommonSearchDialogComponent, {
      width: '800px',
      height: '600px',
      panelClass: 'custom-dialog-container',
      data: { productCode: inputCodeProduct1 },
    });
  }

  openCodeProduct2Search(inputCodeProduct2: string): void {
    this.dialog.open(CommonSearchDialogComponent, {
      width: '800px',
      height: '600px',
      panelClass: 'custom-dialog-container',
      data: { productCode: inputCodeProduct2 },
    });
  }
}
