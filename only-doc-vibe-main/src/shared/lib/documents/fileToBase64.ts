/**
 * Converts a file to base64 string with fallback mechanism
 */
export const fileToBase64 = async (file: Blob): Promise<string> => {
  // Validate input
  if (!file) {
    throw new Error("No file provided");
  }

  if (file.size === 0) {
    throw new Error("File is empty");
  }

  // Try primary method: readAsDataURL
  try {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result;

        // Validate result before resolving
        if (!result || typeof result !== "string") {
          reject(new Error("Invalid result from readAsDataURL"));

          return;
        }

        if (result.length === 0) {
          reject(new Error("Empty result from readAsDataURL"));

          return;
        }

        resolve(result);
      };

      reader.onerror = () => {
        reject(
          new Error(
            `readAsDataURL failed: ${reader.error?.message || "Unknown error"}`
          )
        );
      };

      reader.onabort = () => {
        reject(new Error("readAsDataURL was aborted"));
      };

      reader.readAsDataURL(file);
    });
  } catch (primaryError) {
    try {
      // was analytic error handling

      return await fileToBase64Fallback(file);
    } catch (fallbackError) {
      // Both methods failed, throw comprehensive error
      throw new Error(
        `Failed to convert file to base64. Primary error: ${primaryError instanceof Error ? primaryError.message : "Unknown"}. Fallback error: ${fallbackError instanceof Error ? fallbackError.message : "Unknown"}`
      );
    }
  }
};

/**
 * Converts a binary array to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer, mimeType: string): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  const base64 = btoa(binary);

  return `data:${mimeType};base64,${base64}`;
}

/**
 * Fallback method using ArrayBuffer and manual base64 conversion
 */
function fileToBase64Fallback(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (!result || !(result instanceof ArrayBuffer)) {
        reject(new Error("Fallback failed: Invalid ArrayBuffer result"));

        return;
      }

      try {
        const base64String = arrayBufferToBase64(
          result,
          file.type || "application/octet-stream"
        );

        resolve(base64String);
      } catch (error) {
        reject(
          new Error(
            `Fallback failed: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(
        new Error(
          `Fallback failed: ${reader.error?.message || "Unknown error"}`
        )
      );
    };

    reader.onabort = () => {
      reject(new Error("Fallback failed: File reading was aborted"));
    };

    reader.readAsArrayBuffer(file);
  });
}
