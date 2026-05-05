"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("middleware",{

/***/ "(middleware)/./lib/supabase/config.ts":
/*!********************************!*\
  !*** ./lib/supabase/config.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getSupabaseEnv: () => (/* binding */ getSupabaseEnv)\n/* harmony export */ });\nconst SUPABASE_URL = \"https://arwgrykohsyvgtstxioj.supabase.co\" || 0;\nconst SUPABASE_PUBLISHABLE_KEY = \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyd2dyeWtvaHN5dmd0c3R4aW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzcyNDMsImV4cCI6MjA5MjgxMzI0M30._h4__Zlei-wR8W_04UtmWM4MBRGCJjpsLeAb4Tm5vRA\" || 0;\nfunction getSupabaseEnv() {\n    if (!SUPABASE_URL) {\n        throw new Error(\"Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL in your .env.local.\");\n    }\n    if (!SUPABASE_PUBLISHABLE_KEY) {\n        throw new Error(\"Missing Supabase publishable key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in your .env.local.\");\n    }\n    return {\n        url: SUPABASE_URL,\n        publishableKey: SUPABASE_PUBLISHABLE_KEY\n    };\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vbGliL3N1cGFiYXNlL2NvbmZpZy50cyIsIm1hcHBpbmdzIjoiOzs7O0FBQUEsTUFBTUEsZUFDSkMsMENBQW9DLElBQUlBLENBQXdCO0FBRWxFLE1BQU1HLDJCQUNKSCxrTkFBeUMsSUFDekNBLENBQWdEO0FBRTNDLFNBQVNNO0lBQ2QsSUFBSSxDQUFDUCxjQUFjO1FBQ2pCLE1BQU0sSUFBSVEsTUFDUjtJQUVKO0lBRUEsSUFBSSxDQUFDSiwwQkFBMEI7UUFDN0IsTUFBTSxJQUFJSSxNQUNSO0lBRUo7SUFFQSxPQUFPO1FBQ0xDLEtBQUtUO1FBQ0xVLGdCQUFnQk47SUFDbEI7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9saWIvc3VwYWJhc2UvY29uZmlnLnRzPzUwMzUiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgU1VQQUJBU0VfVVJMID1cbiAgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIHx8IHByb2Nlc3MuZW52LlNVUEFCQVNFX1VSTFxuXG5jb25zdCBTVVBBQkFTRV9QVUJMSVNIQUJMRV9LRVkgPVxuICBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSB8fFxuICBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9QVUJMSVNIQUJMRV9LRVlcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFN1cGFiYXNlRW52KCkge1xuICBpZiAoIVNVUEFCQVNFX1VSTCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIFwiTWlzc2luZyBTdXBhYmFzZSBVUkwuIFNldCBORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwgaW4geW91ciAuZW52LmxvY2FsLlwiXG4gICAgKVxuICB9XG5cbiAgaWYgKCFTVVBBQkFTRV9QVUJMSVNIQUJMRV9LRVkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIk1pc3NpbmcgU3VwYWJhc2UgcHVibGlzaGFibGUga2V5LiBTZXQgTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkgb3IgTkVYVF9QVUJMSUNfU1VQQUJBU0VfUFVCTElTSEFCTEVfS0VZIGluIHlvdXIgLmVudi5sb2NhbC5cIlxuICAgIClcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdXJsOiBTVVBBQkFTRV9VUkwsXG4gICAgcHVibGlzaGFibGVLZXk6IFNVUEFCQVNFX1BVQkxJU0hBQkxFX0tFWSxcbiAgfVxufVxuIl0sIm5hbWVzIjpbIlNVUEFCQVNFX1VSTCIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwiLCJTVVBBQkFTRV9QVUJMSVNIQUJMRV9LRVkiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1BVQkxJU0hBQkxFX0tFWSIsImdldFN1cGFiYXNlRW52IiwiRXJyb3IiLCJ1cmwiLCJwdWJsaXNoYWJsZUtleSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(middleware)/./lib/supabase/config.ts\n");

/***/ })

});