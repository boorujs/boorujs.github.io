import * as Rule34 from "https://esm.sh/gh/booru-abuse/booru-abuse/src/module/rule34/index.ts.mjs?target=es2022";

/* this page is in testing and i just want to be sure esm.sh works before i get
 * custom api keys or a vercel service set up
 *
 * ill refresh the key for the account once i get that set up #lol
 * 
 * dont abuse this key please and thanks!
 */
const auth = {
    api_key: "57931764243134609eb715b9d5c931134cb3cadfdbe166548b2b25543b869f82ee435076819810388fac48119b1eb0731dc86d75aff7b163e5d0c01f21618ecb",
    user_id: 5894621
};

const client = new Rule34.Client({ auth: auth });

try {
    client.test();
} catch (error) {
    window.alert([
        [
            "Uh-oh! The API key doesn't work properly. Please let me know via an",
            "issue and I'll be sure to fix it as soon as I can. Below are the",
            "specific error details."
        ].join(" "),
        error.toString()
    ].join("\n"));
    window.stop();
}

let getEl = (...i) => document.getElementById(...i);

const search = {
    input: getEl("search-input"),
    autocomplete: getEl("search-autocomplete"),
    results: getEl("search-results")
};

search.input.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        search.results.textContent = "";

        client.search(search.input.value, {
            perPage: 42
        }).then(posts => posts.forEach(post => {
            const a = document.createElement("a");
            a.href = post.file.url;

            const li = document.createElement("li");
            a.appendChild(li);
            li.title = `${
                post.id
            }: ${
                post.tags
                    .ofCategory(Rule34.TagType.Artist)
                    .map(t => `${t.name} (${t.count})`)
                    .join(", ")
            }`;

            const img = document.createElement("img");
            li.appendChild(img);
            img.src = post.file.thumbnail.url;
            
            search.results.appendChild(a);
        }));
    }
})
