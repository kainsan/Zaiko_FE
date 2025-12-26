import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MasterProductDTO, Product, Repository, Location } from '../../model/product.model';
import { CommonSearchDialogComponent } from '../common-search-dialog/common-search-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { CategoriesService } from '../../services/categories.service';
import { ProductService } from '../../services/product.service'
import { RepositoriesService } from '../../services/repostories.service';
import { SupplierService } from '../../services/supplier.service';

@Component({
  selector: 'product-detail-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule],
  templateUrl: './product-detail-modal.component.html',
  styleUrls: ['./product-detail-modal.component.scss'],
})
export class ProductDetailModalComponent implements OnInit, OnChanges {
  @Input() product!: MasterProductDTO;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  activeTab: string = 'general'; // Default tab
  productForm!: FormGroup;
  isFormDirty = signal<boolean>(false);

  repositories = signal<Repository[]>([]);
  locations = signal<Location[]>([]);
  packagingCsUnitName = signal<string>('');
  packagingBlUnitName = signal<string>('');
  packagingPieceUnitName = signal<string>('');
  packagingCsUnitAmount = signal<number | null>(null);
  packagingBlUnitAmount = signal<number | null>(null);

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private productService: ProductService,
    private categoriesService: CategoriesService,
    private repositoriesService: RepositoriesService,
    private supplierService: SupplierService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    [
      'isPackCsInput',
      'isPackCsOutput',
      'isPackBlInput',
      'isPackBlOutput',
      'isPieceInput',
      'isPieceOutput',
      'isDateTimeMng',
      'isNumberMng',
      'isReplenishMng'
    ].forEach((name) => {
      this.productForm.get(name)!.valueChanges.subscribe(() => {
        console.log(this.productForm)
        this.togglePackagingUnits();
      });
    });

    // Sync isDateTimeMng and dateTimeMngType
    this.productForm.get('isDateTimeMng')!.valueChanges.subscribe((checked: boolean) => {
      const typeCtrl = this.productForm.get('dateTimeMngType')!;

      if (checked && [!typeCtrl.value || typeCtrl.value === undefined]) {

        typeCtrl.patchValue('0', { emitEvent: false });
      }

      if (!checked) {
        typeCtrl.patchValue(null, { emitEvent: false });
      }
    }
    );

    this.productForm.get('dateTimeMngType')!.valueChanges.subscribe((val: string | null) => {
      const dateMngCtrl = this.productForm.get('isDateTimeMng')!;

      // Nếu chọn type mà isDateTimeMng đang false → bật lại
      if (val && !dateMngCtrl.value && val !== '4') {
        dateMngCtrl.patchValue(true, { emitEvent: false });
      }
    });

    // gọi lần đầu để sync trạng thái
    this.togglePackagingUnits();

    // Track form changes
    this.productForm.valueChanges.subscribe(() => {
      this.isFormDirty.set(this.productForm.dirty);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && changes['product'].currentValue) {
      this.product = changes['product'].currentValue;
      this.patchForm();

      if (this.product.productEntity.productId) {
        this.productService
          .getProductById(this.product.productEntity.productId)
          .subscribe((detail: any) => {
            this.product = detail;
            this.patchForm();
            this.loadRepositories();
            if (!this.product.productEntity.repositoryId) {
              this.loadLocations(0);
            } else {
              this.loadLocations(this.product.productEntity.repositoryId);
            }
          });
      }
    }
  }

  loadRepositories(): void {
    this.repositoriesService.getRepositories().subscribe((repos: any) => {
      this.repositories.set(repos);
    });
  }

  loadLocations(repositoryId: number): void {
    this.repositoriesService.getLocationsByRepository(repositoryId).subscribe((locs: any) => {
      this.locations.set(locs);
    });
  }

  onWarehouseChange(event: any): void {
    const repositoryId = event.target.value;
    if (repositoryId) {
      this.loadLocations(Number(repositoryId));
      this.productForm.patchValue({ repositoryId: Number(repositoryId) });
    } else {
      this.locations.set([]);
      this.productForm.patchValue({ repositoryId: null, locationId: null });
    }
  }

  initForm() {
    this.productForm = this.fb.group({
      // ===== GENERAL =====
      productCode: [{ value: '', disabled: true }],
      upcCd1: [''],
      upcCd2: [''],
      isSet: [false],

      name1: [''],
      name2: [''],
      name3: [''],
      name4: [''],
      name5: [''],
      standardInfo: [''],
      notes: [''],

      categoryCode1: [''],
      categoryCode2: [''],
      categoryCode3: [''],
      categoryCode4: [''],
      categoryCode5: [''],
      categoryName1: [''],
      categoryName2: [''],
      categoryName3: [''],
      categoryName4: [''],
      categoryName5: [''],

      // ===== PACKAGING =====
      fifoType: ['0'],
      cartonWeight: [''],
      cartonWeightName: [''],
      cartonVolume: [''],
      cartonVolumeName: [''],
      cartonHigh: [''],
      cartonHorizontal: [''],
      cartonVertical: [''],

      pieceWeight: [''],
      pieceWeightName: [''],
      pieceVolume: [''],
      pieceVolumeName: [''],

      isPackCsInput: [false],
      isPackCsOutput: [false],
      isPackBlInput: [false],
      isPackBlOutput: [false],
      isPieceInput: [false],
      // Added missing controls for packaging table
      isPieceOutput: [false],
      packagingCsUnitCode: [''],
      packagingBlUnitCode: [''],
      packagingPieceUnitCode: [''],
      packagingCsUnitName: [''],
      packagingBlUnitName: [''],
      packagingPieceUnitName: [''],
      packagingCsUnitAmount: [''],
      packagingBlUnitAmount: [''],

      // ===== STOCK =====
      repositoryId: [null],
      locationId: [null],
      isDateTimeMng: [false],
      isNumberMng: [false],
      dateTimeMngType: [null],
      isReplenishMng: ['0'],
      minInventoryQuantity: [{ value: 0, disabled: true }],
      minInputQuantity: [{ value: 0, disabled: true }],
      supplierId: [{ value: null, disabled: true }],
      supplierCode: [{ value: '', disabled: true }],
      supplierName: [{ value: '', disabled: true }],
      leadTime: [{ value: null, disabled: true }],
      repositoryCode: [{ value: '', disabled: true }],
      locationCode: [{ value: '', disabled: true }],
    });
  }

  patchForm() {
    if (!this.product || !this.product.productEntity) return;
    const p = this.product.productEntity;
    const re = this.product.repositoryEntity;
    const loc = this.product.locationEntity;
    const pcu = this.product.packCsUnitName;
    const pbu = this.product.packBlUnitName;
    const peu = this.product.pieceUnitName;
    const sup = this.product.supplierEntity;
    const cat1 = this.product.category1Entity;
    const cat2 = this.product.category2Entity;
    const cat3 = this.product.category3Entity;
    const cat4 = this.product.category4Entity;
    const cat5 = this.product.category5Entity;

    if (p.productId) {
      this.productForm.get('productCode')?.disable();
    } else {
      this.productForm.get('productCode')?.enable();
    }

    this.productForm.patchValue({
      productCode: p.productCode,
      upcCd1: p.upcCd1,
      upcCd2: p.upcCd2,
      isSet: p.isSet === '1',

      name1: p.name1,
      name2: p.name2,
      name3: p.name3,
      name4: p.name4,
      name5: p.name5,
      standardInfo: p.standardInfo,
      notes: p.notes,

      categoryCode1: p.categoryCode1,
      categoryName1: cat1?.categoryName,
      categoryCode2: p.categoryCode2,
      categoryName2: cat2?.categoryName,
      categoryCode3: p.categoryCode3 ?? '',
      categoryName3: cat3?.categoryName ?? '',
      categoryCode4: p.categoryCode4 ?? '',
      categoryName4: cat4?.categoryName ?? '',
      categoryCode5: p.categoryCode5 ?? '',
      categoryName5: cat5?.categoryName ?? '',

      fifoType: p.fifoType,
      cartonWeight: p.cartonWeight,
      cartonWeightName: p.cartonWeightName,
      cartonVolume: p.cartonVolume,
      cartonVolumeName: p.cartonVolumeName,
      cartonHigh: p.cartonHigh,
      cartonHorizontal: p.cartonHorizontal,
      cartonVertical: p.cartonVertical,

      pieceWeight: p.pieceWeight,
      pieceWeightName: p.pieceWeightName,
      pieceVolume: p.pieceVolume,
      pieceVolumeName: p.pieceVolumeName,

      isPackCsInput: p.isPackCsInput === '1',
      isPackCsOutput: p.isPackCsOutput === '1',
      isPackBlInput: p.isPackBlInput === '1',
      isPackBlOutput: p.isPackBlOutput === '1',
      isPieceInput: p.isPieceInput === '1',
      // Assuming isPieceOutput exists in entity or logic
      isPieceOutput: p.isPieceOutput === '1',

      repositoryId: p.repositoryId,
      locationId: p.locationId,
      isDateTimeMng: p.isDateTimeMng === '1',
      isNumberMng: p?.isNumberMng === '1',
      isReplenishMng: p?.isReplenishMng || '0',
      dateTimeMngType: p?.dateTimeMngType ?? null,
      repositoryCode: re?.repositoryCode,
      locationCode: loc?.locationCode,
      packagingCsUnitCode: pcu?.unitCode,
      packagingCsUnitName: pcu?.unitName,
      packagingCsUnitAmount: p?.packCsAmount,
      packagingBlUnitCode: pbu?.unitCode,
      packagingBlUnitName: pbu?.unitName,
      packagingBlUnitAmount: p?.packBlAmount,
      packagingPieceUnitCode: peu?.unitCode,
      packagingPieceUnitName: peu?.unitName,
      supplierId: p?.supplierId,
      supplierCode: sup?.supplierCode,
      supplierName: sup?.supplierName,
      leadTime: p?.leadTime,
    }, { emitEvent: false });

    this.isFormDirty.set(false);
    this.productForm.markAsPristine();

    this.packagingCsUnitName.set(pcu?.unitName || '');
    this.packagingBlUnitName.set(pbu?.unitName || '');
    this.packagingPieceUnitName.set(peu?.unitName || '');
    this.packagingCsUnitAmount.set(p?.packCsAmount || null);
    this.packagingBlUnitAmount.set(p?.packBlAmount || null);

    this.togglePackagingUnits();
    // this.toggleManagement();
  }

  togglePackagingUnits() {
    const rules = [
      {
        controls: ['packagingCsUnitCode', 'packagingCsUnitAmount'],
        enabled:
          this.productForm.get('isPackCsInput')!.value ||
          this.productForm.get('isPackCsOutput')!.value,
      },
      {
        controls: ['packagingBlUnitCode', 'packagingBlUnitAmount'],
        enabled:
          this.productForm.get('isPackBlInput')!.value ||
          this.productForm.get('isPackBlOutput')!.value,
      },
      {
        controls: ['packagingPieceUnitCode'],
        enabled:
          this.productForm.get('isPieceInput')!.value ||
          this.productForm.get('isPieceOutput')!.value,
      },
      {
        controls: ['minInventoryQuantity', 'minInputQuantity', 'supplierId', 'supplierCode', 'supplierName', 'leadTime'],
        enabled: this.productForm.get('isReplenishMng')!.value === '1',
      },
    ];

    rules.forEach((rule) => {
      rule.controls.forEach((controlName) => {
        const control = this.productForm.get(controlName)!;
        if (rule.enabled) {
          control.enable({ emitEvent: false });
        } else {
          control.disable({ emitEvent: false });
        }
      });
    });
  }

  selectTab(tab: string): void {
    this.activeTab = tab;
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    if (this.productForm.valid) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '450px',
        data: { message: '保存します。よろしいでしょうか。' },
        panelClass: 'custom-confirm-dialog'
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const productId = this.product.productEntity.productId;
          const productData = this.productForm.getRawValue();

          if (productId) {
            // Update existing product
            this.productService.updateProduct(productId, productData).subscribe({
              next: () => {
                console.log('Product updated successfully');
                this.isFormDirty.set(false);
                this.productForm.markAsPristine();
                this.saved.emit();
                this.onClose();
              },
              error: (err) => {
                console.error('Error updating product:', err);
              }
            });
          } else {
            // Create new product
            this.productService.createProduct(productData).subscribe({
              next: () => {
                console.log('Product created successfully');
                console.log(productData);
                this.isFormDirty.set(false);
                this.productForm.markAsPristine();
                this.saved.emit();
                this.onClose();
              },
              error: (err) => {
                console.error('Error creating product:', err);
              }
            });
          }
        }
      });
    } else {
      console.log('Form is invalid');
    }
  }

  openPackagingCodeSearch(type: 'Cs' | 'Bl' | 'Piece'): void {
    this.productService.getUnitNames().subscribe((units: any) => {
      const dialogRef = this.dialog.open(CommonSearchDialogComponent, {
        width: '800px',
        height: '600px',
        panelClass: 'custom-dialog-container',
        data: {
          searchType: 'unit',
          items: units,
        },
      });

      dialogRef.afterClosed().subscribe((unit: any) => {
        if (!unit) return;
        console.log(unit);
        if (type === 'Cs') {
          this.productForm.patchValue({ packagingCsUnitCode: unit.unitCode });
          this.productForm.patchValue({ packagingCsUnitName: unit.unitName });
        } else if (type === 'Bl') {
          this.productForm.patchValue({ packagingBlUnitCode: unit.unitCode });
          this.productForm.patchValue({ packagingBlUnitName: unit.unitName });
        } else if (type === 'Piece') {
          this.productForm.patchValue({ packagingPieceUnitCode: unit.unitCode });
          this.productForm.patchValue({ packagingPieceUnitName: unit.unitName });
        }
      });
    });
  }

  openCategorySearch(type: 'cat1' | 'cat2' | 'cat3' | 'cat4' | 'cat5'): void {
    // Map type to category number (1-5)
    const categoryType = type.replace('cat', '');

    this.categoriesService.getCategoriesByType(categoryType).subscribe((categories: any) => {
      const dialogRef = this.dialog.open(CommonSearchDialogComponent, {
        width: '800px',
        height: '600px',
        panelClass: 'custom-dialog-container',
        data: {
          searchType: 'category',
          items: categories,
        },
      });

      dialogRef.afterClosed().subscribe((category: any | null) => {
        if (!category) return;

        if (type === 'cat1') {
          this.productForm.patchValue({ categoryCode1: category.categoryCode });
          this.productForm.patchValue({ categoryName1: category.categoryName });
        } else if (type === 'cat2') {
          this.productForm.patchValue({ categoryCode2: category.categoryCode });
          this.productForm.patchValue({ categoryName2: category.categoryName });
        } else if (type === 'cat3') {
          this.productForm.patchValue({ categoryCode3: category.categoryCode });
          this.productForm.patchValue({ categoryName3: category.categoryName });
        } else if (type === 'cat4') {
          this.productForm.patchValue({ categoryCode4: category.categoryCode });
          this.productForm.patchValue({ categoryName4: category.categoryName });
        } else if (type === 'cat5') {
          this.productForm.patchValue({ categoryCode5: category.categoryCode });
          this.productForm.patchValue({ categoryName5: category.categoryName });
        }
      });
    });
  }

  openSupplierSearch(): void {
    this.supplierService.getSuppliers().subscribe((suppliers: any) => {
      const dialogRef = this.dialog.open(CommonSearchDialogComponent, {
        width: '800px',
        height: '600px',
        panelClass: 'custom-dialog-container',
        data: {
          searchType: 'supplier',
          items: suppliers,
        },
      });

      dialogRef.afterClosed().subscribe((supplier: any | null) => {
        if (!supplier) return;

        if (supplier) {
          this.productForm.patchValue({
            supplierId: supplier.supplierId,
            supplierCode: supplier.supplierCode,
            supplierName: supplier.supplierName
          });
        }
      });
    });
  }
}
