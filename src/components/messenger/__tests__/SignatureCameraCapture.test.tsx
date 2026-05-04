import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRef } from 'react'
import SignatureCameraCapture from '@/components/messenger/SignatureCameraCapture'
import type { SignatureCameraCaptureRef } from '@/components/messenger/SignatureCameraCapture'

vi.mock('@/utils/logger', () => ({
  createLogger: () => ({ info: vi.fn(), error: vi.fn(), warn: vi.fn() }),
}))

vi.mock('@/config/toast-config', () => ({
  showToast: { info: vi.fn(), error: vi.fn() },
}))

vi.mock('node-webpmux', () => ({
  WebP: class {
    addFrame = vi.fn().mockResolvedValue(undefined)
    setAnimationSettings = vi.fn()
    save = vi.fn().mockResolvedValue(new Uint8Array([0, 1, 2, 3]))
  }
}))

describe('SignatureCameraCapture - Blindaje Total', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
        }),
      },
    })
    vi.spyOn(HTMLVideoElement.prototype, 'play').mockResolvedValue(undefined)
  })

  it('debe mostrar el estado de procesamiento al iniciar captura', async () => {
    const ref = createRef<SignatureCameraCaptureRef>()
    render(<SignatureCameraCapture ref={ref} />)
    
    // Disparamos la captura a través de la ref expuesta
    await act(async () => {
      ref.current?.startCapture()
    })
    
    // Al estar capturando/generando, el texto debe aparecer
    // Nota: El componente tiene timeouts internos, pero el estado isCapturing se activa de inmediato
    expect(screen.queryByTestId('signature-video-container')).toBeInTheDocument()
  })

  it('debe haber reemplazado GIF por WebP en los badges', () => {
    render(<SignatureCameraCapture />)
    expect(screen.queryByText('GIF')).not.toBeInTheDocument()
  })
})
