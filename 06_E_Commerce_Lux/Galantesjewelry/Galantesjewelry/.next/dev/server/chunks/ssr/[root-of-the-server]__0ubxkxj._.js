module.exports = [
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[project]/Galantesjewelry/lib/runtime-paths.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/Galantesjewelry/lib/storage.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$runtime$2d$paths$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/runtime-paths.ts [app-rsc] (ecmascript)");
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
const STORAGE_BASE = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["resolve"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$runtime$2d$paths$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDataRoot"])(), 'blobs');
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
"[project]/Galantesjewelry/src/config/odooClient.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OdooConfigError",
    ()=>OdooConfigError,
    "OdooRequestError",
    ()=>OdooRequestError,
    "assertOdooConfig",
    ()=>assertOdooConfig,
    "buildOdooJson2Url",
    ()=>buildOdooJson2Url,
    "createOdooClient",
    ()=>createOdooClient,
    "getOdooAuthToken",
    ()=>getOdooAuthToken,
    "getOdooConfig",
    ()=>getOdooConfig,
    "getOdooHeaders",
    ()=>getOdooHeaders,
    "parseBooleanEnv",
    ()=>parseBooleanEnv
]);
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_USER_AGENT = 'galantes-jewelry-appointments/1.0';
const DEFAULT_PARTNER_MODEL = 'res.partner';
const DEFAULT_APPOINTMENT_MODEL = 'galante.appointment';
const NON_RETRYABLE_STATUS_CODES = new Set([
    401,
    403,
    404
]);
const TRUE_VALUES = new Set([
    '1',
    'true',
    'yes',
    'on'
]);
const FALSE_VALUES = new Set([
    '0',
    'false',
    'no',
    'off'
]);
class OdooConfigError extends Error {
    constructor(message, details = {}){
        super(message);
        this.name = 'OdooConfigError';
        this.details = details;
    }
}
class OdooRequestError extends Error {
    constructor(message, details = {}){
        super(message);
        this.name = 'OdooRequestError';
        this.details = details;
    }
}
function firstDefinedValue(...values) {
    return values.find((value)=>value !== undefined && value !== null);
}
function parseBooleanEnv(value, fallback = false) {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    const normalized = String(value).trim().toLowerCase();
    if (TRUE_VALUES.has(normalized)) {
        return true;
    }
    if (FALSE_VALUES.has(normalized)) {
        return false;
    }
    throw new OdooConfigError(`Invalid boolean value "${value}" in Odoo configuration.`);
}
function parseIntegerEnv(value, fallback, label) {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }
    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new OdooConfigError(`${label} must be a positive integer.`);
    }
    return parsed;
}
function normalizeOptionalString(value) {
    if (value === undefined || value === null) {
        return '';
    }
    return String(value).trim();
}
function normalizeBaseUrl(value) {
    const normalized = normalizeOptionalString(value).replace(/\/+$/, '');
    if (!normalized) {
        return '';
    }
    try {
        const url = new URL(normalized);
        if (![
            'http:',
            'https:'
        ].includes(url.protocol)) {
            throw new Error('Invalid protocol');
        }
        return url.toString().replace(/\/+$/, '');
    } catch  {
        throw new OdooConfigError('ODOO_BASE_URL must be a valid http(s) URL.');
    }
}
function getOdooAuthToken(overrides = {}) {
    return normalizeOptionalString(firstDefinedValue(overrides.authToken, process.env.ODOO_BEARER_TOKEN, process.env.ODOO_API_KEY));
}
function getOdooPasswordFallback(overrides = {}) {
    return normalizeOptionalString(firstDefinedValue(overrides.password, process.env.ODOO_PASSWORD));
}
function getOdooConfig(overrides = {}) {
    const enabled = parseBooleanEnv(firstDefinedValue(overrides.enabled, process.env.ODOO_ENABLED), true);
    const baseUrl = normalizeBaseUrl(firstDefinedValue(overrides.baseUrl, process.env.ODOO_BASE_URL));
    const database = normalizeOptionalString(firstDefinedValue(overrides.database, process.env.ODOO_DATABASE, process.env.ODOO_DB));
    const authToken = getOdooAuthToken(overrides);
    const password = getOdooPasswordFallback(overrides);
    const timeoutMs = parseIntegerEnv(firstDefinedValue(overrides.timeoutMs, process.env.ODOO_TIMEOUT_MS), DEFAULT_TIMEOUT_MS, 'ODOO_TIMEOUT_MS');
    const config = {
        enabled,
        baseUrl,
        database,
        authToken,
        password,
        timeoutMs,
        syncOnAppointmentValidated: parseBooleanEnv(firstDefinedValue(overrides.syncOnAppointmentValidated, process.env.ODOO_SYNC_ON_APPOINTMENT_VALIDATED), true),
        publicShopUrl: normalizeOptionalString(firstDefinedValue(overrides.publicShopUrl, process.env.ODOO_PUBLIC_SHOP_URL)),
        websiteId: normalizeOptionalString(firstDefinedValue(overrides.websiteId, process.env.ODOO_WEBSITE_ID)),
        companyId: normalizeOptionalString(firstDefinedValue(overrides.companyId, process.env.ODOO_COMPANY_ID)),
        partnerModel: normalizeOptionalString(firstDefinedValue(overrides.partnerModel, process.env.ODOO_PARTNER_MODEL)) || DEFAULT_PARTNER_MODEL,
        appointmentModel: normalizeOptionalString(firstDefinedValue(overrides.appointmentModel, process.env.ODOO_APPOINTMENT_MODEL)) || DEFAULT_APPOINTMENT_MODEL,
        userAgent: normalizeOptionalString(firstDefinedValue(overrides.userAgent, process.env.ODOO_USER_AGENT)) || DEFAULT_USER_AGENT
    };
    const missing = [];
    if (config.enabled && !config.baseUrl) {
        missing.push('ODOO_BASE_URL');
    }
    if (config.enabled && !config.authToken && !config.password) {
        missing.push('ODOO_BEARER_TOKEN or ODOO_API_KEY or ODOO_PASSWORD');
    }
    if (config.enabled && !config.database) {
        missing.push('ODOO_DATABASE or ODOO_DB');
    }
    return {
        ...config,
        missing,
        isReady: config.enabled ? missing.length === 0 : false
    };
}
function assertOdooConfig(config = getOdooConfig()) {
    if (!config.enabled) {
        throw new OdooConfigError('Odoo sync is disabled by configuration.', {
            missing: []
        });
    }
    if (config.missing.length > 0) {
        throw new OdooConfigError(`Odoo configuration is incomplete: ${config.missing.join(', ')}`, {
            missing: config.missing
        });
    }
    return config;
}
function getOdooHeaders(config = getOdooConfig()) {
    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json',
        'User-Agent': config.userAgent,
        'X-Odoo-Database': config.database
    };
    if (config.authToken) {
        headers['Authorization'] = `Bearer ${config.authToken}`;
    } else if (config.password) {
        // Some Odoo JSON-2 deployments accept the shared admin secret only via bearer auth.
        headers['Authorization'] = `Bearer ${config.password}`;
    }
    return headers;
}
function buildOdooUrl(model, method, config = getOdooConfig()) {
    const normalizedModel = normalizeOptionalString(model);
    const normalizedMethod = normalizeOptionalString(method);
    if (!normalizedModel || !normalizedMethod) {
        throw new OdooConfigError('Odoo model and method are required.');
    }
    return `${config.baseUrl}/json/2/${encodeURIComponent(normalizedModel)}/${encodeURIComponent(normalizedMethod)}`;
}
function buildOdooJson2Url(model, method, config = getOdooConfig()) {
    return buildOdooUrl(model, method, config);
}
async function parseResponseBody(response) {
    const contentType = response.headers.get('content-type') || '';
    if (response.status === 204) {
        return null;
    }
    if (contentType.includes('application/json')) {
        const data = await response.json();
        // Standard Odoo JSON-RPC wraps results in a 'result' or 'error' object
        if (data && typeof data === 'object' && ('result' in data || 'error' in data)) {
            if (data.error) {
                throw new OdooRequestError(data.error.message || 'Odoo JSON-RPC error', {
                    status: response.status,
                    body: data.error
                });
            }
            return data.result;
        }
        return data;
    }
    const text = await response.text();
    return text ? {
        message: text
    } : null;
}
function bindAbortSignal(controller, signal) {
    if (!signal) {
        return ()=>{};
    }
    if (signal.aborted) {
        controller.abort(signal.reason);
        return ()=>{};
    }
    const onAbort = ()=>controller.abort(signal.reason);
    signal.addEventListener('abort', onAbort, {
        once: true
    });
    return ()=>signal.removeEventListener('abort', onAbort);
}
function createOdooClient(overrides = {}) {
    function resolveConfig() {
        return getOdooConfig(overrides);
    }
    async function call(model, method, payload = {}, options = {}) {
        const config = assertOdooConfig(resolveConfig());
        const fetchImpl = options.fetchImpl || fetch;
        const maxRetries = options.maxRetries || 3;
        let lastError;
        for(let attempt = 0; attempt <= maxRetries; attempt++){
            const controller = new AbortController();
            const clearSignal = bindAbortSignal(controller, options.signal);
            const timeoutId = setTimeout(()=>controller.abort(), config.timeoutMs);
            try {
                if (attempt > 0) {
                    const delay = Math.pow(2, attempt) * 1000;
                    console.log(`[Odoo] Retry attempt ${attempt}/${maxRetries} using json2...`);
                    await new Promise((resolve)=>setTimeout(resolve, delay));
                }
                const cleanPayload = {
                    ...payload
                };
                delete cleanPayload.args;
                delete cleanPayload.kwargs;
                const response = await fetchImpl(buildOdooUrl(model, method, config), {
                    method: 'POST',
                    headers: getOdooHeaders(config),
                    body: JSON.stringify(cleanPayload),
                    signal: controller.signal
                });
                const result = await parseResponseBody(response);
                if (!response.ok) {
                    throw new OdooRequestError(result?.message || `Odoo request failed with status ${response.status}.`, {
                        status: response.status,
                        body: result,
                        model,
                        method
                    });
                }
                clearTimeout(timeoutId);
                clearSignal();
                return result;
            } catch (error) {
                clearTimeout(timeoutId);
                clearSignal();
                lastError = error;
                const errorStatus = error?.status || error?.details?.status;
                if (NON_RETRYABLE_STATUS_CODES.has(errorStatus) || error.name === 'OdooConfigError') {
                    throw error;
                }
                console.warn(`[Odoo] Request attempt ${attempt} failed with json2: ${error.message}`);
                if (attempt === maxRetries) {
                    throw error;
                }
            }
        }
        throw lastError || new OdooRequestError(`Unable to reach Odoo API after retries.`, {
            model,
            method
        });
    }
    return {
        getConfig: resolveConfig,
        call,
        async searchRead (model, payload = {}, options = {}) {
            return call(model, 'search_read', payload, options);
        },
        async create (model, values, options = {}) {
            return call(model, 'create', {
                vals: Array.isArray(values) ? undefined : values,
                vals_list: Array.isArray(values) ? values : [
                    values
                ]
            }, options);
        }
    };
}
;
}),
"[project]/Galantesjewelry/lib/odoo-cms-sync.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadCmsSnapshotFromOdoo",
    ()=>loadCmsSnapshotFromOdoo,
    "loadIntegrationsSnapshotFromOdoo",
    ()=>loadIntegrationsSnapshotFromOdoo,
    "syncCmsSnapshotToOdoo",
    ()=>syncCmsSnapshotToOdoo,
    "syncIntegrationsSnapshotToOdoo",
    ()=>syncIntegrationsSnapshotToOdoo,
    "syncSettingsToOdoo",
    ()=>syncSettingsToOdoo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$src$2f$config$2f$odooClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/src/config/odooClient.js [app-rsc] (ecmascript)");
;
function getOdooClient() {
    const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$src$2f$config$2f$odooClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOdooConfig"])();
    if (!config.isReady) {
        return null;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$src$2f$config$2f$odooClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createOdooClient"])(config);
}
async function readSingletonRecord() {
    const odoo = getOdooClient();
    if (!odoo) {
        return null;
    }
    try {
        const records = await odoo.searchRead('galante.cms.settings', {
            domain: [],
            fields: [
                'id',
                'cms_snapshot_json',
                'integrations_snapshot_json'
            ],
            limit: 1
        });
        return records[0] || null;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('Invalid apikey') || message.includes('Access Denied')) {
            console.warn('[OdooSync] Authentication failed (Invalid apikey/Access Denied). Using local cache.');
        } else {
            console.error('Odoo snapshot read failed:', error);
        }
        return null;
    }
}
function buildFlatCmsFields(snapshot) {
    const settings = snapshot.settings || {};
    return {
        site_title: settings.site_title || null,
        site_description: settings.site_description || null,
        favicon_url: settings.favicon_url || null,
        logo_url: settings.logo_url || null,
        hero_image_url: settings.hero_image_url || null,
        instagram_url: settings.instagram_url || null,
        facebook_url: settings.facebook_url || null,
        whatsapp_number: settings.whatsapp_number || null,
        contact_email: settings.contact_email || null,
        contact_phone: settings.contact_phone || null,
        contact_address: settings.contact_address || null,
        appointment_email: settings.appointment_email || null,
        navigation_json: JSON.stringify(settings.navigation_links || [])
    };
}
async function upsertSingletonRecord(values) {
    const odoo = getOdooClient();
    if (!odoo) {
        return;
    }
    const existing = await readSingletonRecord();
    if (existing) {
        await odoo.call('galante.cms.settings', 'write', {
            ids: [
                existing.id
            ],
            vals: values
        });
        return;
    }
    await odoo.call('galante.cms.settings', 'create', {
        vals: values
    });
}
async function syncCmsSnapshotToOdoo(snapshot) {
    try {
        const cms_snapshot_json = JSON.stringify(snapshot);
        await upsertSingletonRecord({
            cms_snapshot_json,
            ...buildFlatCmsFields(snapshot)
        });
        return {
            success: true
        };
    } catch (error) {
        console.error('Odoo CMS snapshot sync failed (non-blocking):', error);
        return {
            success: false
        };
    }
}
async function loadCmsSnapshotFromOdoo() {
    const record = await readSingletonRecord();
    if (!record?.cms_snapshot_json) {
        return null;
    }
    try {
        const parsed = JSON.parse(record.cms_snapshot_json);
        if (!parsed.settings || !Array.isArray(parsed.sections) || !Array.isArray(parsed.featured_items)) {
            return null;
        }
        return {
            settings: parsed.settings,
            sections: parsed.sections,
            featured_items: parsed.featured_items
        };
    } catch (error) {
        console.error('Invalid CMS snapshot JSON from Odoo:', error);
        return null;
    }
}
async function syncIntegrationsSnapshotToOdoo(snapshot) {
    try {
        const integrations_snapshot_json = JSON.stringify(snapshot);
        await upsertSingletonRecord({
            integrations_snapshot_json
        });
        return {
            success: true
        };
    } catch (error) {
        console.error('Odoo integrations snapshot sync failed (non-blocking):', error);
        return {
            success: false
        };
    }
}
async function loadIntegrationsSnapshotFromOdoo() {
    const record = await readSingletonRecord();
    if (!record?.integrations_snapshot_json) {
        return null;
    }
    try {
        const parsed = JSON.parse(record.integrations_snapshot_json);
        if (!parsed?.google || !parsed?.appointments || !Array.isArray(parsed.audit)) {
            return null;
        }
        return parsed;
    } catch (error) {
        console.error('Invalid integrations snapshot JSON from Odoo:', error);
        return null;
    }
}
async function syncSettingsToOdoo(settings) {
    const existing = await loadCmsSnapshotFromOdoo();
    return syncCmsSnapshotToOdoo({
        settings,
        sections: existing?.sections || [],
        featured_items: existing?.featured_items || []
    });
}
}),
"[project]/Galantesjewelry/lib/db.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addFeaturedItem",
    ()=>addFeaturedItem,
    "deleteFeaturedItem",
    ()=>deleteFeaturedItem,
    "getAllSections",
    ()=>getAllSections,
    "getFeaturedItems",
    ()=>getFeaturedItems,
    "getSettings",
    ()=>getSettings,
    "updateFeaturedItem",
    ()=>updateFeaturedItem,
    "updateSection",
    ()=>updateSection,
    "updateSettings",
    ()=>updateSettings
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$storage$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/storage.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$runtime$2d$paths$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/runtime-paths.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/odoo-cms-sync.ts [app-rsc] (ecmascript)");
;
;
;
;
;
const dataDir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$runtime$2d$paths$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDataRoot"])();
const dbFile = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(dataDir, 'cms.json');
const INITIAL_DATA = {
    settings: {
        favicon_url: '/api/image?id=favicon-1776389385968-favicon-32x32.png',
        logo_url: '/assets/branding/logo-transparent.png',
        brand_name: "Galante's Jewelry",
        brand_tagline: 'By The Sea',
        site_title: "Galante's Jewelry by the Sea ",
        site_description: 'Luxury jewelry boutique in Islamorada focused on bridal pieces, nautical collections, repairs, and private consultations.',
        instagram_url: 'https://www.instagram.com/galantesjewelrybythesea',
        facebook_url: 'https://www.facebook.com/people/Galantes-Jewelry-by-The-Sea/61574429843836',
        whatsapp_number: '16464965879',
        contact_email: 'concierge@galantesjewelry.com',
        contact_phone: '(305) 555-0199',
        contact_address: '82681 Overseas Highway, Islamorada, FL 33036, United States',
        appointment_email: 'ceo@galantesjewelry.com',
        hero_image_url: '/api/image?id=image-1776959050826-portada.webp',
        shop_hero_image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2844&auto=format&fit=crop',
        navigation_links: [
            {
                href: '/about',
                label: 'Heritage'
            },
            {
                href: '/collections',
                label: 'Collections'
            },
            {
                href: '/bridal',
                label: 'Bridal'
            },
            {
                href: '/repairs',
                label: 'Repairs'
            },
            {
                href: '/contact',
                label: 'Contact'
            }
        ]
    },
    sections: [
        {
            id: '1',
            section_identifier: 'hero',
            title: "Galante's Jewelry by the Sea",
            content_text: "The Coastal Concierge",
            image_url: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=2844&auto=format&fit=crop",
            action_text: "Book Appointment",
            action_link: "/contact",
            is_active: true
        },
        {
            id: '2',
            section_identifier: 'philosophy',
            title: "Barefoot Luxury in Islamorada",
            content_text: "We curate and craft fine nautical jewelry designed to celebrate the spirit of the Florida Keys. Whether you're marking an anniversary, planning a destination wedding, or restoring an heirloom timepiece, our concierge service ensures every detail is attended to with master craftsmanship.",
            image_url: "",
            is_active: true
        },
        {
            id: '6',
            section_identifier: 'review',
            title: "Client Testimonials",
            content_text: "\"Galante's created the most breathtaking engagement ring for my fiancé. Their attention to detail and personal concierge service made our Islamorada trip truly unforgettable.\"",
            subtitle: "— Sarah & James, Florida",
            image_url: "",
            is_active: true
        },
        {
            id: '7',
            section_identifier: 'cta',
            title: "Begin Your Story",
            content_text: "Whether you are visiting the Florida Keys or are a local resident, we invite you to experience jewelry curation as it should be.",
            action_text: "Schedule Your Consultation",
            action_link: "/contact",
            image_url: "",
            is_active: true
        }
    ],
    featured_items: [
        {
            id: 'f1',
            title: "Destination Weddings",
            content_text: "Bespoke engagement rings and wedding bands designed to capture your moment by the sea.",
            image_url: "https://images.unsplash.com/photo-1599643478514-4a52023960c1?q=80&w=1471&auto=format&fit=crop",
            action_text: "Discover Bridal",
            action_link: "/bridal",
            is_active: true,
            order_index: 0
        },
        {
            id: 'f2',
            title: "Nautical Gold & Silver",
            content_text: "Signature pieces honoring our coastal heritage, from mariner links to compass pendants.",
            image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1587&auto=format&fit=crop",
            action_text: "View Collections",
            action_link: "/collections",
            is_active: true,
            order_index: 1
        },
        {
            id: 'f3',
            title: "Master Repair",
            content_text: "Entrust your cherished watches and heirlooms to our master jewelers for restoration.",
            image_url: "https://images.unsplash.com/photo-1584811644165-4f367e1a3962?q=80&w=1626&auto=format&fit=crop",
            action_text: "Service Details",
            action_link: "/repairs",
            is_active: true,
            order_index: 2
        }
    ]
};
function sanitizeLogoUrl(logoUrl) {
    const trimmedLogoUrl = logoUrl?.trim();
    if (!trimmedLogoUrl || /photoroom|error/i.test(trimmedLogoUrl)) {
        return INITIAL_DATA.settings.logo_url;
    }
    return trimmedLogoUrl;
}
let memCache = null;
let memCacheMtimeMs = null;
let initPromise = null;
function hydrateCmsData(parsed) {
    let needsUpdate = false;
    if (!parsed.settings) {
        parsed.settings = INITIAL_DATA.settings;
        needsUpdate = true;
    } else {
        parsed.settings = {
            ...INITIAL_DATA.settings,
            ...parsed.settings
        };
    }
    if (!parsed.sections) {
        parsed.sections = INITIAL_DATA.sections;
        needsUpdate = true;
    }
    if (!parsed.featured_items) {
        parsed.featured_items = INITIAL_DATA.featured_items;
        parsed.sections = (parsed.sections || []).filter((s)=>!s.section_identifier.startsWith('featured_'));
        needsUpdate = true;
    }
    return {
        data: {
            settings: parsed.settings ?? INITIAL_DATA.settings,
            sections: parsed.sections ?? INITIAL_DATA.sections,
            featured_items: parsed.featured_items ?? INITIAL_DATA.featured_items
        },
        needsUpdate
    };
}
async function performInit() {
    try {
        await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(dataDir, {
            recursive: true
        });
    } catch  {}
    try {
        const fileContent = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(dbFile, 'utf-8');
        const parsed = JSON.parse(fileContent);
        const { data: hydratedData, needsUpdate } = hydrateCmsData(parsed);
        if (needsUpdate) {
            await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(dbFile, JSON.stringify(hydratedData, null, 2), 'utf-8');
        }
        memCache = hydratedData;
        memCacheMtimeMs = (await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].stat(dbFile)).mtimeMs;
    } catch  {
        const odooSnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadCmsSnapshotFromOdoo"])();
        const fallbackData = odooSnapshot ? {
            settings: {
                ...INITIAL_DATA.settings,
                ...odooSnapshot.settings
            },
            sections: odooSnapshot.sections,
            featured_items: odooSnapshot.featured_items
        } : INITIAL_DATA;
        await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(dbFile, JSON.stringify(fallbackData, null, 2), 'utf-8');
        memCache = fallbackData;
        memCacheMtimeMs = (await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].stat(dbFile)).mtimeMs;
    }
}
async function initDB() {
    if (!initPromise) {
        initPromise = performInit();
    }
    return initPromise;
}
async function readDB() {
    await initDB();
    const fileStats = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].stat(dbFile);
    if (memCache && memCacheMtimeMs === fileStats.mtimeMs) {
        return memCache;
    }
    const fileContent = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(dbFile, 'utf-8');
    const parsed = JSON.parse(fileContent);
    memCache = parsed;
    memCacheMtimeMs = fileStats.mtimeMs;
    return parsed;
}
async function writeDB(data) {
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(dbFile, JSON.stringify(data, null, 2), 'utf-8');
    memCache = data;
    memCacheMtimeMs = (await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].stat(dbFile)).mtimeMs;
}
function collectReferencedImages(data) {
    return [
        data.settings?.favicon_url,
        data.settings?.logo_url,
        ...(data.sections || []).map((section)=>section.image_url),
        ...(data.featured_items || []).map((item)=>item.image_url)
    ].filter((value)=>Boolean(value));
}
async function cleanupRemovedManagedImages(previousUrls, currentData) {
    const remainingUrls = new Set(collectReferencedImages(currentData));
    const removedUrls = [
        ...new Set(previousUrls.filter((url)=>Boolean(url) && !remainingUrls.has(url)))
    ];
    for (const removedUrl of removedUrls){
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$storage$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteManagedImage"])(removedUrl);
        } catch (error) {
            console.error('[DB] Failed to cleanup managed image:', removedUrl, error);
        }
    }
}
async function getSettings() {
    try {
        const data = await readDB();
        return {
            ...INITIAL_DATA.settings,
            ...data.settings,
            logo_url: sanitizeLogoUrl(data.settings?.logo_url)
        };
    } catch  {
        return INITIAL_DATA.settings;
    }
}
async function updateSettings(updates) {
    const data = await readDB();
    const previousUrls = [
        data.settings?.favicon_url,
        data.settings?.logo_url
    ].filter((value)=>Boolean(value));
    data.settings = {
        ...data.settings,
        ...updates,
        logo_url: sanitizeLogoUrl(updates.logo_url ?? data.settings?.logo_url)
    };
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["syncCmsSnapshotToOdoo"])(data);
    await writeDB(data);
    await cleanupRemovedManagedImages(previousUrls, data);
    return data.settings;
}
async function getAllSections() {
    try {
        const data = await readDB();
        return data.sections || INITIAL_DATA.sections;
    } catch  {
        return INITIAL_DATA.sections;
    }
}
async function updateSection(id, updates) {
    const data = await readDB();
    const index = data.sections.findIndex((s)=>s.id === id);
    if (index === -1) return null;
    const previousUrls = [
        data.sections[index].image_url
    ].filter((value)=>Boolean(value));
    data.sections[index] = {
        ...data.sections[index],
        ...updates
    };
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["syncCmsSnapshotToOdoo"])(data);
    await writeDB(data);
    await cleanupRemovedManagedImages(previousUrls, data);
    return data.sections[index];
}
async function getFeaturedItems() {
    try {
        const data = await readDB();
        const items = data.featured_items || INITIAL_DATA.featured_items;
        return items.sort((a, b)=>a.order_index - b.order_index);
    } catch  {
        return INITIAL_DATA.featured_items;
    }
}
async function addFeaturedItem(item) {
    const data = await readDB();
    const newItem = {
        ...item,
        id: 'f_' + Date.now().toString()
    };
    data.featured_items.push(newItem);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["syncCmsSnapshotToOdoo"])(data);
    await writeDB(data);
    return newItem;
}
async function updateFeaturedItem(id, updates) {
    const data = await readDB();
    const index = data.featured_items.findIndex((s)=>s.id === id);
    if (index === -1) return null;
    const previousUrls = [
        data.featured_items[index].image_url
    ].filter((value)=>Boolean(value));
    data.featured_items[index] = {
        ...data.featured_items[index],
        ...updates
    };
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["syncCmsSnapshotToOdoo"])(data);
    await writeDB(data);
    await cleanupRemovedManagedImages(previousUrls, data);
    return data.featured_items[index];
}
async function deleteFeaturedItem(id) {
    const data = await readDB();
    const initialLength = data.featured_items.length;
    const previousUrls = data.featured_items.filter((s)=>s.id === id).map((item)=>item.image_url).filter((value)=>Boolean(value));
    data.featured_items = data.featured_items.filter((s)=>s.id !== id);
    if (data.featured_items.length !== initialLength) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["syncCmsSnapshotToOdoo"])(data);
        await writeDB(data);
        await cleanupRemovedManagedImages(previousUrls, data);
        return true;
    }
    return false;
}
}),
"[next]/internal/font/google/outfit_333574c6.module.css [app-rsc] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "className": "outfit_333574c6-module__a01f3W__className",
  "variable": "outfit_333574c6-module__a01f3W__variable",
});
}),
"[next]/internal/font/google/outfit_333574c6.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$outfit_333574c6$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__ = __turbopack_context__.i("[next]/internal/font/google/outfit_333574c6.module.css [app-rsc] (css module)");
;
const fontData = {
    className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$outfit_333574c6$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].className,
    style: {
        fontFamily: "'Outfit', 'Outfit Fallback'",
        fontStyle: "normal"
    }
};
if (__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$outfit_333574c6$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable != null) {
    fontData.variable = __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$outfit_333574c6$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable;
}
const __TURBOPACK__default__export__ = fontData;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[project]/Galantesjewelry/lib/auth.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ADMIN_COOKIE_NAME",
    ()=>ADMIN_COOKIE_NAME,
    "ADMIN_SESSION_MAX_AGE",
    ()=>ADMIN_SESSION_MAX_AGE,
    "getAdminCookieOptions",
    ()=>getAdminCookieOptions,
    "getAdminSessionFromRequest",
    ()=>getAdminSessionFromRequest,
    "getExpiredAdminCookieOptions",
    ()=>getExpiredAdminCookieOptions,
    "shouldUseSecureCookies",
    ()=>shouldUseSecureCookies,
    "signToken",
    ()=>signToken,
    "verifyToken",
    ()=>verifyToken
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/jose/dist/webapi/jwt/sign.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/jose/dist/webapi/jwt/verify.js [app-rsc] (ecmascript)");
;
;
const ADMIN_COOKIE_NAME = 'admin_token';
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const localAdminSecret = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString('hex');
function readCookieValue(cookieHeader, cookieName) {
    if (!cookieHeader) {
        return null;
    }
    for (const chunk of cookieHeader.split(';')){
        const [rawName, ...rest] = chunk.trim().split('=');
        if (rawName === cookieName) {
            return rest.join('=') || null;
        }
    }
    return null;
}
function getSecretKey() {
    return new TextEncoder().encode(process.env.ADMIN_SECRET_KEY || localAdminSecret);
}
function shouldUseSecureCookies(request) {
    const forwardedProto = request?.headers.get('x-forwarded-proto');
    if (forwardedProto) {
        return forwardedProto.split(',')[0]?.trim() === 'https';
    }
    return ("TURBOPACK compile-time value", "development") === 'production';
}
function getAdminCookieOptions(request) {
    return {
        httpOnly: true,
        maxAge: ADMIN_SESSION_MAX_AGE,
        path: '/',
        sameSite: 'lax',
        secure: shouldUseSecureCookies(request)
    };
}
function getExpiredAdminCookieOptions(request) {
    return {
        ...getAdminCookieOptions(request),
        expires: new Date(0),
        maxAge: 0
    };
}
async function signToken(payload) {
    return await new __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SignJWT"](payload).setProtectedHeader({
        alg: 'HS256'
    }).setIssuedAt().setExpirationTime('30d').sign(getSecretKey());
}
async function verifyToken(token) {
    try {
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jwtVerify"])(token, getSecretKey());
        return payload;
    } catch  {
        return null;
    }
}
async function getAdminSessionFromRequest(request) {
    const token = readCookieValue(request.headers.get('cookie'), ADMIN_COOKIE_NAME);
    if (!token) {
        return null;
    }
    return verifyToken(token);
}
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/Galantesjewelry/lib/integration-types.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "appointmentSecretFields",
    ()=>appointmentSecretFields,
    "googleSecretFields",
    ()=>googleSecretFields,
    "integrationEnvironments",
    ()=>integrationEnvironments
]);
const integrationEnvironments = [
    'development',
    'staging',
    'production'
];
const googleSecretFields = [
    'googleClientSecret',
    'apiKey',
    'accessToken',
    'refreshToken'
];
const appointmentSecretFields = [
    'googlePrivateKey',
    'gmailSmtpPassword',
    'sendGridApiKey'
];
}),
"[project]/Galantesjewelry/lib/secure-settings.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decryptSecret",
    ()=>decryptSecret,
    "encryptSecret",
    ()=>encryptSecret,
    "maskEncryptedSecret",
    ()=>maskEncryptedSecret
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const localIntegrationSecret = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString('hex');
function getEncryptionKey() {
    const source = process.env.APPOINTMENT_ENCRYPTION_KEY || process.env.INTEGRATIONS_SECRET_KEY || process.env.ADMIN_SECRET_KEY || localIntegrationSecret;
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash('sha256').update(source).digest();
}
function encryptSecret(value) {
    const iv = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(12);
    const cipher = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
    const encrypted = Buffer.concat([
        cipher.update(value, 'utf8'),
        cipher.final()
    ]);
    const tag = cipher.getAuthTag();
    return [
        'v1',
        iv.toString('base64url'),
        tag.toString('base64url'),
        encrypted.toString('base64url')
    ].join(':');
}
function decryptSecret(payload) {
    const [version, ivValue, tagValue, encryptedValue] = payload.split(':');
    if (version !== 'v1' || !ivValue || !tagValue || !encryptedValue) {
        throw new Error('Unsupported encrypted secret payload.');
    }
    const decipher = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(ivValue, 'base64url'), {
        authTagLength: 16
    });
    decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));
    return Buffer.concat([
        decipher.update(Buffer.from(encryptedValue, 'base64url')),
        decipher.final()
    ]).toString('utf8');
}
function maskEncryptedSecret(encryptedValue) {
    if (!encryptedValue) {
        return {
            isSet: false,
            maskedValue: ''
        };
    }
    try {
        const decrypted = decryptSecret(encryptedValue);
        const tail = decrypted.slice(-4);
        return {
            isSet: true,
            maskedValue: tail ? `********${tail}` : '********'
        };
    } catch  {
        return {
            isSet: true,
            maskedValue: '********'
        };
    }
}
}),
"[project]/Galantesjewelry/lib/integrations.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAppointmentIntegrationConfigs",
    ()=>getAppointmentIntegrationConfigs,
    "getAppointmentIntegrationForEnvironment",
    ()=>getAppointmentIntegrationForEnvironment,
    "getDecryptedAppointmentIntegration",
    ()=>getDecryptedAppointmentIntegration,
    "getDecryptedGoogleIntegration",
    ()=>getDecryptedGoogleIntegration,
    "getGoogleIntegrationConfigs",
    ()=>getGoogleIntegrationConfigs,
    "getGoogleIntegrationForEnvironment",
    ()=>getGoogleIntegrationForEnvironment,
    "getIntegrationAdminPayload",
    ()=>getIntegrationAdminPayload,
    "recordAppointmentIntegrationTest",
    ()=>recordAppointmentIntegrationTest,
    "recordGoogleIntegrationTest",
    ()=>recordGoogleIntegrationTest,
    "storeGoogleOAuthTokens",
    ()=>storeGoogleOAuthTokens,
    "updateAppointmentIntegrationConfig",
    ()=>updateAppointmentIntegrationConfig,
    "updateGoogleIntegrationConfig",
    ()=>updateGoogleIntegrationConfig
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$runtime$2d$paths$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/runtime-paths.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/odoo-cms-sync.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/integration-types.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/secure-settings.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
const dataDir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$runtime$2d$paths$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDataRoot"])();
const integrationsFile = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(dataDir, 'integrations.json');
const MINIMUM_GOOGLE_SCOPES = [
    'openid',
    'email',
    'profile'
];
const DEFAULT_TIMEZONE = 'America/New_York';
const DEFAULT_DURATION_MINUTES = 60;
const DEFAULT_START_TIME = '09:00';
const DEFAULT_END_TIME = '18:00';
const DEFAULT_SLOT_INTERVAL_MINUTES = 30;
const DEFAULT_AVAILABLE_WEEKDAYS = [
    0,
    1,
    2,
    3,
    4,
    5,
    6
];
const DEFAULT_GMAIL_SENDER = process.env.GMAIL_SMTP_USER || '';
const DEFAULT_GMAIL_RECIPIENT = process.env.GMAIL_NOTIFICATION_TO || 'appointments@galantesjewelry.com';
const DEFAULT_GOOGLE_CONFIGS = {
    development: buildDefaultGoogleConfig({
        environment: 'development',
        javascriptOrigin: 'http://localhost:3000',
        redirectUri: 'http://localhost:3000/auth/google/callback'
    }),
    staging: buildDefaultGoogleConfig({
        environment: 'staging',
        javascriptOrigin: 'https://staging.galantesjewelry.com',
        redirectUri: 'https://staging.galantesjewelry.com/auth/google/callback'
    }),
    production: buildDefaultGoogleConfig({
        environment: 'production',
        javascriptOrigin: 'https://galantesjewelry.com',
        redirectUri: 'https://galantesjewelry.com/auth/google/callback'
    })
};
const DEFAULT_APPOINTMENT_CONFIGS = {
    development: buildDefaultAppointmentConfig('development'),
    staging: buildDefaultAppointmentConfig('staging'),
    production: buildDefaultAppointmentConfig('production')
};
function buildDefaultGoogleConfig(input) {
    return {
        provider: 'google',
        environment: input.environment,
        enabled: false,
        googleClientId: '',
        javascriptOrigin: input.javascriptOrigin,
        redirectUri: input.redirectUri,
        scopes: MINIMUM_GOOGLE_SCOPES,
        connectedGoogleEmail: '',
        oauthConnectedAt: null,
        encryptedSecrets: {},
        updatedAt: null,
        updatedBy: null
    };
}
function buildDefaultAppointmentConfig(environment) {
    return {
        provider: 'appointments',
        environment,
        googleCalendarEnabled: false,
        googleCalendarId: '',
        googleServiceAccountEmail: '',
        gmailNotificationsEnabled: false,
        gmailRecipientInbox: DEFAULT_GMAIL_RECIPIENT,
        gmailSender: DEFAULT_GMAIL_SENDER,
        appointmentDurationMinutes: DEFAULT_DURATION_MINUTES,
        appointmentTimezone: DEFAULT_TIMEZONE,
        appointmentStartTime: DEFAULT_START_TIME,
        appointmentEndTime: DEFAULT_END_TIME,
        appointmentSlotIntervalMinutes: DEFAULT_SLOT_INTERVAL_MINUTES,
        appointmentAvailableWeekdays: DEFAULT_AVAILABLE_WEEKDAYS,
        encryptedSecrets: {},
        updatedAt: null,
        updatedBy: null
    };
}
function emptyStore() {
    return {
        google: {
            development: {
                ...DEFAULT_GOOGLE_CONFIGS.development
            },
            staging: {
                ...DEFAULT_GOOGLE_CONFIGS.staging
            },
            production: {
                ...DEFAULT_GOOGLE_CONFIGS.production
            }
        },
        appointments: {
            development: {
                ...DEFAULT_APPOINTMENT_CONFIGS.development
            },
            staging: {
                ...DEFAULT_APPOINTMENT_CONFIGS.staging
            },
            production: {
                ...DEFAULT_APPOINTMENT_CONFIGS.production
            }
        },
        audit: []
    };
}
function isIntegrationEnvironment(value) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["integrationEnvironments"].includes(value);
}
function assertGoogleSecretField(value) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["googleSecretFields"].includes(value);
}
function assertAppointmentSecretField(value) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["appointmentSecretFields"].includes(value);
}
function toAdminConfig(config) {
    return {
        provider: config.provider,
        environment: config.environment,
        enabled: config.enabled,
        googleClientId: config.googleClientId || process.env.GOOGLE_OAUTH_CLIENT_ID || '',
        javascriptOrigin: config.javascriptOrigin || process.env.GOOGLE_OAUTH_JAVASCRIPT_ORIGIN || '',
        redirectUri: config.redirectUri || process.env.GOOGLE_OAUTH_REDIRECT_URI || '',
        scopes: config.scopes.length > 0 ? config.scopes : process.env.GOOGLE_OAUTH_SCOPES?.split(' ') || [],
        connectedGoogleEmail: config.connectedGoogleEmail || '',
        oauthConnectedAt: config.oauthConnectedAt || null,
        updatedAt: config.updatedAt,
        updatedBy: config.updatedBy,
        secrets: {
            googleClientSecret: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["maskEncryptedSecret"])(config.encryptedSecrets.googleClientSecret),
            apiKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["maskEncryptedSecret"])(config.encryptedSecrets.apiKey),
            accessToken: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["maskEncryptedSecret"])(config.encryptedSecrets.accessToken),
            refreshToken: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["maskEncryptedSecret"])(config.encryptedSecrets.refreshToken)
        }
    };
}
function toAppointmentAdminConfig(config) {
    return {
        provider: config.provider,
        environment: config.environment,
        googleCalendarEnabled: config.googleCalendarEnabled,
        googleCalendarId: config.googleCalendarId,
        googleServiceAccountEmail: config.googleServiceAccountEmail,
        gmailNotificationsEnabled: config.gmailNotificationsEnabled,
        gmailRecipientInbox: config.gmailRecipientInbox,
        gmailSender: config.gmailSender,
        appointmentDurationMinutes: config.appointmentDurationMinutes,
        appointmentTimezone: config.appointmentTimezone,
        appointmentStartTime: config.appointmentStartTime,
        appointmentEndTime: config.appointmentEndTime,
        appointmentSlotIntervalMinutes: config.appointmentSlotIntervalMinutes,
        appointmentAvailableWeekdays: config.appointmentAvailableWeekdays,
        updatedAt: config.updatedAt,
        updatedBy: config.updatedBy,
        secrets: {
            googlePrivateKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["maskEncryptedSecret"])(config.encryptedSecrets.googlePrivateKey),
            gmailSmtpPassword: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["maskEncryptedSecret"])(config.encryptedSecrets.gmailSmtpPassword),
            sendGridApiKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["maskEncryptedSecret"])(config.encryptedSecrets.sendGridApiKey)
        }
    };
}
function normalizeScopeInput(value) {
    const rawScopes = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[\s,]+/) : MINIMUM_GOOGLE_SCOPES;
    const normalized = rawScopes.map((scope)=>String(scope).trim()).filter(Boolean);
    const deduped = Array.from(new Set([
        ...MINIMUM_GOOGLE_SCOPES,
        ...normalized
    ]));
    return deduped;
}
function validateNoWildcard(value, label) {
    if (value.includes('*')) {
        throw new Error(`${label} cannot contain wildcards.`);
    }
}
function isLocalhost(hostname) {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}
function validateHttpsUnlessLocalhost(url, label) {
    if (url.protocol === 'https:') {
        return;
    }
    if (url.protocol === 'http:' && isLocalhost(url.hostname)) {
        return;
    }
    throw new Error(`${label} must use HTTPS except for localhost.`);
}
function validateJavaScriptOrigin(value) {
    validateNoWildcard(value, 'Authorized JavaScript origin');
    const url = new URL(value);
    validateHttpsUnlessLocalhost(url, 'Authorized JavaScript origin');
    if (url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
        throw new Error('Authorized JavaScript origin must not include path, query, fragment, or userinfo.');
    }
    return url.origin;
}
function validateRedirectUri(value) {
    validateNoWildcard(value, 'Authorized redirect URI');
    const url = new URL(value);
    validateHttpsUnlessLocalhost(url, 'Authorized redirect URI');
    if (url.hash || url.username || url.password) {
        throw new Error('Authorized redirect URI must not include fragment or userinfo.');
    }
    if (url.pathname.includes('/../') || url.pathname.includes('\\..')) {
        throw new Error('Authorized redirect URI must not contain path traversal.');
    }
    return url.toString();
}
async function ensureStoreFile() {
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(dataDir, {
        recursive: true
    });
}
function hydrateStore(parsed) {
    const nextStore = emptyStore();
    for (const environment of __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["integrationEnvironments"]){
        nextStore.google[environment] = {
            ...nextStore.google[environment],
            ...parsed.google?.[environment] || {},
            provider: 'google',
            environment,
            connectedGoogleEmail: parsed.google?.[environment]?.connectedGoogleEmail || '',
            oauthConnectedAt: parsed.google?.[environment]?.oauthConnectedAt || null
        };
    }
    for (const environment of __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["integrationEnvironments"]){
        nextStore.appointments[environment] = {
            ...nextStore.appointments[environment],
            ...parsed.appointments?.[environment] || {},
            provider: 'appointments',
            environment
        };
    }
    nextStore.audit = Array.isArray(parsed.audit) ? parsed.audit.slice(0, 100) : [];
    return nextStore;
}
async function readStore() {
    await ensureStoreFile();
    try {
        const fileContent = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(integrationsFile, 'utf-8');
        const parsed = JSON.parse(fileContent);
        return hydrateStore(parsed);
    } catch  {
        const odooSnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadIntegrationsSnapshotFromOdoo"])();
        const nextStore = odooSnapshot ? hydrateStore(odooSnapshot) : emptyStore();
        await writeStore(nextStore);
        return nextStore;
    }
}
async function writeStore(store) {
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(dataDir, {
        recursive: true
    });
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(integrationsFile, JSON.stringify(store, null, 2), 'utf-8');
}
function buildAuditEntry(config, context, action, changedFields) {
    return {
        id: `${Date.now()}-${__TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(4).toString('hex')}`,
        timestamp: new Date().toISOString(),
        actor: context.actor,
        provider: config.provider,
        environment: config.environment,
        action,
        changedFields,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
    };
}
async function getGoogleIntegrationConfigs() {
    const store = await readStore();
    return {
        configs: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["integrationEnvironments"].map((environment)=>toAdminConfig(store.google[environment])),
        audit: store.audit
    };
}
async function getAppointmentIntegrationConfigs() {
    const store = await readStore();
    return {
        configs: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["integrationEnvironments"].map((environment)=>toAppointmentAdminConfig(store.appointments[environment])),
        audit: store.audit
    };
}
async function getIntegrationAdminPayload() {
    const store = await readStore();
    return {
        configs: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["integrationEnvironments"].map((environment)=>toAdminConfig(store.google[environment])),
        appointmentConfigs: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["integrationEnvironments"].map((environment)=>toAppointmentAdminConfig(store.appointments[environment])),
        audit: store.audit
    };
}
async function getGoogleIntegrationForEnvironment(environment) {
    const store = await readStore();
    return store.google[environment];
}
async function getDecryptedGoogleIntegration(environment) {
    const config = await getGoogleIntegrationForEnvironment(environment);
    return {
        ...config,
        secrets: Object.fromEntries(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["googleSecretFields"].map((field)=>{
            const encryptedValue = config.encryptedSecrets[field];
            return [
                field,
                encryptedValue ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["decryptSecret"])(encryptedValue) : ''
            ];
        }))
    };
}
async function getAppointmentIntegrationForEnvironment(environment) {
    const store = await readStore();
    return store.appointments[environment];
}
async function getDecryptedAppointmentIntegration(environment) {
    const config = await getAppointmentIntegrationForEnvironment(environment);
    return {
        ...config,
        secrets: Object.fromEntries(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["appointmentSecretFields"].map((field)=>{
            const encryptedValue = config.encryptedSecrets[field];
            return [
                field,
                encryptedValue ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["decryptSecret"])(encryptedValue) : ''
            ];
        }))
    };
}
async function updateGoogleIntegrationConfig(input, context) {
    if (!isIntegrationEnvironment(input.environment)) {
        throw new Error('Invalid integration environment.');
    }
    const store = await readStore();
    const current = store.google[input.environment];
    const next = {
        ...current,
        encryptedSecrets: {
            ...current.encryptedSecrets
        }
    };
    const changedFields = new Set();
    if (typeof input.enabled === 'boolean' && input.enabled !== current.enabled) {
        next.enabled = input.enabled;
        changedFields.add('enabled');
    }
    if (typeof input.googleClientId === 'string' && input.googleClientId.trim() !== current.googleClientId) {
        next.googleClientId = input.googleClientId.trim();
        changedFields.add('googleClientId');
    }
    if (typeof input.javascriptOrigin === 'string') {
        const normalizedOrigin = validateJavaScriptOrigin(input.javascriptOrigin.trim());
        if (normalizedOrigin !== current.javascriptOrigin) {
            next.javascriptOrigin = normalizedOrigin;
            changedFields.add('javascriptOrigin');
        }
    }
    if (typeof input.redirectUri === 'string') {
        const normalizedRedirectUri = validateRedirectUri(input.redirectUri.trim());
        if (normalizedRedirectUri !== current.redirectUri) {
            next.redirectUri = normalizedRedirectUri;
            changedFields.add('redirectUri');
        }
    }
    if (input.scopes !== undefined) {
        const scopes = normalizeScopeInput(input.scopes);
        if (JSON.stringify(scopes) !== JSON.stringify(current.scopes)) {
            next.scopes = scopes;
            changedFields.add('scopes');
        }
    }
    for (const field of input.clearSecrets || []){
        if (!assertGoogleSecretField(field)) {
            continue;
        }
        if (next.encryptedSecrets[field]) {
            delete next.encryptedSecrets[field];
            changedFields.add(field);
        }
    }
    for (const [field, value] of Object.entries(input.secrets || {})){
        if (!assertGoogleSecretField(field)) {
            continue;
        }
        const trimmedValue = String(value || '').trim();
        if (!trimmedValue) {
            continue;
        }
        next.encryptedSecrets[field] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["encryptSecret"])(trimmedValue);
        changedFields.add(field);
    }
    if (changedFields.size > 0) {
        next.updatedAt = new Date().toISOString();
        next.updatedBy = context.actor;
        store.google[input.environment] = next;
        store.audit = [
            buildAuditEntry(next, context, current.updatedAt ? 'update' : 'create', [
                ...changedFields
            ]),
            ...store.audit
        ].slice(0, 100);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["syncIntegrationsSnapshotToOdoo"])(store);
        await writeStore(store);
    }
    return {
        config: toAdminConfig(next),
        changedFields: [
            ...changedFields
        ],
        audit: store.audit
    };
}
async function storeGoogleOAuthTokens(input, context) {
    if (!isIntegrationEnvironment(input.environment)) {
        throw new Error('Invalid integration environment.');
    }
    const store = await readStore();
    const current = store.google[input.environment];
    const next = {
        ...current,
        encryptedSecrets: {
            ...current.encryptedSecrets
        }
    };
    const changedFields = new Set();
    if (input.accessToken) {
        next.encryptedSecrets.accessToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["encryptSecret"])(input.accessToken);
        changedFields.add('accessToken');
    }
    if (input.refreshToken) {
        next.encryptedSecrets.refreshToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["encryptSecret"])(input.refreshToken);
        changedFields.add('refreshToken');
    }
    if (input.scopes !== undefined) {
        const scopes = normalizeScopeInput(input.scopes);
        if (JSON.stringify(scopes) !== JSON.stringify(current.scopes)) {
            next.scopes = scopes;
            changedFields.add('scopes');
        }
    }
    if (input.connectedGoogleEmail !== undefined && input.connectedGoogleEmail !== current.connectedGoogleEmail) {
        next.connectedGoogleEmail = normalizeEmail(input.connectedGoogleEmail);
        changedFields.add('connectedGoogleEmail');
    }
    next.oauthConnectedAt = new Date().toISOString();
    changedFields.add('oauthConnectedAt');
    next.enabled = true;
    changedFields.add('enabled');
    next.updatedAt = new Date().toISOString();
    next.updatedBy = context.actor;
    store.google[input.environment] = next;
    store.audit = [
        buildAuditEntry(next, context, current.updatedAt ? 'update' : 'create', [
            ...changedFields
        ]),
        ...store.audit
    ].slice(0, 100);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["syncIntegrationsSnapshotToOdoo"])(store);
    await writeStore(store);
    return {
        config: toAdminConfig(next),
        changedFields: [
            ...changedFields
        ],
        audit: store.audit
    };
}
function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}
function normalizeOptionalText(value) {
    return String(value || '').trim();
}
function normalizeDuration(value) {
    const duration = Number(value);
    if (!Number.isFinite(duration) || duration < 15 || duration > 240) {
        throw new Error('Appointment duration must be between 15 and 240 minutes.');
    }
    return Math.round(duration);
}
function validateTimeString(value, label = 'Appointment time') {
    const normalized = normalizeOptionalText(value);
    if (!/^\d{2}:\d{2}$/.test(normalized)) {
        throw new Error(`${label} must use HH:MM format.`);
    }
    const [hours, minutes] = normalized.split(':').map(Number);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error(`${label} is invalid.`);
    }
    return normalized;
}
function timeToMinutes(value) {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
}
function validateSlotInterval(value) {
    const interval = Number(value);
    if (!Number.isFinite(interval) || interval < 15 || interval > 240) {
        throw new Error('Appointment slot interval must be between 15 and 240 minutes.');
    }
    return Math.round(interval);
}
function validateAvailableWeekdays(value) {
    const normalized = Array.isArray(value) ? Array.from(new Set(value.map((day)=>Number(day)).filter((day)=>Number.isInteger(day) && day >= 0 && day <= 6))) : DEFAULT_AVAILABLE_WEEKDAYS;
    if (normalized.length === 0) {
        throw new Error('At least one appointment weekday must be enabled.');
    }
    return normalized.sort((left, right)=>left - right);
}
function validateTimeZone(value) {
    const timezone = normalizeOptionalText(value) || DEFAULT_TIMEZONE;
    try {
        new Intl.DateTimeFormat('en-US', {
            timeZone: timezone
        }).format(new Date());
        return timezone;
    } catch  {
        throw new Error('Appointment timezone is invalid.');
    }
}
async function updateAppointmentIntegrationConfig(input, context) {
    if (!isIntegrationEnvironment(input.environment)) {
        throw new Error('Invalid integration environment.');
    }
    const store = await readStore();
    const current = store.appointments[input.environment];
    const next = {
        ...current,
        encryptedSecrets: {
            ...current.encryptedSecrets
        }
    };
    const changedFields = new Set();
    if (typeof input.googleCalendarEnabled === 'boolean' && input.googleCalendarEnabled !== current.googleCalendarEnabled) {
        next.googleCalendarEnabled = input.googleCalendarEnabled;
        changedFields.add('googleCalendarEnabled');
    }
    if (typeof input.gmailNotificationsEnabled === 'boolean' && input.gmailNotificationsEnabled !== current.gmailNotificationsEnabled) {
        next.gmailNotificationsEnabled = input.gmailNotificationsEnabled;
        changedFields.add('gmailNotificationsEnabled');
    }
    const textFields = [
        [
            'googleCalendarId',
            normalizeOptionalText(input.googleCalendarId)
        ],
        [
            'googleServiceAccountEmail',
            normalizeEmail(input.googleServiceAccountEmail)
        ],
        [
            'gmailRecipientInbox',
            normalizeEmail(input.gmailRecipientInbox)
        ],
        [
            'gmailSender',
            normalizeEmail(input.gmailSender)
        ]
    ];
    for (const [field, value] of textFields){
        if (input[field] === undefined) {
            continue;
        }
        if (value !== current[field]) {
            next[field] = value;
            changedFields.add(field);
        }
    }
    if (input.appointmentDurationMinutes !== undefined) {
        const duration = normalizeDuration(input.appointmentDurationMinutes);
        if (duration !== current.appointmentDurationMinutes) {
            next.appointmentDurationMinutes = duration;
            changedFields.add('appointmentDurationMinutes');
        }
    }
    if (input.appointmentTimezone !== undefined) {
        const timezone = validateTimeZone(input.appointmentTimezone);
        if (timezone !== current.appointmentTimezone) {
            next.appointmentTimezone = timezone;
            changedFields.add('appointmentTimezone');
        }
    }
    if (input.appointmentStartTime !== undefined) {
        const startTime = validateTimeString(input.appointmentStartTime, 'Appointment start time');
        if (startTime !== current.appointmentStartTime) {
            next.appointmentStartTime = startTime;
            changedFields.add('appointmentStartTime');
        }
    }
    if (input.appointmentEndTime !== undefined) {
        const endTime = validateTimeString(input.appointmentEndTime, 'Appointment end time');
        if (endTime !== current.appointmentEndTime) {
            next.appointmentEndTime = endTime;
            changedFields.add('appointmentEndTime');
        }
    }
    if (input.appointmentSlotIntervalMinutes !== undefined) {
        const interval = validateSlotInterval(input.appointmentSlotIntervalMinutes);
        if (interval !== current.appointmentSlotIntervalMinutes) {
            next.appointmentSlotIntervalMinutes = interval;
            changedFields.add('appointmentSlotIntervalMinutes');
        }
    }
    if (input.appointmentAvailableWeekdays !== undefined) {
        const weekdays = validateAvailableWeekdays(input.appointmentAvailableWeekdays);
        if (JSON.stringify(weekdays) !== JSON.stringify(current.appointmentAvailableWeekdays)) {
            next.appointmentAvailableWeekdays = weekdays;
            changedFields.add('appointmentAvailableWeekdays');
        }
    }
    const effectiveStartTime = input.appointmentStartTime !== undefined ? next.appointmentStartTime : current.appointmentStartTime;
    const effectiveEndTime = input.appointmentEndTime !== undefined ? next.appointmentEndTime : current.appointmentEndTime;
    const effectiveDuration = input.appointmentDurationMinutes !== undefined ? next.appointmentDurationMinutes : current.appointmentDurationMinutes;
    const effectiveInterval = input.appointmentSlotIntervalMinutes !== undefined ? next.appointmentSlotIntervalMinutes : current.appointmentSlotIntervalMinutes;
    if (timeToMinutes(effectiveStartTime) >= timeToMinutes(effectiveEndTime)) {
        throw new Error('Appointment end time must be later than the start time.');
    }
    if (timeToMinutes(effectiveStartTime) + effectiveDuration > timeToMinutes(effectiveEndTime)) {
        throw new Error('Appointment duration does not fit inside the configured booking window.');
    }
    if (effectiveInterval > effectiveDuration) {
        throw new Error('Appointment slot interval cannot be longer than the appointment duration.');
    }
    for (const field of input.clearSecrets || []){
        if (!assertAppointmentSecretField(field)) {
            continue;
        }
        if (next.encryptedSecrets[field]) {
            delete next.encryptedSecrets[field];
            changedFields.add(field);
        }
    }
    for (const [field, value] of Object.entries(input.secrets || {})){
        if (!assertAppointmentSecretField(field)) {
            continue;
        }
        const trimmedValue = String(value || '').trim();
        if (!trimmedValue) {
            continue;
        }
        next.encryptedSecrets[field] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["encryptSecret"])(trimmedValue);
        changedFields.add(field);
    }
    if (changedFields.size > 0) {
        next.updatedAt = new Date().toISOString();
        next.updatedBy = context.actor;
        store.appointments[input.environment] = next;
        store.audit = [
            buildAuditEntry(next, context, current.updatedAt ? 'update' : 'create', [
                ...changedFields
            ]),
            ...store.audit
        ].slice(0, 100);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["syncIntegrationsSnapshotToOdoo"])(store);
        await writeStore(store);
    }
    return {
        config: toAppointmentAdminConfig(next),
        changedFields: [
            ...changedFields
        ],
        audit: store.audit
    };
}
async function recordGoogleIntegrationTest(environment, context) {
    if (!isIntegrationEnvironment(environment)) {
        throw new Error('Invalid integration environment.');
    }
    const store = await readStore();
    const config = store.google[environment];
    const auditEntry = buildAuditEntry(config, context, 'test', [
        'connectionTest'
    ]);
    store.audit = [
        auditEntry,
        ...store.audit
    ].slice(0, 100);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["syncIntegrationsSnapshotToOdoo"])(store);
    await writeStore(store);
    return auditEntry;
}
async function recordAppointmentIntegrationTest(environment, context) {
    if (!isIntegrationEnvironment(environment)) {
        throw new Error('Invalid integration environment.');
    }
    const store = await readStore();
    const config = store.appointments[environment];
    const auditEntry = buildAuditEntry(config, context, 'test', [
        'appointmentIntegrationTest'
    ]);
    store.audit = [
        auditEntry,
        ...store.audit
    ].slice(0, 100);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["syncIntegrationsSnapshotToOdoo"])(store);
    await writeStore(store);
    return auditEntry;
}
}),
"[project]/Galantesjewelry/lib/google-login.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GOOGLE_OAUTH_RETURN_COOKIE",
    ()=>GOOGLE_OAUTH_RETURN_COOKIE,
    "GOOGLE_OAUTH_STATE_COOKIE",
    ()=>GOOGLE_OAUTH_STATE_COOKIE,
    "GOOGLE_USER_COOKIE",
    ()=>GOOGLE_USER_COOKIE,
    "GOOGLE_USER_SESSION_MAX_AGE",
    ()=>GOOGLE_USER_SESSION_MAX_AGE,
    "assertGoogleLoginConfig",
    ()=>assertGoogleLoginConfig,
    "getExpiredGoogleOAuthCookieOptions",
    ()=>getExpiredGoogleOAuthCookieOptions,
    "getGoogleLoginConfig",
    ()=>getGoogleLoginConfig,
    "getGoogleOAuthCookieOptions",
    ()=>getGoogleOAuthCookieOptions,
    "getGoogleRedirectBaseUrl",
    ()=>getGoogleRedirectBaseUrl,
    "getGoogleUserCookieOptions",
    ()=>getGoogleUserCookieOptions,
    "getPublicBaseUrl",
    ()=>getPublicBaseUrl,
    "getPublicUrl",
    ()=>getPublicUrl,
    "getRequestBaseUrl",
    ()=>getRequestBaseUrl,
    "getRequestUrl",
    ()=>getRequestUrl,
    "resolveGoogleEnvironmentFromHost",
    ()=>resolveGoogleEnvironmentFromHost,
    "sanitizeReturnTo",
    ()=>sanitizeReturnTo,
    "signGoogleUserSession",
    ()=>signGoogleUserSession,
    "verifyGoogleUserSession",
    ()=>verifyGoogleUserSession
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/jose/dist/webapi/jwt/sign.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/jose/dist/webapi/jwt/verify.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integrations$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/integrations.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/auth.ts [app-rsc] (ecmascript)");
;
;
;
;
const GOOGLE_OAUTH_STATE_COOKIE = 'google_oauth_state';
const GOOGLE_OAUTH_RETURN_COOKIE = 'google_oauth_return_to';
const GOOGLE_USER_COOKIE = 'google_user_session';
const GOOGLE_USER_SESSION_MAX_AGE = 60 * 60 * 24 * 365 * 10;
const localGoogleSessionSecret = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString('hex');
function normalizeBaseUrl(value) {
    const normalizedValue = value.trim().replace(/\/+$/, '');
    if (!normalizedValue) {
        return '';
    }
    try {
        const url = new URL(normalizedValue);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return '';
        }
        url.hostname = normalizeHostname(url.hostname);
        return url.toString().replace(/\/+$/, '');
    } catch  {
        return '';
    }
}
function getConfiguredSiteUrl() {
    const candidates = [
        process.env.GOOGLE_PUBLIC_BASE_URL,
        process.env.SITE_URL,
        ("TURBOPACK compile-time value", "https://galantesjewelry.com")
    ];
    for (const candidate of candidates){
        const normalized = normalizeBaseUrl(candidate || '');
        if (!normalized) {
            continue;
        }
        return normalized;
    }
    return '';
}
function isLoopbackHostname(hostname) {
    return [
        'localhost',
        '127.0.0.1',
        '[::1]',
        '0.0.0.0',
        '::',
        '[::]'
    ].includes(hostname);
}
function normalizeHostname(hostname) {
    const normalized = hostname.trim().toLowerCase();
    if (normalized === '0.0.0.0' || normalized === '::' || normalized === '[::]') {
        return 'localhost';
    }
    return normalized;
}
function normalizeHostWithPort(host) {
    const trimmed = host.trim();
    if (!trimmed) {
        return '';
    }
    const ipv6LoopbackMatch = trimmed.match(/^\[(::|::1)\](?::(\d+))?$/i);
    if (ipv6LoopbackMatch) {
        const [, , port] = ipv6LoopbackMatch;
        return port ? `localhost:${port}` : 'localhost';
    }
    const [hostname, ...rest] = trimmed.split(':');
    const normalizedHostname = normalizeHostname(hostname);
    const port = rest.join(':');
    return port ? `${normalizedHostname}:${port}` : normalizedHostname;
}
function getGoogleSessionKey() {
    const secret = process.env.GOOGLE_SESSION_SECRET || process.env.ADMIN_SECRET_KEY || localGoogleSessionSecret;
    return new TextEncoder().encode(secret);
}
function resolveGoogleEnvironmentFromHost(host) {
    const normalizedHost = normalizeHostname(host.split(':')[0] || '');
    if (isLoopbackHostname(normalizedHost)) {
        return 'development';
    }
    if (normalizedHost.startsWith('staging.')) {
        return 'staging';
    }
    return 'production';
}
function sanitizeReturnTo(value) {
    if (!value || !value.startsWith('/') || value.startsWith('//')) {
        return '/';
    }
    return value;
}
function getPublicBaseUrl(request) {
    const siteUrl = getConfiguredSiteUrl();
    if (siteUrl) {
        return siteUrl;
    }
    const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
    const host = normalizeHostWithPort(forwardedHost || request.headers.get('host') || '');
    if (host) {
        const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');
        const protocol = isLocal ? 'http' : 'https';
        return `${protocol}://${host}`;
    }
    const isProd = ("TURBOPACK compile-time value", "development") === 'production';
    return ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 'http://localhost:3000';
}
function getRequestBaseUrl(request) {
    const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
    const host = normalizeHostWithPort(forwardedHost || request.headers.get('host') || '');
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
    if (host) {
        const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : forwardedProto;
        return `${protocol}://${host}`;
    }
    if (request.url) {
        try {
            const normalized = normalizeBaseUrl(new URL(request.url).origin);
            if (normalized) {
                return normalized;
            }
        } catch  {
        // Fall through to the canonical public base URL.
        }
    }
    const siteUrl = getConfiguredSiteUrl();
    if (siteUrl) {
        return siteUrl;
    }
    return getPublicBaseUrl(request);
}
function getPublicUrl(pathname, request) {
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return new URL(normalizedPath, getPublicBaseUrl(request)).toString();
}
function getRequestUrl(pathname, request) {
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return new URL(normalizedPath, getRequestBaseUrl(request)).toString();
}
function getGoogleRedirectBaseUrl(redirectUri, request) {
    const normalizedRedirectUri = redirectUri?.trim();
    if (normalizedRedirectUri) {
        try {
            return new URL(normalizedRedirectUri).origin;
        } catch  {
        // Fall through to the canonical public base URL.
        }
    }
    return getPublicBaseUrl(request);
}
function getGoogleOAuthCookieOptions(request, maxAge = 600) {
    const isProd = ("TURBOPACK compile-time value", "development") === 'production' || !request.headers.get('host')?.includes('localhost');
    return {
        httpOnly: true,
        maxAge,
        path: '/',
        // Use none for OAuth to survive redirects from Google, but requires Secure
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd ? true : (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["shouldUseSecureCookies"])(request)
    };
}
function getExpiredGoogleOAuthCookieOptions(request) {
    return {
        ...getGoogleOAuthCookieOptions(request, 0),
        expires: new Date(0),
        maxAge: 0
    };
}
function getGoogleUserCookieOptions(request) {
    return {
        httpOnly: true,
        maxAge: GOOGLE_USER_SESSION_MAX_AGE,
        path: '/',
        sameSite: 'lax',
        secure: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["shouldUseSecureCookies"])(request)
    };
}
async function getGoogleLoginConfig(request) {
    const environment = resolveGoogleEnvironmentFromHost(request.headers.get('host') || '');
    const rawStored = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integrations$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGoogleIntegrationForEnvironment"])(environment);
    const publicBaseUrl = getPublicBaseUrl(request);
    const requestRedirectUri = getRequestUrl('/auth/google/callback', request);
    let stored = rawStored;
    let storedClientSecret = '';
    try {
        const decryptedStored = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integrations$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDecryptedGoogleIntegration"])(environment);
        stored = decryptedStored;
        storedClientSecret = decryptedStored.secrets.googleClientSecret || '';
    } catch (error) {
        console.warn('[Google OAuth] Stored Google secret could not be decrypted; using environment fallback.', error);
    }
    return {
        environment,
        enabled: stored.enabled,
        clientId: stored.googleClientId || process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.CLIENT_ID || '',
        clientSecret: storedClientSecret || process.env.GOOGLE_OAUTH_CLIENT_SECRET || process.env.CLIENT_SECRET || '',
        redirectUri: stored.redirectUri || process.env.GOOGLE_OAUTH_REDIRECT_URI || process.env.REDIRECT_URI || requestRedirectUri,
        javascriptOrigin: stored.javascriptOrigin || process.env.GOOGLE_OAUTH_JAVASCRIPT_ORIGIN || publicBaseUrl,
        scopes: stored.scopes.length > 0 ? stored.scopes : (process.env.GOOGLE_OAUTH_SCOPES || 'openid email profile').split(/[\s,]+/).filter(Boolean)
    };
}
function assertGoogleLoginConfig(config) {
    const missingFields = [
        !config.clientId ? 'GOOGLE_CLIENT_ID' : '',
        !config.clientSecret ? 'GOOGLE_CLIENT_SECRET' : '',
        !config.redirectUri ? 'GOOGLE_REDIRECT_URI' : ''
    ].filter(Boolean);
    if (missingFields.length > 0) {
        throw new Error(`Google OAuth is missing: ${missingFields.join(', ')}`);
    }
}
async function signGoogleUserSession(payload) {
    return await new __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SignJWT"](payload).setProtectedHeader({
        alg: 'HS256'
    }).setIssuedAt().sign(getGoogleSessionKey());
}
async function verifyGoogleUserSession(token) {
    try {
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jwtVerify"])(token, getGoogleSessionKey());
        return payload;
    } catch  {
        return null;
    }
}
}),
"[project]/Galantesjewelry/lib/customer-auth.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CUSTOMER_SESSION_COOKIE",
    ()=>CUSTOMER_SESSION_COOKIE,
    "CUSTOMER_SESSION_MAX_AGE",
    ()=>CUSTOMER_SESSION_MAX_AGE,
    "authenticateCustomerAccount",
    ()=>authenticateCustomerAccount,
    "getAuthenticatedCustomerFromCookies",
    ()=>getAuthenticatedCustomerFromCookies,
    "getAuthenticatedCustomerFromRequest",
    ()=>getAuthenticatedCustomerFromRequest,
    "getCustomerAccountByEmail",
    ()=>getCustomerAccountByEmail,
    "getCustomerSessionCookieOptions",
    ()=>getCustomerSessionCookieOptions,
    "getExpiredCustomerSessionCookieOptions",
    ()=>getExpiredCustomerSessionCookieOptions,
    "hashCustomerPassword",
    ()=>hashCustomerPassword,
    "registerCustomerAccount",
    ()=>registerCustomerAccount,
    "sanitizeCustomerIdentifier",
    ()=>sanitizeCustomerIdentifier,
    "signCustomerSession",
    ()=>signCustomerSession,
    "validateCustomerPassword",
    ()=>validateCustomerPassword,
    "verifyCustomerEmailToken",
    ()=>verifyCustomerEmailToken,
    "verifyCustomerPassword",
    ()=>verifyCustomerPassword,
    "verifyCustomerSession",
    ()=>verifyCustomerSession
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/jose/dist/webapi/jwt/sign.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/jose/dist/webapi/jwt/verify.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$runtime$2d$paths$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/runtime-paths.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$login$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/google-login.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
const CUSTOMER_SESSION_COOKIE = 'customer_session';
const CUSTOMER_SESSION_MAX_AGE = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$login$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["GOOGLE_USER_SESSION_MAX_AGE"];
const customerAuthFile = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$runtime$2d$paths$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDataRoot"])(), 'customer-auth.json');
const CUSTOMER_SESSION_FALLBACK_SECRET = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString('hex');
function normalizeValue(value) {
    return value.trim().toLowerCase();
}
function normalizeName(value) {
    return value.trim().replace(/\s+/g, ' ');
}
function getCustomerSessionKey() {
    return new TextEncoder().encode(process.env.CUSTOMER_SESSION_SECRET || process.env.GOOGLE_SESSION_SECRET || process.env.ADMIN_SECRET_KEY || CUSTOMER_SESSION_FALLBACK_SECRET);
}
function getPasswordSalt() {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomBytes(16).toString('hex');
}
function hashPassword(password, salt = getPasswordSalt()) {
    return `${salt}:${__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].scryptSync(password, salt, 64).toString('hex')}`;
}
function verifyPassword(password, storedHash) {
    const [salt, digest] = storedHash.split(':');
    if (!salt || !digest) {
        return false;
    }
    const computed = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].scryptSync(password, salt, 64).toString('hex');
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(digest, 'hex'));
}
function emptyStore() {
    return {
        customers: []
    };
}
async function readStore() {
    try {
        const content = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].readFile(customerAuthFile, 'utf8');
        const parsed = JSON.parse(content);
        return {
            customers: Array.isArray(parsed.customers) ? parsed.customers : []
        };
    } catch  {
        return emptyStore();
    }
}
async function writeStore(store) {
    await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].dirname(customerAuthFile), {
        recursive: true
    });
    await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(customerAuthFile, JSON.stringify(store, null, 2), 'utf8');
}
function toAuthenticatedCustomer(record) {
    return {
        authMethod: 'password',
        email: record.email,
        name: record.name,
        username: record.username
    };
}
function toSessionPayload(customer) {
    return {
        sub: customer.email,
        email: customer.email,
        name: customer.name,
        username: customer.username,
        authMethod: customer.authMethod
    };
}
function sanitizeCustomerIdentifier(value) {
    return normalizeValue(value);
}
function validateCustomerPassword(password) {
    return password.trim().length >= 8;
}
function hashCustomerPassword(password) {
    return hashPassword(password);
}
function verifyCustomerPassword(password, storedHash) {
    return verifyPassword(password, storedHash);
}
async function registerCustomerAccount(input) {
    const username = normalizeValue(input.username);
    const email = normalizeValue(input.email);
    const name = normalizeName(input.name);
    if (!username || !email || !name) {
        throw new Error('Username, name, and email are required.');
    }
    if (!validateCustomerPassword(input.password)) {
        throw new Error('Password must be at least 8 characters long.');
    }
    const store = await readStore();
    const now = new Date().toISOString();
    const existingByUsername = store.customers.find((customer)=>normalizeValue(customer.username) === username);
    const existingByEmail = store.customers.find((customer)=>normalizeValue(customer.email) === email);
    if (existingByUsername && existingByEmail && existingByUsername !== existingByEmail) {
        throw new Error('Username and email already belong to different accounts.');
    }
    const existing = existingByUsername || existingByEmail;
    if (existing) {
        if (existingByUsername && normalizeValue(existing.email) !== email) {
            throw new Error('That username is already in use.');
        }
        if (existingByEmail && existingByUsername && existingByEmail.username && normalizeValue(existingByEmail.username) !== username) {
            throw new Error('That email is already linked to a different username.');
        }
        existing.username = username || existing.username;
        existing.email = email;
        existing.name = name;
        existing.passwordHash = hashCustomerPassword(input.password);
        existing.updatedAt = now;
        existing.lastLoginAt = now;
        await writeStore(store);
        return toAuthenticatedCustomer(existing);
    }
    const record = {
        username,
        name,
        email,
        passwordHash: hashCustomerPassword(input.password),
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now
    };
    store.customers.unshift(record);
    await writeStore(store);
    return toAuthenticatedCustomer(record);
}
async function authenticateCustomerAccount(identifier, password) {
    const normalizedIdentifier = normalizeValue(identifier);
    if (!normalizedIdentifier) {
        throw new Error('Username or email is required.');
    }
    if (!password) {
        throw new Error('Password is required.');
    }
    const store = await readStore();
    const customer = store.customers.find((record)=>normalizeValue(record.username) === normalizedIdentifier || normalizeValue(record.email) === normalizedIdentifier);
    if (!customer || !verifyPassword(password, customer.passwordHash)) {
        throw new Error('Invalid username/email or password.');
    }
    customer.lastLoginAt = new Date().toISOString();
    customer.updatedAt = customer.lastLoginAt;
    await writeStore(store);
    return toAuthenticatedCustomer(customer);
}
async function signCustomerSession(customer) {
    const expiresAt = new Date(Date.now() + CUSTOMER_SESSION_MAX_AGE * 1000);
    return await new __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SignJWT"](toSessionPayload(customer)).setProtectedHeader({
        alg: 'HS256'
    }).setIssuedAt().setExpirationTime(expiresAt).sign(getCustomerSessionKey());
}
async function verifyCustomerSession(token) {
    try {
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jwtVerify"])(token, getCustomerSessionKey());
        const session = payload;
        if (!session.email || !session.authMethod) {
            return null;
        }
        return {
            authMethod: session.authMethod,
            email: session.email,
            name: session.name,
            username: session.username
        };
    } catch  {
        return null;
    }
}
async function verifyCustomerEmailToken(token) {
    const session = await verifyCustomerSession(token);
    if (!session) {
        throw new Error('Invalid or expired verification token');
    }
    return session;
}
function getCustomerSessionCookieOptions(request) {
    return {
        httpOnly: true,
        maxAge: CUSTOMER_SESSION_MAX_AGE,
        path: '/',
        sameSite: 'lax',
        secure: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["shouldUseSecureCookies"])(request)
    };
}
function getExpiredCustomerSessionCookieOptions(request) {
    return {
        ...getCustomerSessionCookieOptions(request),
        expires: new Date(0),
        maxAge: 0
    };
}
async function getAuthenticatedCustomerFromCookies(cookieSource) {
    const customerToken = cookieSource.get(CUSTOMER_SESSION_COOKIE)?.value;
    if (customerToken) {
        const localSession = await verifyCustomerSession(customerToken);
        if (localSession) {
            return localSession;
        }
    }
    const googleToken = cookieSource.get(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$login$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["GOOGLE_USER_COOKIE"])?.value;
    if (googleToken) {
        const googleSession = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$login$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["verifyGoogleUserSession"])(googleToken);
        if (googleSession) {
            return {
                authMethod: 'google',
                email: googleSession.email,
                name: googleSession.name
            };
        }
    }
    return null;
}
async function getAuthenticatedCustomerFromRequest(request) {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
        return null;
    }
    const cookieMap = new Map(cookieHeader.split(';').map((chunk)=>{
        const [name, ...rest] = chunk.trim().split('=');
        return [
            name,
            rest.join('=')
        ];
    }));
    return getAuthenticatedCustomerFromCookies({
        get (name) {
            const value = cookieMap.get(name);
            return value ? {
                value
            } : undefined;
        }
    });
}
async function getCustomerAccountByEmail(email) {
    const store = await readStore();
    return store.customers.find((customer)=>normalizeValue(customer.email) === normalizeValue(email)) || null;
}
}),
"[project]/Galantesjewelry/lib/odoo/services.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OdooService",
    ()=>OdooService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$src$2f$config$2f$odooClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/src/config/odooClient.js [app-rsc] (ecmascript)");
;
const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$src$2f$config$2f$odooClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createOdooClient"])();
function buildPortalUrl(baseUrl, accessUrl) {
    return accessUrl ? `${baseUrl}${accessUrl}` : null;
}
function buildInvoicePdfUrl(baseUrl, accessUrl, accessToken) {
    if (!accessUrl) return null;
    const separator = accessUrl.includes('?') ? '&' : '?';
    const normalizedToken = accessToken && !accessUrl.includes('access_token=') ? `&access_token=${encodeURIComponent(accessToken)}` : '';
    return `${baseUrl}${accessUrl}${separator}report_type=pdf&download=true${normalizedToken}`;
}
const OdooService = {
    async getCompanySettings () {
        const config = client.getConfig();
        if (!config.enabled || !config.isReady) return {};
        try {
            const cmsSettings = await client.searchRead('galante.cms.settings', {
                domain: [],
                fields: [
                    'site_title',
                    'site_description',
                    'logo_url',
                    'favicon_url',
                    'hero_image_url',
                    'instagram_url',
                    'facebook_url',
                    'whatsapp_number',
                    'contact_email',
                    'contact_phone',
                    'contact_address',
                    'appointment_email',
                    'navigation_json'
                ],
                limit: 1
            });
            if (cmsSettings && cmsSettings.length > 0) {
                const s = cmsSettings[0];
                let navLinks = [];
                try {
                    const parsed = s.navigation_json ? JSON.parse(s.navigation_json) : [];
                    navLinks = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    console.error('Failed to parse nav links', e);
                }
                return {
                    site_title: s.site_title ?? undefined,
                    site_description: s.site_description ?? undefined,
                    logo_url: s.logo_url ?? undefined,
                    favicon_url: s.favicon_url ?? undefined,
                    hero_image_url: s.hero_image_url ?? undefined,
                    instagram_url: s.instagram_url ?? undefined,
                    facebook_url: s.facebook_url ?? undefined,
                    whatsapp_number: s.whatsapp_number ?? undefined,
                    contact_email: s.contact_email ?? undefined,
                    contact_phone: s.contact_phone ?? undefined,
                    contact_address: s.contact_address ?? undefined,
                    appointment_email: s.appointment_email ?? undefined,
                    navigation_links: navLinks
                };
            }
            return {};
        } catch  {
            console.warn('[OdooService] Company settings fetch failed, using local CMS data fallback.');
            return {};
        }
    },
    async getPartnerByEmail (email) {
        try {
            const existing = await client.call('res.partner', 'search_read', {
                domain: [
                    [
                        'email',
                        '=',
                        email
                    ]
                ],
                fields: [
                    'id'
                ],
                limit: 1
            });
            return existing && existing.length > 0 ? existing[0].id : null;
        } catch (error) {
            console.warn('[OdooService] Partner search failed:', error instanceof Error ? error.message : 'Unknown error');
            return null;
        }
    },
    async findOrCreateCustomer (data) {
        try {
            const existing = await this.getPartnerByEmail(data.email);
            if (existing) return existing;
            let countryId = data.country_id || 233; // Default to US
            let stateId = data.state_id;
            const countryName = data.country?.trim() || '';
            const isDR = countryName === 'Dominican Republic' || countryName === 'República Dominicana' || countryName === 'Republica Dominicana';
            const isUS = countryName === 'United States';
            if (isDR) {
                countryId = 62;
            } else if (isUS) {
                countryId = 233;
            }
            // Special handling for Florida state ID if name provided but no ID
            if (data.state?.toUpperCase() === 'FL' || data.state?.toLowerCase() === 'florida') {
                stateId = 10;
            }
            return await client.create('res.partner', {
                name: data.name,
                email: data.email,
                phone: data.phone,
                street: data.street,
                city: data.city,
                zip: data.zip,
                state_id: stateId,
                country_id: countryId,
                customer_rank: 1
            });
        } catch (error) {
            console.warn('[OdooService] Partner creation failed:', error instanceof Error ? error.message : 'Unknown error');
            return null;
        }
    },
    async syncCustomerProfile (data) {
        try {
            const partnerId = await this.findOrCreateCustomer(data);
            if (!partnerId) return null;
            const vals = {
                customer_rank: 1,
                galantes_customer_source: data.authMethod || 'unknown',
                galantes_customer_last_auth_at: data.lastAuthAt || new Date().toISOString()
            };
            await client.call('res.partner', 'write', {
                ids: [
                    partnerId
                ],
                vals
            });
            return partnerId;
        } catch (error) {
            console.warn('[OdooService] User profile sync failed:', error instanceof Error ? error.message : 'Unknown error');
            return null;
        }
    },
    async syncAuthenticatedUser (data) {
        return await this.syncCustomerProfile({
            ...data,
            lastAuthAt: new Date().toISOString()
        });
    },
    async createOrder (partnerId, lines) {
        try {
            const lineVals = lines.map((l)=>[
                    0,
                    0,
                    {
                        product_id: l.product_id,
                        product_uom_qty: l.product_uom_qty,
                        price_unit: l.price_unit,
                        ...l.name ? {
                            name: l.name
                        } : {}
                    }
                ]);
            return await client.create('sale.order', {
                partner_id: partnerId,
                order_line: lineVals
            });
        } catch (error) {
            console.error('Odoo Order Creation Error:', error);
            return null;
        }
    },
    async getProductVariantIdByDefaultCode (defaultCode) {
        try {
            const templates = await client.call('product.template', 'search_read', {
                domain: [
                    [
                        'default_code',
                        '=',
                        defaultCode
                    ]
                ],
                fields: [
                    'id',
                    'product_variant_id'
                ],
                limit: 1
            });
            const templateVariant = templates?.[0]?.product_variant_id;
            if (Array.isArray(templateVariant)) {
                return typeof templateVariant[0] === 'number' ? templateVariant[0] : null;
            }
            if (typeof templateVariant === 'number' && Number.isFinite(templateVariant)) {
                return templateVariant;
            }
            const products = await client.call('product.product', 'search_read', {
                domain: [
                    [
                        'default_code',
                        '=',
                        defaultCode
                    ]
                ],
                fields: [
                    'id'
                ],
                limit: 1
            });
            return products && products.length > 0 ? products[0].id : null;
        } catch (error) {
            console.error('Odoo Product Lookup Error:', error);
            return null;
        }
    },
    async automateBillingFlow (orderId, stripeData) {
        try {
            // 1. Fetch current order state
            const orders = await client.call('sale.order', 'read', {
                ids: [
                    orderId
                ],
                fields: [
                    'state',
                    'invoice_status',
                    'invoice_ids',
                    'picking_ids'
                ]
            });
            if (!orders || orders.length === 0) throw new Error('Order not found');
            // 2. Normalize Stripe data for Odoo
            const stripeVals = stripeData ? {
                payment_intent_id: stripeData.paymentIntentId,
                charge_id: stripeData.chargeId || false,
                amount: stripeData.amount,
                currency: stripeData.currency,
                receipt_url: stripeData.receiptUrl,
                customer_email: stripeData.customerEmail,
                payment_status: stripeData.paymentStatus
            } : false;
            // 3. Call Odoo finalization action (custom logic in galantes_jewelry module)
            const result = await client.call('sale.order', 'action_galantes_finalize_paid_checkout', {
                ids: [
                    orderId
                ],
                stripe_payment: stripeVals
            });
            // The action returns a list with the updated order details
            const finalizedOrder = Array.isArray(result) && result.length > 0 ? result[0] : null;
            if (!finalizedOrder || !finalizedOrder.invoice_ids?.length && finalizedOrder.state !== 'cancel') {
                // Log in Odoo if it didn't cancel but also didn't invoice
                if (finalizedOrder?.state !== 'cancel') {
                    await client.call('sale.order', 'message_post', {
                        ids: [
                            orderId
                        ],
                        body: 'Billing finalization completed without creating or linking an invoice.'
                    });
                    throw new Error('Billing finalization completed without creating or linking an invoice.');
                }
            }
            return {
                success: true,
                orderId,
                invoiceId: finalizedOrder?.invoice_ids?.[0] || null,
                pickingIds: finalizedOrder?.picking_ids || [],
                steps: [
                    'confirmed',
                    'finalized'
                ]
            };
        } catch (error) {
            console.error('Odoo Billing Automation Error:', error);
            // Log failure in Odoo chatter
            try {
                await client.call('sale.order', 'message_post', {
                    ids: [
                        orderId
                    ],
                    body: `Billing Automation Failed: ${error instanceof Error ? error.message : String(error)}`
                });
            } catch  {}
            throw error instanceof Error ? error : new Error(String(error));
        }
    },
    async getOrderWithInvoices (orderId) {
        const orders = await client.call('sale.order', 'search_read', {
            domain: [
                [
                    'id',
                    '=',
                    orderId
                ]
            ],
            fields: [
                'name',
                'date_order',
                'state',
                'amount_total',
                'invoice_status',
                'access_url',
                'partner_id',
                'invoice_ids'
            ],
            limit: 1
        });
        if (!orders || orders.length === 0) return null;
        const o = orders[0];
        let baseUrl = process.env.ODOO_BASE_URL || 'http://odoo:8069';
        // Internal container networking fix
        if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
            baseUrl = baseUrl.replace('localhost', 'odoo').replace('127.0.0.1', 'odoo');
        }
        let invoices = [];
        const invoiceIds = o.invoice_ids ?? [];
        if (invoiceIds.length > 0) {
            const invData = await client.call('account.move', 'search_read', {
                domain: [
                    [
                        'id',
                        'in',
                        invoiceIds
                    ]
                ],
                fields: [
                    'name',
                    'invoice_date',
                    'state',
                    'amount_total',
                    'payment_state',
                    'access_url',
                    'access_token'
                ]
            });
            invoices = (invData || []).map((inv)=>({
                    ...inv,
                    display_status: this.mapInvoiceState(inv.state, inv.payment_state),
                    portal_url: buildPortalUrl(baseUrl, inv.access_url),
                    pdf_url: buildInvoicePdfUrl(baseUrl, inv.access_url, inv.access_token)
                }));
        }
        return {
            ...o,
            display_status: this.mapOrderState(o.state, o.invoice_status),
            portal_url: o.access_url ? `${baseUrl}${o.access_url}` : null,
            invoices
        };
    },
    async syncCompanyProfile (settings) {
        try {
            // Prefer the US country record, but fall back to the standard US id so state lookup still runs.
            const countries = await client.call('res.country', 'search_read', {
                domain: [
                    [
                        'code',
                        '=',
                        'US'
                    ]
                ],
                fields: [
                    'id'
                ],
                limit: 1
            });
            const countryId = countries?.[0]?.id || 233;
            // Simple address parsing for Islamorada
            const vals = {
                email: settings.contact_email,
                phone: settings.contact_phone,
                street: settings.contact_address?.split(',')[0]?.trim(),
                city: 'Islamorada',
                zip: '33036',
                country_id: countryId
            };
            if (settings.contact_address) {
                const stateMatch = settings.contact_address.match(/,\s*([A-Z]{2})\s+\d{5}(?:-\d{4})?\s*,/i);
                const stateCode = stateMatch?.[1]?.toUpperCase() || 'FL';
                const states = await client.call('res.country.state', 'search_read', {
                    domain: [
                        [
                            'code',
                            '=',
                            stateCode
                        ],
                        [
                            'country_id',
                            '=',
                            countryId
                        ]
                    ],
                    fields: [
                        'id'
                    ],
                    limit: 1
                });
                if (states?.length > 0) vals.state_id = states[0].id;
            }
            // Write to company 1
            await client.call('res.company', 'write', {
                ids: [
                    1
                ],
                vals
            });
            return true;
        } catch (error) {
            console.error('Company Sync Error:', error);
            return false;
        }
    },
    async getOrderDetails (orderId, authenticatedEmail) {
        try {
            const orders = await client.call('sale.order', 'search_read', {
                domain: [
                    [
                        'id',
                        '=',
                        orderId
                    ]
                ],
                fields: [
                    'name',
                    'date_order',
                    'state',
                    'amount_untaxed',
                    'amount_tax',
                    'amount_total',
                    'invoice_status',
                    'order_line',
                    'access_url',
                    'partner_id'
                ],
                limit: 1
            });
            if (!orders || orders.length === 0) return null;
            const order = orders[0];
            if (authenticatedEmail) {
                const partnerId = await this.getPartnerByEmail(authenticatedEmail);
                const orderPartnerId = Array.isArray(order.partner_id) ? order.partner_id[0] : order.partner_id;
                if (!partnerId || !orderPartnerId || partnerId !== orderPartnerId) {
                    return null;
                }
            }
            let baseUrl = process.env.ODOO_BASE_URL || 'http://odoo:8069';
            // Internal container networking fix
            if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
                baseUrl = baseUrl.replace('localhost', 'odoo').replace('127.0.0.1', 'odoo');
            }
            return {
                ...order,
                display_status: this.mapOrderState(order.state, order.invoice_status),
                portal_url: order.access_url ? `${baseUrl}${order.access_url}` : null
            };
        } catch (error) {
            console.error('Odoo Order Fetch Error:', error);
            return null;
        }
    },
    async getPartnerOrders (partnerId) {
        try {
            const orders = await client.call('sale.order', 'search_read', {
                domain: [
                    [
                        'partner_id',
                        '=',
                        partnerId
                    ]
                ],
                fields: [
                    'id',
                    'name',
                    'date_order',
                    'state',
                    'amount_total',
                    'invoice_status',
                    'access_url',
                    'invoice_ids'
                ],
                order: 'date_order desc'
            });
            let baseUrl = process.env.ODOO_BASE_URL || 'http://odoo:8069';
            // Internal container networking fix
            if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
                baseUrl = baseUrl.replace('localhost', 'odoo').replace('127.0.0.1', 'odoo');
            }
            return (orders || []).map((o)=>({
                    ...o,
                    display_status: this.mapOrderState(o.state, o.invoice_status),
                    portal_url: o.access_url ? `${baseUrl}${o.access_url}` : null
                }));
        } catch (error) {
            console.error('Odoo Partner Orders Fetch Error:', error);
            return [];
        }
    },
    async getOrdersWithInvoices (partnerId, authenticatedEmail) {
        try {
            if (authenticatedEmail) {
                const partner = await client.call('res.partner', 'search_read', {
                    domain: [
                        [
                            'id',
                            '=',
                            partnerId
                        ]
                    ],
                    fields: [
                        'email'
                    ],
                    limit: 1
                });
                const resolvedEmail = partner?.[0]?.email || '';
                if (!resolvedEmail || resolvedEmail.toLowerCase() !== authenticatedEmail.toLowerCase()) {
                    return [];
                }
            }
            const orders = await this.getPartnerOrders(partnerId);
            if (!orders || orders.length === 0) return [];
            let baseUrl = process.env.ODOO_BASE_URL || 'http://odoo:8069';
            // Internal container networking fix
            if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
                baseUrl = baseUrl.replace('localhost', 'odoo').replace('127.0.0.1', 'odoo');
            }
            const allInvoiceIds = orders.flatMap((o)=>o.invoice_ids || []);
            const invoiceMap = {};
            if (allInvoiceIds.length > 0) {
                const invoices = await client.call('account.move', 'search_read', {
                    domain: [
                        [
                            'id',
                            'in',
                            allInvoiceIds
                        ],
                        [
                            'move_type',
                            '=',
                            'out_invoice'
                        ]
                    ],
                    fields: [
                        'id',
                        'name',
                        'invoice_date',
                        'state',
                        'amount_total',
                        'payment_state',
                        'access_url',
                        'access_token'
                    ]
                });
                for (const inv of invoices || []){
                    const enriched = {
                        ...inv,
                        display_status: this.mapInvoiceState(inv.state, inv.payment_state),
                        portal_url: buildPortalUrl(baseUrl, inv.access_url),
                        pdf_url: buildInvoicePdfUrl(baseUrl, inv.access_url, inv.access_token)
                    };
                    for (const order of orders){
                        if ((order.invoice_ids || []).includes(inv.id)) {
                            if (!invoiceMap[order.id]) invoiceMap[order.id] = [];
                            invoiceMap[order.id].push(enriched);
                        }
                    }
                }
            }
            return orders.map((o)=>({
                    ...o,
                    invoices: invoiceMap[o.id] || []
                }));
        } catch (error) {
            console.warn('[OdooService] Orders+Invoices fetch failed:', error);
            return [];
        }
    },
    async getPartnerInvoices (partnerId) {
        try {
            const invoices = await client.call('account.move', 'search_read', {
                domain: [
                    [
                        'partner_id',
                        '=',
                        partnerId
                    ],
                    [
                        'move_type',
                        '=',
                        'out_invoice'
                    ]
                ],
                fields: [
                    'name',
                    'invoice_date',
                    'state',
                    'amount_total',
                    'payment_state',
                    'access_url',
                    'access_token'
                ],
                order: 'invoice_date desc'
            });
            let baseUrl = process.env.ODOO_BASE_URL || 'http://odoo:8069';
            // Internal container networking fix
            if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
                baseUrl = baseUrl.replace('localhost', 'odoo').replace('127.0.0.1', 'odoo');
            }
            return (invoices || []).map((inv)=>({
                    ...inv,
                    display_status: this.mapInvoiceState(inv.state, inv.payment_state),
                    portal_url: buildPortalUrl(baseUrl, inv.access_url),
                    pdf_url: buildInvoicePdfUrl(baseUrl, inv.access_url, inv.access_token)
                }));
        } catch (error) {
            console.error('Odoo Partner Invoices Fetch Error:', error);
            return [];
        }
    },
    async getPartnerAddresses (partnerId) {
        try {
            return await client.call('res.partner', 'search_read', {
                domain: [
                    [
                        'parent_id',
                        '=',
                        partnerId
                    ],
                    [
                        'type',
                        'in',
                        [
                            'delivery',
                            'invoice',
                            'other'
                        ]
                    ]
                ],
                fields: [
                    'id',
                    'name',
                    'type',
                    'email',
                    'phone',
                    'street',
                    'street2',
                    'city',
                    'zip',
                    'state_id',
                    'country_id'
                ],
                order: 'type asc'
            });
        } catch (error) {
            console.error('Odoo Partner Addresses Fetch Error:', error);
            return [];
        }
    },
    async savePartnerAddress (partnerId, data) {
        try {
            const vals = {
                parent_id: partnerId,
                ...data
            };
            if (data.id) {
                await client.call('res.partner', 'write', {
                    ids: [
                        data.id
                    ],
                    vals
                });
                return data.id;
            }
            return await client.create('res.partner', vals);
        } catch (error) {
            console.error('Odoo Address Save Error:', error);
            return null;
        }
    },
    async deletePartnerAddress (addressId) {
        try {
            return await client.call('res.partner', 'write', {
                ids: [
                    addressId
                ],
                vals: {
                    active: false
                }
            });
        } catch (error) {
            console.error('Odoo Address Delete Error:', error);
            return false;
        }
    },
    async getProductImage (templateId) {
        let baseUrl = process.env.ODOO_BASE_URL || 'http://odoo:8069';
        // Internal container networking fix
        if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
            baseUrl = baseUrl.replace('localhost', 'odoo').replace('127.0.0.1', 'odoo');
        }
        const db = process.env.ODOO_DATABASE || process.env.ODOO_DB || 'galantes_prod';
        const fields = [
            'image_256',
            'image_1920'
        ];
        // Attempt 1: Direct HTTP Fetch (Fastest, best for cache)
        for (const field of fields){
            const urls = [
                `${baseUrl}/web/image/product.template/${templateId}/${field}?db=${db}`,
                `${baseUrl}/web/image?model=product.template&id=${templateId}&field=${field}&db=${db}`
            ];
            for (const url of urls){
                try {
                    const response = await fetch(url, {
                        next: {
                            revalidate: 3600
                        }
                    });
                    if (response.ok) {
                        const buffer = await response.arrayBuffer();
                        if (buffer.byteLength > 9000) {
                            return Buffer.from(buffer).toString('base64');
                        }
                    }
                } catch (error) {
                // Silent fail to next attempt
                }
            }
        }
        // Attempt 2: Odoo API Call (Most reliable, uses credentials)
        console.log(`[OdooService] HTTP fetch failed or returned placeholders for ${templateId}, trying API fallback...`);
        try {
            const result = await client.call('product.template', 'read', {
                ids: [
                    templateId
                ],
                fields: [
                    'image_1920',
                    'image_256'
                ]
            });
            if (result && result.length > 0) {
                const p = result[0];
                // Check image_1920 first, then image_256
                const images = [
                    p.image_1920,
                    p.image_256
                ];
                for (const img of images){
                    if (img && img.length > 12000) {
                        console.log(`[OdooService] Success via API for ${templateId} using ${img === p.image_1920 ? '1920' : '256'}`);
                        return img;
                    }
                }
            }
        } catch (apiError) {
            console.error(`[OdooService] API fallback failed for ${templateId}:`, apiError);
        }
        return null;
    },
    async getOrderFullDetails (orderId, authenticatedEmail) {
        try {
            const order = await this.getOrderDetails(orderId, authenticatedEmail);
            if (!order) return null;
            const orderLineIds = order.order_line ?? [];
            const lines = await client.call('sale.order.line', 'search_read', {
                domain: [
                    [
                        'id',
                        'in',
                        orderLineIds
                    ]
                ],
                fields: [
                    'product_id',
                    'name',
                    'product_uom_qty',
                    'price_unit',
                    'price_subtotal',
                    'price_total',
                    'product_template_id'
                ]
            });
            let tracking = [];
            if (order.picking_ids && order.picking_ids.length > 0) {
                tracking = await client.call('stock.picking', 'search_read', {
                    domain: [
                        [
                            'id',
                            'in',
                            order.picking_ids
                        ]
                    ],
                    fields: [
                        'name',
                        'state',
                        'carrier_tracking_ref',
                        'carrier_id',
                        'date_done'
                    ]
                });
            }
            return {
                ...order,
                lines: (lines || []).map((l)=>({
                        ...l,
                        image_url: `/api/products/image?id=${Array.isArray(l.product_template_id) ? l.product_template_id[0] : l.product_template_id}`
                    })),
                tracking: (tracking || []).map((t)=>({
                        ...t,
                        carrier_name: Array.isArray(t.carrier_id) ? t.carrier_id[1] : 'Standard Shipping'
                    }))
            };
        } catch (error) {
            console.error('Odoo Order Full Details Error:', error);
            return null;
        }
    },
    async getPartnerProfile (partnerId) {
        try {
            const partners = await client.call('res.partner', 'search_read', {
                domain: [
                    [
                        'id',
                        '=',
                        partnerId
                    ]
                ],
                fields: [
                    'name',
                    'email',
                    'phone',
                    'street',
                    'street2',
                    'city',
                    'zip',
                    'country_id',
                    'state_id'
                ],
                limit: 1
            });
            if (!partners || partners.length === 0) return null;
            const p = partners[0];
            return {
                ...p,
                country_name: p.country_id ? p.country_id[1] : '',
                state_name: p.state_id ? p.state_id[1] : ''
            };
        } catch (error) {
            console.error('Odoo Profile Fetch Error:', error);
            return null;
        }
    },
    async updatePartnerProfile (partnerId, data) {
        try {
            await client.call('res.partner', 'write', {
                ids: [
                    partnerId
                ],
                vals: data
            });
            return {
                success: true
            };
        } catch (error) {
            console.error('Odoo Profile Update Error:', error);
            return {
                success: false,
                error: String(error)
            };
        }
    },
    mapOrderState (state, invoiceStatus) {
        const states = {
            'draft': 'Quotation',
            'sent': 'Quotation Sent',
            'sale': 'Confirmed',
            'done': 'Locked',
            'cancel': 'Cancelled'
        };
        if (state === 'sale' && invoiceStatus === 'invoiced') return 'Completed & Invoiced';
        if (state === 'sale' && invoiceStatus === 'to invoice') return 'Ready to Invoice';
        return states[state] || state;
    },
    mapInvoiceState (state, paymentState) {
        if (paymentState === 'paid') return 'Paid';
        if (paymentState === 'in_payment') return 'Processing Payment';
        if (paymentState === 'partial') return 'Partially Paid';
        const states = {
            'draft': 'Draft',
            'posted': 'Posted',
            'cancel': 'Cancelled'
        };
        return states[state] || state;
    }
};
}),
"[project]/Galantesjewelry/context/shop/CartContext.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CartProvider",
    ()=>CartProvider,
    "useCart",
    ()=>useCart
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const CartProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call CartProvider() from the server but CartProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Galantesjewelry/context/shop/CartContext.tsx <module evaluation>", "CartProvider");
const useCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call useCart() from the server but useCart is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Galantesjewelry/context/shop/CartContext.tsx <module evaluation>", "useCart");
}),
"[project]/Galantesjewelry/context/shop/CartContext.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CartProvider",
    ()=>CartProvider,
    "useCart",
    ()=>useCart
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const CartProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call CartProvider() from the server but CartProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Galantesjewelry/context/shop/CartContext.tsx", "CartProvider");
const useCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call useCart() from the server but useCart is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Galantesjewelry/context/shop/CartContext.tsx", "useCart");
}),
"[project]/Galantesjewelry/context/shop/CartContext.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$context$2f$shop$2f$CartContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/Galantesjewelry/context/shop/CartContext.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$context$2f$shop$2f$CartContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/context/shop/CartContext.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$context$2f$shop$2f$CartContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/Galantesjewelry/components/ConditionalNavbar.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConditionalNavbar",
    ()=>ConditionalNavbar
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ConditionalNavbar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ConditionalNavbar() from the server but ConditionalNavbar is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Galantesjewelry/components/ConditionalNavbar.tsx <module evaluation>", "ConditionalNavbar");
}),
"[project]/Galantesjewelry/components/ConditionalNavbar.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConditionalNavbar",
    ()=>ConditionalNavbar
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ConditionalNavbar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ConditionalNavbar() from the server but ConditionalNavbar is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Galantesjewelry/components/ConditionalNavbar.tsx", "ConditionalNavbar");
}),
"[project]/Galantesjewelry/components/ConditionalNavbar.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$ConditionalNavbar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/ConditionalNavbar.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$ConditionalNavbar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/ConditionalNavbar.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$ConditionalNavbar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/Galantesjewelry/components/ConditionalFooter.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConditionalFooter",
    ()=>ConditionalFooter
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ConditionalFooter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ConditionalFooter() from the server but ConditionalFooter is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Galantesjewelry/components/ConditionalFooter.tsx <module evaluation>", "ConditionalFooter");
}),
"[project]/Galantesjewelry/components/ConditionalFooter.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConditionalFooter",
    ()=>ConditionalFooter
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ConditionalFooter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ConditionalFooter() from the server but ConditionalFooter is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Galantesjewelry/components/ConditionalFooter.tsx", "ConditionalFooter");
}),
"[project]/Galantesjewelry/components/ConditionalFooter.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$ConditionalFooter$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/ConditionalFooter.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$ConditionalFooter$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/ConditionalFooter.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$ConditionalFooter$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/Galantesjewelry/app/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RootLayout,
    "dynamic",
    ()=>dynamic,
    "generateMetadata",
    ()=>generateMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$outfit_333574c6$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[next]/internal/font/google/outfit_333574c6.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$customer$2d$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/customer-auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2f$services$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/odoo/services.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$context$2f$shop$2f$CartContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/context/shop/CartContext.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$ConditionalNavbar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/ConditionalNavbar.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$ConditionalFooter$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/ConditionalFooter.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
const dynamic = 'force-dynamic';
const ODOO_SETTINGS_CACHE_TTL_MS = 30 * 60 * 1000; // Increased to 30 mins
const ODOO_SETTINGS_TIMEOUT_MS = 800; // Reduced to 800ms for faster first byte
let cachedOdooSettings = null;
function withTimeout(promise, timeoutMs) {
    return new Promise((resolve, reject)=>{
        const timeoutId = setTimeout(()=>{
            reject(new Error(`Timed out after ${timeoutMs}ms`));
        }, timeoutMs);
        promise.then((value)=>{
            clearTimeout(timeoutId);
            resolve(value);
        }).catch((error)=>{
            clearTimeout(timeoutId);
            reject(error);
        });
    });
}
const FALLBACK_SETTINGS = {
    brand_name: "Galante's Jewelry",
    brand_tagline: 'By The Sea',
    site_title: "Galante's Jewelry by the Sea ",
    site_description: 'Luxury jewelry boutique in Islamorada focused on bridal pieces, nautical collections, repairs, and private consultations.',
    favicon_url: '/favicon.ico',
    logo_url: '/assets/branding/logo-transparent.png',
    hero_image_url: '/api/image?id=image-1776959050826-portada.webp',
    shop_hero_image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2844&auto=format&fit=crop',
    instagram_url: 'https://www.instagram.com/galantesjewelrybythesea',
    facebook_url: 'https://www.facebook.com/people/Galantes-Jewelry-by-The-Sea/61574429843836',
    whatsapp_number: '16464965879',
    contact_email: 'concierge@galantesjewelry.com',
    contact_phone: '(305) 555-0199',
    contact_address: '82681 Overseas Highway, Islamorada, FL 33036, United States',
    appointment_email: 'ceo@galantesjewelry.com',
    navigation_links: [
        {
            label: 'Heritage',
            href: '/about'
        },
        {
            label: 'Collections',
            href: '/collections'
        },
        {
            label: 'Bridal',
            href: '/bridal'
        },
        {
            label: 'Repairs',
            href: '/repairs'
        },
        {
            label: 'Contact',
            href: '/contact'
        }
    ]
};
async function loadSiteSettings() {
    try {
        const localSettings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSettings"])();
        const now = Date.now();
        let odooSettings = {};
        if (cachedOdooSettings && cachedOdooSettings.expiresAt > now) {
            odooSettings = cachedOdooSettings.value;
        } else {
            try {
                odooSettings = await withTimeout(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2f$services$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OdooService"].getCompanySettings(), ODOO_SETTINGS_TIMEOUT_MS);
                cachedOdooSettings = {
                    value: odooSettings,
                    expiresAt: Date.now() + ODOO_SETTINGS_CACHE_TTL_MS
                };
            } catch (error) {
                console.warn('[Layout] Odoo settings fetch timed out or failed; using local CMS data.', error instanceof Error ? error.message : error);
            }
        }
        const merged = {
            ...FALLBACK_SETTINGS,
            ...localSettings ?? {},
            ...odooSettings ?? {}
        };
        const preferredLocalLogoUrl = localSettings?.logo_url?.trim();
        const preferredLogoUrl = preferredLocalLogoUrl && !/photoroom|error/i.test(preferredLocalLogoUrl) ? preferredLocalLogoUrl : FALLBACK_SETTINGS.logo_url;
        const upstreamLogoUrl = merged.logo_url?.trim() || '';
        const logoUrl = !upstreamLogoUrl || /photoroom|error/i.test(upstreamLogoUrl) ? preferredLogoUrl : upstreamLogoUrl;
        // Keep social buttons visible even if upstream systems return empty strings.
        return {
            ...merged,
            logo_url: logoUrl,
            instagram_url: merged.instagram_url || FALLBACK_SETTINGS.instagram_url,
            facebook_url: merged.facebook_url || FALLBACK_SETTINGS.facebook_url,
            whatsapp_number: merged.whatsapp_number || FALLBACK_SETTINGS.whatsapp_number
        };
    } catch  {
        return FALLBACK_SETTINGS;
    }
}
async function generateMetadata() {
    const settings = await loadSiteSettings();
    const brandName = settings.brand_name?.trim() || settings.site_title;
    return {
        title: brandName,
        description: settings.site_description,
        icons: {
            icon: settings.favicon_url || FALLBACK_SETTINGS.favicon_url
        },
        openGraph: {
            title: brandName,
            description: settings.site_description,
            url: 'https://galantesjewelry.com',
            siteName: brandName,
            locale: 'en_US',
            type: 'website'
        }
    };
}
async function RootLayout({ children }) {
    const finalSettings = await loadSiteSettings();
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    const requestHeaders = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["headers"])();
    const currentUrl = requestHeaders.get('x-current-url') || '';
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$customer$2d$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAuthenticatedCustomerFromCookies"])(cookieStore);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("html", {
        lang: "en",
        className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$outfit_333574c6$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].variable,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("head", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                    name: "version-id",
                    content: "v2026-04-27-hard-rebuild-001"
                }, void 0, false, {
                    fileName: "[project]/Galantesjewelry/app/layout.tsx",
                    lineNumber: 153,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                lineNumber: 152,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("body", {
                className: `${__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$outfit_333574c6$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].className} bg-background text-foreground flex min-h-screen flex-col`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$context$2f$shop$2f$CartContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CartProvider"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$ConditionalNavbar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ConditionalNavbar"], {
                                settings: finalSettings,
                                user: user,
                                currentUrl: currentUrl
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                lineNumber: 157,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                                className: "flex-grow",
                                children: children
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                lineNumber: 158,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                        lineNumber: 156,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$ConditionalFooter$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ConditionalFooter"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Footer, {
                                settings: finalSettings
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                lineNumber: 162,
                                columnNumber: 11
                            }, this),
                            finalSettings.facebook_url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: finalSettings.facebook_url,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                "aria-label": "Facebook",
                                className: "fixed bottom-[9.5rem] right-6 z-50 flex items-center justify-center rounded-full bg-[#1877F2] p-4 text-white shadow-lg transition-transform hover:scale-110",
                                title: "Follow us on Facebook",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    width: "24",
                                    height: "24",
                                    viewBox: "0 0 24 24",
                                    fill: "currentColor",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                        lineNumber: 174,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                    lineNumber: 173,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                lineNumber: 165,
                                columnNumber: 13
                            }, this),
                            finalSettings.instagram_url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: finalSettings.instagram_url,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                "aria-label": "Instagram",
                                className: "fixed bottom-[5.5rem] right-6 z-50 flex items-center justify-center rounded-full p-4 text-white shadow-lg transition-transform hover:scale-110",
                                style: {
                                    background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)'
                                },
                                title: "Follow us on Instagram",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    width: "24",
                                    height: "24",
                                    viewBox: "0 0 24 24",
                                    fill: "currentColor",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                        lineNumber: 189,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                    lineNumber: 188,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                lineNumber: 179,
                                columnNumber: 13
                            }, this),
                            finalSettings.whatsapp_number && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: `https://wa.me/${finalSettings.whatsapp_number}`,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                "aria-label": "WhatsApp",
                                className: "fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full bg-[#25D366] p-4 text-white shadow-lg transition-transform hover:scale-110",
                                title: "Chat with us on WhatsApp",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    width: "24",
                                    height: "24",
                                    viewBox: "0 0 24 24",
                                    fill: "currentColor",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .081 5.363.079 11.969c0 2.112.552 4.173 1.6 6.012L0 24l6.17-1.618a11.747 11.747 0 005.876 1.583h.004c6.602 0 11.967-5.367 11.97-11.97a11.815 11.815 0 00-3.351-8.441"
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                        lineNumber: 203,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                    lineNumber: 202,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                lineNumber: 194,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                        lineNumber: 161,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                lineNumber: 155,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Galantesjewelry/app/layout.tsx",
        lineNumber: 151,
        columnNumber: 5
    }, this);
}
function Footer({ settings }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
        className: "mt-20 w-full bg-primary px-6 py-12 text-white md:px-12",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "mb-4 font-serif text-2xl text-accent",
                                children: "Galante's Jewelry by the Sea"
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                lineNumber: 218,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm leading-relaxed text-white/80",
                                children: "Barefoot luxury in Islamorada, with a concierge experience built around heirlooms, bridal moments, and coastal craftsmanship."
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                lineNumber: 219,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-6 flex gap-4",
                                children: [
                                    settings.instagram_url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: settings.instagram_url,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        className: "text-white transition-colors hover:text-accent",
                                        title: "Instagram",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            width: "20",
                                            height: "20",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                    width: "20",
                                                    height: "20",
                                                    x: "2",
                                                    y: "2",
                                                    rx: "5",
                                                    ry: "5"
                                                }, void 0, false, {
                                                    fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                                    lineNumber: 233,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
                                                }, void 0, false, {
                                                    fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                                    lineNumber: 234,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                    x1: "17.5",
                                                    x2: "17.51",
                                                    y1: "6.5",
                                                    y2: "6.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                                    lineNumber: 235,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                            lineNumber: 232,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                        lineNumber: 225,
                                        columnNumber: 15
                                    }, this),
                                    settings.facebook_url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: settings.facebook_url,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        className: "text-white transition-colors hover:text-accent",
                                        title: "Facebook",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            width: "20",
                                            height: "20",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                                lineNumber: 248,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                            lineNumber: 247,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                        lineNumber: 240,
                                        columnNumber: 15
                                    }, this),
                                    settings.whatsapp_number && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: `https://wa.me/${settings.whatsapp_number}`,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        className: "text-white transition-colors hover:text-accent",
                                        title: "WhatsApp",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            width: "20",
                                            height: "20",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                                lineNumber: 261,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                            lineNumber: 260,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                        lineNumber: 253,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                lineNumber: 223,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                        lineNumber: 217,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "mb-4 font-serif text-lg text-accent",
                                children: "Services"
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                lineNumber: 268,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "space-y-2 text-sm text-white/80",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/collections",
                                            className: "transition-colors hover:text-accent",
                                            children: "Fine Collections"
                                        }, void 0, false, {
                                            fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                            lineNumber: 270,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                        lineNumber: 270,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/bridal",
                                            className: "transition-colors hover:text-accent",
                                            children: "Destination Bridal"
                                        }, void 0, false, {
                                            fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                            lineNumber: 271,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                        lineNumber: 271,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/repairs",
                                            className: "transition-colors hover:text-accent",
                                            children: "Jewelry and Watch Repair"
                                        }, void 0, false, {
                                            fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                            lineNumber: 272,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                        lineNumber: 272,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/contact",
                                            className: "transition-colors hover:text-accent",
                                            children: "Private Consultations"
                                        }, void 0, false, {
                                            fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                            lineNumber: 273,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                        lineNumber: 273,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                lineNumber: 269,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                        lineNumber: 267,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "mb-4 font-serif text-lg text-accent",
                                children: "Contact Details"
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                lineNumber: 277,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm leading-relaxed text-white/80",
                                children: [
                                    settings.contact_address || "Located in the heart of Islamorada.",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                        lineNumber: 280,
                                        columnNumber: 13
                                    }, this),
                                    settings.contact_phone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "mt-2 block",
                                        children: [
                                            "Phone: ",
                                            settings.contact_phone
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                        lineNumber: 282,
                                        columnNumber: 15
                                    }, this),
                                    settings.whatsapp_number && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "mt-1 block",
                                        children: [
                                            "WhatsApp:",
                                            ' ',
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: `https://wa.me/${settings.whatsapp_number}`,
                                                className: "underline",
                                                children: [
                                                    "+",
                                                    settings.whatsapp_number
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                                lineNumber: 289,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                        lineNumber: 287,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                lineNumber: 278,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                        lineNumber: 276,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                lineNumber: 216,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto mt-12 max-w-6xl border-t border-white/20 pt-6 text-center text-xs text-white/60",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-3 flex flex-wrap justify-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                href: "/privacy-policy",
                                className: "transition-colors hover:text-accent",
                                children: "Privacy Policy"
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                lineNumber: 299,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                href: "/terms-of-service",
                                className: "transition-colors hover:text-accent",
                                children: "Terms of Service"
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                                lineNumber: 300,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Galantesjewelry/app/layout.tsx",
                        lineNumber: 298,
                        columnNumber: 9
                    }, this),
                    "© ",
                    new Date().getFullYear(),
                    "Galante's Jewelry. All rights reserved."
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/app/layout.tsx",
                lineNumber: 297,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Galantesjewelry/app/layout.tsx",
        lineNumber: 215,
        columnNumber: 5
    }, this);
}
}),
"[project]/Galantesjewelry/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Galantesjewelry/app/layout.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0ubxkxj._.js.map