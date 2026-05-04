import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRef } from 'react'
import SignatureCameraCapture from '@/components/messenger/SignatureCameraCapture'
import type { SignatureCameraCaptureRef } from '@/components/messenger/SignatureCameraCapture'

// Mock de logger y toast
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
    // Mock de getUserMedia
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
        }),
      },
    })
    
    // Mock de HTMLVideoElement.prototype.play
    vi.spyOn(HTMLVideoElement.prototype, 'play').mockResolvedValue(undefined)

    // Mock de getContext para evitar error de "Not implemented" en JSDOM
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(4), width: 1, height: 1 }),
      putImageData: vi.fn(),
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    } as any)
  })

  it('debe renderizar el contenedor principal de video', () => {
    render(<SignatureCameraCapture />)
    const videoContainer = screen.getByTestId('signature-video-container')
    expect(videoContainer).toBeInTheDocument()
  })

  it('debe iniciar captura correctamente y no mostrar errores de canvas', async () => {
    const ref = createRef<SignatureCameraCaptureRef>()
    render(<SignatureCameraCapture ref={ref} />)
    
    await act(async () => {
      ref.current?.startCapture()
    })
    
    // Si el mock de getContext funciona, no debería haber texto de error
    expect(screen.queryByText(/Error al inicializar canvas/i)).not.toBeInTheDocument()
    expect(screen.getByTestId('signature-video-container')).toBeInTheDocument()
  })

  it('debe haber reemplazado GIF por WebP en los badges', () => {
    render(<SignatureCameraCapture />)
    expect(screen.queryByText('GIF')).not.toBeInTheDocument()
  })
})
