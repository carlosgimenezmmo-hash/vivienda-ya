'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

const PLAN_CONFIG = {
  junior:       { color: '#94A3B8', label: 'Junior',       videos: 10,  destacados: 1  },
  agente:       { color: '#F59E0B', label: 'Agente',       videos: 25,  destacados: 3  },
  especializado:{ color: '#2563EB', label: 'Especializado', videos: 60,  destacados: 5  },
  senior:       { color: '#A855F7', label: 'Senior',       videos: 120, destacados: 10 },
};

export default function AgentDashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [subscription, setSub] = useState(null);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({ views: 0, contacts: 0, publicadas: 0 });
  const [comisiones, setComisiones] = useState({ pendiente: 0, pagado: 0, operaciones: 0 });
  const [red, setRed] = useState({ total: 0, directos: 0, codigo: '' });

  useEffect(() => { loadAll() }, []);

  const loadAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUser(user);

    const [{ data: userData }, { data: sub }, { data: props }] = await Promise.all([
      supabase.from('users').select('full_name, avatar_url').eq('id', user.id).single(),
      supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('estado', 'activo').maybeSingle(),
      supabase.from('properties').select('id, title, price, neighborhood, city, views, contacts, status').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    ]);

    if (userData) setUser(u => ({ ...u, ...userData }));
    setSub(sub);
    setProperties(props || []);

    const totalViews    = (props || []).reduce((a, p) => a + (p.views    || 0), 0);
    const totalContacts = (props || []).reduce((a, p) => a + (p.contacts || 0), 0);
    const publicadas    = (props || []).filter(p => p.status === 'active').length;
    setStats({ views: totalViews, contacts: totalContacts, publicadas });

    // Comisiones
    const { data: comData } = await supabase
      .from('red_comisiones')
      .select('monto, estado')
      .eq('beneficiario_id', user.id)

    if (comData) {
      const pendiente = comData.filter(c => c.estado === 'pendiente').reduce((a, c) => a + Number(c.monto), 0)
      const pagado = comData.filter(c => c.estado === 'pagado').reduce((a, c) => a + Number(c.monto), 0)
      setComisiones({ pendiente, pagado, operaciones: comData.length })
    }

    // Red
    const { data: redData } = await supabase
      .from('users')
      .select('id')
      .eq('referido_por', user.id)

    const { data: agenteData } = await supabase
      .from('agentes')
      .select('codigo_referido')
      .eq('user_id', user.id)
      .maybeSingle()

    setRed({
      total: redData?.length || 0,
      directos: redData?.length || 0,
      codigo: agenteData?.codigo_referido || '',
    })

    setLoading(false);
  };

  const f = (n) => Number(n || 0).toLocaleString('es-AR');
  const planKey  = subscription?.plan || null;
  const planConf = planKey ? PLAN_CONFIG[planKey] : null;

  const diasRestantes = () => {
    if (!subscription?.fecha_vencimiento) return null;
    const diff = new Date(subscription.fecha_vencimiento) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) return (
    <div style={{ background: '#0a0a0a', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Cargando...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', paddingBottom: 100 }}>

      <div style={{ padding: '52px 20px 20px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>
          Hola{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋
        </h1>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* PLAN CARD */}
        {planConf ? (
          <div style={{ background: `rgba(${planConf.color === '#94A3B8' ? '148,163,184' : planConf.color === '#F59E0B' ? '245,158,11' : planConf.color === '#2563EB' ? '37,99,235' : '168,85,247'},0.12)`, border: `1px solid ${planConf.color}40`, borderRadius: 18, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ background: planConf.color, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 800, color: '#fff' }}>Plan {planConf.label}</span>
                <p style={{ margin: '10px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  {diasRestantes() !== null ? `Vence en ${diasRestantes()} días` : 'Activo'}
                </p>
              </div>
              <button onClick={() => router.push('/planes')} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                Cambiar
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: planConf.color }}>{planConf.videos}</p>
                <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>videos activos</p>
              </div>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: planConf.color }}>{planConf.destacados}</p>
                <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>destacados/mes</p>
              </div>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: planConf.color }}>{stats.publicadas}</p>
                <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>publicadas</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '20px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>Sin plan activo</p>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Elegí un plan para empezar a publicar</p>
            <button onClick={() => router.push('/planes')} style={{ background: 'linear-gradient(135deg, #2563EB, #1d4ed8)', border: 'none', borderRadius: 12, padding: '12px 24px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              Ver planes
            </button>
          </div>
        )}

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '18px' }}>
            <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 900, color: '#2563EB' }}>{f(stats.views)}</p>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Vistas totales</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '18px' }}>
            <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 900, color: '#22C55E' }}>{f(stats.contacts)}</p>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Contactos</p>
          </div>
        </div>

        {/* ACCIONES RAPIDAS */}
        <div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 12px', fontWeight: 600 }}>ACCIONES RÁPIDAS</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Publicar propiedad', icon: '➕', path: '/publicar', color: '#2563EB' },
              { label: 'Ver mi canal',        icon: '📺', path: '/mi-canal', color: '#A855F7' },
              { label: 'Mis publicaciones',   icon: '🏠', path: '/mis-publicaciones', color: '#F59E0B' },
              { label: 'Estadísticas',        icon: '📊', path: '/mi-canal', color: '#22C55E' },
            ].map(a => (
              <button key={a.path + a.label} onClick={() => router.push(a.path)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 14px', textAlign: 'left', cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                <p style={{ margin: '0 0 6px', fontSize: 22 }}>{a.icon}</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#fff' }}>{a.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* PROPIEDADES RECIENTES */}
        {properties.length > 0 && (
          <div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 12px', fontWeight: 600 }}>MIS PROPIEDADES</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {properties.map(p => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{p.neighborhood}, {p.city}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#22C55E' }}>USD {f(p.price)}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: p.status === 'active' ? '#22C55E' : 'rgba(255,255,255,0.3)' }}>{p.status === 'active' ? 'Activa' : 'Inactiva'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMISIONES */}
        <div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 12px', fontWeight: 600 }}>MIS COMISIONES</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 16, padding: '18px' }}>
              <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 900, color: '#A855F7' }}>${comisiones.pendiente.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Pendiente de cobro</p>
            </div>
            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 16, padding: '18px' }}>
              <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 900, color: '#22C55E' }}>${comisiones.pagado.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Total cobrado</p>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px' }}>
            <p style={{ margin: '0 0 4px', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Operaciones totales</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#fff' }}>{comisiones.operaciones}</p>
          </div>
        </div>

        {/* RED */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 12px', fontWeight: 600 }}>MI RED</p>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 900, color: '#F59E0B' }}>{red.total}</p>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Agentes en tu red</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#fff' }}>{red.directos}</p>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Directos (nivel 1)</p>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Tu código de referido</p>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#F59E0B', letterSpacing: 2 }}>{red.codigo}</p>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(`Unite a ViviendaYa con mi código: ${red.codigo} https://vivienda-ya.vercel.app/registro?ref=${red.codigo}`); alert('Copiado!'); }} style={{ background: '#F59E0B', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                Compartir
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}