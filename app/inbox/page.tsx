"use client";
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Property {
  id: number;
  title: string;
  price: number;
  surface: number;
  rooms: number;
  bedrooms: number;
  neighborhood: string;
  city: string;
  operation_type: string;
  property_type: string;
  video_url: string;
  whatsapp_number: string;
  verified: boolean;
  likes: number;
}

export default function Page() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [liked, setLiked] = useState<{ [key: number]: boolean }>({});
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .not("video_url", "is", null);

      if (error) {
        console.error(error);
        return;
      }
      setProperties((data as Property[]) || []);
    };
    fetchProperties();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play();
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [properties]);

  const handleLike = async (property: Property) => {
    const alreadyLiked = liked[property.id];
    const newLikes = alreadyLiked ? property.likes - 1 : property.likes + 1;

    setLiked((prev) => ({ ...prev, [property.id]: !alreadyLiked }));
    setProperties((prev) =>
      prev.map((p) => (p.id === property.id ? { ...p, likes: newLikes } : p))
    );

    await supabase.from("properties").update({ likes: newLikes }).eq("id", property.id);
  };

  const handleWhatsApp = (number: string, title: string) => {
    const msg = `Hola, vi tu propiedad "${title}" en ViviendaYa y me interesa. ¿Podés darme más info?`;
    const cleanNumber = number.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const getBadgeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "venta":
        return "#EF4444";
      case "alquiler":
        return "#2563EB";
      case "permuta":
        return "#10B981";
      case "temporario":
        return "#F97316";
      default:
        return "#6B7280";
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        backgroundColor: "#000",
      }}
    >
      {properties.map((property, i) => (
        <div
          key={property.id}
          style={{ height: "100vh", scrollSnapAlign: "start", position: "relative" }}
        >
          {/* VIDEO */}
          <video
            ref={(el) => {
              if (el) videoRefs.current[i] = el;
            }}
            src={property.video_url}
            muted
            loop
            playsInline
            autoPlay
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          {/* GRADIENTE inferior */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60%",
              background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
            }}
          />

          {/* HEADER */}
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              right: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#fff", fontWeight: "bold", fontSize: 22 }}>
              Vivienda<span style={{ color: "#22C55E" }}>Ya</span>
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              <span
                style={{
                  backgroundColor: "#F59E0B",
                  color: "#fff",
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                ⭐ DESTACADO
              </span>
              <span
                style={{
                  backgroundColor: "#22C55E",
                  color: "#fff",
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                94% MATCH
              </span>
            </div>
          </div>

          {/* INFO INFERIOR */}
          <div
            style={{
              position: "absolute",
              bottom: 80,
              left: 20,
              right: 80,
              color: "#fff",
            }}
          >
            {/* BADGES */}
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  backgroundColor: getBadgeColor(property.operation_type),
                  color: "#fff",
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                {property.operation_type || "—"}
              </span>
              <span
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                {property.property_type || "Propiedad"}
              </span>
            </div>

            <h3 style={{ fontSize: 26, margin: 0, fontWeight: 800 }}>{property.title}</h3>
            <p style={{ fontSize: 16, color: "#ccc", margin: "4px 0" }}>
              {property.neighborhood}, {property.city}
            </p>
            <p style={{ fontSize: 28, fontWeight: 900, margin: "8px 0" }}>
              ${property.price.toLocaleString()}
            </p>
            <p style={{ fontSize: 14, color: "#9CA3AF" }}>
              {property.surface} m² · {property.rooms} amb · {property.bedrooms} dorm
            </p>
          </div>

          {/* ACCIONES */}
          <div
            style={{
              position: "absolute",
              right: 20,
              bottom: 90,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              alignItems: "center",
            }}
          >
            <button
              onClick={() => handleLike(property)}
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                border: "none",
                background: liked[property.id] ? "#EF4444" : "rgba(255,255,255,0.12)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {liked[property.id] ? "❤️" : "🤍"}
            </button>
            <span style={{ color: "#fff", fontSize: 12 }}>{property.likes}</span>

            <button
              onClick={() => handleWhatsApp(property.whatsapp_number, property.title)}
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                border: "none",
                background: "#25D366",
                color: "#000",
                fontSize: 24,
                cursor: "pointer",
              }}
            >
              📞
            </button>

            <button
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                fontSize: 22,
                cursor: "pointer",
              }}
              onClick={() => navigator.share?.({
                title: property.title,
                text: "Mirá esta propiedad en ViviendaYa",
                url: window.location.href,
              })}
            >
              🚀
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
