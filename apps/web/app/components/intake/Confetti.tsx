'use client'

import { useEffect, useRef } from 'react'

const COLORS = ['#4ade80', '#38bdf8', '#f472b6', '#fde68a', '#a78bfa', '#f97316']

interface Particle {
    x: number
    y: number
    rotation: number
    speedX: number
    speedY: number
    size: number
    color: string
    opacity: number
}

export default function Confetti({ active }: { active: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const rafRef = useRef<number | null>(null)
    const particlesRef = useRef<Particle[]>([])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !active) {
            return
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) {
            return
        }

        const resize = () => {
            const dpr = window.devicePixelRatio || 1
            canvas.width = canvas.clientWidth * dpr
            canvas.height = canvas.clientHeight * dpr
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }

        resize()
        window.addEventListener('resize', resize)

        particlesRef.current = Array.from({ length: 120 }, () => ({
            x: Math.random() * canvas.clientWidth,
            y: Math.random() * canvas.clientHeight - canvas.clientHeight,
            rotation: Math.random() * 360,
            speedX: (Math.random() - 0.5) * 3,
            speedY: Math.random() * 3 + 2,
            size: Math.random() * 8 + 6,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            opacity: Math.random() * 0.6 + 0.4,
        }))

        const render = () => {
            if (!ctx || !canvas) return
            ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
            const width = canvas.clientWidth
            const height = canvas.clientHeight

            for (const particle of particlesRef.current) {
                particle.x += particle.speedX
                particle.y += particle.speedY
                particle.rotation += particle.speedX * 2

                if (particle.y > height + particle.size) {
                    particle.y = -particle.size
                    particle.x = Math.random() * width
                }

                if (particle.x > width + particle.size) {
                    particle.x = -particle.size
                } else if (particle.x < -particle.size) {
                    particle.x = width + particle.size
                }

                ctx.save()
                ctx.translate(particle.x, particle.y)
                ctx.rotate((particle.rotation * Math.PI) / 180)
                ctx.globalAlpha = particle.opacity
                ctx.fillStyle = particle.color
                ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.6)
                ctx.restore()
            }

            rafRef.current = requestAnimationFrame(render)
        }

        rafRef.current = requestAnimationFrame(render)

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
            }
            window.removeEventListener('resize', resize)
        }
    }, [active])

    if (!active) {
        return null
    }

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{ mixBlendMode: 'screen' }}
        />
    )
}
