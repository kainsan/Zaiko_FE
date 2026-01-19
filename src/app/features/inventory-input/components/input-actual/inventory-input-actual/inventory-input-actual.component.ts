import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryInputActualHeaderComponent } from '../inventory-input-actual-header/inventory-input-actual-header.component';
import { InventoryInputActualListComponent } from '../inventory-input-actual-list/inventory-input-actual-list.component';
import { InventoryInputService } from '../../../services/inventory-input.service';
import { InventoryInputPlanDetail, InventoryInputPlanResponse } from '../../../models/inventory-input.model';
import { RepositoriesService } from '../../../../master-product/services/repostories.service';
import { Repository } from '../../../../master-product/model/product.model';
import { Location } from '../../../../master-product/model/product.model';
import { Observable } from 'rxjs/internal/Observable';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { InventoryInputPlanHeaderComponent } from '../../input-plan/inventory-input-plan-header/inventory-input-plan-header.component';

@Component({
    selector: 'app-inventory-input-plan',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InventoryInputPlanHeaderComponent,
        InventoryInputActualListComponent
    ],
    templateUrl: './inventory-input-actual.component.html',
    styleUrls: ['./inventory-input-actual.component.scss']
})
export class InventoryInputActualComponent implements OnInit, OnChanges {
    @Input() inventoryInputId: number | null = null;
    @Output() back = new EventEmitter<void>();
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

    private initializeForm(inventoryInputData?: InventoryInputPlanResponse): void {
        this.inventoryForm = this.fb.group({
            header: this.fb.group({
                inventoryInputId: [inventoryInputData?.inventoryInputPlanHeader && inventoryInputData?.inventoryInputPlanHeader.inventoryInputId
                    ? inventoryInputData?.inventoryInputPlanHeader.inventoryInputId : null],
                companyId: [null],
                inputPlanDate: ['', Validators.required],
                inputActualDate: [''],
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
                customerCode: [''],
                customerName: [''],
                repositoryCode: [''],
                repositoryName: ['']
            }),
            details: inventoryInputData?.inventoryInputPlanDetails && inventoryInputData.inventoryInputPlanDetails.length > 0
                ? this.fb.array(inventoryInputData?.inventoryInputPlanDetails.map(x => this.createDetailFormGroup(x))) : this.fb.array([])
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
        if (!inventoryInputData?.inventoryInputPlanHeader.inventoryInputId) {
            this.inventoryForm.get('header.planRepositoryId')?.valueChanges.subscribe((e: number | null) => {
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
        this.inventoryInputService.getInventoryInputById(id).subscribe({
            next: (data: InventoryInputPlanResponse) => {
                // Patch header data

                const headerData = { ...data.inventoryInputPlanHeader };
                if (headerData.inputPlanDate) {
                    headerData.inputPlanDate = new Date(headerData.inputPlanDate) as any;
                }
                this.inventoryForm.get('header')?.patchValue(headerData);
                // Clear and populate details FormArray
                const detailsArray = this.inventoryForm.get('details') as FormArray;
                detailsArray.clear();
                data.inventoryInputPlanDetails.forEach(detail => {
                    detailsArray.push(this.createDetailFormGroup(detail));
                });
            },
            error: (err) => console.error('Error loading data:', err)
        });
    }

    private createDetailFormGroup(detail?: InventoryInputPlanDetail): FormGroup {
        let datetimeMng = detail?.datetimeMng ? new Date(detail.datetimeMng) : '';
        // console.log(detail)
        return this.fb.group({
            datetimeMng: [{ value: datetimeMng, disabled: detail?.isDatetimeMng === '0' }],
            planDetailId: [detail?.planDetailId || null],
            inventoryInputId: [detail?.inventoryInputId || null],
            companyId: [detail?.companyId || null],
            productId: [detail?.productId || null],
            repositoryId: [detail?.repositoryId || null, Validators.required],
            locationId: [detail?.locationId || null],
            numberMng: [{ value: detail?.numberMng || '', disabled: detail?.isNumberMng === '0' }],
            csPlanQuantity: [{ value: detail?.csPlanQuantity || null, disabled: !detail?.productId || detail?.isPackCsInput === '0' }],
            blPlanQuantity: [{ value: detail?.blPlanQuantity || null, disabled: !detail?.productId || detail?.isPackBlInput === '0' }],
            psPlanQuantity: [{ value: detail?.psPlanQuantity || null, disabled: !detail?.productId || detail?.isPieceInput === '0' }],
            totalPlanQuantity: [detail?.totalPlanQuantity || 0],
            inventoryProductType: [detail?.inventoryProductType || ''],
            detailNote: [detail?.detailNote || ''],
            freeItem1: [detail?.freeItem1 || ''],
            freeItem2: [detail?.freeItem2 || ''],
            freeItem3: [detail?.freeItem3 || ''],
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
            totalActualQuantity: [detail?.totalActualQuantity || 0],
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
                const planDetailId = formGroup.get('planDetailId')?.value;

                if (planDetailId) {
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

        const copyValues = { ...sourceGroup.getRawValue(), planDetailId: null };
        detailsArray.push(this.createDetailFormGroup(copyValues));
    }


    onSave(): void {
        if (this.inventoryForm.invalid) return;

        const id = this.inventoryForm.get('header.inventoryInputId')?.value;
        const data = this.inventoryForm.getRawValue();

        if (id) {
            this.inventoryInputService.updateInventoryInputPlan(id, data as InventoryInputPlanResponse).subscribe({
                next: () => {
                    console.log('Update successful');
                    // console.log(data);
                    this.snackBar.open('保存しました。', '', {
                        duration: 3000,
                        panelClass: ['success-snackbar'],
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    });
                },
                error: (err) => {
                    console.error('Error updating plan:', err);
                    this.snackBar.open('登録に失敗しました。', '', {
                        duration: 3000,
                        panelClass: ['error-snackbar'],
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    });
                }
            });
        } else {
            this.inventoryInputService.createInventoryInputPlan(data as InventoryInputPlanResponse).subscribe({
                next: () => {
                    this.snackBar.open('登録しました。', '', {
                        duration: 3000,
                        panelClass: ['success-snackbar'],
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    });
                    this.onBack();
                },
                error: (err) => {
                    console.error('Error creating plan:', err);
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

    get headerFormGroup(): FormGroup {
        return this.inventoryForm.get('header') as FormGroup;
    }

    get detailsFormArray(): FormArray {
        return this.inventoryForm.get('details') as FormArray;
    }

}
