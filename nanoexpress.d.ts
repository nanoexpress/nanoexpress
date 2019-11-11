import {
  AppOptions as AppOptionsBasic,
  TemplatedApp as AppTemplatedApp,
  HttpRequest as HttpRequestBasic,
  HttpResponse as HttpResponseBasic,
  WebSocket as WebSocketBasic
} from 'uWebSockets.js';
import { Ajv, Options as AjvOptions } from 'ajv';

declare namespace nanoexpress {
  export interface SwaggerOptions {
    [key: string]: SwaggerOptions | string;
  }
  export interface AppOptions extends AppOptionsBasic {
    https?: {
      key_file_name: string;
      cert_file_name: string;
      passphare: string;
    };
    ajv?: AjvOptions;
    configureAjv(ajv: Ajv): Ajv;
    swagger?: SwaggerOptions;
    strictPath?: boolean;
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
    [key: string]: string | object | any[];
  }
  export interface HttpRequestCookies {
    [key: string]: string;
  }

  export interface WebSocket extends WebSocketBasic {
    on(name: string, listener: Function);
    once(name: string, listener: Function);
    off(name: string, listener?: Function);
    emit(name: string, ...args: any[]);
  }
  export interface HttpRequest extends HttpRequestBasic {
    method: string;
    path: string;
    baseUrl: string;
    url: string;
    originalUrl: string;
    headers?: HttpRequestHeaders;
    cookies?: HttpRequestCookies;
    query?: HttpRequestQueries;
    params?: HttpRequestParams;
    body?: string | HttpRequestBody;
    __response?: HttpResponse;
  }

  export interface CookieOptions {
    httpOnly?: boolean;
    secure?: boolean;
    maxAge?: number;
    path?: string;
    domain?: string;
    signed?: boolean;
    expires?: number | string;
  }
  export interface HttpResponse extends HttpResponseBasic {
    type(type: string): HttpResponse;
    status(code: number): HttpResponse;
    setHeader(key: string, value: string | number): HttpResponse;
    header(key: string, value: string | number): HttpResponse;
    hasHeader(key: string): HttpResponse;
    removeHeader(key: string): HttpResponse;
    applyHeadersAndStatus(): HttpResponse;
    setHeaders(headers: HttpRequestHeaders): HttpResponse;
    writeHeaderValues(name: string, value: string[]): HttpResponse;
    writeHeaders(headers: HttpRequestHeaders): HttpResponse;
    writeHead(code: number, headers: HttpRequestHeaders): HttpResponse;
    redirect(code: number | string, path?: string): HttpResponse;
    send(result: string | object | any[]): HttpResponse;
    json(result: object | any[]): HttpResponse;
    sendFile(filename: string, config?: StreamConfig): Promise<HttpResponse>;
    setCookie(
      key: string,
      value: string,
      options?: CookieOptions
    ): HttpResponse;
    cookie(key: string, value: string, options?: CookieOptions): HttpResponse;
    hasCookie(key: string): HttpResponse;
    removeCookie(key: string, options?: CookieOptions): HttpResponse;
    __request?: HttpRequest;
  }

  type HttpRoute = (req: HttpRequest, res: HttpResponse) => nanoexpressApp;

  type MiddlewareRoute = (
    req: HttpRequest,
    res: HttpResponse,
    next?: (err: Error | null | undefined, done: boolean | undefined) => any
  ) => nanoexpressApp;

  type WsRoute = (req: HttpRequest, ws: WebSocket) => any;

  export interface AppRoute {
    get: HttpRoute;
    post: HttpRoute;
    put: HttpRoute;
    patch: HttpRoute;
    head: HttpRoute;
    delete: HttpRoute;
    options: HttpRoute;
    trace: HttpRoute;
    any: HttpRoute;
    ws: WsRoute;
  }

  interface SchemaValue {
    [key: string]: string | SchemaValue;
  }
  interface Schema {
    headers: boolean | SchemaValue;
    cookies: boolean | SchemaValue;
    query: boolean | SchemaValue;
    params: boolean | SchemaValue;
    body: string | boolean | SchemaValue;
    response: boolean | SchemaValue;
  }
  export interface WebSocketOptions {
    compression?: number;
    maxPayloadLength?: number;
    idleTimeout?: number;
    schema?: Schema;
  }
  interface RouteOption {
    schema?: Schema;
    isRaw?: boolean;
    noMiddleware?: boolean;
    onAborted?: () => any;
  }

  export interface AppRoute {
    callback<HttpRequest, HttpResponse>(
      req: HttpRequest,
      res: HttpResponse
    ): any;
    middlewares?: HttpRoute[];
    schema?: Schema;
  }
  export interface AppRoutes {
    [key: string]: AppRoute | AppRoutes | Function;
  }

  export interface AppConfig {
    config: {
      [key: string]: any;
    };
  }

  interface StreamCompressionOptions {
    priority: string[];
  }
  interface StreamConfig {
    lastModified?: boolean;
    compress?: boolean;
    compressionOptions?: StreamCompressionOptions;
    cache?: boolean;
  }

  export interface StaticOptions {
    index?: string;
    addPrettyUrl?: boolean;
    forcePretty?: boolean;
    streamConfig?: StreamConfig;
  }

  interface validationErrorItems {
    type: string;
    messages: string[];
  }
  export interface validationErrors {
    type: string;
    errors: validationErrorItems;
  }

  interface nanoexpressAppInterface {
    host: string | null;
    port: number | null;
    address: string;

    define(callback: (app: nanoexpressApp) => void): nanoexpressApp;
    use(middleware: MiddlewareRoute): nanoexpressApp;
    use(path: string, middleware: MiddlewareRoute): nanoexpressApp;
    use(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    use(...middlewares: MiddlewareRoute[]): nanoexpressApp;

    use(middleware: PromiseLike<MiddlewareRoute>): PromiseLike<any>;
    use(
      path: string,
      middleware: PromiseLike<MiddlewareRoute>
    ): PromiseLike<any>;
    use(
      path: string,
      ...middlewares: PromiseLike<MiddlewareRoute>[]
    ): PromiseLike<any>;
    use(...middlewares: PromiseLike<MiddlewareRoute>[]): PromiseLike<any>;

    get(path: string, callback: HttpRoute): nanoexpressApp;
    get(
      path: string,
      options: RouteOption,
      callback: HttpRoute
    ): nanoexpressApp;
    get(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    get(
      path: string,
      options: RouteOption,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    post(path: string, callback: HttpRoute): nanoexpressApp;
    post(
      path: string,
      options: RouteOption,
      callback: HttpRoute
    ): nanoexpressApp;
    post(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    post(
      path: string,
      options: RouteOption,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    put(path: string, callback: HttpRoute): nanoexpressApp;
    put(
      path: string,
      options: RouteOption,
      callback: HttpRoute
    ): nanoexpressApp;
    put(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    put(
      path: string,
      options: RouteOption,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    patch(path: string, callback: HttpRoute): nanoexpressApp;
    patch(
      path: string,
      options: RouteOption,
      callback: HttpRoute
    ): nanoexpressApp;
    patch(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    patch(
      path: string,
      options: RouteOption,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    del(path: string, callback: HttpRoute): nanoexpressApp;
    del(
      path: string,
      options: RouteOption,
      callback: HttpRoute
    ): nanoexpressApp;
    del(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    del(
      path: string,
      options: RouteOption,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    options(path: string, callback: HttpRoute): nanoexpressApp;
    options(
      path: string,
      options: RouteOption,
      callback: HttpRoute
    ): nanoexpressApp;
    options(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    options(
      path: string,
      options: RouteOption,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    any(path: string, callback: HttpRoute): nanoexpressApp;
    any(
      path: string,
      options: RouteOption,
      callback: HttpRoute
    ): nanoexpressApp;
    any(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    any(
      path: string,
      options: RouteOption,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    head(path: string, callback: HttpRoute): nanoexpressApp;
    head(
      path: string,
      options: RouteOption,
      callback: HttpRoute
    ): nanoexpressApp;
    head(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    head(
      path: string,
      options: RouteOption,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    trace(path: string, callback: HttpRoute): nanoexpressApp;
    trace(
      path: string,
      options: RouteOption,
      callback: HttpRoute
    ): nanoexpressApp;
    trace(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    trace(
      path: string,
      options: RouteOption,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    ws(path: string, fn: WsRoute): nanoexpressApp;
    ws(path: string, options: WebSocketOptions, fn: WsRoute): nanoexpressApp;

    publish(
      topic: string,
      message: string,
      isBinary?: boolean,
      compress?: boolean
    ): nanoexpressApp;

    listen(port: number, host?: string): Promise<nanoexpressApp>;
    close(): boolean;
    setErrorHandler(
      errorHandlerCallback: (
        err: Error,
        req: HttpRequest,
        res: HttpResponse
      ) => HttpResponse
    ): nanoexpressApp;
    setNotFoundHandler(
      notFoundHandlerCallback: (
        req: HttpRequest,
        res: HttpResponse
      ) => HttpResponse
    ): nanoexpressApp;
    setValidationErrorHandler(
      validationErrorHandlerCallback: (
        errors: validationErrors,
        req: HttpRequest,
        res: HttpResponse
      ) => any
    ): nanoexpressApp;
    config: AppConfig;
  }

  export interface nanoexpressApp
    extends Omit<AppTemplatedApp, keyof nanoexpressAppInterface>,
      nanoexpressAppInterface {}
}

declare function nanoexpress(
  options?: nanoexpress.AppOptions
): nanoexpress.nanoexpressApp;

export = nanoexpress;
