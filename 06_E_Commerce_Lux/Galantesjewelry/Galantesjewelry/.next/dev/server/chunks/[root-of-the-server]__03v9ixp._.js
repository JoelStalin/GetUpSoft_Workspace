module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/Galantesjewelry/lib/runtime-paths.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDataRoot",
    ()=>getDataRoot
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
function getDataRoot() {
    if (process.env.APP_DATA_DIR) {
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["resolve"])(/* turbopackIgnore: true */ process.env.APP_DATA_DIR);
    }
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["resolve"])(process.cwd(), 'data');
}
}),
"[project]/Galantesjewelry/lib/storage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALLOWED_FILE_EXTENSIONS",
    ()=>ALLOWED_FILE_EXTENSIONS,
    "ALLOWED_MIME_TYPES",
    ()=>ALLOWED_MIME_TYPES,
    "MAX_FILE_SIZE",
    ()=>MAX_FILE_SIZE,
    "STORAGE_BASE",
    ()=>STORAGE_BASE,
    "buildImageUrl",
    ()=>buildImageUrl,
    "deleteManagedImage",
    ()=>deleteManagedImage,
    "ensureStorageDirectory",
    ()=>ensureStorageDirectory,
    "getImageProcessingMode",
    ()=>getImageProcessingMode,
    "getStorageIdFromUrl",
    ()=>getStorageIdFromUrl,
    "isManagedImageUrl",
    ()=>isManagedImageUrl,
    "resolveManagedImageFile",
    ()=>resolveManagedImageFile,
    "saveProcessedImage",
    ()=>saveProcessedImage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$runtime$2d$paths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/runtime-paths.ts [app-route] (ecmascript)");
;
;
;
;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg'
];
const ALLOWED_FILE_EXTENSIONS = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp'
];
const STORAGE_BASE = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["resolve"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$runtime$2d$paths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDataRoot"])(), 'blobs');
const INTERNAL_IMAGE_PATH = '/api/image';
let sharpProcessorPromise = null;
let hasLoggedSharpFallback = false;
function sanitizeStorageId(value) {
    return value.replace(/[^a-zA-Z0-9._-]/g, '');
}
function normalizeBaseName(fileName) {
    const withoutExtension = fileName.replace(/\.[^/.]+$/, '');
    const normalized = withoutExtension.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
    return normalized || 'image';
}
function getFileExtension(fileName) {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex < 0) {
        return '';
    }
    return fileName.slice(lastDotIndex).toLowerCase();
}
function getStorageFilePath(storageId) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(STORAGE_BASE, sanitizeStorageId(storageId));
}
async function getSharpProcessor() {
    if (!sharpProcessorPromise) {
        sharpProcessorPromise = (async ()=>{
            try {
                const sharpNamespace = await __turbopack_context__.A("[externals]/sharp [external] (sharp, cjs, [project]/Galantesjewelry/node_modules/sharp, async loader)");
                return 'default' in sharpNamespace ? sharpNamespace.default : sharpNamespace;
            } catch (error) {
                if (!hasLoggedSharpFallback) {
                    console.warn('[Storage] sharp unavailable, using passthrough image storage:', error);
                    hasLoggedSharpFallback = true;
                }
                return null;
            }
        })();
    }
    return sharpProcessorPromise;
}
function detectImageFormat(buffer) {
    if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 && buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a) {
        return {
            contentType: 'image/png',
            extension: 'png'
        };
    }
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return {
            contentType: 'image/jpeg',
            extension: 'jpg'
        };
    }
    if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
        return {
            contentType: 'image/webp',
            extension: 'webp'
        };
    }
    return null;
}
async function getImageProcessingMode() {
    const sharpProcessor = await getSharpProcessor();
    return sharpProcessor ? 'sharp' : 'passthrough';
}
function buildImageUrl(storageId) {
    return `${INTERNAL_IMAGE_PATH}?id=${encodeURIComponent(storageId)}`;
}
function getStorageIdFromUrl(url) {
    if (!url) {
        return null;
    }
    if (!url.startsWith(INTERNAL_IMAGE_PATH)) {
        return null;
    }
    const searchIndex = url.indexOf('?');
    const search = searchIndex >= 0 ? url.slice(searchIndex + 1) : '';
    const params = new URLSearchParams(search);
    const storageId = params.get('id');
    if (!storageId) {
        return null;
    }
    const safeStorageId = sanitizeStorageId(storageId);
    return safeStorageId || null;
}
function isManagedImageUrl(url) {
    return Boolean(getStorageIdFromUrl(url));
}
async function ensureStorageDirectory() {
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(STORAGE_BASE)) {
        await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["mkdir"])(STORAGE_BASE, {
            recursive: true
        });
    }
}
async function saveProcessedImage(file, options) {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('El archivo es demasiado grande (maximo 5MB)');
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error('Formato de archivo no permitido. Use JPG, PNG o WEBP.');
    }
    if (!ALLOWED_FILE_EXTENSIONS.includes(getFileExtension(file.name))) {
        throw new Error('Formato de archivo no permitido. Use JPG, PNG o WEBP.');
    }
    await ensureStorageDirectory();
    const isFavicon = Boolean(options?.isFavicon);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const sharpProcessor = await getSharpProcessor();
    let processedBuffer;
    let contentType;
    let extension;
    if (sharpProcessor) {
        try {
            processedBuffer = isFavicon ? await sharpProcessor(buffer).resize(32, 32, {
                fit: 'cover'
            }).png().toBuffer() : await sharpProcessor(buffer).resize(1200, 1200, {
                fit: 'inside',
                withoutEnlargement: true
            }).webp({
                quality: 85
            }).toBuffer();
            contentType = isFavicon ? 'image/png' : 'image/webp';
            extension = isFavicon ? 'png' : 'webp';
        } catch (error) {
            console.error('[Storage] Invalid image payload:', error);
            throw new Error('El archivo no contiene una imagen valida.');
        }
    } else {
        const detectedFormat = detectImageFormat(buffer);
        if (!detectedFormat) {
            throw new Error('El archivo no contiene una imagen valida.');
        }
        if (isFavicon && detectedFormat.contentType !== 'image/png') {
            throw new Error('En este host el favicon debe subirse en PNG.');
        }
        processedBuffer = buffer;
        contentType = isFavicon ? 'image/png' : detectedFormat.contentType;
        extension = isFavicon ? 'png' : detectedFormat.extension;
    }
    const prefix = isFavicon ? 'favicon' : 'image';
    const storageId = `${prefix}-${Date.now()}-${normalizeBaseName(file.name)}.${extension}`;
    const filePath = getStorageFilePath(storageId);
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["writeFile"])(filePath, processedBuffer);
    return {
        contentType,
        size: processedBuffer.length,
        storageId,
        url: buildImageUrl(storageId)
    };
}
async function deleteManagedImage(url) {
    const storageId = getStorageIdFromUrl(url);
    if (!storageId) {
        return false;
    }
    try {
        await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["unlink"])(getStorageFilePath(storageId));
        return true;
    } catch (error) {
        const fileError = error;
        if (fileError.code === 'ENOENT') {
            return false;
        }
        throw error;
    }
}
function resolveManagedImageFile(urlOrId) {
    const storageId = getStorageIdFromUrl(urlOrId) || sanitizeStorageId(urlOrId);
    if (!storageId) {
        throw new Error('Invalid storage id');
    }
    return {
        filePath: getStorageFilePath(storageId),
        storageId
    };
}
}),
"[project]/Galantesjewelry/app/api/health/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/storage.ts [app-route] (ecmascript)");
;
;
;
;
async function GET() {
    try {
        await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["mkdir"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["STORAGE_BASE"], {
            recursive: true
        });
        await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["access"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["STORAGE_BASE"], __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["constants"].R_OK | __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["constants"].W_OK);
        const imageProcessing = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getImageProcessingMode"])();
        return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            imageProcessing,
            status: 'ok',
            storageBase: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["STORAGE_BASE"],
            writable: true
        });
    } catch  {
        const imageProcessing = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getImageProcessingMode"])().catch(()=>'unknown');
        return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            imageProcessing,
            status: 'degraded',
            storageBase: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["STORAGE_BASE"],
            writable: false
        }, {
            status: 503
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__03v9ixp._.js.map