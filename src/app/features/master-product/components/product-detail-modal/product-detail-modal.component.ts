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
import { ProductService } from '../../services/product.service';

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
  activeTab: string = 'general'; // Default tab
  productForm!: FormGroup;

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
    private productService: ProductService
  ) {
    this.initForm();
  }

  openSupplierSearch(): void {
    this.dialog.open(CommonSearchDialogComponent, {
      width: '800px',
      height: '600px',
      panelClass: 'custom-dialog-container',
      autoFocus: false,
    });
  }

  ngOnInit(): void {
    [
      'isPackCsInput',
      'isPackCsOutput',
      'isPackBlInput',
      'isPackBlOutput',
      'isPieceInput',
      'isPieceOutput',
    ].forEach((name) => {
      this.productForm.get(name)!.valueChanges.subscribe(() => {
        this.togglePackagingUnits();
      });
    });

    // gọi lần đầu để sync trạng thái
    this.togglePackagingUnits();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && changes['product'].currentValue) {
      this.product = changes['product'].currentValue;
      this.patchForm();

      if (this.product.productEntity.productId) {
        this.productService
          .getProductById(this.product.productEntity.productId)
          .subscribe((detail) => {
            this.product = detail;
            this.patchForm();
            if (this.product.productEntity.repositoryId) {
              this.loadRepositories();
              this.loadLocations(this.product.productEntity.repositoryId);
            }
          });
      }
    }
  }

  loadRepositories(): void {
    this.productService.getRepositories().subscribe((repos) => {
      this.repositories.set(repos);
    });
  }

  loadLocations(repositoryId: number): void {
    this.productService.getLocationsByRepository(repositoryId).subscribe((locs) => {
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
      isDateTimeMng: ['0'],
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
    console.log(pcu)

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
      categoryCode2: p.categoryCode2,
      categoryCode3: p.categoryCode3,
      categoryCode4: p.categoryCode4,
      categoryCode5: p.categoryCode5,

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
      isDateTimeMng: p.isDateTimeMng,
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
    });

    this.packagingCsUnitName.set(pcu?.unitName || '');
    this.packagingBlUnitName.set(pbu?.unitName || '');
    this.packagingPieceUnitName.set(peu?.unitName || '');
    this.packagingCsUnitAmount.set(p?.packCsAmount || null);
    this.packagingBlUnitAmount.set(p?.packBlAmount || null);

    this.togglePackagingUnits();
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
      console.log('Form Data:', this.productForm.getRawValue());
      // TODO: Implement save logic calling service
    } else {
      console.log('Form is invalid');
    }
  }
  openPackagingCodeSearch(type: 'Cs' | 'Bl' | 'Piece'): void {
    this.productService.getUnitNames().subscribe((units) => {
      const dialogRef = this.dialog.open(CommonSearchDialogComponent, {
        width: '800px',
        height: '600px',
        panelClass: 'custom-dialog-container',
        data: {
          searchType: 'unit',
          items: units,
        },
      });

      dialogRef.afterClosed().subscribe((unit: any | null) => {
        if (!unit) return;

        if (type === 'Cs') {
          this.productForm.patchValue({ packagingCsUnitCode: unit.unitCode });
          this.packagingCsUnitName.set(unit.unitName);
        } else if (type === 'Bl') {
          this.productForm.patchValue({ packagingBlUnitCode: unit.unitCode });
          this.packagingBlUnitName.set(unit.unitName);
        } else if (type === 'Piece') {
          this.productForm.patchValue({ packagingPieceUnitCode: unit.unitCode });
          this.packagingPieceUnitName.set(unit.unitName);
        }
      });
    });
  }

  openCategorySearch(type: 'cat1' | 'cat2' | 'cat3' | 'cat4' | 'cat5'): void {
    // Map type to category number (1-5)
    const categoryType = type.replace('cat', '');

    this.productService.getCategoriesByType(categoryType).subscribe((categories) => {
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
        } else if (type === 'cat2') {
          this.productForm.patchValue({ categoryCode2: category.categoryCode });
        } else if (type === 'cat3') {
          this.productForm.patchValue({ categoryCode3: category.categoryCode });
        } else if (type === 'cat4') {
          this.productForm.patchValue({ categoryCode4: category.categoryCode });
        } else if (type === 'cat5') {
          this.productForm.patchValue({ categoryCode5: category.categoryCode });
        }
      });
    });
  }
}
