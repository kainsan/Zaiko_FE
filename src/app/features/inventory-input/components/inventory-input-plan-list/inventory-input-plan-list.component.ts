import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { InventorySearchDialogComponent } from '../inventory-search-dialog/inventory-search-dialog.component';
import { Product } from '../../../master-product/model/product.model';
import { MatDialog } from '@angular/material/dialog';
import { ProductService } from '../../../master-product/services/product.service';
import { RepositoriesService } from '../../../master-product/services/repostories.service';
import { Location, Repository } from '../../../master-product/model/product.model';
import { InventoryInputService } from '../../services/inventory-input.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inventory-input-plan-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
  ],
  templateUrl: './inventory-input-plan-list.component.html',
  styleUrls: ['./inventory-input-plan-list.component.scss'],
})
export class InventoryInputPlanListComponent implements OnInit {
  @Input() detailsFormArray!: FormArray;
  @Output() addItem = new EventEmitter<void>();
  @Output() removeItem = new EventEmitter<number>();

  products = signal<Product[]>([]);
  repositories = signal<Repository[]>([]);
  locationsMap: { [index: number]: Location[] } = {};
  private subscriptions: Subscription = new Subscription();
  // Biến này dùng để lưu lại repositoryId của lần trước, giúp so sánh xem có thay đổi không
  private previousRepositoryIds: (number | undefined)[] = [];
  test = '1';
  public statusDateTimeMngType: Record<string, string> = {
    '0': '入',
    '1': '製',
    '2': '賞',
    '4': ' '
  };
  constructor(
    private dialog: MatDialog,
    private productService: ProductService,
    private repositoriesService: RepositoriesService,
    private inventoryInputService: InventoryInputService,
    private cdr: ChangeDetectorRef
  ) { }
  ngOnInit(): void {
    this.loadProducts();
    this.loadRepositories();
    // 1. Xử lý ngay lần đầu tiên khi component chạy (để load location cho dữ liệu có sẵn)
    this.handleRepositoryChanges(this.detailsFormArray.value);

    // Calculate initial totals for all rows
    for (let i = 0; i < this.detailsFormArray.length; i++) {
      this.calculateTotal(i);
    }

    // 2. Đăng ký theo dõi sự thay đổi của form
    // Khi người dùng sửa dữ liệu, hàm này sẽ được gọi
    this.subscriptions.add(
      this.detailsFormArray.valueChanges.subscribe((values: any[]) => {
        this.handleRepositoryChanges(values);
        this.handleProductCodeChanges(values);
        // Recalculate totals for all rows when values change
        for (let i = 0; i < this.detailsFormArray.length; i++) {
          this.calculateTotal(i);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Hàm này kiểm tra xem repositoryId có thay đổi không
  private handleRepositoryChanges(rows: any[]): void {
    rows.forEach((row, index) => {
      // Lấy repositoryId hiện tại của dòng này
      const currentRepoId = row.repositoryId;

      // Lấy repositoryId cũ đã lưu lần trước
      const previousRepoId = this.previousRepositoryIds[index];

      // Nếu có ID và ID này KHÁC với ID cũ => Có sự thay đổi
      if (currentRepoId && currentRepoId !== previousRepoId) {
        // Gọi API load location mới
        this.loadLocations(index, currentRepoId);

        // Cập nhật lại ID cũ bằng ID mới để dùng cho lần so sánh sau
        this.previousRepositoryIds[index] = currentRepoId;
      }
    });
  }

  private handleProductCodeChanges(rows: any[]): void {
    rows.forEach((row, index) => {
      // If productCode is empty but productId exists (meaning it was previously set)
      if (!row.productCode && row.productId) {
        const formGroup = this.detailsFormArray.at(index);

        // Reset all product-related fields
        formGroup.patchValue({
          productId: null,
          productName: '',
          detailNote: '',

          // Reset Units
          packCsUnitName: '',
          packBlUnitName: '',
          pieceUnitName: '',
          // Reset Quantities
          csPlanQuantity: null,
          blPlanQuantity: null,
          psPlanQuantity: null,
          totalPlanQuantity: null,
          totalQuantityInput: null,
          // Reset Flags
          isDatetimeMng: '0',
          isNumberMng: '0',
          isPackCsInput: '0',
          isPieceInput: '0',
          datetimeMngType: null,
          standardInfo: '',
          totalActualQuantity: 0,
          packCsAmount: 0,
          packBlAmount: 0
        }, { emitEvent: false });

        // Disable fields
        formGroup.get('datetimeMng')?.disable({ emitEvent: false });
        formGroup.get('numberMng')?.disable({ emitEvent: false });
        formGroup.get('csPlanQuantity')?.disable({ emitEvent: false });
        formGroup.get('blPlanQuantity')?.disable({ emitEvent: false });
        formGroup.get('psPlanQuantity')?.disable({ emitEvent: false });

        this.cdr.detectChanges();
      }
    });
  }

  private loadLocations(index: number, repositoryId: number): void {
    // Gọi service để lấy danh sách vị trí (Location) dựa trên repositoryId
    this.repositoriesService.getLocationsByRepository(repositoryId).subscribe({
      next: (locations) => {
        // Lưu danh sách vị trí vào map, key là index của dòng hiện tại
        // Để template có thể truy cập qua locationsMap[i]
        this.locationsMap[index] = locations;
      },
      error: (err) => console.error(`Error loading locations for row ${index}:`, err),
    });
  }
  private loadProducts(): void {
    const page = 0;
    const limit = 50;
    this.productService.getProducts(page, limit).subscribe({
      next: (data) => {
        const products = data.content.map((dto) => {
          const product = { ...dto.productEntity } as any;
          product.packCsUnitName = dto.packCsUnitName?.unitName || '';
          product.packBlUnitName = dto.packBlUnitName?.unitName || '';
          product.pieceUnitName = dto.pieceUnitName?.unitName || '';
          product.packCsAmount = dto.productEntity.packCsAmount || 0;
          product.packBlAmount = dto.productEntity.packBlAmount || 0;
          product.totalPlanQuantity = dto.totalPlanQuantity;
          return product;
        });
        this.products.set(products);
      },
      error: (err) => console.error('Error loading products:', err),
    });
  }

  private loadRepositories(): void {
    this.inventoryInputService.getRepositories().subscribe({
      next: (data) => {
        this.repositories.set(data);
      },
      error: (err) => console.error('Error loading repositories:', err),
    });
  }

  onDetailRepositoryChange(index: number, event: any): void {
    const repoId = Number(event.target.value);
    const repo = this.repositories().find((r) => r.repositoryId === repoId);

    if (repo) {
      const formGroup = this.detailsFormArray.at(index);
      formGroup.patchValue({
        detailRepositoryCode: repo.repositoryCode,
        detailRepositoryName: repo.repositoryName,
        locationCode: '',
        repositoryId: repo.repositoryId,
        locationId: null,
      });
    }
  }

  onAddItem(): void {
    this.addItem.emit();
  }

  openSearchDialog(index: number): void {
    const dialogRef = this.dialog.open(InventorySearchDialogComponent, {
      width: '450px',
      height: '600px',
      panelClass: 'custom-dialog-container',
      data: {
        searchType: 'product',
        items: this.products(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      console.log(result)
      const formGroup = this.detailsFormArray.at(index);

      // ✅ 1. Chỉ update thông tin PRODUCT (KHÔNG đụng form khác)
      formGroup.patchValue(
        {
          productCode: result.productCode,
          productName: result.name1,
          productId: result.productId,
          datetimeMngType: result.dateTimeMngType,
          isDatetimeMng: result.isDateTimeMng,
          isNumberMng: result.isNumberMng,
          packCsUnitName: result.packCsUnitName,
          packBlUnitName: result.packBlUnitName,
          pieceUnitName: result.pieceUnitName,
          isPackCsInput: result.isPackCsInput,
          isPackBlInput: result.isPackBlInput,
          isPieceInput: result.isPieceInput,
          packCsAmount: result.packCsAmount,
          packBlAmount: result.packBlAmount,
          totalPlanQuantity: result.totalPlanQuantity,
          standardInfo: result.standardInfo,
          totalActualQuantity: result.totalActualQuantity || 0,
          // Reset quantities when new product is selected
          csPlanQuantity: null,
          blPlanQuantity: null,
          psPlanQuantity: null,
          totalQuantityInput: null
        },
        { emitEvent: false }
      ); // 🚫 không trigger valueChanges

      // ✅ 4. Enable / Disable datetimeMng bằng API FormControl
      const datetimeCtrl = formGroup.get('datetimeMng');
      if (result.isDateTimeMng === '0') {
        datetimeCtrl?.disable({ emitEvent: false }); // giữ value, chỉ disable
      } else {
        datetimeCtrl?.enable({ emitEvent: false });
      }

      // ✅ 5. Enable / Disable numberMng bằng API FormControl
      const numberCtrl = formGroup.get('numberMng');
      if (result.isNumberMng === '0') {
        numberCtrl?.disable({ emitEvent: false });
      } else {
        numberCtrl?.enable({ emitEvent: false });
      }

      // ✅ 6. Enable / Disable quantity fields
      const csCtrl = formGroup.get('csPlanQuantity');
      if (result.isPackCsInput === '0') {
        csCtrl?.disable({ emitEvent: false });
      } else {
        csCtrl?.enable({ emitEvent: false });
      }

      const blCtrl = formGroup.get('blPlanQuantity');
      if (result.isPackBlInput === '0') {
        blCtrl?.disable({ emitEvent: false });
      } else {
        blCtrl?.enable({ emitEvent: false });
      }

      const psCtrl = formGroup.get('psPlanQuantity');
      if (result.isPieceInput === '0') {
        psCtrl?.disable({ emitEvent: false });
      } else {
        psCtrl?.enable({ emitEvent: false });
      }

      this.calculateTotal(index);
      this.cdr.detectChanges();
    });
  }

  calculateTotal(index: number): void {
    const formGroup = this.detailsFormArray.at(index);
    const csQty = Number(formGroup.get('csPlanQuantity')?.value) || 0;
    const blQty = Number(formGroup.get('blPlanQuantity')?.value) || 0;
    const psQty = Number(formGroup.get('psPlanQuantity')?.value) || 0;

    const packCsAmount = Number(formGroup.get('packCsAmount')?.value) || 0;
    const packBlAmount = Number(formGroup.get('packBlAmount')?.value) || 0;

    const isPackCsInput = formGroup.get('isPackCsInput')?.value;
    const isPackBlInput = formGroup.get('isPackBlInput')?.value;
    const isPieceInput = formGroup.get('isPieceInput')?.value;

    let total = 0;

    if (isPackCsInput !== '0') {
      total += csQty * packCsAmount * packBlAmount;
    }
    if (isPackBlInput !== '0') {
      total += blQty * packBlAmount;
    }
    if (isPieceInput !== '0') {
      total += psQty;
    }

    const totalActualQuantity = Number(formGroup.get('totalActualQuantity')?.value) || 0;

    formGroup.patchValue({
      totalQuantityInput: total,
      totalPlanQuantity: total - totalActualQuantity
    }, { emitEvent: false });
  }

  onRemoveItem(index: number): void {
    this.removeItem.emit(index);
  }
}
