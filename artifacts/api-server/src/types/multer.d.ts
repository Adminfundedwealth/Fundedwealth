declare module "multer" {
  import { Request, RequestHandler } from "express";

  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination?: string;
    filename?: string;
    path?: string;
    buffer: Buffer;
  }

  interface Options {
    dest?: string;
    storage?: StorageEngine;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
    fileFilter?(req: Request, file: File, cb: (error: Error | null, acceptFile?: boolean) => void): void;
  }

  interface StorageEngine {
    _handleFile(req: Request, file: File, cb: (error: Error | null, info?: Partial<File>) => void): void;
    _removeFile(req: Request, file: File, cb: (error: Error | null) => void): void;
  }

  interface Multer {
    single(fieldname: string): RequestHandler;
    array(fieldname: string, maxCount?: number): RequestHandler;
    fields(fields: Array<{ name: string; maxCount?: number }>): RequestHandler;
    none(): RequestHandler;
  }

  class MulterError extends Error {
    code: string;
    field?: string;
    constructor(code: string, field?: string);
  }

  function multer(options?: Options): Multer;

  namespace multer {
    function memoryStorage(): StorageEngine;
    function diskStorage(options: { destination?: string | ((req: Request, file: File, cb: (error: Error | null, destination: string) => void) => void); filename?: (req: Request, file: File, cb: (error: Error | null, filename: string) => void) => void }): StorageEngine;
    export { MulterError };
  }

  export = multer;
}

declare global {
  namespace Express {
    interface Request {
      file?: import("multer").File;
      files?: import("multer").File[] | { [fieldname: string]: import("multer").File[] };
    }
  }
}

export {};

