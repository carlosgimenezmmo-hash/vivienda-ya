export async function register() {
  try {
    if (process.env.BETTERSTACK_TOKEN) {
      const { log } = await import("@logtail/next")
      log.info("App iniciada")
    }
  } catch (err) {
    console.error("Logtail error:", err)
  }
}
