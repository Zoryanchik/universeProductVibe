import type { InternalFileType } from "@/shared/constants/file-type";

export interface IUploadLink {
  filename: string;
  url: string;
  expiredAt?: number;
}

export interface IDocument {
  id: string;
  filename: string;
  internal_type: string;
  created_at: string;
  size: string;
  aws_url: string;
  processing_status: string;
}

/**
 * Dashboard-shaped file record returned by GET /api/v1/files.
 */
export interface IUserFile {
  id: string;
  filename: string;
  internal_type: string;
  creation_type: string;
  processing_status: string;
  size: number;
  created_at: string;
  aws_url: string;
  original_file_id: string | null;
  pages?: number | null;
}

export interface IRequiresPaymentResponse {
  success: boolean;
  fileId: string;
}

export interface IDocumentById {
  format: InternalFileType;
  filename: string;
  url: string;
  id: string;
  internal_type?: string;
  size?: string;
}

/**
 * Response of GET /files/status/:id — mirrors `FileDto` on the backend.
 */
export interface IDocumentStatus {
  id: string;
  aws_url: string;
  size: number;
  filename: string;
  error_code?: string | null;
  error_message?: string | null;
  internal_type: string;
  processing_status: string;
  created_at: string;
  creation_type: string;
  original_file_id: string | null;
}
