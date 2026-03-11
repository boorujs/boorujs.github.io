import { defineConfig } from "vite";
import { glob } from "glob";

import react from "@vitejs/plugin-react";

export default defineConfig({
    preview: {
        port: 6767
    },
    esbuild: {
        jsxImportSource: "jsx-dom",
        jsxInject: `import React from "react"`
    },
    build: {
        emptyOutDir: true,
        assetsInlineLimit: 0,
        sourcemap: true,
        rollupOptions: {
            input: [
                ...glob.sync("src/**/*.html")
            ]
        }
    },
    css: {
        devSourcemap: true
    },
    plugins: [
        react(),
        {
            name: "remove-src-dir-from-path",
            enforce: "post",
            generateBundle(_, bundle) {
                const regex = /^src\//;
                for (const item of Object.values(bundle)) {
                    if (!regex.test(item.fileName)) continue;
                    item.fileName = item.fileName.replace(regex, "");
                }
            }
        }
    ]
});
