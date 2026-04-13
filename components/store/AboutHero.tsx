'use client'

import { motion } from 'framer-motion'

export function AboutHero() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            عن <span className="gold-text">أثر</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            أثر ليس مجرد اسم، بل هو وعد بأن تترك انطباعاً لا يُنسى أينما ذهبت
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-8" />
        </motion.div>
      </div>
    </section>
  )
}
