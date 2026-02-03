import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryInputActualHeaderComponent } from '../inventory-input-actual-header/inventory-input-actual-header.component';
import { InventoryInputActualListComponent } from '../inventory-input-actual-list/inventory-input-actual-list.component';
import { InventoryInputService } from '../../../services/inventory-input.service';
import { InventoryInputActualDetail, InventoryInputActualResponse } from '../../../models/inventory-input.model';
import { RepositoriesService } from '../../../../master-product/services/repostories.service';
import { Repository } from '../../../../master-product/model/product.model';
import { Location } from '../../../../master-product/model/product.model';
import { Observable } from 'rxjs/internal/Observable';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-inventory-input-actual',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InventoryInputActualHeaderComponent,
        InventoryInputActualListComponent
    ],
    templateUrl: './inventory-input-actual.component.html',
    styleUrls: ['./inventory-input-actual.component.scss']
})
export class InventoryInputActualComponent implements OnInit, OnChanges {
    @Input() inventoryInputId: number | null = null;
    @Output() back = new EventEmitter<void>();
    @Output() navigateToCorrection = new EventEmitter<number>();
    locations = signal<Location[]>([]);
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

    private initializeForm(inventoryInputData?: InventoryInputActualResponse): void {
        this.inventoryForm = this.fb.group({
            header: this.fb.group({
                inventoryInputId: [inventoryInputData?.inventoryInputActualHeader && inventoryInputData?.inventoryInputActualHeader.inventoryInputId
                    ? inventoryInputData?.inventoryInputActualHeader.inventoryInputId : null],
                companyId: [null],
                inputPlanDate: [{ value: '', disabled: true }],
                inputActualDate: ['', Validators.required],
                createSlipType: ['0'], // Default to Auto
                slipNo: [{ value: '', disabled: false }], // Default to disabled
                planSupplierSlipNo: [''],
                actualSupplierSlipNo: [''],
                planSlipNote: [''],
                actualSlipNote: [''],
                planSupplierDeliveryDestinationId: [null],
                actualSupplierDeliveryDestinationId: [null],
                planSupplierId: [null],
                actualSupplierId: [null],
                productOwnerId: [null],
                planRepositoryId: [null],
                actualRepositoryId: [null],
                inputStatus: [''],
                sumPlanQuantity: [null],
                sumActualQuantity: [null],
                isClosed: [''],
                freeItem1: [''],
                freeItem2: [''],
                freeItem3: [''],
                contactStatus: [''],
                destinationCode: [''],
                departmentName: [''],
                planSupplierCode: [''],
                planSupplierName: [''],
                supplierCode: [''],
                supplierName: [''],
                customerCode: [''],
                customerName: [''],
                repositoryCode: [''],
                repositoryName: ['']
            }),
            details: inventoryInputData?.inventoryInputActualDetails && inventoryInputData.inventoryInputActualDetails.length > 0
                ? this.fb.array(inventoryInputData?.inventoryInputActualDetails.map(x => this.createDetailFormGroup(x))) : this.fb.array([])
        });

        // Subscribe to createSlipType changes
        this.inventoryForm.get('header.createSlipType')?.valueChanges.subscribe(value => {
            const slipNoControl = this.inventoryForm.get('header.slipNo');
            if (value === '1') { // Manual
                slipNoControl?.enable();
            } else { // Auto
                slipNoControl?.disable();
            }
        });
        if (!inventoryInputData?.inventoryInputActualHeader.inventoryInputId) {
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

    private loadData(id: number): void {
        this.inventoryInputService.getInventoryInputActualById(id).subscribe({
            next: (actualData: InventoryInputActualResponse) => {
                // Patch header data
                console.log(actualData);
                const headerData = { ...actualData.inventoryInputActualHeader };
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
                actualData.inventoryInputActualDetails.forEach(detail => {
                    detailsArray.push(this.createDetailFormGroup(detail));
                });
            },
            error: (err) => console.error('Error loading data:', err)
        });
    }

    private createDetailFormGroup(detail?: InventoryInputActualDetail): FormGroup {
        let datetimeMng = detail?.datetimeMng ? new Date(detail.datetimeMng) : '';
        // console.log(detail)
        return this.fb.group({
            datetimeMng: [{ value: datetimeMng, disabled: detail?.isDatetimeMng === '0' }],
            actualDetailId: [detail?.actualDetailId || null],
            inventoryInputId: [detail?.inventoryInputId || null],
            companyId: [detail?.companyId || null],
            productId: [detail?.productId || null],
            repositoryId: [detail?.repositoryId || null, Validators.required],
            locationId: [detail?.locationId || null],
            numberMng: [{ value: detail?.numberMng || '', disabled: detail?.isNumberMng === '0' }],
            csActualQuantity: [{ value: detail?.csActualQuantity || null, disabled: !detail?.productId || detail?.isPackCsInput === '0' }],
            blActualQuantity: [{ value: detail?.blActualQuantity || null, disabled: !detail?.productId || detail?.isPackBlInput === '0' }],
            psActualQuantity: [{ value: detail?.psActualQuantity || null, disabled: !detail?.productId || detail?.isPieceInput === '0' }],
            totalActualQuantity: [detail?.totalActualQuantity || 0],
            inventoryProductType: [detail?.inventoryProductType || ''],
            detailNote: [detail?.detailNote || ''],
            productCode: [detail?.productCode || '', Validators.required],
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
            delFlg: [detail?.delFlg || '0']
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

        // STEP 1: Calculate and update sum quantities from details (NO API call yet)
        this.calculateAndUpdateSumQuantities();

        // STEP 2: Get calculated values
        const sumActualQty = this.inventoryForm.get('header.sumActualQuantity')?.value || 0;
        const sumPlanQty = this.inventoryForm.get('header.sumPlanQuantity')?.value || 0;

        console.log('Compare quantities:', { sumActualQty, sumPlanQty });

        // STEP 3: Compare quantities
        if (sumActualQty === sumPlanQty) {
            // Quantities match - do nothing, no API call, no navigation
            console.log('Quantities match - no action needed');
            return;
        }

        // STEP 4: Quantities differ - show confirmation dialog
        this.showQuantityMismatchDialog(sumPlanQty, sumActualQty);
    }

    // Show dialog when quantities don't match
    private showQuantityMismatchDialog(planQty: number, actualQty: number): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '450px',
            data: {
                title: '数量確認',
                message: `予定数量と実績数量が一致しません。\n\n` +
                    `予定数量: ${planQty}\n` +
                    `実績数量: ${actualQty}\n\n` +
                    `保存してよろしいですか？`
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                // User confirmed - call API
                this.performSave();
            }
            // User cancelled - do nothing
        });
    }

    // Perform actual save operation (called after confirmation)
    private performSave(): void {
        const id = this.inventoryForm.get('header.inventoryInputId')?.value;
        const data = this.inventoryForm.getRawValue();

        if (id) {
            // UPDATE case
            this.inventoryInputService.updateInventoryInputActual(id, data as InventoryInputActualResponse).subscribe({
                next: () => {
                    console.log('Update successful');
                    this.snackBar.open('保存しました。', '', {
                        duration: 3000,
                        panelClass: ['success-snackbar'],
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    });
                    // Navigate to correction screen
                    this.navigateToCorrection.emit(id);
                },
                error: (err) => {
                    console.error('Error updating actual:', err);
                    this.snackBar.open('登録に失敗しました。', '', {
                        duration: 3000,
                        panelClass: ['error-snackbar'],
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    });
                }
            });
        } else {
            // CREATE case
            this.inventoryInputService.createInventoryInputActual(data as InventoryInputActualResponse).subscribe({
                next: (response: any) => {
                    this.snackBar.open('登録しました。', '', {
                        duration: 3000,
                        panelClass: ['success-snackbar'],
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    });
                    // Navigate to correction screen with new ID from response
                    const newId = response?.inventoryInputId;
                    if (newId) {
                        this.navigateToCorrection.emit(newId);
                    } else {
                        console.error('No inventoryInputId in response');
                        this.onBack();
                    }
                },
                error: (err) => {
                    console.error('Error creating actual:', err);
                    this.snackBar.open('登録に失敗しました。', '', {
                        duration: 3000,
                        panelClass: ['error-snackbar'],
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    });
                }
            });
        }
    }

    // Calculate sum of all detail quantities and update header
    private calculateAndUpdateSumQuantities(): void {
        const detailsArray = this.inventoryForm.get('details') as FormArray;
        let sumActualQuantity = 0;

        detailsArray.controls.forEach(control => {
            const delFlg = control.get('delFlg')?.value;
            // Only count non-deleted items
            if (delFlg !== '1') {
                const totalActualQty = control.get('totalActualQuantity')?.value || 0;
                sumActualQuantity += Number(totalActualQty);
            }
        });

        // Update header with calculated sum
        this.inventoryForm.get('header.sumActualQuantity')?.patchValue(sumActualQuantity, { emitEvent: false });
        console.log('Calculated sumActualQuantity:', sumActualQuantity);
    }

    // Check if total actual quantity exceeds total plan quantity
    private shouldShowQuantityConfirm(): boolean {
        const sumActualQty = this.inventoryForm.get('header.sumActualQuantity')?.value || 0;
        const sumPlanQty = this.inventoryForm.get('header.sumPlanQuantity')?.value || 0;
        return sumActualQty > sumPlanQty;
    }

    // Show confirmation dialog when actual quantity exceeds plan
    private showQuantityConfirmDialog(): Promise<boolean> {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: '確認',
                message: '入庫実績が入庫予定を超えています。伝票を締めますか？'
            }
        });

        return new Promise((resolve) => {
            dialogRef.afterClosed().subscribe(result => {
                resolve(result === true);
            });
        });
    }

    // Navigate to correction screen with optional confirmation
    private navigateToCorrectionScreen(inventoryInputId: number): void {
        if (this.shouldShowQuantityConfirm()) {
            // Show confirm dialog if quantity exceeds
            this.showQuantityConfirmDialog().then(() => {
                // Navigate regardless of confirmation result
                this.navigateToCorrection.emit(inventoryInputId);
            }).catch(() => {
                // Even if dialog errors, still navigate
                this.navigateToCorrection.emit(inventoryInputId);
            });
        } else {
            // Direct navigation if quantity is normal
            this.navigateToCorrection.emit(inventoryInputId);
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

    onToggleClose(): void {
        const isClosedControl = this.inventoryForm.get('header.isClosed');
        const currentValue = isClosedControl?.value;
        const id = this.inventoryForm.get('header.inventoryInputId')?.value;

        if (currentValue === '1') {
            // Unclose - no confirmation needed
            if (id) {
                this.inventoryInputService.updateInventoryInputStatus(id, '0').subscribe({
                    next: () => {
                        isClosedControl?.setValue('0');
                        this.updateDetailsState(false);
                        this.snackBar.open('クローズ解除しました。', '', {
                            duration: 3000,
                            panelClass: ['success-snackbar'],
                            horizontalPosition: 'start',
                            verticalPosition: 'bottom'
                        });
                        this.cdr.detectChanges();
                    },
                    error: (err) => {
                        console.error('Error updating status:', err);
                        this.snackBar.open('クローズ解除に失敗しました。', '', {
                            duration: 3000,
                            panelClass: ['error-snackbar'],
                            horizontalPosition: 'start',
                            verticalPosition: 'bottom'
                        });
                    }
                });
            }
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
                    if (id) {
                        this.inventoryInputService.updateInventoryInputStatus(id, '1').subscribe({
                            next: () => {
                                isClosedControl?.setValue('1');
                                this.updateDetailsState(true);
                                this.snackBar.open('クローズしました。', '', {
                                    duration: 3000,
                                    panelClass: ['success-snackbar'],
                                    horizontalPosition: 'start',
                                    verticalPosition: 'bottom'
                                });
                                this.cdr.detectChanges();
                            },
                            error: (err) => {
                                console.error('Error updating status:', err);
                                this.snackBar.open('クローズに失敗しました。', '', {
                                    duration: 3000,
                                    panelClass: ['error-snackbar'],
                                    horizontalPosition: 'start',
                                    verticalPosition: 'bottom'
                                });
                            }
                        });
                    }
                }
            });
        }
    }

    private updateDetailsState(isClosed: boolean): void {
        const detailsArray = this.inventoryForm.get('details') as FormArray;
        if (isClosed) {
            detailsArray.controls.forEach(group => {
                (group as FormGroup).disable({ emitEvent: false });
            });
        } else {
            detailsArray.controls.forEach(group => {
                const fg = group as FormGroup;
                fg.enable({ emitEvent: false });
                // Re-apply specific disable logic
                const isExisting = !!fg.get('actualDetailId')?.value;
                if (fg.get('isDatetimeMng')?.value === '0') fg.get('datetimeMng')?.disable({ emitEvent: false });
                if (fg.get('isNumberMng')?.value === '0') fg.get('numberMng')?.disable({ emitEvent: false });

                if (fg.get('isPackCsInput')?.value === '0') fg.get('csActualQuantity')?.disable({ emitEvent: false });
                if (fg.get('isPackBlInput')?.value === '0') fg.get('blActualQuantity')?.disable({ emitEvent: false });
                if (fg.get('isPieceInput')?.value === '0') fg.get('psActualQuantity')?.disable({ emitEvent: false });
            });
        }
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

    get headerFormGroup(): FormGroup {
        return this.inventoryForm.get('header') as FormGroup;
    }

    get detailsFormArray(): FormArray {
        return this.inventoryForm.get('details') as FormArray;
    }

}
