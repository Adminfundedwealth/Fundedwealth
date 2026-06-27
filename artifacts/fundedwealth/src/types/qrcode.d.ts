declare module "qrcode" {
  interface QRCodeOptions {
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    type?: string;
    quality?: number;
    margin?: number;
    color?: { dark?: string; light?: string };
    width?: number;
  }

  function toDataURL(text: string, options?: QRCodeOptions): Promise<string>;
  function toCanvas(canvas: HTMLCanvasElement, text: string, options?: QRCodeOptions): Promise<void>;
  function toString(text: string, options?: QRCodeOptions): Promise<string>;

  export { toDataURL, toCanvas, toString, QRCodeOptions };
  export default { toDataURL, toCanvas, toString };
}
