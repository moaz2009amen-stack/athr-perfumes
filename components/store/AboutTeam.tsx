'use client'

import { motion } from 'framer-motion'
import { Mail, Phone } from 'lucide-react'

const team = [
  {
    name: 'محمد أحمد',
    role: 'المؤسس والمدير التنفيذي',
    bio: 'خبير عطور مع أكثر من 15 عاماً من الخبرة في صناعة العطور الفاخرة',
  },
  {
    name: 'سارة خالد',
    role: 'مديرة الإبداع',
    bio: 'مصممة عطور محترفة تجمع بين التراث الشرقي واللمسات العصرية',
  },
  {
    name: 'كريم محمود',
    role: 'مدير العمليات',
    bio: 'مسؤول عن ضمان جودة المنتجات وسلاسة عمليات التوصيل',
  },
]

export function AboutTeam() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            فريق <span className="gold-text">أثر</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            نخبة من الخبراء والمتخصصين في عالم العطور يعملون معاً لنقدم لكم الأفضل
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-lg p-6 text-center"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                <span className="text-3xl font-serif text-gold">
                  {member.name.charAt(0)}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-1">{member.name}</h3>
              <p className="text-gold text-sm mb-3">{member.role}</p>
              <p className="text-sm text-muted-foreground">{member.bio}</p>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">تواصل معنا</p>
          <div className="flex items-center justify-center gap-6">
            <a
              href="mailto:info@athr.com"
              className="flex items-center gap-2 text-gold hover:underline"
            >
              <Mail className="h-5 w-5" />
              info@athr.com
            </a>
            <a
              href="https://wa.me/201012345678"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gold hover:underline"
            >
              <Phone className="h-5 w-5" />
              +20 101 234 5678
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
