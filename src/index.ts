export interface ISarvisConfig {
    base_url?: string;
    port?: number;
    base_path?: string;
    authorization?: string;
}

export class Sarvis {

    public config?: ISarvisConfig;
    public api_url: string | undefined;

    constructor (config?: ISarvisConfig) {
        this.config = config;
        this.api_url = this.createApiUrl();
    }

    public get = async <Type>(url: string, customConfig?: RequestInit ): Promise<Type> => {

        const config = customConfig ? customConfig : this.getBasicRequestConfig("GET");

        const {result, error} = await this.fetchRequest<Type>(fetch(this.getApiUrl + url, config));

        if (error) { return Promise.reject("An Error" + error); }

        return result!;
    };

    public post = async <Type>(url: string, body: any, customConfig?: RequestInit): Promise<Type> => {

        const config = customConfig ? customConfig : this.getBasicRequestConfig("POST", body);

        const {result, error} = await this.fetchRequest<Type>(fetch(this.getApiUrl + url, config));

        if (error) { return Promise.reject(error); }

        return result!;
    };

    public put = async <Type>(url: string, body: any, customConfig?: RequestInit): Promise<Type> => {

        const config = customConfig ? customConfig : this.getBasicRequestConfig("PUT", body);

        const {result, error} = await this.fetchRequest<Type>(fetch(this.getApiUrl + url, config));

        if (error) { return Promise.reject(error); }

        return result!;
    };

    public delete = async <Type>(url: string, body?: any, customConfig?: RequestInit): Promise<Type> => {

        const config = customConfig ? customConfig : this.getBasicRequestConfig("DELETE", body);

        const {result, error} = await this.fetchRequest<Type>(fetch(this.getApiUrl + url, config));

        if (error) { return Promise.reject(error); }

        return result!;
    };

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

    // If you want to do any generic error handling, you can do it here.
    // For example: Requesting a new token with the refresh token.
    private async fetchRequest<T>(promise: Promise<Response>): Promise<{result: T | null, error: any | null}> {
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
