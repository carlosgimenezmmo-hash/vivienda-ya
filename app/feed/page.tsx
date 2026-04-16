"use client";
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useActiveProperty } from '@/lib/active-property-context';
import { AuthSheet } from '@/components/auth-sheet';
import { BuscarUsuarios } from '@/components/buscar-usuarios';

export default function ViviendaYaFull() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [comments, setComments] = useState<{ [key: number]: any[] }>({});
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [paused, setPaused] = useState<{ [key: number]: boolean }>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [channels, setChannels] = useState<{ [key: string]: string }>({});
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [showBuscarUsuarios, setShowBuscarUsuarios] = useState(false);
  const [authAction, setAuthAction] = useState('');
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const { isLoggedIn, user, likedProperties, savedProperties, toggleLike, toggleSave } = useAuth();
  const router = useRouter();
  const { setActiveProperty } = useActiveProperty();

  useEffect(() => {
    async function fetchProperties() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .not('video_url', 'is', null)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });
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
    async function fetchChannels() {
      const { data } = await supabase.from("channels").select("user_id, slug");
      if (data) {
        const map: { [key: string]: string } = {};
        data.forEach((c: any) => { map[c.user_id] = c.slug; });
        setChannels(map);
      }
    }
    fetchChannels();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            const index = videoRefs.current.indexOf(video);
            if (index !== -1) {
              setActiveIndex(index);
              const prop = properties[index];
              if (prop) {
                setActiveProperty({ id: prop.id, title: prop.title, whatsapp_number: prop.whatsapp_number });
                // Sumar vista
                supabase.from("properties").update({ views: (prop.views || 0) + 1 }).eq("id", prop.id).then(() => {
                  setProperties(prev => prev.map(p => p.id === prop.id ? { ...p, views: (p.views || 0) + 1 } : p))
                })
              }
            }
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


  const sendComment = async (propertyId: number) => {
    if (!commentText.trim()) return;
    setSendingComment(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData?.session?.user?.id;
    if (!uid) { setSendingComment(false); return; }
    const { data, error } = await supabase.from("comments").insert({
      property_id: propertyId,
      user_id: uid,
      user_name: sessionData?.session?.user?.user_metadata?.nombre || "Usuario",
      content: commentText.trim(),
    }).select().single();
    if (!error && data) {
      setComments(prev => ({ ...prev, [propertyId]: [...(prev[propertyId] || []), data] }));
      setCommentText("");
    } else if (error) { alert("Error: " + error.message); }
    setSendingComment(false);
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






  const handleShare = (title: string) => {
    if (navigator.share) {
      navigator.share({ title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  };

  const requireLogin = (action: () => void, actionLabel?: string) => {
    if (!isLoggedIn) {
      setAuthAction(actionLabel || '');
      setShowAuthSheet(true);
    } else {
      action();
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

  if (loading) return (
    <div style={{ background: '#0a0a0a', height: '100vh', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Vivienda<span style={{ color: '#22C55E' }}>Ya</span></p>
        <p style={{ color: '#555', marginTop: 8, fontSize: 13 }}>Cargando propiedades...</p>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#000', height: '100dvh', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', overflow: 'hidden' }}>
      <div style={{ height: '100dvh', overflowY: 'scroll', scrollSnapType: 'y mandatory' }}>
        {properties.length === 0 ? (
          <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <p style={{ fontSize: 15, color: '#888' }}>No hay propiedades disponibles</p>
            <button onClick={() => window.location.reload()} style={{ color: '#22C55E', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, marginTop: 12 }}>Reintentar</button>
          </div>
        ) : (
          properties.map((p, i) => (
            <section key={p.id} style={{ height: '100dvh', scrollSnapAlign: 'start', position: 'relative', overflow: 'hidden', background: '#000' }}>

              <video
                ref={(el) => { if (el) videoRefs.current[i] = el; }}
                src={p.video_url}
                autoPlay loop muted playsInline
                onClick={() => togglePause(i, p.id)}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
              />

              {paused[p.id] && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.45)', borderRadius: '50%', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 15, pointerEvents: 'none' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><rect x="5" y="3" width="4" height="18" rx="1.5"/><rect x="15" y="3" width="4" height="18" rx="1.5"/></svg>
                </div>
              )}

              <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '75%', background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.75) 100%)', pointerEvents: 'none', zIndex: 5 }} />

              <div style={{ position: 'absolute', top: 0, width: '100%', zIndex: 20, padding: '52px 16px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box', background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)' }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>Vivienda<span style={{ color: '#22C55E' }}>Ya</span></span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {p.highlighted && <span style={{ background: 'rgba(245,158,11,0.9)', color: '#fff', padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>DESTACADO</span>}
                </div>
              </div>

              <div style={{ position: 'absolute', right: 14, bottom: 100, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                <button onClick={() => requireLogin(() => toggleLike(String(p.id)), 'dar like')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 0 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill={likedProperties.has(String(p.id)) ? '#EF4444' : 'none'} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{p.likes || 0}</span>
                </button>

                <button onClick={() => requireLogin(() => { const newId = showComments === p.id ? null : p.id; setShowComments(newId); if (newId && !comments[newId]) fetchComments(newId); }, 'chatear')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 0 }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>Chat</span>
                </button>

                <button onClick={() => requireLogin(async () => {
                  const { data: sessionData } = await supabase.auth.getSession();
                  const uid = sessionData?.session?.user?.id || user?.id;
                  if (!uid) return;
                  const isSaved = savedProperties.has(String(p.id));
                  if (isSaved) {
                    await supabase.from("saved_properties").delete().eq("user_id", uid).eq("property_id", p.id);
                  } else {
                    await supabase.from("saved_properties").insert({ user_id: uid, property_id: p.id });
                  }
                  toggleSave(String(p.id));
                }, 'guardar propiedades')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 0 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill={savedProperties.has(String(p.id)) ? 'white' : 'none'} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>Guardar</span>
                </button>

                <button onClick={() => setShowBuscarUsuarios(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 0 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>Buscar</span>
                </button>

                <button onClick={() => handleShare(p.title)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 0 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>Compartir</span>
                </button>
              </div>

              <div style={{ position: 'absolute', bottom: 90, left: 16, right: 80, zIndex: 10, color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#333', border: '2px solid rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, overflow: 'hidden' }}>
                    {p.owner_avatar ? <img src={p.owner_avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 18 }}>U</span>}
                  </div>
                  <div onClick={() => { const slug = channels[p.user_id]; if (slug) router.push(`/canal/${slug}`); }} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: channels[p.user_id] ? 'pointer' : 'default' }}>
                    <span style={{ fontWeight: 'bold', fontSize: 15, color: '#fff' }}>{p.owner_name || 'Propietario'}</span>
                    {channels[p.user_id] && <span style={{ background: '#2563EB', borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 700, color: '#fff' }}>CANAL</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ background: getBadgeColor(p.operation_type), color: '#fff', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{p.operation_type?.toUpperCase() || 'VENTA'}</span>
                  {p.verified && (
                    <span style={{ background: 'rgba(16,185,129,0.9)', color: '#fff', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      GPS
                    </span>
                  )}
                  {!p.verified && (
                    <span style={{ background: "rgba(245,158,11,0.8)", color: "#fff", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      Sin verificar
                    </span>
                  )}
                </div>
                <p onClick={() => setShowDetails(showDetails === p.id ? null : p.id)} style={{ margin: '8px 0 0 0', fontSize: 13, color: '#22C55E', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                  Ver detalles
                </p>
              </div>

              {showDetails === p.id && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40, background: 'rgba(10,10,10,0.97)', borderRadius: '24px 24px 0 0', padding: '20px 20px 100px', maxHeight: '70vh', overflowY: 'auto', backdropFilter: 'blur(20px)' }}>
                  <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', margin: '0 auto 20px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#fff' }}>{p.title || 'Propiedad'}</h2>
                      <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{[p.neighborhood, p.city].filter(Boolean).join(", ")}</p>
                    </div>
                    <button onClick={() => setShowDetails(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
                  </div>
                  <p style={{ margin: '0 0 16px', fontSize: 28, fontWeight: 800, color: '#fff' }}>USD {Number(p.price)?.toLocaleString()}</p>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' as const }}>
                    {p.rooms && <span style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', color: '#fff', fontSize: 13 }}>{p.rooms} ambientes</span>}
                    {p.bedrooms && <span style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', color: '#fff', fontSize: 13 }}>{p.bedrooms} dorm.</span>}
                    {p.bathrooms && <span style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', color: '#fff', fontSize: 13 }}>{p.bathrooms} banos</span>}
                    {p.surface && <span style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', color: '#fff', fontSize: 13 }}>{p.surface} m2</span>}
                  </div>
                  {p.description && <p style={{ margin: '0 0 16px', fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{p.description}</p>}
                  {p.lat && p.lng && (
                    <div style={{ marginBottom: 16, borderRadius: 14, overflow: 'hidden' }}>
                      <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${p.lng - 0.005},${p.lat - 0.005},${p.lng + 0.005},${p.lat + 0.005}&layer=mapnik&marker=${p.lat},${p.lng}`} style={{ width: '100%', height: 180, border: 'none' }} />
                    </div>
                  )}
                  <button onClick={() => requireLogin(() => {
                    const clean = p.whatsapp_number?.replace(/\D/g, "");
                    const msg = "Hola! Vi tu propiedad en ViviendaYa y me interesa. Podes darme mas info?";
                    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, "_blank");
                    supabase.from("properties").update({ contacts: (p.contacts || 0) + 1 }).eq("id", p.id).then(() => {
                      setProperties(prev => prev.map(prop => prop.id === p.id ? { ...prop, contacts: (prop.contacts || 0) + 1 } : prop))
                    })
                  }, "contactar")} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "#25D366", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    Contactar por WhatsApp
                  </button>
                </div>
              )}
              {showComments === p.id && (
                <div style={{ position: 'absolute', bottom: 80, right: 0, width: '80%', maxHeight: '55vh', background: 'rgba(10,10,10,0.95)', borderRadius: '20px 0 0 20px', padding: 18, zIndex: 30, overflowY: 'auto', boxSizing: 'border-box', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Comentarios</span>
                    <button onClick={() => setShowComments(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 20 }}>X</button>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
                    {!comments[p.id] || comments[p.id].length === 0 ? (
                      <p style={{ color: '#555', fontSize: 13, textAlign: 'center', marginTop: 24 }}>No hay comentarios. Se el primero!</p>
                    ) : (
                      comments[p.id].map((c) => (
                        <div key={c.id} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', flexShrink: 0 }}>
                              {c.user_avatar ? <img src={c.user_avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (c.user_name?.[0] || 'U')}
                            </div>
                            <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{c.user_name || 'Usuario'}</span>
                            <span style={{ color: '#444', fontSize: 11 }}>{new Date(c.created_at).toLocaleDateString('es-AR')}</span>
                          </div>
                          <p style={{ margin: '0 0 0 36px', color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.4 }}>{c.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendComment(p.id)} placeholder="Escribi un comentario..." style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }} />
                    <button onClick={() => sendComment(p.id)} disabled={sendingComment} style={{ background: '#2563EB', border: 'none', borderRadius: 24, padding: '10px 16px', color: '#fff', cursor: 'pointer', fontSize: 16, opacity: sendingComment ? 0.5 : 1 }}>send</button>
                  </div>
                </div>
              )}

            </section>
          ))
        )}
      </div>
      {showBuscarUsuarios && <BuscarUsuarios onClose={() => setShowBuscarUsuarios(false)} />}
      <AuthSheet visible={showAuthSheet} onClose={() => setShowAuthSheet(false)} action={authAction} />
    </div>
  );
}
