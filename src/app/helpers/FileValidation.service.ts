import { Injectable } from '@angular/core';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  validFiles?: File[];
  invalidFiles?: Array<{ file: File; reason: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class FileValidationService {
  // Maximum file size: 5MB in bytes
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024;

  constructor() {}

  /**
   * Validate a single file for size
   * @param file - File to validate
   * @returns Validation result
   */
  validateFile(file: File): FileValidationResult {
    if (file.size > this.MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `File "${file.name}" is too large (${fileSizeMB}MB). Maximum size is 5MB.`
      };
    }

    return { valid: true };
  }

  /**
   * Validate multiple files for size
   * @param files - Array of files or FileList to validate
   * @returns Validation result with separated valid and invalid files
   */
  validateFiles(files: File[] | FileList): FileValidationResult {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const invalidFiles: Array<{ file: File; reason: string }> = [];

    fileArray.forEach(file => {
      const validation = this.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({
          file,
          reason: validation.error || 'Invalid file'
        });
      }
    });

    if (invalidFiles.length > 0) {
      const errors = invalidFiles.map(item => item.reason).join('\n');
      return {
        valid: false,
        error: errors,
        validFiles,
        invalidFiles
      };
    }

    return {
      valid: true,
      validFiles,
      invalidFiles: []
    };
  }

  /**
   * Format file size to human-readable string
   * @param bytes - File size in bytes
   * @returns Formatted file size string
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get maximum allowed file size in MB
   * @returns Maximum file size in MB
   */
  getMaxFileSizeMB(): number {
    return this.MAX_FILE_SIZE / (1024 * 1024);
  }

  /**
   * Check if file size exceeds limit
   * @param file - File to check
   * @returns True if file exceeds size limit
   */
  isFileTooLarge(file: File): boolean {
    return file.size > this.MAX_FILE_SIZE;
  }
}