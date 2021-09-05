// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable max-lines, @typescript-eslint/no-explicit-any */
import Ajv, { Options as AjvOptions } from 'ajv';
import { Stream } from 'stream';
import {
  AppOptions as AppOptionsBasic,
  HttpRequest as HttpRequestBasic,
  HttpResponse as HttpResponseBasic,
  TemplatedApp as AppTemplatedApp,
  WebSocket as WebSocketBasic,
  WebSocketBehavior
} from 'uWebSockets.js';

declare namespace nanoexpress {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface IRecord {
    [key: string]: string | string[] | IRecord;
  }
  export type RecordString = IRecord;
  export type SwaggerOptions = IRecord;
  export interface IAppOptions extends AppOptionsBasic {
    https?: {
      key_file_name: string;
      cert_file_name: string;
      passphare: string;
    };
    is_ssl?: boolean;
    ajv?: AjvOptions;
    configureAjv(ajv: Ajv): Ajv;
    swagger?: SwaggerOptions;
    console?:
      | Pick<Console, 'log' | 'error' | 'warn' | 'info' | 'debug'>
      | false;
  }

  export type HttpRequestHeaders = Record<string, string>;
  export type HttpRequestQueries = Record<string, string>;
  export type HttpRequestParams = Record<string, string>;
  export type HttpRequestBody = Record<string, string | any>;
  export type HttpRequestCookies = Record<string, string>;

  export interface IWebSocket extends WebSocketBasic {
    emit(name: string, ...args: any[]): void;

    on(
      event: 'upgrade',
      listener: (req: IHttpRequest, res: IHttpResponse) => void
    ): void;
    on(event: 'drain', listener: (drain_amount: number) => void): void;
    on(event: 'close', listener: (code: number, message: string) => void): void;
    on(
      event: 'message',
      listener: (message: string | any, isBinary?: boolean) => void
    ): void;

    on(event: string, listener: (...args: any[]) => void): void;
    once(event: string, listener: (...args: any[]) => void): void;
    off(event: string, listener?: (...args: any[]) => void): void;
  }
  export interface IHttpRequest extends HttpRequestBasic {
    method: string;
    path: string;
    baseUrl: string;
    url: string;
    originalUrl: string;
    getIP: () => string;
    getProxiedIP: () => string;
    headers?: HttpRequestHeaders;
    cookies?: HttpRequestCookies;
    query?: HttpRequestQueries;
    params?: HttpRequestParams;
    body?: string | HttpRequestBody;
    pipe(stream: Stream): IHttpRequest;
    onAborted(onAborted: () => void): void;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __response?: IHttpResponse;
  }

  export interface ICookieOptions {
    httpOnly?: boolean;
    secure?: boolean;
    maxAge?: number;
    path?: string;
    domain?: string;
    signed?: boolean;
    expires?: number | string;
  }
  export interface IHttpResponse extends HttpResponseBasic {
    type(type: string): IHttpResponse;
    status(code: number): IHttpResponse;
    setHeader(key: string, value: string | number): IHttpResponse;
    header(key: string, value: string | number): IHttpResponse;
    hasHeader(key: string): IHttpResponse;
    removeHeader(key: string): IHttpResponse;
    applyHeadersAndStatus(): IHttpResponse;
    setHeaders(headers: HttpRequestHeaders): IHttpResponse;
    writeHeaderValues(name: string, value: string[]): IHttpResponse;
    writeHeaders(headers: HttpRequestHeaders): IHttpResponse;
    writeHead(code: number, headers: HttpRequestHeaders): IHttpResponse;
    redirect(code: number | string, path?: string): IHttpResponse;
    send(result: string | Record<string, any> | any[]): IHttpResponse;
    json(result: Record<string, any> | any[]): IHttpResponse;
    pipe(stream: Stream, size?: number, compressed?: boolean): IHttpResponse;
    sendFile(
      filename: string,
      lastModified?: boolean,
      compressed?: boolean
    ): Promise<IHttpResponse>;
    setCookie(
      key: string,
      value: string,
      options?: ICookieOptions
    ): IHttpResponse;
    cookie(key: string, value: string, options?: ICookieOptions): IHttpResponse;
    hasCookie(key: string): IHttpResponse;
    removeCookie(key: string, options?: ICookieOptions): IHttpResponse;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __request?: IHttpResponse;
    on(event: 'connection', ws: WebSocket): void;
  }

  type HttpRoute = (
    req: IHttpRequest,
    res: IHttpResponse
  ) => any | Promise<any>;

  type MiddlewareRoute = (
    req: IHttpRequest,
    res: IHttpResponse,
    next?: (err: Error | null | undefined, done: boolean | undefined) => any
  ) => INanoexpressApp;

  export interface IAppRoute {
    get: HttpRoute;
    post: HttpRoute;
    put: HttpRoute;
    patch: HttpRoute;
    head: HttpRoute;
    delete: HttpRoute;
    options: HttpRoute;
    trace: HttpRoute;
    any: HttpRoute;
    ws: HttpRoute;
  }

  type SchemaValue = IRecord;
  interface ISchema {
    headers?: false | SchemaValue;
    cookies?: false | SchemaValue;
    query?: false | SchemaValue;
    params?: false | SchemaValue;
    body?: false | SchemaValue;
    response?: false | SchemaValue;
  }
  export interface IWebSocketOptions {
    compression?: number;
    maxPayloadLength?: number;
    idleTimeout?: number;
    schema?: ISchema;
  }
  interface IRouteOption {
    schema?: ISchema;
    isRaw?: boolean;
    isStrictRaw?: boolean;
    forceRaw?: boolean;
    noMiddleware?: boolean;
    onAborted?: () => any;
  }

  export interface IPerRoute {
    callback(req: IHttpRequest, res: IHttpResponse): any;
    middlewares?: HttpRoute[];
    schema?: ISchema;
  }

  export interface IAppConfig {
    config: Record<string, any>;
  }

  export interface IStaticOptions {
    index?: string;
    addPrettyUrl?: boolean;
    forcePretty?: boolean;
    lastModified?: boolean;
    compressed?: boolean;
  }

  interface IValidationErrorItems {
    type: string;
    messages: string[];
  }
  export interface IValidationErrors {
    type: string;
    errors: IValidationErrorItems;
  }

  interface INanoexpressAppInterface {
    host: string | null;
    port: number | null;
    address: string;

    define(callback: (app: INanoexpressApp) => void): INanoexpressApp;
    use(middleware: MiddlewareRoute): INanoexpressApp;
    use(path: string, middleware: MiddlewareRoute): INanoexpressApp;
    use(path: string, ...middlewares: MiddlewareRoute[]): INanoexpressApp;
    use(...middlewares: MiddlewareRoute[]): INanoexpressApp;

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

    get(path: string, callback: HttpRoute): INanoexpressApp;
    get(
      path: string,
      options: IRouteOption,
      callback: HttpRoute
    ): INanoexpressApp;
    get(path: string, ...middlewares: MiddlewareRoute[]): INanoexpressApp;
    get(
      path: string,
      options: IRouteOption,
      ...middlewares: MiddlewareRoute[]
    ): INanoexpressApp;

    post(path: string, callback: HttpRoute): INanoexpressApp;
    post(
      path: string,
      options: IRouteOption,
      callback: HttpRoute
    ): INanoexpressApp;
    post(path: string, ...middlewares: MiddlewareRoute[]): INanoexpressApp;
    post(
      path: string,
      options: IRouteOption,
      ...middlewares: MiddlewareRoute[]
    ): INanoexpressApp;

    put(path: string, callback: HttpRoute): INanoexpressApp;
    put(
      path: string,
      options: IRouteOption,
      callback: HttpRoute
    ): INanoexpressApp;
    put(path: string, ...middlewares: MiddlewareRoute[]): INanoexpressApp;
    put(
      path: string,
      options: IRouteOption,
      ...middlewares: MiddlewareRoute[]
    ): INanoexpressApp;

    patch(path: string, callback: HttpRoute): INanoexpressApp;
    patch(
      path: string,
      options: IRouteOption,
      callback: HttpRoute
    ): INanoexpressApp;
    patch(path: string, ...middlewares: MiddlewareRoute[]): INanoexpressApp;
    patch(
      path: string,
      options: IRouteOption,
      ...middlewares: MiddlewareRoute[]
    ): INanoexpressApp;

    del(path: string, callback: HttpRoute): INanoexpressApp;
    del(
      path: string,
      options: IRouteOption,
      callback: HttpRoute
    ): INanoexpressApp;
    del(path: string, ...middlewares: MiddlewareRoute[]): INanoexpressApp;
    del(
      path: string,
      options: IRouteOption,
      ...middlewares: MiddlewareRoute[]
    ): INanoexpressApp;

    options(path: string, callback: HttpRoute): INanoexpressApp;
    options(
      path: string,
      options: IRouteOption,
      callback: HttpRoute
    ): INanoexpressApp;
    options(path: string, ...middlewares: MiddlewareRoute[]): INanoexpressApp;
    options(
      path: string,
      options: IRouteOption,
      ...middlewares: MiddlewareRoute[]
    ): INanoexpressApp;

    any(path: string, callback: HttpRoute): INanoexpressApp;
    any(
      path: string,
      options: IRouteOption,
      callback: HttpRoute
    ): INanoexpressApp;
    any(path: string, ...middlewares: MiddlewareRoute[]): INanoexpressApp;
    any(
      path: string,
      options: IRouteOption,
      ...middlewares: MiddlewareRoute[]
    ): INanoexpressApp;

    head(path: string, callback: HttpRoute): INanoexpressApp;
    head(
      path: string,
      options: IRouteOption,
      callback: HttpRoute
    ): INanoexpressApp;
    head(path: string, ...middlewares: MiddlewareRoute[]): INanoexpressApp;
    head(
      path: string,
      options: IRouteOption,
      ...middlewares: MiddlewareRoute[]
    ): INanoexpressApp;

    trace(path: string, callback: HttpRoute): INanoexpressApp;
    trace(
      path: string,
      options: IRouteOption,
      callback: HttpRoute
    ): INanoexpressApp;
    trace(path: string, ...middlewares: MiddlewareRoute[]): INanoexpressApp;
    trace(
      path: string,
      options: IRouteOption,
      ...middlewares: MiddlewareRoute[]
    ): INanoexpressApp;

    ws(
      path: string,
      handler: MiddlewareRoute | Promise<MiddlewareRoute>,
      options?: IWebSocketOptions
    ): INanoexpressApp;
    ws(path: string, options: IWebSocketOptions): INanoexpressApp;
    ws(path: string, options: WebSocketBehavior): INanoexpressApp;

    publish(
      topic: string,
      message: string,
      isBinary?: boolean,
      compress?: boolean
    ): boolean;

    listen(port: number, host?: string): Promise<INanoexpressApp>;
    close(): boolean;
    setErrorHandler(
      errorHandlerCallback: (
        err: Error,
        req: IHttpRequest,
        res: IHttpResponse
      ) => IHttpResponse
    ): INanoexpressApp;
    setNotFoundHandler(
      notFoundHandlerCallback: (
        req: IHttpRequest,
        res: IHttpResponse
      ) => IHttpResponse
    ): INanoexpressApp;
    setValidationErrorHandler(
      validationErrorHandlerCallback: (
        errors: IValidationErrors,
        req: IHttpRequest,
        res: IHttpResponse
      ) => any
    ): INanoexpressApp;
    config: IAppConfig;
  }

  export interface INanoexpressApp
    extends Omit<AppTemplatedApp, keyof INanoexpressAppInterface>,
      INanoexpressAppInterface {}
}

declare function nanoexpress(
  options?: nanoexpress.IAppOptions
): nanoexpress.INanoexpressApp;

export = nanoexpress;
