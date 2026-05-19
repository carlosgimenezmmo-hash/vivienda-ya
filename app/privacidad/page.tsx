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
            contenido: `Carlos Alberto Gimenez, operador de ViviendaYa, con domicilio en Tres Arroyos, Provincia de Buenos Aires, República Argentina. Contacto: vivendayatresa@gmail.com.`
          },
          {
            titulo: "2. Datos que recopilamos",
            contenido: `Al registrarse y utilizar la Plataforma recopilamos: nombre completo, dirección de correo electrónico, número de teléfono, edad, provincia y ciudad de residencia, foto de perfil, videos e imágenes publicados, ubicación GPS al momento de grabar videos, datos de uso de la Plataforma y datos de pago (procesados por terceros, no almacenados por nosotros).`
          },
          {
            titulo: "3. Uso de los datos",
            contenido: `Los datos recopilados se utilizan para: identificar al usuario dentro de la Plataforma, mostrar publicaciones y perfiles a otros usuarios, verificar la ubicación de las propiedades publicadas, procesar pagos de suscripciones, mejorar el funcionamiento de la Plataforma y cumplir con obligaciones legales.`
          },
          {
            titulo: "4. Compartición de datos",
            contenido: `No vendemos ni cedemos datos personales a terceros con fines comerciales. Los datos pueden ser compartidos con: proveedores de servicios tecnológicos necesarios para el funcionamiento de la Plataforma (Supabase, Vercel, Google), procesadores de pago (MercadoPago) y autoridades competentes cuando sea requerido por ley.`
          },
          {
            titulo: "5. Datos de ubicación GPS",
            contenido: `La Plataforma solicita acceso a la ubicación del dispositivo al momento de grabar o publicar un video, con el único fin de verificar que la propiedad se encuentra donde se indica. Esta información se almacena asociada a la publicación y es visible para otros usuarios de la Plataforma.`
          },
          {
            titulo: "6. Almacenamiento y seguridad",
            contenido: `Los datos se almacenan en servidores seguros provistos por Supabase. Implementamos medidas de seguridad razonables para proteger la información, incluyendo cifrado y control de acceso. Sin embargo, ningún sistema es completamente infalible y no podemos garantizar la seguridad absoluta de los datos.`
          },
          {
            titulo: "7. Derechos del usuario",
            contenido: `De acuerdo con la Ley 25.326 de Protección de Datos Personales de Argentina, el usuario tiene derecho a: acceder a sus datos personales, rectificar datos incorrectos, solicitar la eliminación de sus datos, oponerse al tratamiento de sus datos. Para ejercer estos derechos escribir a: vivendayatresa@gmail.com.`
          },
          {
            titulo: "8. Retención de datos",
            contenido: `Los datos se conservan mientras la cuenta del usuario esté activa. Al eliminar la cuenta, los datos personales son eliminados en un plazo máximo de 30 días, excepto aquellos que deban conservarse por obligaciones legales.`
          },
          {
            titulo: "9. Cookies y tecnologías similares",
            contenido: `La Plataforma puede utilizar cookies y tecnologías similares para mantener la sesión del usuario y mejorar la experiencia de uso. El usuario puede configurar su navegador para rechazar cookies, aunque esto podría afectar el funcionamiento de la Plataforma.`
          },
          {
            titulo: "10. Menores de edad",
            contenido: `La Plataforma no está dirigida a menores de 18 años. No recopilamos intencionalmente datos de menores. Si detectamos que un usuario es menor de edad, procederemos a eliminar su cuenta y datos asociados.`
          },
          {
            titulo: "11. Modificaciones",
            contenido: `Esta Política de Privacidad puede modificarse en cualquier momento. Las modificaciones entrarán en vigencia desde su publicación en la Plataforma. El uso continuado del servicio implica la aceptación de la política actualizada.`
          },
          {
            titulo: "12. Contacto",
            contenido: `Para consultas sobre esta Política de Privacidad escribir a: vivendayatresa@gmail.com`
          },
        ].map((seccion, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 10px", color: "#fff" }}>{seccion.titulo}</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, margin: 0, whiteSpace: "pre-line" }}>{seccion.contenido}</p>
          </div>
        ))}

        <div style={{ marginTop: 40, padding: 20, background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0, lineHeight: 1.6 }}>
            Carlos Alberto Gimenez — ViviendaYa — Tres Arroyos, Buenos Aires, Argentina — vivendayatresa@gmail.com
          </p>
        </div>

      </div>
    </div>
  )
}