"use client"
import { useRouter } from "next/navigation"

export default function PrivacidadPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", padding: "52px 24px 80px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer", padding: "0 0 24px", fontFamily: "sans-serif" }}>
          ← Volver
        </button>

        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px" }}>Política de Privacidad</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 40px" }}>Última actualización: mayo de 2026</p>

        {[
          {
            titulo: "1. Responsable del tratamiento de datos",
            contenido: `El responsable del tratamiento de los datos personales recopilados a través de ViviendaYa es Carlos Alberto Gimenez, con domicilio en la ciudad de Tres Arroyos, Provincia de Buenos Aires, República Argentina. Contacto: viviendayatresa@gmail.com`
          },
          {
            titulo: "2. Datos que recopilamos",
            contenido: `Al usar ViviendaYa podemos recopilar los siguientes datos:\n\n• Datos de registro: nombre, dirección de email, foto de perfil (si utilizás Google para registrarte).\n• Datos de publicaciones: videos, imágenes, descripciones, precios y ubicación GPS de las propiedades publicadas.\n• Datos de uso: páginas visitadas, propiedades vistas, interacciones con el contenido.\n• Datos de contacto: número de WhatsApp ingresado voluntariamente para recibir consultas.\n• Datos de pago: procesados exclusivamente por MercadoPago. ViviendaYa no almacena datos de tarjetas de crédito ni débito.`
          },
          {
            titulo: "3. Finalidad del tratamiento",
            contenido: `Los datos recopilados se utilizan para:\n\n• Proveer y mejorar el servicio de la Plataforma.\n• Permitir la publicación y búsqueda de propiedades.\n• Gestionar reservas y pagos.\n• Enviar notificaciones relacionadas con el uso del servicio.\n• Cumplir con obligaciones legales.\n\nNo vendemos ni cedemos datos personales a terceros con fines comerciales.`
          },
          {
            titulo: "4. Ubicación GPS",
            contenido: `La Plataforma solicita acceso a la ubicación GPS del dispositivo únicamente al momento de grabar un video de una propiedad. Esta información se utiliza exclusivamente para mostrar la ubicación aproximada de la propiedad en el mapa y verificar que el video fue grabado en el lugar indicado. El usuario puede publicar sin GPS, en cuyo caso la propiedad se mostrará como "no verificada".`
          },
          {
            titulo: "5. Acceso a la cámara",
            contenido: `La Plataforma solicita acceso a la cámara del dispositivo únicamente para grabar videos de propiedades. No se graba ni almacena ningún contenido sin la acción explícita del usuario. El usuario puede optar por subir videos desde su galería sin usar la cámara.`
          },
          {
            titulo: "6. Almacenamiento de datos",
            contenido: `Los datos se almacenan en servidores seguros provistos por Supabase (base de datos) y Vercel (infraestructura). Ambos proveedores cumplen con estándares internacionales de seguridad. Los videos se almacenan en Supabase Storage.`
          },
          {
            titulo: "7. Derechos del usuario",
            contenido: `El usuario tiene derecho a:\n\n• Acceder a sus datos personales almacenados en la Plataforma.\n• Rectificar datos inexactos o incompletos.\n• Solicitar la eliminación de su cuenta y datos asociados.\n• Oponerse al tratamiento de sus datos.\n\nPara ejercer cualquiera de estos derechos, el usuario puede escribir a viviendayatresa@gmail.com indicando su solicitud.`
          },
          {
            titulo: "8. Eliminación de cuenta",
            contenido: `El usuario puede solicitar la eliminación de su cuenta y todos sus datos personales en cualquier momento escribiendo a viviendayatresa@gmail.com con el asunto "Eliminar cuenta". La solicitud será procesada dentro de los 30 días hábiles.`
          },
          {
            titulo: "9. Cookies y tecnologías de seguimiento",
            contenido: `La Plataforma puede utilizar cookies y tecnologías similares para mejorar la experiencia del usuario, recordar preferencias y analizar el uso del servicio. El usuario puede configurar su navegador para rechazar cookies, aunque esto podría afectar el funcionamiento de algunas funcionalidades.`
          },
          {
            titulo: "10. Servicios de terceros",
            contenido: `La Plataforma utiliza los siguientes servicios de terceros que tienen sus propias políticas de privacidad:\n\n• Google (autenticación)\n• MercadoPago (procesamiento de pagos)\n• Supabase (almacenamiento de datos)\n• Vercel (infraestructura)\n• Resend (envío de emails)\n\nRecomendamos leer las políticas de privacidad de cada uno de estos servicios.`
          },
          {
            titulo: "11. Menores de edad",
            contenido: `ViviendaYa no está dirigida a menores de 18 años. No recopilamos intencionalmente datos de menores. Si detectamos que un menor ha proporcionado datos personales, procederemos a eliminarlos de inmediato.`
          },
          {
            titulo: "12. Cambios en la política",
            contenido: `ViviendaYa se reserva el derecho de modificar esta Política de Privacidad en cualquier momento. Los cambios serán notificados a través de la Plataforma. El uso continuado del servicio luego de la notificación implica la aceptación de los cambios.`
          },
          {
            titulo: "13. Contacto",
            contenido: `Para consultas sobre esta Política de Privacidad escribinos a: viviendayatresa@gmail.com`
          },
        ].map((seccion, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 10px", color: "#fff" }}>{seccion.titulo}</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, margin: 0, whiteSpace: "pre-line" }}>{seccion.contenido}</p>
          </div>
        ))}

        <div style={{ marginTop: 40, padding: 20, background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0, lineHeight: 1.6 }}>
            Carlos Alberto Gimenez — ViviendaYa — Tres Arroyos, Buenos Aires, Argentina — viviendayatresa@gmail.com
          </p>
        </div>

      </div>
    </div>
  )
}