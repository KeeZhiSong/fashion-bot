"use client"

import { useEffect, useRef } from "react"

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string
    borderColor?: string
    borderWidth?: number
  }[]
}

export function LineChart({ data }: { data: ChartData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // This is a simplified mock chart rendering
    // In a real app, you would use Chart.js or another library
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const padding = 40

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = "#e2e8f0"
    ctx.stroke()

    // Draw labels
    ctx.font = "12px sans-serif"
    ctx.fillStyle = "#64748b"
    data.labels.forEach((label, i) => {
      const x = padding + (i * (width - 2 * padding)) / (data.labels.length - 1)
      ctx.fillText(label, x - 10, height - padding + 20)
    })

    // Draw datasets
    data.datasets.forEach((dataset, datasetIndex) => {
      ctx.beginPath()
      dataset.data.forEach((value, i) => {
        const x = padding + (i * (width - 2 * padding)) / (dataset.data.length - 1)
        const y = height - padding - (value / 100) * (height - 2 * padding)

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.strokeStyle = dataset.borderColor || "#3b82f6"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw points
      dataset.data.forEach((value, i) => {
        const x = padding + (i * (width - 2 * padding)) / (dataset.data.length - 1)
        const y = height - padding - (value / 100) * (height - 2 * padding)

        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = dataset.backgroundColor
        ctx.fill()
        ctx.strokeStyle = "#fff"
        ctx.lineWidth = 1
        ctx.stroke()
      })
    })
  }, [data])

  return <canvas ref={canvasRef} width={800} height={400} className="w-full h-full" />
}

export function BarChart({ data }: { data: ChartData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // This is a simplified mock chart rendering
    // In a real app, you would use Chart.js or another library
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const padding = 40

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = "#e2e8f0"
    ctx.stroke()

    // Draw bars
    const barWidth = (width - 2 * padding) / (data.labels.length * data.datasets.length + data.labels.length)

    data.datasets.forEach((dataset, datasetIndex) => {
      dataset.data.forEach((value, i) => {
        const x = padding + i * (barWidth * (data.datasets.length + 1)) + (datasetIndex + 1) * barWidth
        const barHeight = (value / 100) * (height - 2 * padding)
        const y = height - padding - barHeight

        ctx.fillStyle = dataset.backgroundColor
        ctx.fillRect(x, y, barWidth, barHeight)

        // Draw value
        ctx.fillStyle = "#1e293b"
        ctx.font = "12px sans-serif"
        ctx.fillText(value.toString(), x + barWidth / 2 - 10, y - 5)
      })
    })

    // Draw labels
    ctx.font = "12px sans-serif"
    ctx.fillStyle = "#64748b"
    data.labels.forEach((label, i) => {
      const x = padding + i * (barWidth * (data.datasets.length + 1)) + ((data.datasets.length + 1) * barWidth) / 2
      ctx.fillText(label, x - 10, height - padding + 20)
    })
  }, [data])

  return <canvas ref={canvasRef} width={800} height={400} className="w-full h-full" />
}

