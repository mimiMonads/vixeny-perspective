export type VServe = {
  liveReolading?: boolean;
  handler: (req: Request) => Promise<Response> | Response;
  port?: number;
  hostname?: string;
};
