export const CLOUDINARY_CLOUD_NAME = 'gyr7fxm';
export const CLOUDINARY_UPLOAD_PRESET = 'Rohingya Young Generation Network';
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
export const CLOUDINARY_MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  display_name?: string;
  original_filename?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

export interface UploadToCloudinaryOptions {
  onProgress?: (percent: number, stage: string) => void;
  signal?: AbortSignal;
}

export function uploadImageToCloudinary(
  file: File,
  options: UploadToCloudinaryOptions = {}
): Promise<CloudinaryUploadResult> {
  const { onProgress, signal } = options;

  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No image file selected.'));
      return;
    }

    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file (JPEG, PNG, WebP, GIF, or HEIC).'));
      return;
    }

    if (file.size <= 0) {
      reject(new Error('The selected image file appears to be empty.'));
      return;
    }

    if (file.size > CLOUDINARY_MAX_FILE_BYTES) {
      reject(new Error('Image exceeds the 10 MB upload limit. Please select a smaller image.'));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_UPLOAD_URL, true);
    xhr.timeout = 60_000;

    let settled = false;
    const cleanupAbort = () => {
      if (signal) {
        signal.removeEventListener('abort', handleAbort);
      }
    };

    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      cleanupAbort();
      reject(err);
    };

    const handleAbort = () => {
      xhr.abort();
      fail(new Error('Image upload was canceled.'));
    };

    if (signal) {
      if (signal.aborted) {
        fail(new Error('Image upload was canceled.'));
        return;
      }
      signal.addEventListener('abort', handleAbort);
    }

    onProgress?.(5, 'Connecting to Cloudinary...');

    xhr.upload.addEventListener('progress', event => {
      if (!event.lengthComputable) return;
      const ratio = event.total > 0 ? event.loaded / event.total : 0;
      const percent = Math.min(92, Math.max(8, Math.round(ratio * 92)));
      onProgress?.(percent, `Uploading image (${percent}%)...`);
    });

    xhr.upload.addEventListener('load', () => {
      onProgress?.(95, 'Finalizing image on Cloudinary...');
    });

    xhr.addEventListener('load', () => {
      if (settled) return;

      let parsed: Record<string, unknown> | null = null;
      try {
        parsed = JSON.parse(xhr.responseText) as Record<string, unknown>;
      } catch {
        fail(new Error(`Unexpected response from Cloudinary (HTTP ${xhr.status}).`));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        const cloudErr =
          parsed &&
          typeof parsed.error === 'object' &&
          parsed.error !== null &&
          typeof (parsed.error as { message?: unknown }).message === 'string'
            ? (parsed.error as { message: string }).message
            : `Cloudinary upload failed (HTTP ${xhr.status}).`;
        fail(new Error(cloudErr));
        return;
      }

      const rawSecureUrl = typeof parsed?.secure_url === 'string' ? parsed.secure_url.trim() : '';
      const secureUrl = rawSecureUrl.replace(/\s/g, '%20');
      if (!secureUrl || !/^https:\/\/[^\s]+$/i.test(secureUrl)) {
        fail(new Error('Cloudinary did not return a valid HTTPS secure_url.'));
        return;
      }

      settled = true;
      cleanupAbort();
      resolve({
        secure_url: secureUrl,
        public_id: typeof parsed.public_id === 'string' ? parsed.public_id : '',
        display_name: typeof parsed.display_name === 'string' ? parsed.display_name : undefined,
        original_filename: typeof parsed.original_filename === 'string' ? parsed.original_filename : undefined,
        format: typeof parsed.format === 'string' ? parsed.format : undefined,
        width: typeof parsed.width === 'number' ? parsed.width : undefined,
        height: typeof parsed.height === 'number' ? parsed.height : undefined,
        bytes: typeof parsed.bytes === 'number' ? parsed.bytes : undefined,
      });
    });

    xhr.addEventListener('error', () => {
      fail(new Error('Network error while uploading image to Cloudinary. Check your internet connection.'));
    });

    xhr.addEventListener('timeout', () => {
      fail(new Error('Cloudinary upload timed out. Please try again.'));
    });

    xhr.send(formData);
  });
}
