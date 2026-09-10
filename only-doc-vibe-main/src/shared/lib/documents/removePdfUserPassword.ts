import { loadQPdf } from "../lazy-load/loadQPdf";

/**
 * Thrown when qpdf rejects the supplied user password (or any other
 * password-related failure). UI layer uses this to show "incorrect password"
 * versus a generic "decryption failed" message.
 */
export class IncorrectPdfPasswordError extends Error {
  constructor(public readonly details: string) {
    super("PDF decryption failed: incorrect password");
    this.name = "IncorrectPdfPasswordError";
  }
}

const PASSWORD_ERROR_PATTERNS = [
  "invalid password",
  "incorrect password",
  "password required",
  "password is not correct",
  "supplied password",
];

const isPasswordError = (qpdfOutput: string): boolean => {
  const lc = qpdfOutput.toLowerCase();

  return PASSWORD_ERROR_PATTERNS.some((pattern) => lc.includes(pattern));
};

/**
 * Decrypt a user-password-protected PDF on the client using qpdf-wasm and
 * return a new `File` with the encryption removed.
 *
 * Throws `IncorrectPdfPasswordError` when qpdf reports a bad password.
 * Throws a generic `Error` for any other failure (wasm load failure,
 * unsupported encryption, etc.) — the message includes the captured qpdf
 * stderr so it can be diagnosed from the browser console.
 */
export const removePdfUserPassword = async ({
  file,
  password,
}: {
  file: File;
  password: string;
}): Promise<File> => {
  const pdfArrayBuffer = await file.arrayBuffer();
  const qpdfModule = await loadQPdf();

  const stdoutChunks: string[] = [];
  const stderrChunks: string[] = [];

  const qpdf = await qpdfModule({
    locateFile: () => "/qpdf.wasm",
    print: (msg: string) => stdoutChunks.push(msg),
    printErr: (msg: string) => stderrChunks.push(msg),
  });

  const inPath = "/in.pdf";
  const outPath = "/out.pdf";

  const uint8 = new Uint8Array(pdfArrayBuffer);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (qpdf.FS as any).writeFile(inPath, uint8);

  const args = [`--password=${password}`, "--decrypt", inPath, outPath];
  let exitCode: number | undefined;
  try {
    exitCode = qpdf.callMain(args) as number | undefined;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    const combined = [...stderrChunks, ...stdoutChunks].join("\n");
    if (isPasswordError(combined) || isPasswordError(errMsg)) {
      throw new IncorrectPdfPasswordError(combined || errMsg);
    }

    throw new Error(
      `qpdf aborted while decrypting: ${errMsg}\nqpdf output:\n${combined}`
    );
  }

  let outBytes: Uint8Array | undefined;
  try {
    outBytes = qpdf.FS.readFile(outPath) as Uint8Array;
  } catch {
    // Output never produced -> qpdf failed.
  }

  const combinedOutput = [...stderrChunks, ...stdoutChunks].join("\n");

  if (!outBytes || outBytes.length === 0) {
    if (isPasswordError(combinedOutput) || exitCode === 2) {
      throw new IncorrectPdfPasswordError(combinedOutput);
    }

    throw new Error(
      `qpdf failed to produce decrypted file (exit code ${exitCode ?? "unknown"}).\nqpdf output:\n${combinedOutput}`
    );
  }

  return new File([outBytes as unknown as BlobPart], file.name, {
    type: file.type || "application/pdf",
  });
};
