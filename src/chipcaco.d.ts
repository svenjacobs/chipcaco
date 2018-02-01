export function buffer(inBuf: Buffer,
                       outBuf: Buffer,
                       size: number): Promise<{ inBuf: Buffer, outBuf: Buffer, bytesWritten: number }>;

export function file(srcFile: string,
                     destFile: string): Promise<boolean>;
