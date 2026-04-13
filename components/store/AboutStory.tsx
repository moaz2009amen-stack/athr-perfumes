'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function AboutStory() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              قصتنا
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                بدأت قصة أثر من شغف عميق بعالم العطور الشرقية والغربية، وإيمان بأن العطر 
                ليس مجرد رائحة، بل هو بصمة شخصية تترك أثراً في الذاكرة.
              </p>
              <p>
                في عام 2024، اجتمع فريق من خبراء العطور والمصممين ليخلقوا علامة تجارية 
                مصرية تعكس أصالة الشرق مع لمسات عصرية من الغرب.
              </p>
              <p>
                نؤمن في أثر أن كل شخص يستحق عطراً يعبر عن شخصيته الفريدة، ولهذا نقدم 
                مجموعة مختارة بعناية من أفخر أنواع العطور التي تناسب كل الأذواق.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-lg overflow-hidden border border-gold/30">
              <div className="absolute inset-0 bg-gradient-to-tr from-gold/20 to-transparent z-10" />
              <div className="w-full h-full bg-gradient-to-br from-background to-card flex items-center justify-center">
                <span className="text-8xl font-serif text-gold/20">ATHR</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 border border-gold/20 rounded-lg -z-10" />
            <div className="absolute -top-4 -right-4 w-32 h-32 border border-gold/20 rounded-lg -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
