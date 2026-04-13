'use client'

import { motion } from 'framer-motion'

interface AboutSectionProps {
  productCount: number
}

export function AboutSection({ productCount }: AboutSectionProps) {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-transparent to-gold/5">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              لماذا <span className="gold-text">أثر</span>؟
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              أثر ليس مجرد عطر، بل هو انطباع يبقى بعد رحيلك. نختار كل قطرة بعناية 
              لتعكس شخصيتك وتترك أثراً لا يُنسى.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              من مجموعتنا الفاخرة من العطور الشرقية والغربية المزجية، نقدم لك 
              تجربة عطرية استثنائية توصل لباب بيتك.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative border border-gold/30 p-8 md:p-12">
              <div className="absolute inset-2 border border-gold/10" />
              
              <div className="relative grid grid-cols-1 gap-8 text-center">
                <div>
                  <div className="text-5xl md:text-6xl font-serif text-gold mb-2">
                    ∞
                  </div>
                  <div className="text-sm text-muted-foreground tracking-wider">
                    أثر يبقى
                  </div>
                </div>
                
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold/30 to-transparent mx-auto" />
                
                <div>
                  <div className="text-5xl md:text-6xl font-serif text-gold mb-2">
                    {productCount}+
                  </div>
                  <div className="text-sm text-muted-foreground tracking-wider">
                    عطر فاخر
                  </div>
                </div>
                
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold/30 to-transparent mx-auto" />
                
                <div>
                  <div className="text-5xl md:text-6xl font-serif text-gold mb-2">
                    🚚
                  </div>
                  <div className="text-sm text-muted-foreground tracking-wider">
                    توصيل لباب بيتك
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
