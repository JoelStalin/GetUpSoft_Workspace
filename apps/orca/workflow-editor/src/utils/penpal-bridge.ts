/**
 * Penpal Communication Bridge
 *
 * Bidirectional communication between parent editor and iframe children.
 * Enables real-time CSS/HTML editing without page reloads.
 *
 * FUTURO: Enhanced communication
 * - Add message queuing for offline support
 * - Implement request/response with timeouts
 * - Add encryption for sensitive messages
 * - Create message versioning/migration
 * - Add performance monitoring
 * - Implement error recovery
 */

import { connectToChild, connectToParent } from 'penpal';
import type { AsyncMethodReturns } from 'penpal';

/**
 * Parent side interface - methods the parent can call on iframe
 */
export interface IframeChildMethods {
  // CSS operations
  updateCss: (css: string) => Promise<void>;
  getCss: () => Promise<string>;
  setInlineStyle: (selector: string, styles: Record<string, string>) => Promise<void>;

  // HTML operations
  updateHtml: (html: string) => Promise<void>;
  getHtml: () => Promise<string>;

  // Dimensions
  getElementDimensions: () => Promise<{ width: number; height: number }>;
  setElementDimensions: (width: number, height: number) => Promise<void>;

  // Responsive preview
  setViewport: (width: number, height: number) => Promise<void>;
  getViewport: () => Promise<{ width: number; height: number }>;

  // Execution
  executeScript: (code: string) => Promise<any>;
  reloadContent: () => Promise<void>;

  // FUTURO: Add these methods
  // validateHtml: (html: string) => Promise<ValidationResult>;
  // minifyAssets: () => Promise<{ css: string; js: string }>;
  // exportAssets: (format: 'html' | 'json') => Promise<Blob>;
  // recordInteraction: (event: UserEvent) => Promise<void>;
}

/**
 * Iframe side interface - methods the iframe can call on parent
 */
export interface ParentMethods {
  // Change notifications
  onCssChange: (css: string) => void;
  onHtmlChange: (html: string) => void;
  onElementSelect: (selector: string) => void;

  // Requests
  requestAsset: (url: string) => Promise<Blob>;
  saveDraft: (content: { html: string; css: string }) => Promise<void>;

  // FUTURO: Add these methods
  // notifyError: (error: string) => void;
  // requestApproval: (action: string) => Promise<boolean>;
  // sendAnalytics: (event: AnalyticsEvent) => Promise<void>;
}

/**
 * Initialize parent side of Penpal connection
 */
export async function initPenpal(iframeWindow: Window) {
  const connection = await connectToChild<IframeChildMethods>({
    iframe: document.querySelector('iframe') as HTMLIFrameElement,
    methods: {
      onCssChange: (css: string) => {
        console.log('CSS changed in iframe:', css);
        // FUTURO: Dispatch to Zustand store
        // useEditorStore.setState({ isDirty: true });
      },

      onHtmlChange: (html: string) => {
        console.log('HTML changed in iframe:', html);
        // FUTURO: Update preview, trigger validation
      },
    } as ParentMethods,
  });

  return connection;
}

/**
 * Initialize iframe side of Penpal connection
 */
export async function initIframeConnection() {
  const connection = await connectToParent<ParentMethods>({
    methods: {
      // CSS operations
      updateCss: async (css: string) => {
        const style = document.getElementById('dynamic-styles') as HTMLStyleElement
          || document.createElement('style');
        style.id = 'dynamic-styles';
        style.textContent = css;
        if (!document.head.contains(style)) {
          document.head.appendChild(style);
        }
      },

      getCss: async () => {
        const style = document.getElementById('dynamic-styles') as HTMLStyleElement;
        return style?.textContent || '';
      },

      setInlineStyle: async (selector: string, styles: Record<string, string>) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          Object.assign((el as HTMLElement).style, styles);
        });
      },

      // HTML operations
      updateHtml: async (html: string) => {
        document.body.innerHTML = html;
      },

      getHtml: async () => {
        return document.documentElement.outerHTML;
      },

      // Dimensions
      getElementDimensions: async () => {
        const rect = document.body.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      },

      setElementDimensions: async (width: number, height: number) => {
        document.body.style.width = `${width}px`;
        document.body.style.height = `${height}px`;
      },

      // Responsive preview
      setViewport: async (width: number, height: number) => {
        const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement
          || document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = `width=${width}, initial-scale=1.0`;
        if (!document.head.contains(viewport)) {
          document.head.appendChild(viewport);
        }
        window.resizeTo(width, height);
      },

      getViewport: async () => {
        return {
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },

      // Script execution
      executeScript: async (code: string) => {
        try {
          // FUTURO: Implement sandboxed execution
          // - Use Web Workers for safety
          // - Validate code before execution
          // - Capture console output
          return Function(`"use strict"; return (${code})`)();
        } catch (error) {
          console.error('Script execution error:', error);
          throw error;
        }
      },

      reloadContent: async () => {
        window.location.reload();
      },
    } as IframeChildMethods,
  });

  // Notify parent of changes
  const observer = new MutationObserver(() => {
    if (connection.iframe.onHtmlChange) {
      connection.iframe.onHtmlChange(document.documentElement.outerHTML);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
  });

  return connection;
}

/**
 * Helper to send CSS updates from parent to iframe
 */
export async function updateIframeCss(
  connection: AsyncMethodReturns<IframeChildMethods>,
  css: string
): Promise<void> {
  try {
    await connection.iframe.updateCss(css);
    console.log('✅ CSS updated in iframe');
  } catch (error) {
    console.error('❌ Failed to update iframe CSS:', error);
    throw error;
  }
}

/**
 * Helper to send HTML updates from parent to iframe
 */
export async function updateIframeHtml(
  connection: AsyncMethodReturns<IframeChildMethods>,
  html: string
): Promise<void> {
  try {
    await connection.iframe.updateHtml(html);
    console.log('✅ HTML updated in iframe');
  } catch (error) {
    console.error('❌ Failed to update iframe HTML:', error);
    throw error;
  }
}

/**
 * Helper to get current state from iframe
 */
export async function getIframeState(
  connection: AsyncMethodReturns<IframeChildMethods>
): Promise<{ html: string; css: string }> {
  try {
    const [html, css] = await Promise.all([
      connection.iframe.getHtml(),
      connection.iframe.getCss(),
    ]);
    return { html, css };
  } catch (error) {
    console.error('Failed to get iframe state:', error);
    throw error;
  }
}

// FUTURO: Add these utility functions
// - Implement message queueing for offline support
// - Add retry logic for failed messages
// - Create batch update operations
// - Add performance monitoring
// - Implement message compression for large payloads
