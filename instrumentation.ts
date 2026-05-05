export async function register() {
  try {
    if (process.env.BETTERSTACK_TOKEN) {
      const { Logtail } = await import("@logtail/next")
      const logtail = new Logtail(process.env.BETTERSTACK_TOKEN)
      logtail.info("App iniciada")
      await logtail.flush()
    }
  } catch (err) {
    console.error("Logtail error:", err)
  }
}