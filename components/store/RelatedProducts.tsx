'use client'

import { motion } from 'framer-motion'
import type { Product } from '@/types'
import { ProductCard } from './ProductCard'

interface RelatedProductsProps {
  products: Product[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          قد يعجبك <span className="gold-text">أيضاً</span>
        </h2>
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
