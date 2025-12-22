import { Component, EventEmitter, Input, OnChanges, OnInit, Output, signal, SimpleChanges, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonSearchDialogComponent } from '../common-search-dialog/common-search-dialog.component';
import { Product, MasterProductDTO } from '../../model/product.model';
import { ProductService } from '../../services/product.service';
import { ProductType } from '../list-product-component/list-product.component';
import { ProductSearchParams } from '../../request/ProductSearchRequest';
import { PageResponse } from '../../response/PageResponse';

@Component({
  selector: 'search-product',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule, MatDialogModule],
  templateUrl: './search-product-component.html',
  styleUrls: ['./search-product.component.scss'],
})
export class SearchProductComponent implements OnChanges, OnInit {
  @Input() products: MasterProductDTO[] = [];
  allProducts: Product[] = [];
  repositoryId: number = 0;
  locationId: number = 0;
  repositories: number[] = [];
  locations: number[] = [];

  // Search fields
  productCodeFrom = signal('');
  productCodeTo = signal('');
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
  @Output() searchProducts = new EventEmitter<PageResponse<MasterProductDTO>>();
  @Output() onSearchParams = new EventEmitter<ProductSearchParams>();

  constructor(private dialog: MatDialog, private productService: ProductService) { }

  ngOnInit(): void {
    this.productService.getProducts(0, 100).subscribe(response => {
      this.allProducts = response.content.map(item => item.productEntity);
    });
  }

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
      const entity = p.productEntity;
      if (entity.repositoryId != null) repoSet.add(entity.repositoryId);
      if (entity.locationId != null) locSet.add(entity.locationId);
    });

    this.repositories = Array.from(repoSet).sort((a, b) => a - b);
    this.locations = Array.from(locSet).sort((a, b) => a - b);
  }

  searchProduct(): void {
    const searchParams: ProductSearchParams = {
      productCodeFrom: this.productCodeFrom(),
      productCodeTo: this.productCodeTo(),
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
    this.productService.searchProducts(searchParams).subscribe((response) => {
      this.searchProducts.emit(response);
    });
  }

  openProductCodeSearch(type: 'from' | 'to'): void {
    const dialogRef = this.dialog.open(CommonSearchDialogComponent, {
      width: '800px',
      height: '600px',
      panelClass: 'custom-dialog-container',
      data: { products: this.allProducts },
    });

    dialogRef.afterClosed().subscribe((product: Product | null) => {
      if (!product) return;

      if (type === 'from') {
        this.productCodeFrom.set(product.productCode || '');
      } else {
        this.productCodeTo.set(product.productCode || '');
      }
    });
  }
}
