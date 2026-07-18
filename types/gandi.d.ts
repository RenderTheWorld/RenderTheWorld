/// <reference path="../node_modules/@turbowarp/types/types/scratch-vm-extension.d.ts" />
interface Collaborator {
  /**
   * Collaborator name.
   */
  collaborator: string
  /**
   * Collaborator profile URL.
   */
  collaboratorURL?: string
}
declare interface Window {
  tempExt?: {
    /**
     * Extension class.
     */
    Extension: new (runtime: VM.Runtime) => Scratch.Extension
    info: {
      /**
       * Extension name.
       */
      name: string
      /**
       * Extension description.
       */
      description: string
      /**
       * Extension ID.
       */
      extensionId: string
      /**
       * Is the extension featured?
       */
      featured: boolean
      /**
       * Is the extension disabled?
       */
      disabled: boolean
      /**
       * @deprecated Collaborator name.
       */
      collaborator?: string
      /**
       * Extension cover URL.
       */
      iconURL?: string
      /**
       * Extension inset icon URL.
       */
      insetIconURL?: string
      /**
       * @deprecated Collaborator profile URL.
       */
      collaboratorURL?: string
      /**
       * Collaborator list.
       */
      collaboratorList?: Collaborator[]
    }
    /**
     * Translations.
     */
    l10n: Record<string, Record<string, string>>
  }
}

declare namespace VM {
  interface Runtime {
    logSystem?: any
    extensionManager?: any
    _events?: any
    scratchBlocks?: any
    /**
     * Gandi IDE asset content accessor.
     * @param {string} filename
     * @returns {{ encodeDataURI: () => string } | null | undefined}
     */
    getGandiAssetContent?: (filename: string) => { encodeDataURI: () => string } | null | undefined
  }
}
interface VM {
  securityManager?: {
    canDownload?: (...args: any[]) => any
    canEmbed?: (...args: any[]) => any
    canFetch?: (...args: any[]) => any
    canGeolocate?: (...args: any[]) => any
    canNotify?: (...args: any[]) => any
    canOpenWindow?: (...args: any[]) => any
    canReadClipboard?: (...args: any[]) => any
    canRecordAudio?: (...args: any[]) => any
    canRecordVideo?: (...args: any[]) => any
    canRedirect?: (...args: any[]) => any
  }
}
