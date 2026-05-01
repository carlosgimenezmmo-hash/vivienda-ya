export async function register() {
  const { Logtail } = await import("@logtail/node")
  const logtail = new Logtail(process.env.BETTERSTACK_TOKEN!)
  logtail.info("App iniciada")
  logtail.flush()
}