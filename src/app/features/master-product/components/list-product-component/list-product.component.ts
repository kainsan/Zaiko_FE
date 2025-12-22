import {
  Component,
  computed,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Product, MasterProductDTO } from '../../model/product.model';
import { I } from '@angular/cdk/keycodes';

export type ProductType = 'ALL' | 'SET' | 'PRODUCT';
@Component({
  selector: 'list-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-product-component.html',
  styleUrls: ['./list-product-component.scss'],
})
export class ListProductComponent implements OnChanges {
  @Input() products: MasterProductDTO[] = [];
  @Input() totalPages: number = 0;
  @Input() currentPage: number = 0;
  @Output() openDetail: EventEmitter<Product> = new EventEmitter<Product>();
  @Output() selectedTypeChange = new EventEmitter<ProductType>();
  @Output() loadMore = new EventEmitter<void>();

  selectedType = signal<ProductType>('ALL');
  productList = signal<MasterProductDTO[]>([]);

  constructor(private dialog: MatDialog) { }

  filteredProducts = computed(() => {
    let type = this.selectedType();
    let list = this.productList();

    if (type === 'ALL') {
      return list;
    } else if (type === 'SET') {
      return list.filter((p) => p.productEntity.isSet === '1');
    } else {
      return list.filter((p) => p.productEntity.isSet === '0');
    }
  });

  onTypeChange(type: ProductType): void {
    this.selectedType.set(type);
    this.selectedTypeChange.emit(type);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products']) {
      this.productList.set(changes['products'].currentValue);
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
