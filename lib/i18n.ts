// simple i18n helper

export type Locale = "es" | "pt" | "en"

// sample translations used in modal etc.
const messages: Record<Locale, Record<string, string>> = {
  es: {
    protectedMessage:
      "Para interactuar con la comunidad y realizar transacciones, debes registrarte y verificar tu identidad",
    register: "Registrarse",
    close: "Cerrar",
  },
  pt: {
    protectedMessage:
      "Para interagir com a comunidade e realizar transações, você deve se registrar e verificar sua identidade",
    register: "Registrar",
    close: "Fechar",
  },
  en: {
    protectedMessage:
      "To interact with the community and perform transactions, you must register and verify your identity",
    register: "Sign up",
    close: "Close",
  },
}

let current: Locale = "es"

export function setLocale(locale: Locale) {
  current = locale
}

export function t(key: string): string {
  return messages[current]?.[key] || key
}

export const translations = {
  es: {
    auth_required: "Identidad requerida",
    auth_message:
      "Para comprar créditos o publicar, debes verificar tu identidad (+18).",
    btn_register: "Registrarse ahora",
    btn_login: "Iniciar sesión",
    verifying_dni: "Escaneando DNI...",
    under_age_error: "Debes ser mayor de 18 años para registrarte.",
    buy_credits: "Comprar Créditos",
  },
  pt: {
    auth_required: "Identidade necessária",
    auth_message:
      "Para comprar créditos ou publicar, você deve verificar sua identidade (+18).",
    btn_register: "Registrar agora",
    btn_login: "Entrar",
    verifying_dni: "Digitalizando RG...",
    under_age_error: "Você deve ter mais de 18 anos para se registrar.",
    buy_credits: "Comprar Créditos",
  },
}
