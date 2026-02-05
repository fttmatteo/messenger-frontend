/**
 * Tipos para la Web Speech API
 * La Web Speech API no tiene tipos oficiales en TypeScript,
 * por lo que definimos las interfaces necesarias.
 */

export interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number
    readonly results: SpeechRecognitionResultList
}

export interface SpeechRecognitionResultList {
    readonly length: number
    item(index: number): SpeechRecognitionResult
    [index: number]: SpeechRecognitionResult
}

export interface SpeechRecognitionResult {
    readonly isFinal: boolean
    readonly length: number
    item(index: number): SpeechRecognitionAlternative
    [index: number]: SpeechRecognitionAlternative
}

export interface SpeechRecognitionAlternative {
    readonly transcript: string
    readonly confidence: number
}

export interface SpeechRecognitionErrorEvent extends Event {
    readonly error: SpeechRecognitionErrorCode
    readonly message: string
}

export type SpeechRecognitionErrorCode =
    | 'no-speech'
    | 'aborted'
    | 'audio-capture'
    | 'network'
    | 'not-allowed'
    | 'service-not-allowed'
    | 'bad-grammar'
    | 'language-not-supported'

export interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    maxAlternatives: number
    grammars: SpeechGrammarList

    start(): void
    stop(): void
    abort(): void

    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
    onstart: (() => void) | null
    onend: (() => void) | null
    onspeechstart: (() => void) | null
    onspeechend: (() => void) | null
    onaudiostart: (() => void) | null
    onaudioend: (() => void) | null
    onnomatch: (() => void) | null
    onsoundstart: (() => void) | null
    onsoundend: (() => void) | null
}

export interface SpeechGrammarList {
    readonly length: number
    item(index: number): SpeechGrammar
    addFromString(string: string, weight?: number): void
    addFromURI(src: string, weight?: number): void
}

export interface SpeechGrammar {
    src: string
    weight: number
}

export interface SpeechRecognitionConstructor {
    new(): SpeechRecognition
}

/**
 * Extender Window para incluir las APIs de reconocimiento de voz
 */
declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor
        webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
}
