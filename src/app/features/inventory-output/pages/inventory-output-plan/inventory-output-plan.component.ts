import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryOutputPlanHeaderComponent } from './inventory-output-plan-header/inventory-output-plan-header.component';
import { InventoryOutputPlanListComponent } from './inventory-output-plan-list/inventory-output-plan-list.component';
import { InventoryOutputService } from '../../services/inventory-output.service';
import { InventoryOutputPlanDetail, InventoryOutputPlanResponse } from '../../models/inventory-output.model';
import { RepositoriesService } from '../../../master-product/services/repostories.service';
import { Repository } from '../../../master-product/model/product.model';
import { Location } from '../../../master-product/model/product.model';
import { Observable } from 'rxjs/internal/Observable';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../inventory-input/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-inventory-output-plan',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InventoryOutputPlanHeaderComponent,
        InventoryOutputPlanListComponent
    ],
    templateUrl: './inventory-output-plan.component.html',
    styleUrls: ['./inventory-output-plan.component.scss']
})
export class InventoryOutputPlanComponent implements OnChanges {
    @Input() inventoryInputId: number | null = null; // Actually InventoryOutputId, keeping name for consistency if passed from parent
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
        private inventoryOutputService: InventoryOutputService,
        private repositoriesService: RepositoriesService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef
    ) {
        this.initializeForm();
    }

    // ngOnInit(): void {
    //     if (this.inventoryInputId) {
    //         this.loadData(this.inventoryInputId);
    //     }
    //     // this.inventoryForm.statusChanges.subscribe(() => {
    //     //     this.isFormInvalid = this.inventoryForm.invalid;
    //     // });
    // }

    public getLocationByRepositoryId(repositoryId: number): Observable<Location[]> {
        return this.repositoriesService.getLocationsByRepository(repositoryId);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['inventoryInputId']?.currentValue) {
            this.loadData(changes['inventoryInputId'].currentValue);
        }
    }

    private initializeForm(inventoryOutputData?: InventoryOutputPlanResponse): void {
        this.inventoryForm = this.fb.group({
            header: this.fb.group({
                inventoryOutputId: [inventoryOutputData?.inventoryOutputPlanHeader && inventoryOutputData?.inventoryOutputPlanHeader.inventoryOutputId
                    ? inventoryOutputData?.inventoryOutputPlanHeader.inventoryOutputId : null],
                companyId: [null],
                orderDate: [null],
                planOutputDate: ['', Validators.required],
                planWorkingDate: [null, Validators.required],
                planDeliverDate: [null, Validators.required],
                actualOutputDate: [null],
                actualDeliverDate: [null],
                createSlipType: ['0'],
                slipNo: [{ value: '', disabled: false }],
                planSupplierSlipNo: [''],
                actualSupplierSlipNo: [''],
                slipNote: [''],

                planDestinationCode: [''],
                planDestinationName: [''],
                actualDestinationCode: [''],
                actualDestinationName: [''],

                planCustomerCode: [''],
                planCustomerName: [''],
                actualCustomerCode: [''],
                actualCustomerName: [''],

                planRepositoryId: [null],
                planRepositoryCode: [''],
                planRepositoryName: [''],

                actualRepositoryId: [null],
                actualRepositoryCode: [''],
                actualRepositoryName: [''],

                newDestinationName: [''],
                routeCode: [''],
                courseCode: [''],
                phoneNumber: [''],
                faxNumber: [''],
                postCode: [''],
                address1: [''],
                address2: [''],
                address3: [''],
                address4: [''],
                isManualDestination: ['0'],

                inputStatus: [''], // outputStatus in JSON
                sumPlanQuantity: [null],
                sumActualQuantity: [null],
                isClosed: [''],
                batchStatus: [''],
                checked: [''],
                deliverDestinationName: [''],

                // Internal IDs
                planCustomerDeliveryDestinationId: [null],
                actualCustomerDeliveryDestinationId: [null],
                planCustomerId: [null],
                actualCustomerId: [null],
            }),
            details: inventoryOutputData?.inventoryOutputPlanDetails && inventoryOutputData.inventoryOutputPlanDetails.length > 0
                ? this.fb.array(inventoryOutputData?.inventoryOutputPlanDetails.map(x => this.createDetailFormGroup(x))) : this.fb.array([])
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

        // Subscribe to isManualDestination changes
        this.inventoryForm.get('header.isManualDestination')?.valueChanges.subscribe(value => {
            if (this.inventoryForm.get('header.isClosed')?.value !== '1') {
                this.updateFormState(false);
            }
        });

        // Logic to update repository in details when header repository changes (for new items)
        if (!inventoryOutputData?.inventoryOutputPlanHeader.inventoryOutputId) {
            this.inventoryForm.get('header.planRepositoryId')?.valueChanges.subscribe((e: number | null) => {
                if (e) {
                    this.getLocationByRepositoryId(e).subscribe(res => {
                        if (res) {
                            (this.inventoryForm.get('details') as FormArray).controls.forEach(el => {
                                el.get('repositoryId')?.setValue(e);
                            })
                        }
                    });
                }
            });
        }
    }

    private loadData(id: number): void {
        this.inventoryOutputService.getInventoryOutputById(id).subscribe({
            next: (data: InventoryOutputPlanResponse) => {
                const headerData = { ...data.inventoryOutputPlanHeader };

                // Convert date strings to Date objects for Datepicker
                if (headerData.planOutputDate) headerData.planOutputDate = new Date(headerData.planOutputDate) as any;
                if (headerData.orderDate) headerData.orderDate = new Date(headerData.orderDate) as any;
                if (headerData.planWorkingDate) headerData.planWorkingDate = new Date(headerData.planWorkingDate) as any;
                if (headerData.planDeliverDate) headerData.planDeliverDate = new Date(headerData.planDeliverDate) as any;

                this.inventoryForm.get('header')?.patchValue(headerData);

                const detailsArray = this.inventoryForm.get('details') as FormArray;
                detailsArray.clear();
                data.inventoryOutputPlanDetails.forEach(detail => {
                    detailsArray.push(this.createDetailFormGroup(detail));
                });

                this.updateFormState(headerData.isClosed === '1');
            },
            error: (err) => console.error('Error loading data:', err)
        });
    }

    private createDetailFormGroup(detail?: InventoryOutputPlanDetail): FormGroup {
        let datetimeMng = detail?.datetimeMng ? new Date(detail.datetimeMng) : '';
        return this.fb.group({
            planDetailId: [detail?.planDetailId || null],
            inventoryOutputId: [detail?.inventoryOutputId || null],
            companyId: [detail?.companyId || null],
            productId: [detail?.productId || null],
            repositoryId: [detail?.repositoryId || null, Validators.required],
            locationId: [detail?.locationId || null],

            // Quantities
            csPlanQuantity: [{ value: detail?.csPlanQuantity || null, disabled: !detail?.productId || detail?.isPackCsInput === '0' }],
            blPlanQuantity: [{ value: detail?.blPlanQuantity || null, disabled: !detail?.productId || detail?.isPackBlInput === '0' }],
            psPlanQuantity: [{ value: detail?.psPlanQuantity || null, disabled: !detail?.productId || detail?.isPieceInput === '0' }],
            totalPlanQuantity: [detail?.totalPlanQuantity || 0],

            inventoryProductType: [detail?.inventoryProductType || ''],
            detailNote: [detail?.detailNote || ''], // Unused?

            // Product Info
            productCode: [detail?.productCode || '', Validators.required],
            productName: [detail?.productName || ''],
            standardInfo: [detail?.standardInfo || ''],

            // Repository Info
            detailRepositoryCode: [detail?.detailRepositoryCode || ''],
            detailRepositoryName: [detail?.detailRepositoryName || ''],
            locationCode: [detail?.locationCode || ''],

            // Management
            datetimeMng: [{ value: datetimeMng, disabled: detail?.isDatetimeMng === '0' }],
            numberMng: [{ value: detail?.numberMng || '', disabled: detail?.isNumberMng === '0' }],

            // Metadata / Config from Product Master
            isDatetimeMng: [detail?.isDatetimeMng || '0'],
            isNumberMng: [detail?.isNumberMng || '0'],
            isPackCsInput: [detail?.isPackCsInput || '0'],
            isPackBlInput: [detail?.isPackBlInput || '0'],
            isPieceInput: [detail?.isPieceInput || '0'],

            packCsUnitName: [detail?.packCsUnitName || ''],
            packBlUnitName: [detail?.packBlUnitName || ''],
            pieceUnitName: [detail?.pieceUnitName || ''],

            packCsAmount: [detail?.packCsAmount || 0],
            packBlAmount: [detail?.packBlAmount || 0],

            totalQuantityInput: [detail?.totalQuantityInput || 0],
            supplierCode: [detail?.supplierCode || ''],
            supplierName: [detail?.supplierName || ''],
            ownerCode: [detail?.ownerCode || ''],
            ownerName: [detail?.ownerName || ''],
            inventoryStatus: [detail?.inventoryProductType || ''], // Mapping inventoryProductType to inventoryStatus for now

            // New fields
            datetimeMngFrom: [detail?.datetimeMngFrom ? new Date(detail.datetimeMngFrom) : null],
            datetimeMngTo: [detail?.datetimeMngTo ? new Date(detail.datetimeMngTo) : null],
            numberMngFrom: [detail?.numberMngFrom || null],
            numberMngTo: [detail?.numberMngTo || null],
            productOwnerId: [detail?.productOwnerId || null],
            supplierId: [detail?.supplierId || null],
            planCsPrice: [detail?.planCsPrice || 0],
            planBlPrice: [detail?.planBlPrice || 0],
            planPiecePrice: [detail?.planPiecePrice || 0],
            tax: [detail?.tax || 0],
            amountTotal: [detail?.amountTotal || 0],
            batchStatus: [detail?.batchStatus || ''],
            batchNo: [detail?.batchNo || ''],
            billingPackType: [detail?.billingPackType || ''],
            isBatchInprogress: [detail?.isBatchInprogress || 0],

            totalActualQuantity: [detail?.totalActualQuantity || 0],

            saleCsPrice: [detail?.saleCsPrice || 0],
            saleBlPrice: [detail?.saleBlPrice || 0],
            salePiecePrice: [detail?.salePiecePrice || 0],

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
                    formGroup.get('delFlg')?.setValue('1');
                } else {
                    detailsArray.removeAt(index);
                }

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
        this.calculateAndUpdateSumPlanQuantity();
        const id = this.inventoryForm.get('header.inventoryOutputId')?.value;
        const data = this.inventoryForm.getRawValue();

        // Map form fields back to API expected keys if necessary, or ensure form keys match.
        // Assuming backend DTO matches the model, which matches my form (mostly).

        if (id) {
            this.inventoryOutputService.updateInventoryOutputPlan(id, data as InventoryOutputPlanResponse).subscribe({
                next: () => {
                    this.snackBar.open('保存しました。', '', { duration: 3000, panelClass: ['success-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
                },
                error: (err) => {
                    console.error('Error updating:', err);
                    this.snackBar.open('登録に失敗しました。', '', { duration: 3000, panelClass: ['error-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
                }
            });
        } else {
            this.inventoryOutputService.createInventoryOutputPlan(data as InventoryOutputPlanResponse).subscribe({
                next: () => {
                    this.snackBar.open('登録しました。', '', { duration: 3000, panelClass: ['success-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
                    this.onBack();
                },
                error: (err) => {
                    console.error('Error creating:', err);
                    this.snackBar.open('登録に失敗しました。', '', { duration: 3000, panelClass: ['error-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
                }
            });
        }
    }

    private calculateAndUpdateSumPlanQuantity(): void {
        const detailsArray = this.inventoryForm.get('details') as FormArray;
        let sumPlanQuantity = 0;
        detailsArray.controls.forEach(control => {
            if (control.get('delFlg')?.value !== '1') {
                const totalPlanQty = control.get('totalPlanQuantity')?.value || 0;
                sumPlanQuantity += Number(totalPlanQty);
            }
        });
        this.inventoryForm.get('header.sumPlanQuantity')?.patchValue(sumPlanQuantity, { emitEvent: false });
    }

    onDelete(): void {
        const id = this.inventoryForm.get('header.inventoryOutputId')?.value;
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
                this.inventoryOutputService.deleteInventoryOutputPlan(id).subscribe({
                    next: () => {
                        this.snackBar.open('削除しました。', '', { duration: 3000, panelClass: ['success-snackbar'], horizontalPosition: 'start', verticalPosition: 'bottom' });
                        this.onBack();
                    },
                    error: (err) => this.snackBar.open('削除に失敗しました。', '', { duration: 3000, panelClass: ['error-snackbar'], horizontalPosition: 'start', verticalPosition: 'bottom' })
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
        const id = this.inventoryForm.get('header.inventoryOutputId')?.value;

        if (!id) return;

        if (currentValue === '1') {
            this.updateStatus(id, '0');
        } else {
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
                    this.updateStatus(id, '1');
                }
            });
        }
    }

    private updateStatus(id: number, status: string): void {
        this.inventoryOutputService.updateInventoryOutputStatus(id, status).subscribe({
            next: () => {
                this.inventoryForm.get('header.isClosed')?.setValue(status);
                this.updateFormState(status === '1');
                const message = status === '1' ? 'クローズしました。' : 'クローズ解除しました。';
                this.snackBar.open(message, '', { duration: 3000, panelClass: ['success-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            },
            error: (err) => this.snackBar.open('ステータス更新に失敗しました。', '', { duration: 3000, panelClass: ['error-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' })
        });
    }

    private updateFormState(isClosed: boolean): void {
        const headerGroup = this.inventoryForm.get('header') as FormGroup;
        const detailsArray = this.inventoryForm.get('details') as FormArray;

        if (isClosed) {
            Object.keys(headerGroup.controls).forEach(key => {
                if (key !== 'isClosed') headerGroup.get(key)?.disable({ emitEvent: false });
            });
            detailsArray.controls.forEach(group => (group as FormGroup).disable({ emitEvent: false }));
        } else {
            Object.keys(headerGroup.controls).forEach(key => {
                // Logic to keep readonly fields disabled
                const readOnlyFields = ['slipNo', 'planDestinationName', 'planCustomerCode', 'planCustomerName', 'planRepositoryName', 'actualRepositoryName'];
                const manualDestinationFields = ['newDestinationName', 'phoneNumber', 'faxNumber', 'postCode', 'address1', 'address2', 'address3', 'address4'];

                if (readOnlyFields.includes(key)) {
                    headerGroup.get(key)?.disable({ emitEvent: false });
                } else if (manualDestinationFields.includes(key)) {
                    if (headerGroup.get('isManualDestination')?.value === '1') {
                        headerGroup.get(key)?.enable({ emitEvent: false });
                    } else {
                        headerGroup.get(key)?.disable({ emitEvent: false });
                    }
                } else {
                    headerGroup.get(key)?.enable({ emitEvent: false });
                }
            });
            detailsArray.controls.forEach(group => {
                const fg = group as FormGroup;
                fg.enable({ emitEvent: false });
                // Re-disable conditionally disabled fields
                if (fg.get('isDatetimeMng')?.value === '0') fg.get('datetimeMng')?.disable({ emitEvent: false });
                if (fg.get('isNumberMng')?.value === '0') fg.get('numberMng')?.disable({ emitEvent: false });
                if (fg.get('isPackCsInput')?.value === '0') fg.get('csPlanQuantity')?.disable({ emitEvent: false });
                if (fg.get('isPackBlInput')?.value === '0') fg.get('blPlanQuantity')?.disable({ emitEvent: false });
                if (fg.get('isPieceInput')?.value === '0') fg.get('psPlanQuantity')?.disable({ emitEvent: false });
                if (!fg.get('repositoryId')?.value) fg.get('locationCode')?.disable({ emitEvent: false });
            });
        }
        this.cdr.detectChanges();
    }

    onRepositoryChanged(repo: Repository): void {
        const detailsArray = this.inventoryForm.get('details') as FormArray;
        this.inventoryForm.get('header')?.patchValue({
            planRepositoryCode: repo.repositoryCode,
            planRepositoryName: repo.repositoryName
        });
        detailsArray.controls.forEach(control => {
            control.patchValue({
                repositoryId: repo.repositoryId,
                detailRepositoryCode: repo.repositoryCode,
                detailRepositoryName: repo.repositoryName,
                locationId: null,
                locationCode: ''
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
