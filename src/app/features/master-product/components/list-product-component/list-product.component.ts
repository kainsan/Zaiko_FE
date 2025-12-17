import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetailModalComponent } from '../product-detail-modal/product-detail-modal.component';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'list-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-product-component.html',
  styleUrls: ['./list-product-component.scss']
})
export class ListProductComponent implements OnChanges {
  @Input() products: Product[] = [];
  @Output() openDetail: EventEmitter<Product> = new EventEmitter<Product>();
  currentPage: number = 0;
  pageSize: number = 20;
  constructor(
    private dialog: MatDialog,
    private productService: ProductService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products']) {
      this.products = changes['products'].currentValue;
    }
  }

  loadMore(): void {
    this.currentPage++;
    console.log(this.currentPage);
    this.productService.loadMoreProducts(this.currentPage, this.pageSize).subscribe(newProducts => {
      this.products = [...this.products, ...newProducts];
    });
  }

  openProductDetail(product: Product): void {
    this.openDetail.emit(product);

  }

  getInputPackagingString(product: any): string {
    const cs = product.isPackCsInput === '1' ? 'Y' : 'N';
    const bl = product.isPackBlInput === '1' ? 'Y' : 'N';
    const pc = product.isPieceInput === '1' ? 'Y' : 'N';
    return `${cs} ${bl} ${pc}`;
  }
  getOutputPackagingString(product: any): string {
    const cs = product.isPackCsOutput === '1' ? 'Y' : 'N';
    const bl = product.isPackBlOutput === '1' ? 'Y' : 'N';
    const pc = product.isPieceOutput === '1' ? 'Y' : 'N';
    return `${cs} ${bl} ${pc}`;
  }
}
