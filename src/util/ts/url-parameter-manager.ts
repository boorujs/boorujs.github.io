type UrlKeys = Record<string, any>;

export class URLParameterManager {
    get(key: string) {
        return this.getParams().get(key);
    }

    set(object: UrlKeys, data?: any = {}) {
        const params = new URLSearchParams();
        Object.entries(object).forEach(
            ([ key, value ]) => params.set(key, value)
        );
        this.setParams(params, data);
    }

    replace(object: UrlKeys, data?: any = {}) {
        const params = this.getParams();
        Object.entries(object).forEach(
            ([ key, value ]) => params.set(key, value)
        );
        this.setParams(params, data);
    }

    remove(keys: string[], data?: any = {}) {
        const params = this.getParams();
        keys.forEach(i => params.delete(i));
        this.setParams(params, data);
    }

    getParams() {
        return new URL(window.location.href).searchParams;
    }

    setParams(params: URLSearchParams, data?: any = {}) {
        const url = new URL(window.location.toString());
        url.search = params.toString();
        window.history.pushState(data, "", url.href);
    }
};
