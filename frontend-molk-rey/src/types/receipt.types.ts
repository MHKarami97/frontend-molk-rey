export interface PaymentAccount {
  id: string;
  cardNumber: string;
  shabaNumber: string | null;
  accountHolderName: string;
  bankName: string;
}

export type ReceiptReviewStatus = 'pending' | 'confirmed' | 'rejected';

export interface ReceiptHistoryItem {
  receiptId: string;
  imageKey: string;
  uploadedAt: string;
  reviewStatus: ReceiptReviewStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  billId: string;
  billAmount: number;
}

export interface ReceiptQueueItem {
  receiptId: string;
  imageKey: string;
  uploadedAt: string;
  billId: string;
  billAmount: number;
  billDueDate: string;
  unitId: string;
  unitFloor: number;
  buildingId: string;
  uploaderName: string | null;
  uploaderPhone: string | null;
}

export type UploadStage = 'idle' | 'compressing' | 'uploading' | 'success' | 'error';
