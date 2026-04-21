import { useState, useEffect, useRef } from 'react'

/* ───── Hooks ───── */
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function Counter({ end, duration = 2000, prefix = '', suffix = '', decimals = 0 }) {
  const [val, setVal] = useState(0)
  const [ref, visible] = useInView(0.3)
  useEffect(() => {
    if (!visible) return
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(eased * end)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [visible, end, duration])
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString('pt-BR')}{suffix}
    </span>
  )
}

/* ───── Reusable Components ───── */
function Section({ id, children, className = '' }) {
  const [ref, visible] = useInView(0.1)
  return (
    <section
      id={id}
      ref={ref}
      className={`py-20 md:py-28 px-5 md:px-10 ${className}`}
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}
    >
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-px bg-gold" />
      <span className="text-xs tracking-[0.2em] uppercase text-gold font-medium">{children}</span>
    </div>
  )
}

function SectionTitle({ children, light = false }) {
  return (
    <h2 className={`font-display text-3xl md:text-5xl font-semibold mb-6 leading-tight ${light ? 'text-white' : 'text-ink'}`}>
      {children}
    </h2>
  )
}

function Card({ children, className = '', highlight = false }) {
  return (
    <div className={`rounded-2xl p-6 md:p-8 ${highlight ? 'bg-sage text-white shadow-xl' : 'bg-white border border-sage-mist shadow-sm'} ${className}`}>
      {children}
    </div>
  )
}

/* ───── Bar Chart ───── */
function HBar({ label, value, max, color = 'bg-sage', suffix = '' }) {
  const [ref, visible] = useInView(0.2)
  const pct = (value / max) * 100
  return (
    <div ref={ref} className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-ink-soft">{label}</span>
        <span className="font-semibold text-ink">{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}{suffix}</span>
      </div>
      <div className="h-3 bg-sage-mist rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full`}
          style={{ width: visible ? `${pct}%` : '0%', transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </div>
    </div>
  )
}

/* ───── Donut Chart ───── */
function DonutChart({ segments, size = 200, label }) {
  const [ref, visible] = useInView(0.3)
  let offset = 0
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  const circumference = 2 * Math.PI * 80
  return (
    <div ref={ref} className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 200 200">
        {segments.map((seg, i) => {
          const pct = seg.value / total
          const dash = pct * circumference
          const gap = circumference - dash
          const o = offset
          offset += pct * circumference
          return (
            <circle
              key={i}
              cx="100" cy="100" r="80"
              fill="none"
              stroke={seg.color}
              strokeWidth="28"
              strokeDasharray={visible ? `${dash} ${gap}` : `0 ${circumference}`}
              strokeDashoffset={-o}
              style={{ transition: `stroke-dasharray 1.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.15}s` }}
              transform="rotate(-90 100 100)"
            />
          )
        })}
        <text x="100" y="95" textAnchor="middle" className="font-display" fontSize="28" fontWeight="600" fill="#1a1a18">{label}</text>
        <text x="100" y="118" textAnchor="middle" fontSize="11" fill="#7a7970">cap table</text>
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-xs">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
            <span className="text-ink-soft">{seg.label} ({seg.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───── Line Chart ───── */
function LineChart({ data, width = 600, height = 250, color = '#2D5A3D', fillColor = 'rgba(45,90,61,0.1)' }) {
  const [ref, visible] = useInView(0.2)
  const max = Math.max(...data.map(d => d.value))
  const padX = 50, padY = 30
  const plotW = width - padX * 2
  const plotH = height - padY * 2
  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * plotW,
    y: padY + plotH - (d.value / max) * plotH
  }))
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padY + plotH} L ${points[0].x} ${padY + plotH} Z`
  return (
    <div ref={ref} className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[600px]">
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <g key={f}>
            <line x1={padX} y1={padY + plotH * (1 - f)} x2={width - padX} y2={padY + plotH * (1 - f)} stroke="#eaf1ec" strokeWidth="1" />
            <text x={padX - 8} y={padY + plotH * (1 - f) + 4} textAnchor="end" fontSize="9" fill="#7a7970">
              {(max * f / 1000).toFixed(0)}k
            </text>
          </g>
        ))}
        <path d={areaD} fill={fillColor} style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease' }} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease 0.3s' }} />
        {points.map((p, i) => (
          <g key={i} style={{ opacity: visible ? 1 : 0, transition: `opacity 0.5s ease ${0.3 + i * 0.08}s` }}>
            <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2" />
            <text x={p.x} y={height - 5} textAnchor="middle" fontSize="8" fill="#7a7970">{data[i].label}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ───── Milestone Step ───── */
function MilestoneStep({ phase, trigger, investPct, techPct, filhosPct, pool, equityValue, active }) {
  const [ref, visible] = useInView(0.2)
  return (
    <div ref={ref} className={`relative pl-8 pb-10 border-l-2 ${active ? 'border-gold' : 'border-white/10'}`}
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateX(-20px)', transition: 'all 0.6s ease' }}>
      <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 ${active ? 'bg-gold border-gold' : 'bg-sage-dark border-white/30'}`} />
      <div className="ml-4">
        <h4 className="font-display text-xl font-semibold text-white mb-1">{phase}</h4>
        <p className="text-sm text-gold font-medium mb-3">{trigger}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Investidores', val: investPct },
            { label: 'Filhos', val: filhosPct },
            { label: 'Técnicos', val: techPct },
            { label: 'Pool', val: pool },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="text-xs text-white/50 mb-0.5">{s.label}</div>
              <div className="font-display text-xl font-bold text-white">{s.val}%</div>
            </div>
          ))}
        </div>
        {equityValue && (
          <div className="mt-3 text-sm text-white/60">
            Valor do equity investidor: <span className="font-semibold text-gold">{equityValue}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <div className="min-h-screen">
      {/* ───── NAV ───── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-10 flex items-center justify-between transition-all duration-500 ${scrolled ? 'py-3 bg-cream/95 backdrop-blur-md shadow-sm' : 'py-5 bg-transparent'}`}>
        <a href="#hero" className={`font-display text-xl font-medium tracking-wide transition-colors ${scrolled ? 'text-sage' : 'text-white'}`}>
          Pulso<span className="inline-block w-1.5 h-1.5 bg-gold rounded-full ml-1 relative -top-0.5" />
        </a>
        <div className="hidden md:flex items-center gap-8">
          {['Oportunidade', 'Projeções', 'Sociedade', 'Equipe', 'Retorno'].map(s => (
            <a key={s} href={`#${s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}
              className={`text-xs tracking-[0.12em] uppercase transition-colors ${scrolled ? 'text-ink-soft hover:text-sage' : 'text-white/80 hover:text-gold'}`}>
              {s}
            </a>
          ))}
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section id="hero" className="min-h-screen bg-sage-dark relative overflow-hidden flex items-center px-6 md:px-10">
        <div className="absolute top-20 right-[-100px] w-[400px] h-[400px] rounded-full bg-sage/20 blur-3xl" />
        <div className="absolute bottom-[-50px] left-[-80px] w-[300px] h-[300px] rounded-full bg-gold/10 blur-3xl" />
        <div className="max-w-5xl mx-auto relative z-10 pt-28 pb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-px bg-gold" />
            <span className="text-gold text-xs tracking-[0.25em] uppercase font-medium">Documento Confidencial</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.1] mb-6">
            Proposta de<br />
            <span className="text-gold">Parceria Societária</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-4 leading-relaxed">
            Agência de Marketing Digital para o Nicho Médico
          </p>
          <p className="text-sm text-white/50 mb-10">
            Cenário A — Construção Gradual de Participação · Mai/2026 – Abr/2028
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { n: '40', label: 'Clientes meta Y1' },
              { n: 'R$ 3.500', label: 'Ticket médio/mês' },
              { n: 'R$ 1,07M', label: 'EBITDA Y1 (realista)' },
              { n: '+412%', label: 'ROI em 24 meses' },
            ].map((m, i) => (
              <div key={i} className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                <div className="font-display text-2xl md:text-3xl font-bold text-gold">{m.n}</div>
                <div className="text-xs text-white/50 mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ OPORTUNIDADE ═══════ */}
      <Section id="oportunidade">
        <SectionLabel>A Oportunidade</SectionLabel>
        <SectionTitle>O mercado de saúde precisa de marketing profissional</SectionTitle>
        <p className="text-ink-soft text-lg max-w-3xl mb-12">
          Clínicas e especialistas querem resultado previsível: agenda cheia, novos pacientes,
          operação profissional. O mercado é fragmentado — quem entregar com consistência, escala.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🎯', title: 'Gestão completa', desc: 'Campanhas Meta Ads, landing pages, criativos, copies e relatórios mensais. O médico foca no paciente.' },
            { icon: '🔄', title: 'Receita recorrente', desc: 'Mensalidade de R$3.500/cliente com fidelidade mínima de 3 meses. Previsibilidade de caixa desde o mês 1.' },
            { icon: '🤖', title: 'IA como alavanca', desc: '10 novos onboardings/mês + gestão de 20 em ongoing com IA. Capacidade de 40 clientes com 5 pessoas.' },
          ].map((c, i) => (
            <Card key={i}>
              <div className="text-3xl mb-4">{c.icon}</div>
              <h3 className="font-display text-xl font-semibold text-ink mb-2">{c.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{c.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ═══════ MODELO FINANCEIRO ═══════ */}
      <Section id="projecoes" className="bg-sage-mist/40">
        <SectionLabel>Modelo Financeiro</SectionLabel>
        <SectionTitle>Três cenários transparentes</SectionTitle>
        <p className="text-ink-soft text-lg max-w-3xl mb-12">
          Projeções baseadas em métricas reais de mercado. O cenário realista é o nosso compromisso —
          os outros mostram o piso e o teto.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { name: 'Pessimista', invest: '237k', payback: 'M8', ebitdaY1: '614k', roi: '+259%', churn: '8%' },
            { name: 'Realista', invest: '260.5k', payback: 'M6', ebitdaY1: '1,07M', roi: '+412%', star: true, churn: '5%' },
            { name: 'Otimista', invest: '285k', payback: 'M5', ebitdaY1: '1,15M', roi: '+442%', churn: '3%' },
          ].map((c, i) => (
            <Card key={i} highlight={c.star} className={!c.star ? 'border-t-4 border-sage-mist' : ''}>
              <div className="flex items-center gap-2 mb-4">
                <h3 className={`font-display text-2xl font-semibold ${c.star ? 'text-white' : 'text-ink'}`}>{c.name}</h3>
                {c.star && <span className="text-gold text-lg">★</span>}
              </div>
              <div className="space-y-3">
                {[
                  ['Investimento Y1', `R$ ${c.invest}`],
                  ['Payback', c.payback],
                  ['EBITDA Y1', `R$ ${c.ebitdaY1}`],
                  ['ROI 24 meses', c.roi],
                ].map(([l, v], j) => (
                  <div key={j} className="flex justify-between">
                    <span className={`text-sm ${c.star ? 'text-white/70' : 'text-ink-soft'}`}>{l}</span>
                    <span className={`font-semibold ${j === 3 ? (c.star ? 'text-gold text-lg font-bold' : 'text-sage text-lg font-bold') : (c.star ? 'text-white' : 'text-ink')}`}>{v}</span>
                  </div>
                ))}
                <div className={`text-xs pt-2 mt-2 border-t ${c.star ? 'border-white/20 text-white/50' : 'border-sage-mist text-text-muted'}`}>
                  Churn mensal: {c.churn}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 border border-sage-mist shadow-sm mb-12">
          <h3 className="font-display text-xl font-semibold text-ink mb-2">Receita mensal — Cenário Realista</h3>
          <p className="text-sm text-text-muted mb-6">Em R$ mil · Payback no mês 6 · Cap de 40 clientes atingido no M8</p>
          <LineChart data={[
            { label: 'M1', value: 28000 }, { label: 'M2', value: 45500 }, { label: 'M3', value: 66500 },
            { label: 'M4', value: 87500 }, { label: 'M5', value: 105000 }, { label: 'M6', value: 126000 },
            { label: 'M7', value: 140000 }, { label: 'M8', value: 147000 }, { label: 'M9', value: 147000 },
            { label: 'M10', value: 147000 }, { label: 'M11', value: 147000 }, { label: 'M12', value: 147000 },
          ]} />
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 border border-sage-mist shadow-sm">
          <h3 className="font-display text-xl font-semibold text-ink mb-2">EBITDA acumulado — Cenário Realista</h3>
          <p className="text-sm text-text-muted mb-6">Em R$ mil · Investimento recuperado no M6</p>
          <LineChart data={[
            { label: 'M1', value: 10500 }, { label: 'M2', value: 38500 }, { label: 'M3', value: 87500 },
            { label: 'M4', value: 155500 }, { label: 'M5', value: 241000 }, { label: 'M6', value: 345000 },
            { label: 'M7', value: 460500 }, { label: 'M8', value: 583000 }, { label: 'M9', value: 705500 },
            { label: 'M10', value: 828000 }, { label: 'M11', value: 950500 }, { label: 'M12', value: 1073000 },
          ]} color="#C9A84C" fillColor="rgba(201,168,76,0.08)" />
        </div>
      </Section>

      {/* ═══════ ANO 2 ═══════ */}
      <Section>
        <SectionLabel>Ano 2</SectionLabel>
        <SectionTitle>Autofinanciada e escalando</SectionTitle>
        <p className="text-ink-soft text-lg max-w-3xl mb-12">
          A partir do mês 13, a empresa se autofinancia 100%. Capacidade ampliada para 60 clientes.
          MRR projetado de R$210.000 no M24.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-display text-xl font-semibold text-ink mb-4">Crescimento trimestral Y2</h3>
            <HBar label="Q1 (Mai–Jul/27)" value={48} max={60} suffix=" clientes" />
            <HBar label="Q2 (Ago–Out/27)" value={55} max={60} suffix=" clientes" />
            <HBar label="Q3 (Nov/27–Jan/28)" value={60} max={60} suffix=" clientes" color="bg-gold" />
            <HBar label="Q4 (Fev–Abr/28)" value={60} max={60} suffix=" clientes" color="bg-gold" />
          </Card>
          <Card highlight>
            <h3 className="font-display text-xl font-semibold text-white mb-6">Resultado Y2 — Realista</h3>
            <div className="space-y-5">
              <div>
                <div className="text-white/60 text-sm">Receita anual</div>
                <div className="font-display text-3xl font-bold text-white">R$ <Counter end={2278} suffix=".500" /></div>
              </div>
              <div>
                <div className="text-white/60 text-sm">EBITDA Y2</div>
                <div className="font-display text-3xl font-bold text-gold">R$ <Counter end={1942} suffix=".500" /></div>
              </div>
              <div>
                <div className="text-white/60 text-sm">MRR no M24</div>
                <div className="font-display text-3xl font-bold text-white">R$ <Counter end={210} suffix=".000" /></div>
              </div>
              <div className="pt-4 border-t border-white/20">
                <div className="text-white/60 text-sm">ARR projetado</div>
                <div className="font-display text-2xl font-bold text-gold-light">R$ 2.520.000</div>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* ═══════ SOCIEDADE — A GRANDE IDEIA ═══════ */}
      <section id="sociedade" className="py-20 md:py-28 px-5 md:px-10 bg-sage-dark text-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <SectionLabel>Estrutura Societária</SectionLabel>
          <SectionTitle light>Menos percentual, mais valor</SectionTitle>
          <p className="text-white/60 text-lg max-w-3xl mb-4">
            A lógica central desta proposta: à medida que a empresa cresce, o percentual do investidor diminui —
            mas o <strong className="text-gold">valor absoluto</strong> do equity cresce exponencialmente.
          </p>
          <p className="text-white/60 text-lg max-w-3xl mb-12">
            Os milestones são o motor que alinha todos os interesses. Quem opera faz a empresa valer mais.
            Quem investe ganha mais em valor, mesmo com menos percentual.
          </p>

          {/* THE KEY COMPARISON */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 md:p-8 border border-white/10">
              <div className="text-red-400 text-xs tracking-wider uppercase mb-3 font-medium">❌ Sem milestones</div>
              <div className="font-display text-4xl font-bold text-white mb-2">60%</div>
              <div className="text-white/50 text-sm mb-4">de uma empresa que não escala</div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-white/40 text-xs mb-1">Valuation estimado</div>
                <div className="font-display text-2xl font-semibold text-white/70">~R$ 500.000</div>
                <div className="text-white/40 text-xs mt-1 mb-3">(4 clientes, mês 1)</div>
                <div className="h-px bg-white/10 my-3" />
                <div className="text-white/40 text-xs mb-1">Equity do investidor</div>
                <div className="font-display text-3xl font-bold text-red-400">R$ 300.000</div>
              </div>
            </div>
            <div className="bg-gold/10 backdrop-blur rounded-2xl p-6 md:p-8 border border-gold/30 animate-pulse-glow">
              <div className="text-gold text-xs tracking-wider uppercase mb-3 font-medium">✓ Com milestones ★</div>
              <div className="font-display text-4xl font-bold text-white mb-2">22,5%</div>
              <div className="text-white/50 text-sm mb-4">de uma empresa de R$7–12 milhões</div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-white/40 text-xs mb-1">Valuation M24 (conservador 3x ARR)</div>
                <div className="font-display text-2xl font-semibold text-white">R$ 7.560.000</div>
                <div className="text-white/40 text-xs mt-1 mb-3">(60 clientes, MRR R$210k)</div>
                <div className="h-px bg-white/10 my-3" />
                <div className="text-white/40 text-xs mb-1">Equity do investidor</div>
                <div className="font-display text-3xl font-bold text-gold">R$ 1.701.000</div>
                <div className="text-gold/60 text-xs mt-1">até R$ 2.835.000 (5x ARR)</div>
              </div>
            </div>
          </div>

          {/* Key insight callout */}
          <div className="bg-gold/10 border border-gold/20 rounded-2xl p-6 md:p-8 mb-16 max-w-4xl">
            <div className="flex items-start gap-4">
              <div className="text-gold text-3xl mt-1">💡</div>
              <div>
                <h3 className="font-display text-xl font-semibold text-white mb-2">O ponto-chave</h3>
                <p className="text-white/70 leading-relaxed">
                  O investidor não perde dinheiro com a diluição — ele troca percentual por crescimento real de valor.
                  Sair de 60% para 22,5% com os milestones significa ir de <strong className="text-white">R$300k para R$1,7M–R$2,8M</strong>.
                  Os milestones são o que faz isso acontecer — e quem entrega os milestones é a operação.
                </p>
              </div>
            </div>
          </div>

          {/* MILESTONES TIMELINE */}
          <h3 className="font-display text-2xl font-semibold text-white mb-8">Evolução por milestone</h3>
          <MilestoneStep phase="Dia 1 — Assinatura" trigger="Assinatura do SHA" investPct={60} filhosPct={10} techPct={15} pool={15} equityValue="R$ 302k (3x ARR)" active />
          <MilestoneStep phase="Milestone 1 — Payback" trigger="EBITDA acumulado ≥ capital investido" investPct={48} filhosPct={13} techPct={24} pool={15} equityValue="R$ 2.178k (3x ARR)" />
          <MilestoneStep phase="Milestone 2 — 40 Clientes" trigger="40 clientes ativos por 30 dias consecutivos" investPct={36} filhosPct={16} techPct={33} pool={15} equityValue="R$ 1.814k (3x ARR)" />
          <MilestoneStep phase="Milestone 3 — Estado Final" trigger="M24 ou ARR ≥ R$2M" investPct={22.5} filhosPct={20} techPct={42.5} pool={15} equityValue="R$ 1.701k – R$ 2.835k" active />
        </div>
      </section>

      {/* ═══════ CAP TABLE VISUAL ═══════ */}
      <Section className="bg-sage-mist/40">
        <SectionLabel>Cap Table Visual</SectionLabel>
        <SectionTitle>A participação evolui com os resultados</SectionTitle>
        <p className="text-ink-soft text-lg max-w-3xl mb-12">
          A cada milestone, a diluição é exclusivamente dos investidores. Filhos e técnicos nunca diluem uns aos outros.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Dia 1', segs: [{ label: 'Invest.', value: 60, color: '#C9A84C' }, { label: 'Filhos', value: 10, color: '#3d7a56' }, { label: 'Técnicos', value: 15, color: '#2D5A3D' }, { label: 'Pool', value: 15, color: '#d4d0c8' }] },
            { label: 'Payback', segs: [{ label: 'Invest.', value: 48, color: '#C9A84C' }, { label: 'Filhos', value: 13, color: '#3d7a56' }, { label: 'Técnicos', value: 24, color: '#2D5A3D' }, { label: 'Pool', value: 15, color: '#d4d0c8' }] },
            { label: '40 Clientes', segs: [{ label: 'Invest.', value: 36, color: '#C9A84C' }, { label: 'Filhos', value: 16, color: '#3d7a56' }, { label: 'Técnicos', value: 33, color: '#2D5A3D' }, { label: 'Pool', value: 15, color: '#d4d0c8' }] },
            { label: 'Final', segs: [{ label: 'Invest.', value: 22.5, color: '#C9A84C' }, { label: 'Filhos', value: 20, color: '#3d7a56' }, { label: 'Técnicos', value: 42.5, color: '#2D5A3D' }, { label: 'Pool', value: 15, color: '#d4d0c8' }] },
          ].map((d, i) => (
            <div key={i} className="text-center">
              <DonutChart segments={d.segs} label={d.label} size={170} />
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════ POR QUE A OPERAÇÃO É O CORAÇÃO ═══════ */}
      <Section>
        <SectionLabel>Tese Central</SectionLabel>
        <SectionTitle>O capital inicial constrói. A operação sustenta.</SectionTitle>
        <p className="text-ink-soft text-lg max-w-3xl mb-12">
          O aporte é fundamental no Ano 1 — viabiliza a estrutura. Mas a partir do mês 6–8,
          a empresa se autofinancia. O que mantém a máquina gerando dinheiro é a operação escalável.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <div className="text-3xl mb-4">💰</div>
            <h3 className="font-display text-xl font-semibold text-ink mb-3">Papel do capital</h3>
            <ul className="space-y-2 text-sm text-ink-soft">
              {['Salários nos primeiros 6–8 meses', 'Infraestrutura (escritório, ferramentas)', 'Tráfego pago para aquisição inicial', 'Networking para os primeiros 3 clientes/mês'].map((t, i) => (
                <li key={i} className="flex gap-2"><span className="text-sage mt-0.5">●</span>{t}</li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-sage-mist">
              <div className="text-xs text-text-muted">Importância ao longo do tempo</div>
              <div className="h-2 bg-sage-mist rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gold rounded-full" style={{ width: '25%' }} />
              </div>
              <div className="text-xs text-text-muted mt-1">Diminui após payback</div>
            </div>
          </Card>
          <Card highlight>
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="font-display text-xl font-semibold text-white mb-3">Papel da operação</h3>
            <ul className="space-y-2 text-sm text-white/80">
              {['Entrega dos resultados ao cliente (agenda cheia)', 'Retenção via NPS alto e relacionamento', 'Escala com IA (10 onboardings + 20 ongoing/mês)', 'Criação de processos e playbooks replicáveis'].map((t, i) => (
                <li key={i} className="flex gap-2"><span className="text-gold mt-0.5">●</span>{t}</li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="text-xs text-white/50">Importância ao longo do tempo</div>
              <div className="h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gold rounded-full" style={{ width: '95%' }} />
              </div>
              <div className="text-xs text-white/50 mt-1">Cresce indefinidamente</div>
            </div>
          </Card>
        </div>
      </Section>

      {/* ═══════ EQUIPE ═══════ */}
      <Section id="equipe" className="bg-sage-mist/40">
        <SectionLabel>Quem somos</SectionLabel>
        <SectionTitle>Match de ética e execução</SectionTitle>
        <p className="text-ink-soft text-lg max-w-3xl mb-12">
          Três perfis complementares com histórico comprovado no nicho médico.
          Juntos, já atenderam mais de 30 contas de profissionais de saúde.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Calil', role: 'Estratégia Comercial', color: 'bg-gold', skills: ['Vendas e negociação B2B', 'Relacionamento com médicos', 'Gestão de contas de alto valor', 'Fechamento e retenção de clientes'], highlight: '+30 contas de médicos atendidas' },
            { name: 'Sérgio', role: 'Gestão de Tráfego', color: 'bg-sage', skills: ['Meta Ads especialista em saúde', 'Google Ads e SEO local', 'Análise de dados e otimização', 'Funis de conversão para clínicas'], highlight: 'CPC médio R$12, conversão 7,4%' },
            { name: 'Guilherme', role: 'Tecnologia e IA', color: 'bg-ink', skills: ['Automação com IA (Claude, GPT)', 'Desenvolvimento de sites e LPs', 'Infraestrutura e deploy', 'Sistemas de gestão e CRM'], highlight: 'Escala de 10→40 clientes com IA' },
          ].map((p, i) => (
            <Card key={i}>
              <div className={`w-14 h-14 ${p.color} rounded-2xl flex items-center justify-center mb-4`}>
                <span className="text-white font-display text-2xl font-bold">{p.name[0]}</span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-ink mb-1">{p.name}</h3>
              <p className="text-sm text-gold font-medium mb-4">{p.role}</p>
              <ul className="space-y-2 text-sm text-ink-soft mb-4">
                {p.skills.map((s, j) => (
                  <li key={j} className="flex gap-2"><span className="text-sage mt-0.5 text-xs">✓</span>{s}</li>
                ))}
              </ul>
              <div className="bg-sage-mist rounded-lg p-3 text-center">
                <span className="text-xs text-sage font-semibold">{p.highlight}</span>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* ═══════ GOVERNANÇA ═══════ */}
      <Section>
        <SectionLabel>Governança</SectionLabel>
        <SectionTitle>Paridade de poder desde o Dia 1</SectionTitle>
        <p className="text-ink-soft text-lg max-w-3xl mb-12">
          Mesmo com equity desigual, o sistema de blocos garante que nenhum grupo
          pode impor decisões ao outro nas matérias que realmente importam.
        </p>
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-t-4 border-gold">
            <h3 className="font-display text-xl font-semibold text-ink mb-2">Bloco Familiar</h3>
            <p className="text-sm text-text-muted mb-4">Investidores + Filhos operacionais</p>
            <div className="text-5xl font-display font-bold text-gold text-center py-4">3 votos</div>
            <p className="text-xs text-text-muted text-center">Votam como unidade — 1 voz, não 4</p>
          </Card>
          <Card className="border-t-4 border-sage">
            <h3 className="font-display text-xl font-semibold text-ink mb-2">Bloco Técnico</h3>
            <p className="text-sm text-text-muted mb-4">3 sócios técnicos</p>
            <div className="text-5xl font-display font-bold text-sage text-center py-4">3 votos</div>
            <p className="text-xs text-text-muted text-center">Paridade real — independe do equity</p>
          </Card>
        </div>
        <div className="bg-cream-warm rounded-2xl p-6 md:p-8 border border-sage-mist/60">
          <h4 className="font-display text-lg font-semibold text-ink mb-4">Matérias que exigem aprovação de AMBOS os blocos:</h4>
          <div className="grid md:grid-cols-2 gap-2">
            {['Venda total ou parcial da empresa', 'Emissão de novas quotas / novos investidores', 'Alteração da política de distribuição de lucros', 'Reestruturação do cap table fora dos milestones', 'Concessões do pool de talentos (cada grant)', 'Contratação/desligamento de sócios e C-level', 'Aportes de capital acima de R$ 50.000', 'Mudança de objeto social ou modelo de negócio'].map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-ink-soft py-1">
                <span className="text-gold mt-0.5">◆</span>{m}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════ RETORNO ═══════ */}
      <section id="retorno" className="py-20 md:py-28 px-5 md:px-10 bg-sage-dark text-white">
        <div className="max-w-6xl mx-auto">
          <SectionLabel>Retorno Completo</SectionLabel>
          <SectionTitle light>O que o investidor recebe</SectionTitle>
          <p className="text-white/60 text-lg max-w-3xl mb-12">
            O retorno não é apenas o equity final. Ao longo dos 24 meses, o investidor recebe
            distribuições de lucro, retorno preferencial, e acumula valor patrimonial.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <h3 className="font-display text-xl font-semibold text-white mb-6">Componentes do retorno</h3>
              <div className="space-y-4">
                {[
                  { label: 'Capital investido (Y1)', value: 'R$ 260.500', note: 'Custeio 100% da operação' },
                  { label: 'Retorno preferencial', value: '~R$ 85.000', note: 'IPCA+12% × ~2 anos, pago primeiro' },
                  { label: 'Distribuições Y1', value: 'R$ 80–120k', note: '48% do EBITDA distribuível Q3-Q4' },
                  { label: 'Distribuições Y2', value: 'R$ 450–600k', note: '~30% equity × EBITDA Y2' },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between items-start py-2 border-b border-white/5">
                    <div>
                      <div className="text-white/80 text-sm">{r.label}</div>
                      <div className="text-white/40 text-xs mt-0.5">{r.note}</div>
                    </div>
                    <div className="text-white font-semibold text-right">{r.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gold/10 backdrop-blur rounded-2xl p-6 border border-gold/30">
              <h3 className="font-display text-xl font-semibold text-gold mb-6">Resultado final (24 meses)</h3>
              <div className="space-y-6">
                <div>
                  <div className="text-white/50 text-xs mb-1">Retorno conservador (3x ARR)</div>
                  <div className="font-display text-4xl font-bold text-white">R$ <Counter end={2416} suffix="k" /></div>
                  <div className="text-gold text-sm mt-1">ROI de 828%</div>
                </div>
                <div className="h-px bg-white/10" />
                <div>
                  <div className="text-white/50 text-xs mb-1">Retorno otimista (5x ARR)</div>
                  <div className="font-display text-4xl font-bold text-gold">R$ <Counter end={3640} suffix="k" /></div>
                  <div className="text-gold-light text-sm mt-1">ROI de 1.298%</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 mt-4">
                  <div className="text-white/40 text-xs mb-2">Cada R$1 investido retorna</div>
                  <div className="flex gap-6">
                    <div>
                      <div className="font-display text-2xl font-bold text-white">R$ 9,28</div>
                      <div className="text-white/40 text-xs">conservador</div>
                    </div>
                    <div>
                      <div className="font-display text-2xl font-bold text-gold">R$ 13,98</div>
                      <div className="text-gold/60 text-xs">otimista</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Distribution table */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 md:p-8 border border-white/10 mb-12">
            <h3 className="font-display text-xl font-semibold text-white mb-6">Política de distribuição de lucros</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Fase', 'Reserva', 'Distribuível', 'Freq.', 'Mecânica'].map(h => (
                      <th key={h} className="text-left py-3 text-white/50 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Pré-payback (M1–M6)', '100%', '0%', '—', 'Pref. acumula (IPCA+12%)'],
                    ['Pós-payback (M7+)', '25%', '75%', 'Trimestral', 'Pref. primeiro, depois pro-rata'],
                    ['40 clientes (M8+)', '20%', '80%', 'Mensal', 'Pref. quitado — pro-rata'],
                    ['Estado final (M24+)', '15%', '85%', 'Mensal', 'Pro-rata puro'],
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3 text-white/80">{r[0]}</td>
                      <td className="py-3 text-white/60">{r[1]}</td>
                      <td className="py-3 text-gold font-semibold">{r[2]}</td>
                      <td className="py-3 text-white/60">{r[3]}</td>
                      <td className="py-3 text-white/60 text-xs">{r[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Exit mechanisms */}
          <h3 className="font-display text-2xl font-semibold text-white mb-6">Mecanismos de saída</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Call Option', who: 'Bloco Técnico aciona', when: 'A partir do mês 36', price: '4x EBITDA × % investidor', icon: '📞' },
              { title: 'Put Option', who: 'Investidor aciona', when: 'A partir do mês 48', price: '4x EBITDA × % investidor', icon: '🎯' },
              { title: 'Tag-Along', who: 'Qualquer minoritário', when: 'Em qualquer venda', price: 'Mesmas condições da maioria', icon: '🤝' },
              { title: 'Drag-Along', who: 'Exige AMBOS os blocos', when: 'Após mês 48', price: 'Nunca unilateral', icon: '🔗' },
            ].map((m, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/10 flex gap-4">
                <div className="text-2xl">{m.icon}</div>
                <div>
                  <h4 className="font-semibold text-white mb-0.5">{m.title}</h4>
                  <div className="text-xs text-gold mb-1">{m.who}</div>
                  <div className="text-xs text-white/50">{m.when} · {m.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CUSTOS + FUNIL ═══════ */}
      <Section>
        <SectionLabel>Transparência</SectionLabel>
        <SectionTitle>Para onde vai cada real</SectionTitle>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <h3 className="font-display text-xl font-semibold text-ink mb-4">Custos fixos mensais</h3>
            <HBar label="Aluguel escritório" value={4000} max={6000} />
            <HBar label="Servidores e IAs" value={700} max={6000} color="bg-sage-light" />
            <HBar label="Claude Pro" value={500} max={6000} color="bg-gold" />
            <HBar label="Utilidades" value={500} max={6000} color="bg-sage-light" />
            <HBar label="Materiais" value={300} max={6000} color="bg-sage-light" />
            <div className="mt-4 pt-4 border-t border-sage-mist flex justify-between">
              <span className="font-semibold text-ink">Total fixo</span>
              <span className="font-display text-xl font-bold text-sage">R$ 6.000/mês</span>
            </div>
          </Card>
          <Card>
            <h3 className="font-display text-xl font-semibold text-ink mb-4">Folha salarial</h3>
            {[
              { p: 'M1–M3', q: '4 sócios', s: 'R$ 2.000', t: 'R$ 8.000' },
              { p: 'M4–M5', q: '4 sócios', s: 'R$ 2.500', t: 'R$ 10.000' },
              { p: 'M6', q: '5 sócios', s: 'R$ 2.500', t: 'R$ 12.500' },
              { p: 'M7–M24', q: '5 sócios', s: 'R$ 3.000', t: 'R$ 15.000' },
            ].map((f, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-sage-mist last:border-0">
                <div>
                  <div className="text-sm text-ink">{f.p}</div>
                  <div className="text-xs text-text-muted">{f.q} × {f.s}</div>
                </div>
                <div className="font-semibold text-sage">{f.t}</div>
              </div>
            ))}
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-display text-xl font-semibold text-ink mb-4">Sensibilidade ao ticket</h3>
            {[
              { ticket: 'R$ 2.500', mrr: 'R$ 100k', payback: 'M9' },
              { ticket: 'R$ 3.500 ★', mrr: 'R$ 140k', payback: 'M7', hl: true },
              { ticket: 'R$ 4.500', mrr: 'R$ 180k', payback: 'M5' },
            ].map((t, i) => (
              <div key={i} className={`rounded-xl p-4 mb-2 ${t.hl ? 'bg-sage text-white' : 'bg-sage-mist'}`}>
                <div className="flex justify-between">
                  <span className={`font-semibold ${t.hl ? 'text-white' : 'text-ink'}`}>{t.ticket}</span>
                  <span className={`text-xs font-medium ${t.hl ? 'text-gold' : 'text-sage'}`}>Payback {t.payback}</span>
                </div>
                <div className={`text-xs ${t.hl ? 'text-white/70' : 'text-text-muted'}`}>MRR (40 clientes): {t.mrr}</div>
              </div>
            ))}
          </Card>
          <Card>
            <h3 className="font-display text-xl font-semibold text-ink mb-4">Pool de talentos (15%)</h3>
            {[
              { l: 'Vesting', v: '12m cliff + 36m linear' },
              { l: 'Máx. por pessoa', v: '0,3% da empresa' },
              { l: 'Aprovação', v: 'Consenso de ambos os blocos' },
              { l: 'Diluição', v: 'Todos diluem proporcionalmente' },
              { l: 'Extinção', v: 'Unanimidade — nunca unilateral' },
            ].map((r, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-sage-mist last:border-0">
                <span className="text-sm text-ink-soft">{r.l}</span>
                <span className="text-sm font-medium text-ink">{r.v}</span>
              </div>
            ))}
          </Card>
        </div>
      </Section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-24 md:py-32 px-5 md:px-10 bg-sage-dark text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,168,76,0.08),transparent_70%)]" />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="font-display text-sm tracking-[0.2em] uppercase text-gold mb-6">Próximo passo</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mb-6 leading-tight">
            Vamos construir isso juntos?
          </h2>
          <p className="text-white/60 text-lg mb-10 leading-relaxed">
            Este documento é a base para alinharmos a visão. O próximo passo é uma conversa para
            ajustar os detalhes e formalizar o Acordo de Quotistas.
          </p>
          <a href="https://wa.me/5561999999999?text=Quero%20conversar%20sobre%20a%20parceria" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gold text-ink font-semibold px-8 py-4 rounded-full hover:bg-gold-light transition-all hover:-translate-y-0.5 shadow-lg shadow-gold/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.765-1.259A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.24 0-4.32-.726-6.006-1.957l-.42-.318-3.16.834.897-3.276-.35-.557A9.953 9.953 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
            Agendar conversa
          </a>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="py-8 px-6 bg-sage-dark border-t border-white/5 text-center">
        <div className="font-display text-sm text-white/30">
          Pulso — Documento confidencial · Apresentação exclusiva ao grupo investidor
        </div>
      </footer>
    </div>
  )
}
