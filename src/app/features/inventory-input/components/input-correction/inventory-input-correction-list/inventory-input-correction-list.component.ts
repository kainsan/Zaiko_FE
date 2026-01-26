import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { InventorySearchDialogComponent } from '../../inventory-search-dialog/inventory-search-dialog.component';
import { Product } from '../../../../master-product/model/product.model';
import { MatDialog } from '@angular/material/dialog';
import { ProductService } from '../../../../master-product/services/product.service';
import { RepositoriesService } from '../../../../master-product/services/repostories.service';
import { Location, Repository } from '../../../../master-product/model/product.model';
import { InventoryInputService } from '../../../services/inventory-input.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inventory-input-correction-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
  ],
  templateUrl: './inventory-input-correction-list.component.html',
  styleUrls: ['./inventory-input-correction-list.component.scss'],
})
export class InventoryInputCorrectionListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() detailsFormArray!: FormArray;
  @Input() repositories: Repository[] = [];
  @Output() addItem = new EventEmitter<void>();
  @Output() removeItem = new EventEmitter<number>();
  @Output() copyItem = new EventEmitter<number>();

  products = signal<Product[]>([]);
  locationsMap: { [index: number]: Location[] } = {};
  locationsCacheByRepoId: { [repoId: number]: Location[] } = {};
  private subscriptions: Subscription = new Subscription();
  private previousRepositoryIds: (number | undefined)[] = [];
  private previousLocationIds: (number | undefined)[] = [];
  test = '1';
  public statusDateTimeMngType: Record<string, string> = {
    '0': '入',
    '1': '製',
    '2': '賞',
    '4': ' '
  };

  inventoryProductTypeOptions = [
    { value: '0', label: '良品' },
    { value: '1', label: '預り予定' },
    { value: '2', label: 'MTとりおき' },
    { value: '3', label: '新ロット' },
    { value: '4', label: '廃棄・処分品' },
    { value: '5', label: '破損' },
    { value: '6', label: '不良品' },
    { value: '7', label: 'サンプル' },
    { value: '8', label: '予備' }
  ];

  constructor(
    private dialog: MatDialog,
    private productService: ProductService,
    private repositoriesService: RepositoriesService,
    private inventoryInputService: InventoryInputService,
    private cdr: ChangeDetectorRef
  ) { }
  ngOnInit(): void {
    this.loadProducts();
    console.log(this.detailsFormArray);
    this.setupFormLogic();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['detailsFormArray'] && !changes['detailsFormArray'].firstChange) {
      this.setupFormLogic();
    }
  }

  private setupFormLogic(): void {
    // 1. Clear old subscriptions
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();

    // 2. Reset internal state
    this.previousRepositoryIds = [];
    this.previousLocationIds = [];
    this.locationsMap = {};

    if (!this.detailsFormArray) return;

    // 3. Initial processing - force load locations because locationsMap was reset
    // Use getRawValue() to include disabled controls (for existing records)
    setTimeout(() => {
      const rawValues = this.detailsFormArray.getRawValue();
      this.handleRepositoryChanges(rawValues, true);
      this.handleLocationChanges(rawValues);
      for (let i = 0; i < this.detailsFormArray.length; i++) {
        this.calculateTotal(i);
      }
    });

    // 4. Subscribe to changes
    this.subscriptions.add(
      this.detailsFormArray.valueChanges.subscribe((values: any[]) => {
        // valueChanges excludes disabled controls, but for user interactions (which only happen on enabled controls), this is fine.
        // However, to be safe and consistent, we can check getRawValue() if needed, 
        // but values is sufficient for detecting changes on enabled fields.
        // Actually, let's use getRawValue() to be absolutely sure we have all data context if needed.
        const rawValues = this.detailsFormArray.getRawValue();
        
        this.handleRepositoryChanges(rawValues);
        this.handleLocationChanges(rawValues);
        this.handleProductCodeChanges(rawValues);
        for (let i = 0; i < this.detailsFormArray.length; i++) {
          this.calculateTotal(i);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private handleRepositoryChanges(rows: any[], force: boolean = false): void {
    rows.forEach((row, index) => {
      const currentRepoId = row.repositoryId;
      const previousRepoId = this.previousRepositoryIds[index];

      if (currentRepoId && (force || currentRepoId !== previousRepoId)) {
        // Load locations
        this.loadLocations(index, currentRepoId);

        // If NOT force (meaning user change), update related fields
        if (!force && currentRepoId !== previousRepoId) {
          const formGroup = this.detailsFormArray.at(index);
          const repo = this.repositories.find((r) => r.repositoryId === currentRepoId);
          if (repo) {
            formGroup.patchValue({
              detailRepositoryCode: repo.repositoryCode,
              detailRepositoryName: repo.repositoryName,
              locationCode: '',
              locationId: null,
            }, { emitEvent: false }); // Avoid infinite loops
          }
        }

        this.previousRepositoryIds[index] = currentRepoId;
      } else if (!currentRepoId && previousRepoId) {
          // Repository cleared
          const formGroup = this.detailsFormArray.at(index);
          formGroup.patchValue({
              detailRepositoryCode: '',
              detailRepositoryName: '',
              locationCode: '',
              locationId: null,
          }, { emitEvent: false });
          this.locationsMap[index] = [];
          this.previousRepositoryIds[index] = undefined;
      }
    });
  }

  private handleLocationChanges(rows: any[]): void {
    rows.forEach((row, index) => {
      const currentLocId = row.locationId;
      const previousLocId = this.previousLocationIds[index];

      if (currentLocId !== previousLocId) {
        const formGroup = this.detailsFormArray.at(index);
        
        if (currentLocId) {
          const locations = this.locationsMap[index] || [];
          const selectedLocation = locations.find(loc => loc.locationId === currentLocId);
          if (selectedLocation) {
            formGroup.patchValue({
              locationCode: selectedLocation.locationCode
            }, { emitEvent: false });
          }
        } else {
          formGroup.patchValue({
            locationCode: ''
          }, { emitEvent: false });
        }
        
        this.previousLocationIds[index] = currentLocId;
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
          inventoryProductType: '',
          // Reset Quantities
          csActualQuantity: null,
          blActualQuantity: null,
          psActualQuantity: null,
          totalActualQuantity: 0,
          totalQuantityInput: null,
          // Reset Flags
          isDatetimeMng: '0',
          isNumberMng: '0',
          isPackCsInput: '0',
          isPieceInput: '0',
          datetimeMngType: null,
          datetimeMng: null,
          standardInfo: '',
          packCsAmount: 0,
          packBlAmount: 0
        }, { emitEvent: false });

        // Disable fields
        formGroup.get('datetimeMng')?.disable({ emitEvent: false });
        formGroup.get('numberMng')?.disable({ emitEvent: false });
        formGroup.get('csActualQuantity')?.disable({ emitEvent: false });
        formGroup.get('blActualQuantity')?.disable({ emitEvent: false });
        formGroup.get('psActualQuantity')?.disable({ emitEvent: false });
        formGroup.get('locationCode')?.disable({ emitEvent: false });
      }
    });
  }

  private loadLocations(index: number, repositoryId: number): void {
    if (this.locationsCacheByRepoId[repositoryId]) {
      this.locationsMap[index] = this.locationsCacheByRepoId[repositoryId];
      return;
    }

    this.repositoriesService.getLocationsByRepository(repositoryId).subscribe({
      next: (locations) => {
        this.locationsCacheByRepoId[repositoryId] = locations;
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
      // console.log(result)
      setTimeout(() => {
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

            csActualQuantity: null,
            blActualQuantity: null,
            psActualQuantity: null,
            totalQuantityInput: null,
            datetimeMng: null,
            inventoryProductType: '0'
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
        const csCtrl = formGroup.get('csActualQuantity');
        if (result.isPackCsInput === '0') {
          csCtrl?.disable({ emitEvent: false });
        } else {
          csCtrl?.enable({ emitEvent: false });
        }

        const blCtrl = formGroup.get('blActualQuantity');
        if (result.isPackBlInput === '0') {
          blCtrl?.disable({ emitEvent: false });
        } else {
          blCtrl?.enable({ emitEvent: false });
        }

        const psCtrl = formGroup.get('psActualQuantity');
        if (result.isPieceInput === '0') {
          psCtrl?.disable({ emitEvent: false });
        } else {
          psCtrl?.enable({ emitEvent: false });
        }

        this.calculateTotal(index);

        // ✅ 7. Enable / Disable locationCode
        const repoId = formGroup.get('repositoryId')?.value;
        if (repoId) {
          this.loadLocations(index, repoId);
          formGroup.get('locationCode')?.enable({ emitEvent: false });
        } else {
          formGroup.get('locationCode')?.disable({ emitEvent: false });
        }

      });
    });
  }

  calculateTotal(index: number): void {
    const formGroup = this.detailsFormArray.at(index);
    const csQty = Number(formGroup.get('csActualQuantity')?.value) || 0;
    const blQty = Number(formGroup.get('blActualQuantity')?.value) || 0;
    const psQty = Number(formGroup.get('psActualQuantity')?.value) || 0;

    const packCsAmount = Number(formGroup.get('packCsAmount')?.value) || 0;
    const packBlAmount = Number(formGroup.get('packBlAmount')?.value) || 0;

    const isPackCsInput = formGroup.get('isPackCsInput')?.value;
    const isPackBlInput = formGroup.get('isPackBlInput')?.value;
    const isPieceInput = formGroup.get('isPieceInput')?.value;

    let total = 0;

    // Formula: (packCsAmount * csQty * packBlAmount) + (packBlAmount * blQty) + psQty
    // Note: If item is disabled (isPackInput === '0'), it is not counted.

    if (isPackCsInput !== '0') {
      total += csQty * packCsAmount * packBlAmount;
    }
    if (isPackBlInput !== '0') {
      total += blQty * packBlAmount;
    }
    if (isPieceInput !== '0') {
      total += psQty;
    }

    formGroup.patchValue({
      totalActualQuantity: total
    }, { emitEvent: false });
  }

  onRemoveItem(index: number): void {
    this.removeItem.emit(index);
  }

  onCopyItem(index: number): void {
    this.copyItem.emit(index);
  }

  trackByDetail(index: number, control: AbstractControl) {
    const id = control.get('actualDetailId')?.value;
    return id != null ? id : index;
  }

  isCopyDisabled(control: AbstractControl): boolean {
    return control.invalid;
  }
}
