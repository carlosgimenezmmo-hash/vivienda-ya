"use client"

import { useRouter } from "next/navigation"

export default function TerminosPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", padding: "52px 24px 80px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer", padding: "0 0 24px", fontFamily: "sans-serif" }}>
          ← Volver
        </button>

        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px" }}>Términos y Condiciones</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 40px" }}>Última actualización: mayo de 2026</p>

        {[
          {
            titulo: "1. Aceptación de los términos",
            contenido: `Al registrarse, acceder o utilizar ViviendaYa (en adelante "la Plataforma"), el usuario acepta en forma plena e incondicional los presentes Términos y Condiciones. Si no está de acuerdo con alguna de las disposiciones aquí establecidas, deberá abstenerse de utilizar la Plataforma. El uso continuado de la Plataforma implica la aceptación de cualquier modificación que pudiera realizarse a estos términos.`
          },
          {
            titulo: "2. Titular del servicio",
            contenido: `La Plataforma es operada por Carlos Alberto Gimenez, con domicilio en la ciudad de Tres Arroyos, Provincia de Buenos Aires, República Argentina. Contacto: viviendayatresa@gmail.com.`
          },
          {
            titulo: "3. Descripción del servicio",
            contenido: `ViviendaYa es una plataforma digital de anuncios inmobiliarios que permite a los usuarios publicar, buscar y contactar propiedades mediante video. La Plataforma actúa exclusivamente como intermediario tecnológico entre usuarios, sin intervenir en las negociaciones, operaciones, acuerdos o transacciones que pudieran realizarse entre las partes.`
          },
          {
            titulo: "4. Exención de responsabilidad por contenidos publicados",
            contenido: `ViviendaYa no es responsable por la veracidad, exactitud, legalidad, licitud, calidad ni integridad de los contenidos publicados por los usuarios. Cada usuario es el único y exclusivo responsable de las publicaciones que realice, incluyendo pero no limitándose a: descripciones, precios, imágenes, videos, ubicaciones y cualquier otra información asociada a las propiedades anunciadas.\n\nLa Plataforma no garantiza que las propiedades publicadas existan, estén disponibles, correspondan a las descripciones indicadas ni que sus titulares tengan capacidad legal para disponer de ellas. El usuario que contacta una propiedad lo hace bajo su exclusiva responsabilidad.`
          },
          {
            titulo: "5. Exención de responsabilidad por operaciones entre usuarios",
            contenido: `ViviendaYa no es parte de ninguna operación inmobiliaria que se realice entre usuarios de la Plataforma. No garantiza la conclusión de ninguna operación ni se responsabiliza por incumplimientos, fraudes, engaños, vicios ocultos, problemas de titularidad, deudas, gravámenes ni ningún otro inconveniente que pudiera surgir de la relación entre usuarios.\n\nEl usuario libera expresamente a ViviendaYa, sus operadores, empleados y colaboradores de cualquier reclamo, demanda o acción legal derivada de operaciones realizadas a través de la Plataforma.`
          },
          {
            titulo: "6. Exención de responsabilidad por contenido audiovisual",
            contenido: `Los videos publicados en la Plataforma son responsabilidad exclusiva de quien los sube. ViviendaYa no verifica el contenido de los videos más allá de los controles técnicos de ubicación GPS. La Plataforma se reserva el derecho de eliminar cualquier contenido que considere inapropiado, sin necesidad de justificación previa.`
          },
          {
            titulo: "7. Requisitos para el uso",
            contenido: `Para utilizar la Plataforma el usuario debe: (a) ser mayor de 18 años de edad; (b) tener capacidad legal para celebrar contratos; (c) proporcionar información veraz al momento del registro. Al aceptar estos términos, el usuario declara bajo juramento que cumple con todos los requisitos mencionados. ViviendaYa no se responsabiliza por el uso de la Plataforma por parte de menores de edad que hubieran proporcionado información falsa.`
          },
          {
            titulo: "8. Planes y suscripciones",
            contenido: `La Plataforma ofrece planes de suscripción pagos que otorgan acceso a funcionalidades adicionales. Los precios están expresados en pesos argentinos (ARS) y pueden modificarse sin previo aviso. El pago de un plan no garantiza resultados comerciales ni la concreción de operaciones inmobiliarias. No se realizan reembolsos salvo disposición legal en contrario.`
          },
          {
            titulo: "9. Propiedad intelectual",
            contenido: `El nombre, logo, diseño y código de ViviendaYa son propiedad de Carlos Alberto Gimenez. Los contenidos publicados por los usuarios (fotos, videos, textos) son propiedad de sus respectivos autores. Al publicar contenido en la Plataforma, el usuario otorga a ViviendaYa una licencia no exclusiva, gratuita y mundial para mostrar dicho contenido dentro de la Plataforma.`
          },
          {
            titulo: "10. Modificaciones y cancelación del servicio",
            contenido: `ViviendaYa se reserva el derecho de modificar, suspender o interrumpir el servicio en cualquier momento, con o sin previo aviso, sin que ello genere derecho a indemnización alguna a favor del usuario. Asimismo, podrá dar de baja cuentas de usuarios que incumplan estos términos.`
          },
          {
            titulo: "11. Ley aplicable y jurisdicción",
            contenido: `Los presentes Términos y Condiciones se rigen por las leyes de la República Argentina. Ante cualquier controversia, las partes se someten a la jurisdicción de los tribunales ordinarios de la ciudad de Tres Arroyos, Provincia de Buenos Aires, renunciando a cualquier otro fuero que pudiera corresponder.`
          },
          {
            titulo: "12. Contacto",
            contenido: `Para consultas sobre estos Términos y Condiciones podés escribirnos a: viviendayatresa@gmail.com`
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