/**
 * The Sarvis Config contains information that will be re-used in every request.
 */
export interface ISarvisConfig {
    // The url that will be used in every request.
    base_url?: string;
    // (Optional) The port number that will be used for a request.
    port?: number;
    // (Optional) Most api's have a base path, such as: /api, or /v1 etc.
    base_path?: string;
    // (Optional) A string that will be set to the Authorazation header on every request, for example:
    // "Bearer YOUR_BEARER_TOKEN_HERE".
    authorization?: string;
}

export class Sarvis {

    public config?: ISarvisConfig;
    public api_url: string | undefined;

    public useBefore: undefined | ((url: string, config: RequestInit) => { url: string, config: RequestInit }) = undefined;
    public useAfter: undefined | ((result: any) => any) = undefined;

    // If true, returns the ftehc request before the JSON has been extracted. Default = false.
    public returnFullRequest: boolean = false;

    constructor (config?: ISarvisConfig) {
        if (!config) {
            config = {}
        }
        this.config = config;
        /**
         * If a base url, with optionally a base path and/or port are passed to the Sarvis instance, this variable is
         * filled with the url that will be used for every request.
         */
        this.api_url = this.createApiUrl();
    }

    /**
     * Sends a GET request.
     *
     * @param url - The URL the request will be send to. If a base_url was passed in the config, it will be added to that url.
     * @param customConfig - RequestInit.
     */
    public async get<Type>(url: string, customConfig?: RequestInit): Promise<Type> {

        const {buildUrl, finalConfig} = this.prepareRequest(url, "GET", undefined, customConfig);

        return this.excecuteRequest(buildUrl, finalConfig);
    };

    public async post<Type>(url: string, body: any, customConfig?: RequestInit): Promise<Type> {

        const {buildUrl, finalConfig} = this.prepareRequest(url, "POST", body, customConfig);

        return this.excecuteRequest(buildUrl, finalConfig);
    };

    public async put<Type>(url: string, body: any, customConfig?: RequestInit): Promise<Type> {

        const {buildUrl, finalConfig} = this.prepareRequest(url, "PUT", body, customConfig);

        return this.excecuteRequest(buildUrl, finalConfig);
    };

    public async delete<Type>(url: string, body?: any, customConfig?: RequestInit): Promise<Type> {

        const {buildUrl, finalConfig} = this.prepareRequest(url, "DELETE", body, customConfig);

        return this.excecuteRequest(buildUrl, finalConfig);
    };

    public prepareRequest(url: string, method: string, body?: any, customConfig?: RequestInit): { buildUrl: string, finalConfig: RequestInit } {
        // Update the api_url in case the config settings have changed.
        this.api_url = this.createApiUrl();

        const config = {...this.getBasicRequestConfig(method, body), ...customConfig};

        return { buildUrl: this.getApiUrl() + url, finalConfig: config};
    }

    public async excecuteRequest<Type>(buildUrl: string, finalConfig: RequestInit): Promise<Type | never> {
        const {result, error} = await this.fetchRequest<Type>(buildUrl, finalConfig);

        if (error) { return Promise.reject(error); }

        return result!;
    }

    /**
     * The basic request config used for every request.
     * If a custom config is passed to a request, it will be used insead of this config.
     * @param method - Enum: "GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS", "TRACE", "HEAD", "CONNECT".
     * @param body - Can be any type. The body is stringified before being send.
     */
    public getBasicRequestConfig<T>(method?: string, body?: T): RequestInit {
        return {
            method: method ? method : "GET",
            headers: this.basicHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        };
    }

    private withAuthHeader(headers: Headers): Headers {
        if (!this.config || !this.config.authorization) {
            return headers;
        }

        headers.append("Authorization", this.config.authorization);
        return headers;
    }

    private basicHeaders(): Headers {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        return this.withAuthHeader(headers);
    }

    public async fetchRequest<T>(requestUrl: string, requestConfig: RequestInit): Promise<{result: T | any | null, error: any | null}> {
        try
        {
            if (this.useBefore) {
                const {url, config} = this.useBefore(requestUrl, requestConfig);
                requestUrl = url;
                requestConfig = config;
            }

            let result: Response = await fetch(requestUrl, requestConfig);

            if (!result.ok) { throw result; }

            if (this.returnFullRequest) {
                if (this.useAfter) {
                    result = this.useAfter(result);
                }
                return { result, error: null };
            }

            let json: T =  await result.json();

            if (this.useAfter) {
                json = this.useAfter(json);
            }

            return {result: json, error: null};
        }
        catch(error: any)
        {
            return {result: null, error};
        }
    }

    /**
     * Used to create the pre-made url for every request, based on data given in the SarvisConfig in the constructor.
     * If no config was passed, or no base_url was passed in the config, returns undefined.
     * @private
     */
    private createApiUrl(): string | undefined {

        if (!this.config || !this.config.base_url) {
            return undefined;
        }
 
        return `${this.config.base_url}${this.config.port ? ":"+this.config.port : ""}${this.config.base_path ? this.config.base_path : ""}`
    }

    private getApiUrl(): string {
        if (this.api_url) { return this.api_url; }

        return "";
    }
}

export default Sarvis;
