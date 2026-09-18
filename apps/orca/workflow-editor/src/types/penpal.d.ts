declare module 'penpal' {
  type RemoteMethods<T> = {
    [K in keyof T]: T[K] extends (...args: infer Args) => infer Return
      ? (...args: Args) => Promise<Awaited<Return>>
      : never
  }

  export type AsyncMethodReturns<T> = {
    iframe: RemoteMethods<T>
    destroy?: () => void
  }

  export function connectToChild<TMethods>(options: {
    iframe: HTMLIFrameElement
    methods?: object
  }): Promise<AsyncMethodReturns<TMethods>>

  export function connectToParent<TMethods>(options: {
    methods?: object
  }): Promise<AsyncMethodReturns<TMethods>>
}
