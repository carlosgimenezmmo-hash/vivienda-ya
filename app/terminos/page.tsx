{/* Checkboxes obligatorios */}
<div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 4 }}>
  <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
    <input
      type="checkbox"
      checked={aceptaTerminos}
      onChange={e => setAceptaTerminos(e.target.checked)}
      style={{ width: 18, height: 18, marginTop: 2, accentColor: "#22C55E", flexShrink: 0 }}
    />
    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
      Acepto los{" "}
      <span onClick={() => window.open("/terminos", "_blank")} style={{ color: "#22C55E", cursor: "pointer", textDecoration: "underline" }}>Términos y Condiciones</span>
      {" "}y la{" "}
      <span onClick={() => window.open("/privacidad", "_blank")} style={{ color: "#22C55E", cursor: "pointer", textDecoration: "underline" }}>Política de Privacidad</span>
    </span>
  </label>

  <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
    <input
      type="checkbox"
      checked={aceptaMayorEdad}
      onChange={e => setAceptaMayorEdad(e.target.checked)}
      style={{ width: 18, height: 18, marginTop: 2, accentColor: "#22C55E", flexShrink: 0 }}
    />
    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
      Declaro que soy mayor de 18 años
    </span>
  </label>
</div>