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
     *  thumbnail: string; preview: string; href: string;
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
        this.element.submit.addEventListener("click",
            () => this.submitSearch()
        );
        this.element.input.addEventListener("input",
            () => this.suggestAutocompletion()
        );
    }

    /**
     * @param {string} id 
     * @param {string | undefined} query 
     * @returns {HTMLElement}
     */
    getElement(id, query) {
        const el = document.getElementById(id);
        if (query) return el.querySelector(query);
        else return el;
    }

    suggestAutocompletion() {
        this.element.autocomplete.replaceChildren();
        const query = this.element.input.value;

        Promise.resolve(this.getAutocompletion(query)).then(results =>
            this.element.autocomplete
            .replaceChildren(...results.map((tag, index) => (
                <li key={index}>
                    <span className="name">{ tag.name }</span>
                    <span className="count">{ tag.count }</span>
                </li>
            )))
        );
    }

    submitSearch() {
        this.element.results.replaceChildren();
        const query = this.element.input.value;

        this.urlParam.set({ q: query });
        Promise.resolve(this.getSearchResults(query)).then(results =>
            this.element.results
            .replaceChildren(...results.map((post, index) => (
                <li
                    key={index}
                    title={
                        `${post.id}: ${post.tags
                            .map(t => `${t.name} (${t.count})`)
                            .join(", ")
                        }`
                    }
                >
                    <a href={post.href}>
                        <img
                            src={post.thumbnail}
                            onMouseOver={setSrc(post.preview)}
                            onMouseOut ={setSrc(post.thumbnail)}
                        />
                    </a>
                </li>
            )))
        );
        
        var setSrc = (src) => function () { this.src = src; };
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
