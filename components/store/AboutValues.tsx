'use client'

import { motion } from 'framer-motion'
import { Shield, Truck, Award, Leaf } from 'lucide-react'

const values = [
  {
    icon: Shield,
    title: 'الجودة أولاً',
    description: 'نختار أجود المكونات من أفضل المصادر العالمية لضمان تجربة عطرية استثنائية',
  },
  {
    icon: Leaf,
    title: 'مكونات طبيعية',
    description: 'نحرص على استخدام مكونات طبيعية وآمنة في جميع منتجاتنا',
  },
  {
    icon: Truck,
    title: 'توصيل سريع',
    description: 'نوصل طلبك لباب بيتك في أسرع وقت مع خدمة تتبع مباشرة',
  },
  {
    icon: Award,
    title: 'ضمان الرضا',
    description: 'نضمن لك الرضا التام عن منتجاتنا أو استرداد كامل للمبلغ',
  },
]

export function AboutValues() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            قيمنا <span className="gold-text">وأهدافنا</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            نلتزم بتقديم أفضل تجربة عطرية لعملائنا من خلال مجموعة من القيم الأساسية
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-lg p-6 text-center card-hover"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                <value.icon className="h-8 w-8 text-gold" />
              </div>
              <h3 className="text-lg font-bold mb-2">{value.title}</h3>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
