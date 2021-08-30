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

    constructor (config?: ISarvisConfig) {
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
    public get = async <Type>(url: string, customConfig?: RequestInit): Promise<Type> => {

        const config = customConfig ? customConfig : this.getBasicRequestConfig("GET");

        const {result, error} = await this.fetchRequest<Type>(fetch(this.getApiUrl() + url, config));

        if (error) { return Promise.reject("An Error" + error); }

        return result!;
    };

    public post = async <Type>(url: string, body: any, customConfig?: RequestInit): Promise<Type> => {

        const config = customConfig ? customConfig : this.getBasicRequestConfig("POST", body);

        const {result, error} = await this.fetchRequest<Type>(fetch(this.getApiUrl() + url, config));

        if (error) { return Promise.reject(error); }

        return result!;
    };

    public put = async <Type>(url: string, body: any, customConfig?: RequestInit): Promise<Type> => {

        const config = customConfig ? customConfig : this.getBasicRequestConfig("PUT", body);

        const {result, error} = await this.fetchRequest<Type>(fetch(this.getApiUrl() + url, config));

        if (error) { return Promise.reject(error); }

        return result!;
    };

    public delete = async <Type>(url: string, body?: any, customConfig?: RequestInit): Promise<Type> => {

        const config = customConfig ? customConfig : this.getBasicRequestConfig("DELETE", body);

        const {result, error} = await this.fetchRequest<Type>(fetch(this.getApiUrl() + url, config));

        if (error) { return Promise.reject(error); }

        return result!;
    };

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

    /**
     * This request takes a promise, executes it and attempts to get JSON data from it.
     * The format in which it returns data should be easier to work with than the regular try catches usually implemted
     * with promises.
     * @param promise - The promise that will be executed.
     *
     * @Example const {result, error} = await fetchRequest<Type>(fetch("https://a-website.org"));
     */
    public async fetchRequest<T>(promise: Promise<Response>): Promise<{result: T | null, error: any | null}> {
        try {
            const result: Response = await promise;

            if (!result.ok) { throw result; }

            const json: T =  await result.json();
            return {result: json, error: null};
        }
        catch(error: any) {
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

        let url = this.config.base_url;

        if (this.config.base_path) {
            url = url + this.config.base_path;
        }

        if (this.config.port) {
            url = url + this.config.port;
        }

        return url;
    }

    private getApiUrl(): string {
        if (this.api_url) { return this.api_url; }

        return "";
    }
}

export default Sarvis;
