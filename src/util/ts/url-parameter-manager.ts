type UrlKeys = Record<string, any>;

export class URLParameterManager {
    set(object: UrlKeys) {
        const params = new URLSearchParams();
        Object.entries(object).forEach(
            ([ key, value ]) => params.set(key, value)
        );
        this.setParams(params);
    }

    replace(object: UrlKeys) {
        const params = this.getParams();
        Object.entries(object).forEach(
            ([ key, value ]) => params.set(key, value)
        );
        this.setParams(params);
    }

    remove(...keys: string[]) {
        const params = this.getParams();
        keys.forEach(i => params.delete(i));
        this.setParams(params);
    }

    getParams() {
        return new URL(window.location.href).searchParams;
    }

    setParams(params: object) {
        const url = new URL(window.location.toString());
        url.search = params.toString();
        window.history.pushState({}, "", url.href);
    }
};
