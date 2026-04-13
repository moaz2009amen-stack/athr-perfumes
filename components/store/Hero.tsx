'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function Hero() {
  const particlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!particlesRef.current) return
    
    const container = particlesRef.current
    container.innerHTML = ''
    
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      particle.style.cssText = `
        left: ${Math.random() * 100}%;
        width: ${Math.random() * 3 + 1}px;
        height: ${Math.random() * 3 + 1}px;
        animation-duration: ${Math.random() * 10 + 8}s;
        animation-delay: ${Math.random() * 8}s;
      `
      container.appendChild(particle)
    }
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent dark:from-gold/10" />
      
      {/* Particles */}
      <div ref={particlesRef} className="absolute inset-0 overflow-hidden">
        <style jsx>{`
          .particle {
            position: absolute;
            background: #c9a84c;
            border-radius: 50%;
            opacity: 0;
            animation: float linear infinite;
          }
          @keyframes float {
            0% { transform: translateY(100vh); opacity: 0; }
            10% { opacity: 0.6; }
            90% { opacity: 0.6; }
            100% { transform: translateY(-100px) translateX(30px); opacity: 0; }
          }
        `}</style>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-gold tracking-widest mb-6 animate-logo-glow">
          ATHR
        </h1>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4"
        >
          مرحباً <span className="gold-text">بكم</span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-base md:text-xl text-muted-foreground tracking-widest mb-8"
        >
          حيث يبدأ الأثر
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-8"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Link
            href="/products"
            className="btn-primary inline-block"
          >
            <span>اكتشف العطور</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border border-gold/50 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 bg-gold rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  )
}
