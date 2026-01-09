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
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ProductService } from '../../services/product.service';

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
  @Output() openDetail: EventEmitter<MasterProductDTO> = new EventEmitter<MasterProductDTO>();
  @Output() selectedTypeChange = new EventEmitter<ProductType>();
  @Output() loadMore = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  selectedType = signal<ProductType>('ALL');
  productList = signal<MasterProductDTO[]>([]);

  constructor(
    private dialog: MatDialog,
    private productService: ProductService,) { }

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

  openProductDetail(product: MasterProductDTO): void {
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

  getDateMngKanji(product: any): string {
    if (product.isDateTimeMng !== '1') return '';
    switch (product.dateTimeMngType) {
      case '0': return '入';
      case '1': return '製';
      case '2': return '賞';
      default: return '';
    }
  }


  onDelete(productId: number | any): void {
    if (!productId) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: { message: '削除します。よろしいでしょうか。' },
      panelClass: 'custom-confirm-dialog'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.productService.deleteProduct(productId).subscribe({
          next: () => {
            console.log('Product deleted successfully');
            console.log(result)
            this.saved.emit();
            this.close.emit();
          },
          error: (err) => {
            console.error('Error deleting product:', err);
            // TODO: Show error message to user
          }
        });
      }
    });
  }
}
