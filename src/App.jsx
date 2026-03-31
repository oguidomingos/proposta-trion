import { useState, useEffect, useRef } from 'react'
import './index.css'

/* ── Intersection Observer Hook ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

/* ── Animated Counter ── */
function Counter({ end, duration = 2000, prefix = '', suffix = '', decimals = 0 }) {
  const [val, setVal] = useState(0)
  const [ref, visible] = useInView()
  useEffect(() => {
    if (!visible) return
    let start = 0
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(p * end)
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [visible, end, duration])
  return <span ref={ref}>{prefix}{val.toFixed(decimals)}{suffix}</span>
}

/* ── Bar Chart ── */
function BarChart({ data, maxVal }) {
  const [ref, visible] = useInView()
  return (
    <div ref={ref} className="flex items-end gap-3 h-56 mt-6">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <span className="text-xs text-trion-lilas font-semibold mb-1">{d.label2}</span>
          <div
            className="w-full rounded-t-lg transition-all duration-1000 ease-out"
            style={{
              height: visible ? `${(d.value / maxVal) * 100}%` : '0%',
              background: d.color || 'linear-gradient(to top, #7B2CBF, #c084fc)',
              transitionDelay: `${i * 150}ms`
            }}
          />
          <span className="text-xs text-gray-400 mt-2 text-center">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Donut Chart ── */
function DonutChart({ segments, size = 200 }) {
  const [ref, visible] = useInView()
  const r = size / 2 - 20
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <svg ref={ref} width={size} height={size} className="mx-auto">
      {segments.map((s, i) => {
        const dash = (s.pct / 100) * c
        const o = offset
        offset += dash
        return (
          <circle key={i} cx={size/2} cy={size/2} r={r}
            fill="none" stroke={s.color} strokeWidth="24"
            strokeDasharray={`${visible ? dash : 0} ${c}`}
            strokeDashoffset={-o}
            style={{ transition: `stroke-dasharray 1.5s ease-out ${i * 300}ms` }}
            strokeLinecap="round"
          />
        )
      })}
      <text x={size/2} y={size/2 - 8} textAnchor="middle" fill="#c084fc" fontSize="24" fontWeight="700">100%</text>
      <text x={size/2} y={size/2 + 16} textAnchor="middle" fill="#94a3b8" fontSize="12">Controle</text>
    </svg>
  )
}

/* ── Section Wrapper ── */
function Section({ id, children, className = '' }) {
  const [ref, visible] = useInView(0.05)
  return (
    <section id={id} ref={ref} className={`py-20 px-6 md:px-12 lg:px-24 ${className}`}
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(40px)', transition: 'all 0.8s ease-out' }}>
      {children}
    </section>
  )
}

function SectionTitle({ badge, title, subtitle }) {
  return (
    <div className="text-center mb-16">
      {badge && <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-trion-purple/20 text-trion-lilas border border-trion-purple/30 mb-4">{badge}</span>}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">{title}</h2>
      {subtitle && <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  )
}

/* ── Main App ── */
export default function App() {
  const [navOpen, setNavOpen] = useState(false)

  const navItems = [
    { href: '#problema', label: 'O Problema' },
    { href: '#solucao', label: 'A Solução' },
    { href: '#rodadas', label: 'Rodadas' },
    { href: '#holding', label: 'Holding' },
    { href: '#equipe', label: 'Equipe' },
    { href: '#ecossistema', label: 'Ecossistema' },
    { href: '#benchmarking', label: 'Resultados' },
    { href: '#projecao', label: 'Projeção' },
  ]

  return (
    <div className="min-h-screen">
      {/* ── NAV ── */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-trion-purple flex items-center justify-center text-white font-bold text-sm">T</div>
            <span className="font-bold text-white text-lg">Trion Marketing</span>
          </div>
          <div className="hidden lg:flex items-center gap-6">
            {navItems.map(n => (
              <a key={n.href} href={n.href} className="text-sm text-gray-300 hover:text-trion-lilas transition-colors">{n.label}</a>
            ))}
          </div>
          <button className="lg:hidden text-white" onClick={() => setNavOpen(!navOpen)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d={navOpen ? "M6 6l12 12M6 18L18 6" : "M4 6h16M4 12h16M4 18h16"}/></svg>
          </button>
        </div>
        {navOpen && (
          <div className="lg:hidden px-6 pb-4 flex flex-col gap-2">
            {navItems.map(n => (
              <a key={n.href} href={n.href} onClick={() => setNavOpen(false)} className="text-sm text-gray-300 hover:text-trion-lilas py-1">{n.label}</a>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(123,44,191,0.15),_transparent_60%)]" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-trion-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-trion-lilas/5 rounded-full blur-3xl" />
        <div className="relative text-center px-6 max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-trion-purple/20 text-trion-lilas border border-trion-purple/30 mb-8 animate-fade-in-up">
            Proposta de Parceria Estratégica
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 animate-fade-in-up" style={{animationDelay:'0.2s'}}>
            Assessoria de Marketing<br/>
            <span className="gradient-text">para Clínicas e Médicos</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{animationDelay:'0.4s'}}>
            Um modelo de negócios inteligente, com rodadas de investimento baseadas em resultados,
            proteção jurídica para todos os sócios e um ecossistema tecnológico pronto para escalar.
          </p>
          <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up" style={{animationDelay:'0.6s'}}>
            <a href="#solucao" className="px-8 py-3.5 rounded-xl bg-trion-purple hover:bg-trion-purple/80 text-white font-semibold transition-all animate-pulse-glow">
              Ver a Proposta
            </a>
            <a href="#equipe" className="px-8 py-3.5 rounded-xl border border-trion-border text-trion-lilas hover:bg-trion-purple/10 font-semibold transition-all">
              Conhecer a Equipe
            </a>
          </div>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 animate-fade-in-up" style={{animationDelay:'0.8s'}}>
            {[
              { n: 30, s: '+', l: 'Contas atendidas', p: '' },
              { n: 4, s: '', l: 'Sócios operacionais', p: '' },
              { n: 7.2, s: 'x', l: 'ROI médio', p: '', d: 1 },
              { n: 100, s: '%', l: 'Ecossistema pronto', p: '' },
            ].map((s, i) => (
              <div key={i} className="glass rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-white"><Counter end={s.n} prefix={s.p} suffix={s.s} decimals={s.d || 0} /></div>
                <div className="text-sm text-gray-400 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEMA ── */}
      <Section id="problema">
        <SectionTitle badge="O Contexto" title="Por que 50/50 é arriscado?" subtitle="70% das sociedades brasileiras desaparecem por conflito entre sócios. A estrutura 50/50 é a principal causa." />
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: '⚠️', title: 'Deadlock Inevitável', desc: 'Toda decisão exige consenso permanente. Uma divergência paralisa a empresa inteira.' },
            { icon: '⚖️', title: 'Sem Desempate', desc: 'No Código Civil (Art. 1.010), o voto é proporcional às quotas. Em 50/50, ninguém decide sozinho.' },
            { icon: '📉', title: 'Capital sem Validação', desc: 'R$150 mil sem tração = pressão por resultado sem base. Capital pequeno com milestones = alinhamento.' },
          ].map((c, i) => (
            <div key={i} className="glass rounded-2xl p-8 hover:border-trion-purple/50 transition-all group">
              <div className="text-4xl mb-4">{c.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{c.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── SOLUÇÃO ── */}
      <Section id="solucao" className="bg-trion-midnight/20">
        <SectionTitle badge="A Solução" title="Modelo Inteligente de Parceria" subtitle="Em vez de R$150 mil de uma vez, propomos um modelo em rodadas com proteção jurídica completa." />
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[
            { icon: '🔄', title: 'Duas Rodadas de Investimento', desc: 'Rodada 1 pequena para validação. Rodada 2 baseada em resultados reais. Protege ambos os lados.', color: 'from-trion-purple to-trion-lilas' },
            { icon: '🏛️', title: 'Holding dos Fundadores', desc: 'Os 4 sócios operacionais votam como um bloco. Decisões estratégicas protegidas por acordo de quotistas.', color: 'from-trion-blue to-cyan-400' },
            { icon: '📋', title: 'Quotas Preferenciais', desc: 'Investidores com retorno financeiro garantido, sem poder de veto nas operações diárias (IN DREI 81/2020).', color: 'from-emerald to-green-400' },
            { icon: '📊', title: 'Acordo de Quotistas', desc: '16 cláusulas essenciais: veto bilateral, deadlock resolution, tag-along, drag-along, non-compete, vesting.', color: 'from-gold to-yellow-300' },
          ].map((c, i) => (
            <div key={i} className="glass rounded-2xl p-8 hover:border-trion-purple/50 transition-all relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${c.color} group-hover:w-1.5 transition-all`} />
              <div className="text-3xl mb-4 pl-4">{c.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3 pl-4">{c.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed pl-4">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── RODADAS ── */}
      <Section id="rodadas">
        <SectionTitle badge="Investimento" title="Modelo de Duas Rodadas" subtitle="Capital inteligente: pouco no início para validar, mais depois para escalar." />
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Rodada 1 */}
          <div className="glass rounded-2xl p-8 border-2 border-trion-purple/30 relative">
            <div className="absolute -top-3 left-8 px-4 py-1 bg-trion-purple rounded-full text-xs font-bold text-white">RODADA 1</div>
            <h3 className="text-2xl font-bold text-white mt-4 mb-2">Validação</h3>
            <p className="text-trion-lilas text-3xl font-extrabold mb-4">R$ 10.000</p>
            <div className="space-y-3 text-sm">
              {[
                '2-3 meses de duração',
                '10 clientes indicados pelos investidores',
                'Meta: R$20k faturamento mensal',
                'Instrumento: CICC (LC 182/2021)',
                'Participação: 10-15% da empresa',
                'Investidor NÃO vira sócio até conversão',
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-emerald mt-0.5">✓</span>
                  <span className="text-gray-300">{t}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Rodada 2 */}
          <div className="glass rounded-2xl p-8 border-2 border-gold/30 relative">
            <div className="absolute -top-3 left-8 px-4 py-1 bg-gold rounded-full text-xs font-bold text-trion-bg">RODADA 2</div>
            <h3 className="text-2xl font-bold text-white mt-4 mb-2">Tração e Escala</h3>
            <p className="text-gold text-3xl font-extrabold mb-4">R$ 50k — 140k</p>
            <div className="space-y-3 text-sm">
              {[
                'Capital baseado em resultados da Rodada 1',
                'Valuation real: 3-5x ARR (receita anual)',
                '60% tráfego pago + 30% contratação',
                'Meta: 15+ clientes, R$30k+ MRR',
                'Milestones progressivos para liberação',
                'Participação total: até 40-50%',
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-gold mt-0.5">✓</span>
                  <span className="text-gray-300">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline visual */}
        <div className="max-w-4xl mx-auto">
          <h4 className="text-center text-lg font-semibold text-white mb-8">Timeline de Evolução</h4>
          <div className="flex items-center gap-0 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-trion-border -translate-y-1/2" />
            {[
              { m: 'Mês 0', t: 'Rodada 1\nR$10k', c: 'bg-trion-purple' },
              { m: 'Mês 3', t: '10 clientes\nR$20k MRR', c: 'bg-emerald' },
              { m: 'Mês 4', t: 'Rodada 2\nEscala', c: 'bg-gold' },
              { m: 'Mês 6', t: '20 clientes\nR$40k MRR', c: 'bg-trion-lilas' },
              { m: 'Mês 12', t: '30+ clientes\nR$60k+ MRR', c: 'bg-rose' },
            ].map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center relative z-10">
                <div className={`w-4 h-4 rounded-full ${s.c} ring-4 ring-trion-bg`} />
                <span className="text-xs text-white font-semibold mt-2">{s.m}</span>
                <span className="text-xs text-gray-400 mt-1 text-center whitespace-pre-line">{s.t}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── HOLDING ── */}
      <Section id="holding" className="bg-trion-midnight/20">
        <SectionTitle badge="Governança" title="Holding dos Fundadores" subtitle="Estrutura que protege os operadores e garante retorno justo aos investidores." />
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Org chart visual */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 border-2 border-trion-purple/40">
              <h4 className="text-lg font-bold text-trion-lilas mb-3">Holding Fundadores (LTDA)</h4>
              <div className="grid grid-cols-2 gap-3">
                {['Calil — 25%', 'Sérgio — 25%', 'Guilherme — 25%', 'Sócio 4 — 25%'].map((s, i) => (
                  <div key={i} className="bg-trion-purple/20 rounded-lg p-2 text-center text-sm text-white">{s}</div>
                ))}
              </div>
              <div className="text-center mt-3 text-trion-lilas font-semibold">100% dos votos | 50% econômico</div>
            </div>
            <div className="flex justify-center">
              <svg width="40" height="40"><path d="M20 0v40" stroke="#7B2CBF" strokeWidth="2" /><path d="M12 32l8 8 8-8" fill="#7B2CBF" /></svg>
            </div>
            <div className="glass rounded-2xl p-6 border-2 border-emerald/40">
              <h4 className="text-lg font-bold text-emerald mb-2">Agência Operacional (LTDA)</h4>
              <p className="text-sm text-gray-400">Assessoria de marketing para clínicas</p>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-trion-purple/20 rounded-lg p-2 text-center text-sm text-white">Holding: 50%<br/><span className="text-xs text-trion-lilas">100% votos</span></div>
                <div className="bg-gold/20 rounded-lg p-2 text-center text-sm text-white">Investidores: 50%<br/><span className="text-xs text-gold">Quotas preferenciais</span></div>
              </div>
            </div>
          </div>

          {/* Donut + benefits */}
          <div>
            <DonutChart segments={[
              { pct: 50, color: '#7B2CBF' },
              { pct: 50, color: '#d4af37' },
            ]} size={220} />
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-trion-purple" /> Fundadores (voto)</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gold" /> Investidores (econômico)</div>
            </div>
            <div className="mt-8 space-y-4">
              {[
                { t: 'Proteção patrimonial', d: 'Bens da holding protegidos contra dívidas pessoais (Art. 50 CC)' },
                { t: 'Bloco de controle', d: '4 fundadores votam como uma unidade na empresa operacional' },
                { t: 'Equity para colaboradores', d: 'Cotas cedidas dentro da holding sem alterar participação dos investidores' },
                { t: 'Planejamento tributário', d: 'Distribuição de lucros isenta de IRPF via holding' },
              ].map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-trion-purple/20 flex items-center justify-center text-trion-lilas text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                  <div>
                    <div className="text-white font-semibold text-sm">{b.t}</div>
                    <div className="text-gray-400 text-xs">{b.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── EQUIPE ── */}
      <Section id="equipe">
        <SectionTitle badge="Quem Somos" title="Sócios Operacionais" subtitle="Track record comprovado no mercado de marketing médico. Mais de 30 contas atendidas simultaneamente." />
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              name: 'Calil',
              role: 'Estratégia & Operações',
              expertise: ['Gestão de +15 contas médicas simultâneas', 'Especialista em tráfego pago para saúde', 'Planejamento estratégico de campanhas', 'Gestão de equipe criativa'],
              icon: '🎯',
              color: 'border-trion-purple/50',
            },
            {
              name: 'Sérgio',
              role: 'Design & Branding',
              expertise: ['Designer senior com foco em saúde/estética', 'Identidade visual para +20 clínicas', 'Criativos de alta conversão para Meta Ads', 'Direção de arte e brand strategy'],
              icon: '🎨',
              color: 'border-trion-lilas/50',
            },
            {
              name: 'Guilherme',
              role: 'Tecnologia & Automação',
              expertise: ['Engenheiro de software & automação com IA', 'Arquiteto do ecossistema tecnológico completo', 'Sites premium, CRM, gestão, chatbots', 'Stack: React, Node.js, Python, AI/ML'],
              icon: '⚡',
              color: 'border-gold/50',
            },
          ].map((p, i) => (
            <div key={i} className={`glass rounded-2xl p-8 border-2 ${p.color} hover:border-opacity-80 transition-all`}>
              <div className="text-5xl mb-4">{p.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-1">{p.name}</h3>
              <p className="text-trion-lilas text-sm font-semibold mb-6">{p.role}</p>
              <div className="space-y-3">
                {p.expertise.map((e, j) => (
                  <div key={j} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald mt-0.5">→</span>
                    <span className="text-gray-300">{e}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 glass rounded-2xl p-8 max-w-5xl mx-auto text-center">
          <p className="text-lg text-white font-semibold">Juntos, Calil + Sérgio + Designer atendiam <span className="gradient-text font-extrabold text-2xl">+30 contas</span> de médicos e clínicas simultaneamente.</p>
          <p className="text-gray-400 text-sm mt-2">Track record comprovado. Entrega consistente. Agora, com tecnologia de ponta e um modelo escalável.</p>
        </div>
      </Section>

      {/* ── ECOSSISTEMA ── */}
      <Section id="ecossistema" className="bg-trion-midnight/20">
        <SectionTitle badge="Tecnologia" title="Ecossistema Plug & Play" subtitle="Soluções prontas para operação. Desenvolvidas internamente. Vantagem competitiva brutal." />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              name: 'RH Gaming',
              desc: 'Plataforma gamificada de gestão de equipe. Onboarding, OKRs, XP, achievements, playbooks.',
              tag: 'Gestão de Pessoas',
              icon: '🎮',
              color: 'from-purple-500 to-pink-500',
              repo: 'farmingmoney-rh'
            },
            {
              name: 'Distill',
              desc: 'Resumos e estudos automatizados a partir de vídeos usando IA. Transforme qualquer conteúdo em conhecimento acionável.',
              tag: 'AI / Conhecimento',
              icon: '🧠',
              color: 'from-blue-500 to-cyan-400',
              repo: 'distill'
            },
            {
              name: 'Lead-Spark',
              desc: 'CRM inteligente com captura automática de leads, qualificação por IA e integração WhatsApp.',
              tag: 'Vendas / CRM',
              icon: '⚡',
              color: 'from-yellow-500 to-orange-500',
              repo: 'lead-spark'
            },
            {
              name: 'Frappe CRM',
              desc: 'CRM enterprise open-source. Pipeline de vendas, automações, relatórios avançados. Já configurado e rodando.',
              tag: 'CRM Enterprise',
              icon: '📊',
              color: 'from-green-500 to-emerald-400',
              repo: 'frappe-crm'
            },
            {
              name: 'Plane',
              desc: 'Gestão de tarefas e projetos estilo Jira. Kanban, sprints, roadmaps. Open-source e customizável.',
              tag: 'Project Management',
              icon: '📋',
              color: 'from-indigo-500 to-violet-400',
              repo: 'plane'
            },
            {
              name: 'Painel Financeiro',
              desc: 'Dashboard financeiro completo (ezbooking). DRE, fluxo de caixa, métricas de performance, relatórios automáticos.',
              tag: 'Financeiro',
              icon: '💰',
              color: 'from-emerald-500 to-teal-400',
              repo: 'ezbooking'
            },
            {
              name: 'Sites Premium',
              desc: 'Portfólio de 63+ sites desenvolvidos. React + Tailwind + glassmorphism. Deploy automático via GitHub Pages.',
              tag: 'Web / Portfólio',
              icon: '🌐',
              color: 'from-rose-500 to-pink-400',
              link: 'https://oguidomingos.github.io/portfolio-sites/'
            },
            {
              name: 'WhatsApp Bridge',
              desc: 'Integração direta WhatsApp ↔ Sistema. Chatbot, notificações, comandos, transcrição de áudio.',
              tag: 'Comunicação',
              icon: '💬',
              color: 'from-green-600 to-green-400',
              repo: 'zap-bridge'
            },
            {
              name: 'Trading Bot',
              desc: 'Bot autônomo de trading com Kelly Criterion, análise Bayesiana e auto-redeem. Demonstra capacidade técnica avançada.',
              tag: 'AI / Fintech',
              icon: '🤖',
              color: 'from-amber-500 to-yellow-400',
              repo: 'trading-bot'
            },
          ].map((t, i) => (
            <div key={i} className="glass rounded-2xl p-6 hover:border-trion-purple/50 transition-all group relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${t.color} opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{t.icon}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${t.color} text-white font-semibold`}>{t.tag}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <div className="glass rounded-2xl p-8 max-w-3xl mx-auto">
            <p className="text-xl text-white font-bold mb-2">9 soluções prontas = <span className="gradient-text">R$500k+ em desenvolvimento economizado</span></p>
            <p className="text-gray-400 text-sm">Enquanto concorrentes começam do zero, nós já temos a infraestrutura operacional completa.</p>
          </div>
        </div>
      </Section>

      {/* ── BENCHMARKING ── */}
      <Section id="benchmarking">
        <SectionTitle badge="Resultados" title="Benchmarking de Performance" subtitle="Dados reais de campanhas executadas pela equipe operacional." />
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
          {[
            { label: 'CPC Médio', value: 'R$12', sub: 'Google Ads + Meta', color: 'text-trion-lilas' },
            { label: 'Taxa de Conversão', value: '7,4%', sub: 'Landing page → Lead', color: 'text-emerald' },
            { label: 'ROI Médio', value: '7,2x', sub: 'Retorno sobre investimento', color: 'text-gold' },
            { label: 'CAC', value: 'R$162', sub: 'Custo por cliente', color: 'text-rose' },
          ].map((m, i) => (
            <div key={i} className="glass rounded-2xl p-6 text-center">
              <div className={`text-3xl font-extrabold ${m.color}`}>{m.value}</div>
              <div className="text-white font-semibold text-sm mt-2">{m.label}</div>
              <div className="text-gray-500 text-xs mt-1">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="max-w-3xl mx-auto glass rounded-2xl p-8">
          <h4 className="text-lg font-bold text-white mb-2">Projeção de Faturamento Mensal (MRR)</h4>
          <p className="text-sm text-gray-400 mb-4">Baseado em ticket médio de R$2.000/cliente</p>
          <BarChart
            maxVal={70000}
            data={[
              { value: 10000, label: 'Mês 1', label2: 'R$10k', color: 'linear-gradient(to top, #272757, #7B2CBF)' },
              { value: 20000, label: 'Mês 3', label2: 'R$20k', color: 'linear-gradient(to top, #7B2CBF, #c084fc)' },
              { value: 30000, label: 'Mês 5', label2: 'R$30k', color: 'linear-gradient(to top, #7B2CBF, #c084fc)' },
              { value: 40000, label: 'Mês 7', label2: 'R$40k', color: 'linear-gradient(to top, #15803d, #10b981)' },
              { value: 50000, label: 'Mês 9', label2: 'R$50k', color: 'linear-gradient(to top, #15803d, #10b981)' },
              { value: 60000, label: 'Mês 12', label2: 'R$60k', color: 'linear-gradient(to top, #d4af37, #fbbf24)' },
            ]}
          />
        </div>
      </Section>

      {/* ── PROJEÇÃO FINANCEIRA ── */}
      <Section id="projecao" className="bg-trion-midnight/20">
        <SectionTitle badge="Financeiro" title="Projeção de Retorno" subtitle="Cenário conservador baseado em ticket médio de R$2k e margem de 40%." />
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {[
            {
              period: 'Meses 1-3',
              badge: 'Rodada 1',
              badgeColor: 'bg-trion-purple',
              items: ['10 clientes', 'MRR: R$20.000', 'Custos: ~R$12.000', 'Lucro: R$8.000/mês'],
            },
            {
              period: 'Meses 4-6',
              badge: 'Rodada 2',
              badgeColor: 'bg-gold',
              items: ['20 clientes', 'MRR: R$40.000', 'Custos: ~R$22.000', 'Lucro: R$18.000/mês'],
            },
            {
              period: 'Meses 7-12',
              badge: 'Escala',
              badgeColor: 'bg-emerald',
              items: ['30+ clientes', 'MRR: R$60.000+', 'Custos: ~R$30.000', 'Lucro: R$30.000/mês'],
            },
          ].map((p, i) => (
            <div key={i} className="glass rounded-2xl p-8 relative">
              <span className={`absolute -top-3 left-8 px-3 py-1 ${p.badgeColor} text-white text-xs font-bold rounded-full`}>{p.badge}</span>
              <h3 className="text-xl font-bold text-white mt-3 mb-4">{p.period}</h3>
              <div className="space-y-3">
                {p.items.map((item, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-trion-lilas">•</span> {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Valuation cards */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="glass rounded-2xl p-8 text-center border-2 border-trion-purple/30">
            <p className="text-sm text-gray-400 uppercase tracking-wider">Valuation Ano 1</p>
            <p className="text-4xl font-extrabold gradient-text mt-2">R$ 900.000</p>
            <p className="text-sm text-gray-400 mt-2">3x EBITDA anual</p>
          </div>
          <div className="glass rounded-2xl p-8 text-center border-2 border-gold/30">
            <p className="text-sm text-gray-400 uppercase tracking-wider">Valuation Ano 2</p>
            <p className="text-4xl font-extrabold text-gold mt-2">R$ 2.500.000+</p>
            <p className="text-sm text-gray-400 mt-2">5x EBITDA com tração</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-12 glass rounded-2xl p-8 text-center">
          <h4 className="text-xl font-bold text-white mb-3">Retorno para Investidores</h4>
          <p className="text-gray-400 text-sm mb-6">Agência com R$50k MRR e margem de 40% = R$240k lucro/ano</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-extrabold text-emerald"><Counter end={120} prefix="R$" suffix="k" /></p>
              <p className="text-xs text-gray-400 mt-1">Retorno anual (50%)</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gold"><Counter end={80} suffix="%" /></p>
              <p className="text-xs text-gray-400 mt-1">ROI sobre R$150k</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-trion-lilas"><Counter end={15} suffix=" meses" /></p>
              <p className="text-xs text-gray-400 mt-1">Payback estimado</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── PORTFOLIO ── */}
      <Section id="portfolio">
        <SectionTitle badge="Portfólio" title="Sites e Trabalhos Realizados" subtitle="63+ sites premium já desenvolvidos e implantados para clientes reais." />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {[
            { name: 'Ornato Estudio', url: 'https://oguidomingos.github.io/ornato-studio/' },
            { name: 'Garage 6691', url: 'https://oguidomingos.github.io/garage6691_mkt/' },
            { name: 'Florizz Hair', url: 'https://oguidomingos.github.io/Florizz_mkt/' },
            { name: 'Fruto Da Vide', url: 'https://oguidomingos.github.io/frutodavide-brand/' },
            { name: 'Rest. Paulista', url: 'https://oguidomingos.github.io/site-paulista/' },
            { name: 'Fogo do Galpão', url: 'https://oguidomingos.github.io/site-fogo-galpao/' },
            { name: 'Paladar Goiano', url: 'https://oguidomingos.github.io/site-paladar-goiano/' },
            { name: 'Zezinho', url: 'https://oguidomingos.github.io/site-zezinho/' },
          ].map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noopener" className="glass rounded-xl p-4 text-center hover:border-trion-purple/50 transition-all group">
              <div className="w-full h-24 bg-trion-midnight/50 rounded-lg mb-3 flex items-center justify-center text-2xl group-hover:bg-trion-purple/20 transition-colors">🌐</div>
              <p className="text-sm text-white font-semibold">{s.name}</p>
            </a>
          ))}
        </div>
        <div className="text-center mt-8">
          <a href="https://oguidomingos.github.io/portfolio-sites/" target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-trion-border text-trion-lilas hover:bg-trion-purple/10 font-semibold transition-all text-sm">
            Ver todos os 63+ sites →
          </a>
        </div>
      </Section>

      {/* ── INVESTIDOR (O QUE GANHA) ── */}
      <Section id="investidor" className="bg-trion-midnight/20">
        <SectionTitle badge="Para o Investidor" title="O Que Você Ganha" subtitle="Modelo justo que protege seu capital e maximiza retorno." />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: '🛡️', title: 'Capital Protegido', desc: 'R$10k primeiro, não R$150k. Risco limitado na validação.' },
            { icon: '📈', title: 'Upside Ilimitado', desc: 'Segunda rodada com valuation real. Multiplicação do investimento.' },
            { icon: '🔒', title: 'Governança Justa', desc: 'Veto em decisões críticas, relatórios mensais, direito de auditoria.' },
            { icon: '💰', title: 'Dividendos Garantidos', desc: 'Mínimo 30% do lucro distribuído trimestralmente.' },
            { icon: '🤝', title: 'Tag-Along', desc: 'Se a empresa for vendida, você sai nas mesmas condições.' },
            { icon: '📊', title: 'Transparência Total', desc: 'Acesso ao CRM, métricas de clientes, CAC, LTV, churn em tempo real.' },
          ].map((b, i) => (
            <div key={i} className="glass rounded-2xl p-6 text-center hover:border-trion-purple/50 transition-all">
              <div className="text-4xl mb-3">{b.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{b.title}</h3>
              <p className="text-gray-400 text-sm">{b.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(123,44,191,0.2),_transparent_60%)]" />
        <div className="relative max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Pronto para construir<br/>
            <span className="gradient-text">algo grande juntos?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Parceria inteligente. Capital protegido. Ecossistema pronto. Equipe comprovada. O momento é agora.
          </p>
          <a href="https://wa.me/5561999999999" target="_blank" rel="noopener"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-trion-purple hover:bg-trion-purple/80 text-white font-bold text-lg transition-all animate-pulse-glow">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Vamos Conversar
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t border-trion-border text-center">
        <p className="text-sm text-gray-500">Trion Marketing &copy; 2026 — Proposta Confidencial</p>
        <p className="text-xs text-gray-600 mt-1">Documento de referência. Não constitui aconselhamento jurídico.</p>
      </footer>
    </div>
  )
}
