const ERROR_CODE = {
    METHOD_NOT_IMPLEMENTED: "Method must be implemented by subclass.",
    PROPERTY_NOT_IMPLEMENTED: "Property must be implemented by subclass."
};

/** @abstract */
export default class Submodule {
    /**
     * @abstract Method run when autocompletion is searched for.
     * @param {string} query Value of input element.
     * @returns {{ name: string; count: number; value: string; }[]}
     */
    getAutocompletion(query) {
        this.throwError("METHOD_NOT_IMPLEMENTED");
    }
    
    /**
     * @abstract Method run when post results are searched for.
     * @param {string} query Value of input element.
     * @returns {{
     *  thumbnail: string; preview: string;
     *  id: string | number; tags: { name: string; count: number; }[];
     * }[]}
     */
    getSearchResults(query) {
        this.throwError("METHOD_NOT_IMPLEMENTED");
    }

    constructor () {
        this.run();
    }
    
    element = {
        input: this.getElement("search-bar", "input.input"),
        clear: this.getElement("search-bar", "button.clear"),
        autocomplete: this.getElement("search-bar", "ul.autocomplete"),
        submit: this.getElement("search-bar", "button.submit"),
        results: this.getElement("search-results")
    };

    run() {
        this.element.input.addEventListener("keydown",
            event => event.key === "Enter" && this.submitSearch()
        );
    }

    getElement(id, query) {
        const el = document.getElementById(id);
        if (query) return el.querySelector(query);
        else return el;
    }

    submitSearch() {
        const query = this.element.input.value;

        this.urlParam.set({ q: query });
        
    }

    urlParam = {
        set(object) {
            const params = new URLSearchParams();
            Object.entries(object).forEach(
                ([ key, value ]) => params.set(key, value)
            );
            this.setParams(params);
        },
        replace(object) {
            const params = this.getParams();
            Object.entries(object).forEach(
                ([ key, value ]) => params.set(key, value)
            );
            this.setParams(params);
        },
        remove(...keys) {
            const params = this.getParams();
            keys.forEach(params.delete);
            this.setParams(params);
        },
        getParams() {
            return new URL(window.location.href).searchParams;
        },
        setParams(params) {
            const url = new URL(window.location);
            url.search = params.toString();
            window.history.replaceState({}, "", url.href);
        }
    };

    /**
     * @param {keyof typeof ERROR_CODE} code
     */
    throwError(code) {
        throw new Error(ERROR_CODE[code]);
    }
}
