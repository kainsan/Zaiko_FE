import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryInputCorrectionHeaderComponent } from '../inventory-input-correction-header/inventory-input-correction-header.component';
import { InventoryInputCorrectionListComponent } from '../inventory-input-correction-list/inventory-input-correction-list.component';
import { InventoryInputService } from '../../../services/inventory-input.service';
import { InventoryInputActualDetail, InventoryInputActualResponse, InventoryInputCorrectionDetail, InventoryInputCorrectionResponse } from '../../../models/inventory-input.model';
import { RepositoriesService } from '../../../../master-product/services/repostories.service';
import { Repository } from '../../../../master-product/model/product.model';
import { Location } from '../../../../master-product/model/product.model';
import { Observable } from 'rxjs/internal/Observable';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-inventory-input-correction',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InventoryInputCorrectionHeaderComponent,
        InventoryInputCorrectionListComponent
    ],
    templateUrl: './inventory-input-correction.component.html',
    styleUrls: ['./inventory-input-correction.component.scss']
})
export class InventoryInputCorrectionComponent implements OnInit, OnChanges {
    @Input() inventoryInputId: number | null = null;
    @Output() back = new EventEmitter<void>();
    locations = signal<Location[]>([]);
    repositories = signal<Repository[]>([]);
    inventoryForm!: FormGroup;
    isFormInvalid = true;

    currentDate = new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '/');

    constructor(
        private fb: FormBuilder,
        private inventoryInputService: InventoryInputService,
        private repositoriesService: RepositoriesService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadRepositories();
        if (this.inventoryInputId) {
            this.loadData(this.inventoryInputId);
        } else {
            this.addDetail();
        }
        this.inventoryForm.statusChanges.subscribe(() => {
            this.isFormInvalid = this.inventoryForm.invalid;
        });
    }

    public getLocationByRepositoryId(repositoryId: number): Observable<Location[]> {
        return this.repositoriesService.getLocationsByRepository(repositoryId);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['inventoryInputId']?.currentValue) {
            this.loadData(changes['inventoryInputId'].currentValue);
        }
    }

    private initializeForm(inventoryInputData?: InventoryInputCorrectionResponse): void {
        this.inventoryForm = this.fb.group({
            header: this.fb.group({
                inventoryInputId: [inventoryInputData?.inventoryInputCorrectionHeader && inventoryInputData?.inventoryInputCorrectionHeader.inventoryInputId
                    ? inventoryInputData?.inventoryInputCorrectionHeader.inventoryInputId : null],
                companyId: [null],
                inputPlanDate: [{ value: '', disabled: true }],
                inputActualDate: ['', Validators.required],
                createSlipType: [{ value: '0', disabled: true }], // Default to Auto
                slipNo: [{ value: '', disabled: true }], // Default to disabled
                planSupplierSlipNo: [''],
                actualSupplierSlipNo: [{ value: '', disabled: true }],
                planSlipNote: [''],
                actualSlipNote: [{ value: '', disabled: false }],
                planSupplierDeliveryDestinationId: [null],
                actualSupplierDeliveryDestinationId: [null],
                planSupplierId: [null],
                actualSupplierId: [null],
                productOwnerId: [null],
                planRepositoryId: [null],
                actualRepositoryId: [{ value: null, disabled: true }],
                inputStatus: [''],
                sumPlanQuantity: [null],
                sumActualQuantity: [null],
                isClosed: [''],
                freeItem1: [''],
                freeItem2: [''],
                freeItem3: [''],
                contactStatus: [''],
                destinationCode: [{ value: '', disabled: true }],
                departmentName: [{ value: '', disabled: true }],
                planSupplierCode: [''],
                planSupplierName: [''],
                supplierCode: [{ value: '', disabled: true }],
                supplierName: [{ value: '', disabled: true }],
                customerCode: [{ value: '', disabled: true }],
                customerName: [{ value: '', disabled: true }],
                repositoryCode: [''],
                repositoryName: ['']
            }),
            details: inventoryInputData?.inventoryInputCorrectionDetails && inventoryInputData.inventoryInputCorrectionDetails.length > 0
                ? this.fb.array(inventoryInputData?.inventoryInputCorrectionDetails.map(x => this.createDetailFormGroup(x))) : this.fb.array([])
        });

        // Subscribe to createSlipType changes - REMOVED as fields should be disabled
        // this.inventoryForm.get('header.createSlipType')?.valueChanges.subscribe(value => {
        //     const slipNoControl = this.inventoryForm.get('header.slipNo');
        //     if (value === '1') { // Manual
        //         slipNoControl?.enable();
        //     } else { // Auto
        //         slipNoControl?.disable();
        //     }
        // });
        if (!inventoryInputData?.inventoryInputCorrectionHeader.inventoryInputId) {
            this.inventoryForm.get('header.actualRepositoryId')?.valueChanges.subscribe((e: number | null) => {
                if (e) {
                    this.getLocationByRepositoryId(e).subscribe(res => {
                        if (res) {
                            (this.inventoryForm.get('details') as FormArray).controls.forEach(el => {
                                el.get('repositoryId')?.setValue(e);

                            })
                        }
                    });
                } else {
                    (this.inventoryForm.get('details') as FormArray).controls.forEach(el => {
                        el.get('repositoryId')?.setValue(e);
                        el.get('localtions')?.setValue([]);
                    })
                }
            });
        }
    }

    private loadRepositories(): void {
        this.inventoryInputService.getRepositories().subscribe({
            next: (data) => this.repositories.set(data),
            error: (err) => console.error('Error loading repositories:', err)
        });
    }

    private loadData(id: number): void {
        this.inventoryInputService.getInventoryInputCorrectionById(id).subscribe({
            next: (correctionData: InventoryInputCorrectionResponse) => {
                // Patch header data
                console.log(correctionData);
                const headerData = { ...correctionData.inventoryInputCorrectionHeader };
                if (headerData.inputActualDate) {
                    headerData.inputActualDate = new Date(headerData.inputActualDate) as any;
                }
                if (headerData.inputPlanDate) {
                    headerData.inputPlanDate = new Date(headerData.inputPlanDate) as any;
                }
                this.inventoryForm.get('header')?.patchValue(headerData);
                // Clear and populate details FormArray
                const detailsArray = this.inventoryForm.get('details') as FormArray;
                detailsArray.clear();
                correctionData.inventoryInputCorrectionDetails.forEach(detail => {
                    detailsArray.push(this.createDetailFormGroup(detail));
                });
            },
            error: (err) => console.error('Error loading data:', err)
        });
    }

    private createDetailFormGroup(detail?: InventoryInputCorrectionDetail): FormGroup {
        const isExisting = !!detail?.actualDetailId;
        let datetimeMng = detail?.datetimeMng ? new Date(detail.datetimeMng) : '';
        let inputActualDate = detail?.inputActualDate ? new Date(detail.inputActualDate) : (isExisting ? '' : new Date(this.currentDate));

        return this.fb.group({
            datetimeMng: [{ value: datetimeMng, disabled: isExisting || detail?.isDatetimeMng === '0' }],
            actualDetailId: [detail?.actualDetailId || null],
            inventoryInputId: [detail?.inventoryInputId || null],
            companyId: [detail?.companyId || null],
            productId: [detail?.productId || null],
            repositoryId: [{ value: detail?.repositoryId || null, disabled: isExisting }, Validators.required],
            locationId: [detail?.locationId || null],
            numberMng: [{ value: detail?.numberMng || '', disabled: isExisting || detail?.isNumberMng === '0' }],
            csActualQuantity: [{ value: detail?.csActualQuantity || null, disabled: !detail?.productId || detail?.isPackCsInput === '0' }],
            blActualQuantity: [{ value: detail?.blActualQuantity || null, disabled: !detail?.productId || detail?.isPackBlInput === '0' }],
            psActualQuantity: [{ value: detail?.psActualQuantity || null, disabled: !detail?.productId || detail?.isPieceInput === '0' }],
            totalActualQuantity: [detail?.totalActualQuantity || 0],
            inventoryProductType: [detail?.inventoryProductType || ''],
            detailNote: [detail?.detailNote || ''],
            correctionReason: [detail?.correctionReason || '入庫訂正'], // Default to '入庫訂正'
            productCode: [{ value: detail?.productCode || '', disabled: isExisting }, Validators.required],
            productName: [detail?.productName || ''],
            detailRepositoryCode: [detail?.detailRepositoryCode || ''],
            detailRepositoryName: [detail?.detailRepositoryName || ''],
            locationCode: [detail?.locationCode || ''],
            packCsUnitName: [detail?.packCsUnitName || ''],
            packBlUnitName: [detail?.packBlUnitName || ''],
            pieceUnitName: [detail?.pieceUnitName || ''],
            datetimeMngType: [detail?.datetimeMngType || '0'],
            isDatetimeMng: [detail?.isDatetimeMng || '0'],
            isNumberMng: [detail?.isNumberMng || '0'],
            isPackCsInput: [detail?.isPackCsInput || '0'],
            isPackBlInput: [detail?.isPackBlInput || '0'],
            isPieceInput: [detail?.isPieceInput || '0'],
            totalQuantityInput: [detail?.totalQuantityInput || 0],
            standardInfo: [detail?.standardInfo || ''],
            packCsAmount: [detail?.packCsAmount || 0],
            packBlAmount: [detail?.packBlAmount || 0],
            delFlg: [detail?.delFlg || '0'],
            // Added for UI compatibility
            originalQuantityCase: [detail?.csActualQuantity || 0],
            originalQuantityBall: [detail?.blActualQuantity || 0],
            originalQuantityUnit: [detail?.psActualQuantity || 0],
            originalTotalQuantity: [detail?.totalActualQuantity || 0],
            inputActualDate: [inputActualDate, Validators.required]
        });
    }

    addDetail(): void {
        const detailsArray = this.inventoryForm.get('details') as FormArray;
        detailsArray.push(this.createDetailFormGroup());
    }

    removeDetail(index: number): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '450px',
            panelClass: 'custom-dialog-container',
            data: {
                title: '確認',
                message: '商品を削除します。よろしいでしょうか。'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!result) return;

            setTimeout(() => {
                const detailsArray = this.inventoryForm.get('details') as FormArray;
                const formGroup = detailsArray.at(index) as FormGroup;
                const actualDetailId = formGroup.get('actualDetailId')?.value;

                if (actualDetailId) {
                    // Soft delete for existing items
                    formGroup.get('delFlg')?.setValue('1');
                } else {
                    // Physical delete for new items
                    detailsArray.removeAt(index);
                }

                // Manually trigger change detection to prevent NG0100
                this.cdr.detectChanges();

                const visibleControls = detailsArray.controls.filter(
                    c => c.get('delFlg')?.value !== '1'
                );

                if (visibleControls.length === 0) {
                    detailsArray.push(this.createDetailFormGroup());
                }
            }, 0);
        });
    }


    copyDetail(index: number): void {
        const detailsArray = this.inventoryForm.get('details') as FormArray;
        const sourceGroup = detailsArray.at(index) as FormGroup;

        const copyValues = { ...sourceGroup.getRawValue(), actualDetailId: null };
        detailsArray.push(this.createDetailFormGroup(copyValues));
    }


    onSave(): void {
        if (this.inventoryForm.invalid) return;

        const id = this.inventoryForm.get('header.inventoryInputId')?.value;
        const data = this.inventoryForm.getRawValue();

        if (id) {
            this.inventoryInputService.updateInventoryInputCorrection(id, data as InventoryInputCorrectionResponse).subscribe({
                next: () => {
                    console.log('Update successful');
                    console.log(data)
                    this.snackBar.open('保存しました。', '', {
                        duration: 3000,
                        panelClass: ['success-snackbar'],
                        horizontalPosition: 'start',
                        verticalPosition: 'bottom'
                    });
                    this.onBack();
                },
                error: (err) => {
                    console.error('Error updating plan:', err);
                    this.snackBar.open('登録に失敗しました。', '', {
                        duration: 3000,
                        panelClass: ['error-snackbar'],
                        horizontalPosition: 'start',
                        verticalPosition: 'bottom'
                    });
                }
            });
        } else {
            this.inventoryInputService.createInventoryInputActual(data as InventoryInputActualResponse).subscribe({
                next: () => {
                    this.snackBar.open('登録しました。', '', {
                        duration: 3000,
                        panelClass: ['success-snackbar'],
                        horizontalPosition: 'start',
                        verticalPosition: 'bottom'
                    });
                    this.onBack();
                },
                error: (err) => {
                    console.error('Error creating plan:', err);
                    this.snackBar.open('登録に失敗しました。', '', {
                        duration: 3000,
                        panelClass: ['error-snackbar'],
                        horizontalPosition: 'start',
                        verticalPosition: 'bottom'
                    });
                }
            });
        }
    }

    onDelete(): void {
        const id = this.inventoryForm.get('header.inventoryInputId')?.value;
        if (!id) return;

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '450px',
            panelClass: 'custom-dialog-container',
            data: {
                title: '確認',
                message: '伝票を削除します。よろしいでしょうか。'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.inventoryInputService.deleteInventoryInputPlan(id).subscribe({
                    next: () => {
                        this.snackBar.open('削除しました。', '', {
                            duration: 3000,
                            panelClass: ['success-snackbar'],
                            horizontalPosition: 'center',
                            verticalPosition: 'bottom'
                        });
                        this.onBack();
                    },
                    error: (err) => {
                        console.error('Error deleting plan:', err);
                        this.snackBar.open('削除に失敗しました。', '', {
                            duration: 3000,
                            panelClass: ['error-snackbar'],
                            horizontalPosition: 'center',
                            verticalPosition: 'bottom'
                        });
                    }
                });
            }
        });
    }

    onBack(): void {
        this.back.emit();
    }

    onRepositoryChanged(repo: Repository): void {
        this.detailsFormArray.controls.forEach(control => {
            control.patchValue({
                detailRepositoryCode: repo.repositoryCode,
                detailRepositoryName: repo.repositoryName,
                locationCode: '',
                repositoryId: repo.repositoryId,
                locationId: null
            });
        });
    }

    onToggleClose(): void {
        const isClosedControl = this.inventoryForm.get('header.isClosed');
        const currentValue = isClosedControl?.value;

        if (currentValue === '1') {
            // Unclose - no confirmation needed
            isClosedControl?.setValue('0');
            this.updateFormState(false);
        } else {
            // Close - show confirmation
            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                width: '450px',
                panelClass: 'custom-dialog-container',
                data: {
                    title: '確認',
                    message: 'クローズ済みに変更します。\nよろしいですか？\nクローズ済みに変更するとクローズ解除するまで編集できません。'
                }
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    isClosedControl?.setValue('1');
                    this.updateFormState(true);
                }
            });
        }
    }

    private updateFormState(isClosed: boolean): void {
        const headerGroup = this.inventoryForm.get('header') as FormGroup;
        const detailsArray = this.inventoryForm.get('details') as FormArray;

        if (isClosed) {
            // Disable all header controls except isClosed (which is handled by the button)
            Object.keys(headerGroup.controls).forEach(key => {
                if (key !== 'isClosed') {
                    headerGroup.get(key)?.disable({ emitEvent: false });
                }
            });

            // Disable all detail controls
            detailsArray.controls.forEach(group => {
                (group as FormGroup).disable({ emitEvent: false });
            });
        } else {
            // Enable header controls (with some exceptions based on existing logic)
            Object.keys(headerGroup.controls).forEach(key => {
                // Keep these disabled as they are readonly/auto or not editable in correction
                if (['inputPlanDate', 'createSlipType', 'slipNo', 'actualSupplierSlipNo', 'actualRepositoryId', 'destinationCode', 'departmentName', 'supplierCode', 'supplierName', 'customerCode', 'customerName'].includes(key)) {
                    headerGroup.get(key)?.disable({ emitEvent: false });
                } else {
                    headerGroup.get(key)?.enable({ emitEvent: false });
                }
            });

            // Enable detail controls (with some exceptions based on product settings)
            detailsArray.controls.forEach(group => {
                const fg = group as FormGroup;
                fg.enable({ emitEvent: false });

                // Re-apply specific disable logic for details
                const isExisting = !!fg.get('actualDetailId')?.value;
                if (isExisting) {
                    fg.get('repositoryId')?.disable({ emitEvent: false });
                    fg.get('numberMng')?.disable({ emitEvent: false });
                    fg.get('datetimeMng')?.disable({ emitEvent: false });
                } else {
                    if (fg.get('isDatetimeMng')?.value === '0') fg.get('datetimeMng')?.disable({ emitEvent: false });
                    if (fg.get('isNumberMng')?.value === '0') fg.get('numberMng')?.disable({ emitEvent: false });
                }

                if (fg.get('isPackCsInput')?.value === '0') fg.get('csActualQuantity')?.disable({ emitEvent: false });
                if (fg.get('isPackBlInput')?.value === '0') fg.get('blActualQuantity')?.disable({ emitEvent: false });
                if (fg.get('isPieceInput')?.value === '0') fg.get('psActualQuantity')?.disable({ emitEvent: false });

                if (!fg.get('repositoryId')?.value) {
                    fg.get('locationCode')?.disable({ emitEvent: false });
                }
            });
        }
        this.cdr.detectChanges();
    }

    get headerFormGroup(): FormGroup {
        return this.inventoryForm.get('header') as FormGroup;
    }

    get detailsFormArray(): FormArray {
        return this.inventoryForm.get('details') as FormArray;
    }

}
