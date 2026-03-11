"use client";
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function ViviendaYaFull() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState<number | null>(null);
  const [paused, setPaused] = useState<{ [key: number]: boolean }>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const { isLoggedIn, likedProperties, savedProperties, toggleLike, toggleSave } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchProperties() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .not('video_url', 'is', null);
        if (error) throw error;
        setProperties(data || []);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            const index = videoRefs.current.indexOf(video);
            if (index !== -1) setActiveIndex(index);
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.7 }
    );
    videoRefs.current.forEach((v) => { if (v) observer.observe(v); });
    return () => observer.disconnect();
  }, [properties]);

  const requireLogin = (action: () => void) => {
    if (!isLoggedIn) {
      router.push('/registro');
    } else {
      action();
    }
  };

  const togglePause = (i: number, id: number) => {
    const video = videoRefs.current[i];
    if (!video) return;
    if (video.paused) {
      video.play();
      setPaused(prev => ({ ...prev, [id]: false }));
    } else {
      video.pause();
      setPaused(prev => ({ ...prev, [id]: true }));
    }
  };

  const handleWhatsApp = (number: string, title: string) => {
    const clean = number?.replace(/\D/g, '');
    const msg = `Hola! Vi "${title}" en ViviendaYa y me interesa. ¿Podés darme más info?`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShare = (title: string) => {
    if (navigator.share) {
      navigator.share({ title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('¡Link copiado!');
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'venta': return '#EF4444';
      case 'alquiler': return '#2563EB';
      case 'permuta': return '#10B981';
      case 'temporario': return '#F97316';
      default: return '#6B7280';
    }
  };

  const activeProperty = properties[activeIndex];

  if (loading) return (
    <div style={{ background: '#000', height: '100vh', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Vivienda<span style={{ color: '#22C55E' }}>Ya</span></p>
        <p style={{ color: '#888', marginTop: 8 }}>Cargando propiedades...</p>
      </div>
    </div>
  );

  return (
 <div style={{ backgroundColor: 'transparent', height: '100vh', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      <div style={{ height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory' }}>
        {properties.length === 0 ? (
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <p>No hay propiedades disponibles</p>
            <button onClick={() => window.location.reload()} style={{ color: '#22C55E', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, marginTop: 10 }}>
              Reintentar
            </button>
          </div>
        ) : (
          properties.map((p, i) => (
            <section key={p.id} style={{ height: '100vh', scrollSnapAlign: 'start', position: 'relative', overflow: 'hidden' }}>

              {/* VIDEO */}
              <video
                ref={(el) => { if (el) videoRefs.current[i] = el; }}
                src={p.video_url}
                autoPlay loop muted playsInline
                onClick={() => togglePause(i, p.id)}
                style={{ position: 'absolute', top: 0, width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
              />

              {/* ICONO PAUSA */}
{paused[p.id] && (
  <div style={{
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(0,0,0,0.4)', borderRadius: '50%',
    width: 70, height: 70, display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 15, pointerEvents: 'none'
  }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
      <rect x="5" y="3" width="4" height="18" rx="1"/>
      <rect x="15" y="3" width="4" height="18" rx="1"/>
    </svg>
  </div>
)}

              {/* GRADIENTE */}
              <div style={{
                position: 'absolute', bottom: 0, width: '100%', height: '70%',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.35))',
                pointerEvents: 'none'
              }} />

              {/* HEADER */}
              <div style={{
                position: 'absolute', top: 0, width: '100%', zIndex: 20,
                padding: '16px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', boxSizing: 'border-box'
              }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>
                  Vivienda<span style={{ color: '#22C55E' }}>Ya</span>
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ background: '#F59E0B', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>⭐ DESTACADO</span>
                  <span style={{ background: '#22C55E', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>94% MATCH</span>
                </div>
              </div>

              {/* BOTONES DERECHA */}
              <div style={{
                position: 'absolute', right: 12, bottom: 160, zIndex: 20,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20
              }}>
                <div style={{ textAlign: 'center' }}>
                  <button onClick={() => requireLogin(() => toggleLike(String(p.id)))}
                    style={{ background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: 50, height: 50, fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ filter: likedProperties.has(String(p.id)) ? 'none' : 'grayscale(1)' }}>❤️</span>
                  </button>
                  <p style={{ color: '#fff', fontSize: 11, margin: '2px 0 0 0' }}>{p.likes || 0}</p>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button onClick={() => requireLogin(() => setShowComments(showComments === p.id ? null : p.id))}
                    style={{ background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: 50, height: 50, fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    💬
                  </button>
                  <p style={{ color: '#fff', fontSize: 11, margin: '2px 0 0 0' }}>Chat</p>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button onClick={() => requireLogin(() => toggleSave(String(p.id)))}
                    style={{ background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: 50, height: 50, fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ filter: savedProperties.has(String(p.id)) ? 'none' : 'grayscale(1)' }}>🔖</span>
                  </button>
                  <p style={{ color: '#fff', fontSize: 11, margin: '2px 0 0 0' }}>Guardar</p>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button onClick={() => handleShare(p.title)}
                    style={{ background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: 50, height: 50, fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    🔗
                  </button>
                  <p style={{ color: '#fff', fontSize: 11, margin: '2px 0 0 0' }}>Compartir</p>
                </div>
              </div>

              {/* INFO INFERIOR */}
              <div style={{ position: 'absolute', bottom: 80, left: 16, right: 70, zIndex: 10, color: '#fff' }}>

                {/* AVATAR + NOMBRE */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: '#444', border: '2px solid #fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                  }}>👤</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 'bold', fontSize: 15 }}>{p.owner_name || 'Propietario'}</span>
                    <span style={{ background: '#1d4ed8', borderRadius: 4, padding: '1px 6px', fontSize: 11 }}>☆</span>
                  </div>
                </div>

                {/* BADGES */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <span style={{ background: getBadgeColor(p.operation_type), color: '#fff', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 'bold' }}>
                    {p.operation_type?.toUpperCase() || 'VENTA'}
                  </span>
                  {p.verified && (
                    <span style={{ background: '#10B981', color: '#fff', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 'bold' }}>🛡️ GPS</span>
                  )}
                </div>

                <h3 style={{ margin: '0 0 4px 0', fontSize: 20, fontWeight: 'bold' }}>{p.title}</h3>
                <p style={{ margin: '0 0 4px 0', fontSize: 14, color: '#ddd' }}>
                  📍 {[p.neighborhood, p.city].filter(Boolean).join(', ') || p.location || 'Ubicación no disponible'}
                </p>
                <p style={{ margin: '0 0 4px 0', fontSize: 26, fontWeight: 'bold' }}>
                  USD {Number(p.price)?.toLocaleString() || 'Consultar'}
                </p>
                <p style={{ margin: 0, fontSize: 13, color: '#ccc' }}>
                  {[p.rooms ? `${p.rooms} amb.` : null, p.surface ? `${p.surface} m²` : null, p.bedrooms ? `${p.bedrooms} dorm.` : null].filter(Boolean).join(' · ')}
                </p>
                <p style={{ margin: '6px 0 0 0', fontSize: 13, color: '#22C55E', cursor: 'pointer' }}>↗ Ver detalles</p>
              </div>

              {/* PANEL COMENTARIOS */}
              {showComments === p.id && (
                <div style={{
                  position: 'absolute', bottom: 80, right: 0, width: '78%', maxHeight: '55vh',
                  background: 'rgba(0,0,0,0.88)', borderRadius: '16px 0 0 16px',
                  padding: 16, zIndex: 30, overflowY: 'auto', boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Comentarios</span>
                    <button onClick={() => setShowComments(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 18 }}>✕</button>
                  </div>
                  <p style={{ color: '#888', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
                    Todavía no hay comentarios. ¡Sé el primero!
                  </p>
                  <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                    <input placeholder="Escribí un comentario..."
                      style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid #444', borderRadius: 20, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' }}
                    />
                    <button style={{ background: '#2563EB', border: 'none', borderRadius: 20, padding: '8px 14px', color: '#fff', cursor: 'pointer', fontSize: 13 }}>↗</button>
                  </div>
                </div>
              
              )}

            </section>
          ))
        )}
      </div>
    </div>
  );
}

          