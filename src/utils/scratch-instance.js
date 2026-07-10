import external from './tw-external.js'
import staticFetch from './tw-static-fetch.js'
import Color from './gandi-color.js'
import { getVM, getScratchBlocks } from './injector.js'

function parseURL(url) {
    try {
        return new URL(url)
    } catch {
        return null
    }
}

export function createScratchInstance(Scratch) {
    const vm = getVM(Scratch.vm?.runtime)
    const ScratchBlocks = getScratchBlocks(Scratch.vm?.runtime, vm)

    return {
        ArgumentType: Scratch.ArgumentType,
        BlockType: Scratch.BlockType,
        Cast: Scratch.Cast,
        Color: Scratch.Color || Color,
        TargetType: Scratch.TargetType,
        canDownload: Scratch.canDownload || createCanDownload(vm),
        canEmbed: Scratch.canEmbed || createCanEmbed(vm),
        canFetch: Scratch.canFetch || createCanFetch(vm),
        canGeolocate:
            Scratch.canGeolocate || (() => vm.securityManager.canGeolocate()),
        canNotify: Scratch.canNotify || (() => vm.securityManager.canNotify()),
        canOpenWindow: Scratch.canOpenWindow || createCanOpenWindow(vm),
        canReadClipboard:
            Scratch.canReadClipboard ||
            (() => vm.securityManager.canReadClipboard()),
        canRecordAudio:
            Scratch.canRecordAudio ||
            (() => vm.securityManager.canRecordAudio()),
        canRecordVideo:
            Scratch.canRecordVideo ||
            (() => vm.securityManager.canRecordVideo()),
        canRedirect: Scratch.canRedirect || createCanRedirect(vm),
        download: Scratch.download || createDownload(Scratch),
        extensions: Scratch.extensions,
        external: Scratch.external || external,
        fetch: Scratch.fetch || createFetch(Scratch),
        gui: Scratch.gui || createGUI(ScratchBlocks),
        openWindow: Scratch.openWindow || createOpenWindow(Scratch),
        redirect: Scratch.redirect || createRedirect(Scratch),
        renderer: vm.runtime.renderer,
        runtime: vm.runtime,
        translate: Scratch.translate,
        vm: vm,
        ScratchBlocks: ScratchBlocks
    }
}

function createCanDownload(vm) {
    return async (url, name) => {
        const parsed = parseURL(url)
        if (!parsed || parsed.protocol === 'javascript:') return false
        return vm.securityManager.canDownload(url, name)
    }
}

function createCanEmbed(vm) {
    return async url => {
        const parsed = parseURL(url)
        if (!parsed) return false
        return vm.securityManager.canEmbed(parsed.href)
    }
}

function createCanFetch(vm) {
    return async url => {
        const parsed = parseURL(url)
        if (!parsed) return false
        if (parsed.protocol === 'blob:' || parsed.protocol === 'data:')
            return true
        return vm.securityManager.canFetch(parsed.href)
    }
}

function createCanOpenWindow(vm) {
    return async url => {
        const parsed = parseURL(url)
        if (!parsed || parsed.protocol === 'javascript:') return false
        return vm.securityManager.canOpenWindow(parsed.href)
    }
}

function createCanRedirect(vm) {
    return async url => {
        const parsed = parseURL(url)
        if (!parsed || parsed.protocol === 'javascript:') return false
        return vm.securityManager.canRedirect(parsed.href)
    }
}

function createDownload(Scratch) {
    return async (url, name) => {
        if (!(await Scratch.canDownload(url, name))) {
            throw new Error(`Permission to download ${name} rejected.`)
        }
        const link = document.createElement('a')
        link.href = url
        link.download = name
        document.body.appendChild(link)
        link.click()
        link.remove()
    }
}

function createFetch(Scratch) {
    return async (url, options) => {
        const actualURL = url instanceof Request ? url.url : url
        const staticFetchResult = staticFetch(url)
        if (staticFetchResult) return staticFetchResult
        if (!(await Scratch.canFetch(actualURL))) {
            throw new Error(`Permission to fetch ${actualURL} rejected.`)
        }
        return fetch(url, options)
    }
}

function createGUI(ScratchBlocks) {
    return {
        getBlockly: () => Promise.resolve(ScratchBlocks),
        getBlocklyEagerly: () => {
            throw new Error('Not implemented')
        }
    }
}

function createOpenWindow(Scratch) {
    return async (url, features) => {
        if (!(await Scratch.canOpenWindow(url))) {
            throw new Error(`Permission to open tab ${url} rejected.`)
        }
        const baseFeatures = 'noreferrer'
        features = features ? `${baseFeatures},${features}` : baseFeatures
        return window.open(url, '_blank', features)
    }
}

function createRedirect(Scratch) {
    return async url => {
        if (!(await Scratch.canRedirect(url))) {
            throw new Error(`Permission to redirect to ${url} rejected.`)
        }
        location.href = url
    }
}
