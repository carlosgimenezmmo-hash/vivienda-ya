export async function register() {
  const { Logtail } = await import("@logtail/next")
  const logtail = new Logtail(process.env.BETTERSTACK_TOKEN!)
  logtail.info("App iniciada")
  await logtail.flush()
}