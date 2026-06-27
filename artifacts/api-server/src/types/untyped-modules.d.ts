declare module "node-fetch" {
  const fetch: typeof globalThis.fetch;
  export default fetch;
}

declare module "multer" {
  import { RequestHandler, Request } from "express";

  interface FileFilterCallback {
    (error: Error | null, acceptFile?: boolean): void;
  }

  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
    destination?: string;
    filename?: string;
    path?: string;
  }

  interface Options {
    storage?: any;
    limits?: { fileSize?: number; files?: number };
    fileFilter?: (req: Request, file: File, cb: FileFilterCallback) => void;
  }

  interface Multer {
    single(fieldname: string): RequestHandler;
    array(fieldname: string, maxCount?: number): RequestHandler;
    fields(fields: Array<{ name: string; maxCount?: number }>): RequestHandler;
    none(): RequestHandler;
    any(): RequestHandler;
  }

  function multer(options?: Options): Multer;

  namespace multer {
    function memoryStorage(): any;
    function diskStorage(options: any): any;
    type FileFilterCallback = import("express").Request extends any ? {
      (error: Error | null, acceptFile?: boolean): void;
    } : never;
  }

  export = multer;
}
