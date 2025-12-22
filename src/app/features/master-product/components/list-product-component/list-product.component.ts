import {
  Component,
  computed,
  EventEmitter,
  input,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetailModalComponent } from '../product-detail-modal/product-detail-modal.component';
import { ProductService } from '../../services/product.service';
import { Product } from '../../model/product.model';

export type ProductType = 'ALL' | 'SET' | 'PRODUCT';
@Component({
  selector: 'list-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-product-component.html',
  styleUrls: ['./list-product-component.scss'],
})
export class ListProductComponent implements OnChanges {
  @Input() products: Product[] = [];
  @Output() openDetail: EventEmitter<Product> = new EventEmitter<Product>();
  @Output() selectedTypeChange = new EventEmitter<ProductType>();
  @Output() loadMore = new EventEmitter<void>();
  currentPage: number = 0;
  pageSize: number = 50;
  selectedType = signal<ProductType>('ALL');
  productList = signal<Product[]>([]);

  constructor(private dialog: MatDialog, private productService: ProductService) { }


  filteredProducts = computed(() => {
    let type = this.selectedType();
    let list = this.productList();

    if (type === 'ALL') {
      return list;
    } else if (type === 'SET') {
      return list.filter((p) => p.isSet === '1');
    } else {
      return list.filter((p) => p.isSet === '0');
    }
  });

  onTypeChange(type: ProductType): void {
    this.selectedType.set(type);
    this.selectedTypeChange.emit(type);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products']) {
      if (changes['searchProducts']) {
        this.productList.set(changes['searchProducts'].currentValue);
      } else {
        this.productList.set(changes['products'].currentValue);
      }
    }
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
