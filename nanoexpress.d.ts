import {
  AppOptions as AppOptionsBasic,
  TemplatedApp as BasicApp,
  HttpRequest as HttpRequestBasic,
  HttpResponse as HttpResponseBasic,
  WebSocket as WebSocketBasic
} from 'uWebSockets.js';
import { Ajv, Options as AjvOptions } from 'ajv';

declare namespace nanoexpress {
  export interface AppOptions extends AppOptionsBasic {
  https?: {
    key_file_name: string;
    cert_file_name: string;
    passphare: string;
  };
  ajv?: AjvOptions,
  configureAjv(ajv: Ajv): Ajv
}

export interface HttpRequestHeaders {
  [key: string]: string;
}
export interface HttpRequestQueries {
  [key: string]: string;
}
export interface HttpRequestParams {
  [key: string]: string;
}
export interface HttpRequestBody {
  [key: string]: string;
}

export interface WebSocket extends WebSocketBasic {
  on(name: string, listener: Function);
  once(name: string, listener: Function);
  off(name: string, listener?: Function);
  emit(name: string, ...args: any[])
}
export interface HttpRequest extends HttpRequestBasic {
  path: string;
  url: string;
  headers: HttpRequestHeaders;
  query: HttpRequestQueries;
  params: HttpRequestParams;
  body?: HttpRequestBody;
  private __response: HttpResponse;
}

export interface HttpResponse extends HttpResponseBasic {
  status(code: number): HttpResponse;
  setHeader(key: string, value: string | number): HttpResponse;
  hasHeader(key: string): HttpResponse;
  removeHeader(key: string): HttpResponse;
  applyHeaders(): HttpResponse;
  setHeaders(headers: HttpRequestHeaders): HttpResponse;
  writeHead(code: number; headers: HttpRequestHeaders): HttpResponse;
  send(result: string | object | array): HttpResponse;
  json(result: object | array): HttpResponse;
  xml(result: string): HttpResponse;
  html(result: string): HttpResponse;
  plain(result: string): HttpResponse;
  cork(result: string | object | array): HttpResponse;
  __request?: HttpRequest
}

export interface AppRoute {
  get(req: HttpRequest, res: HttpResponse): any
  post(req: HttpRequest, res: HttpResponse): any
  put(req: HttpRequest, res: HttpResponse): any
  patch(req: HttpRequest, res: HttpResponse): any
  head(req: HttpRequest, res: HttpResponse): any
  delete(req: HttpRequest, res: HttpResponse): any
  trace(req: HttpRequest, res: HttpResponse): any
  ws(req: HttpRequest, ws: WebSocket): any
}
export interface AppRoutes {
  [key: string]: AppRoute | object;
}

export interface AppConfig {
  config: {
    set(key: string, value: any): void,
    get(key: string): any;
  }
}

export interface nanoexpressApp extends BasicApp {
  use(path: string | Function, ...fns?: Function<HttpRequest, HttpResponse>): nanoexpressApp;
  get(path: string, ...fns: Function<HttpRequest, HttpResponse>[]): nanoexpressApp;
  post(path: string, ...fns: Function<HttpRequest, HttpResponse>[]): nanoexpressApp;
  put(path: string, ...fns: Function<HttpRequest, HttpResponse>[]): nanoexpressApp;
  patch(path: string, ...fns: Function<HttpRequest, HttpResponse>[]): nanoexpressApp;
  del(path: string, ...fns: Function<HttpRequest, HttpResponse>[]): nanoexpressApp;
  options(path: string, ...fns: Function<HttpRequest, HttpResponse>[]): nanoexpressApp;
  head(path: string, ...fns: Function<HttpRequest, HttpResponse>[]): nanoexpressApp;
  trace(path: string, ...fns: Function<HttpRequest, HttpResponse>[]): nanoexpressApp;
  any(path: string, ...fns: Function<HttpRequest, HttpResponse>[]): nanoexpressApp;
  ws(path: string, ...fns: Function<HttpRequest, HttpResponse>[]): nanoexpressApp;
  listen(port: number, host?: string): Promise<nanoexpressApp>;
  define(routes: AppRoutes): nanoexpressApp;
  config: AppConfig
}
}

declare function nanoexpress(options?: nanoexpress.AppOptions): nanoexpress.nanoexpressApp;

export = nanoexpress;
