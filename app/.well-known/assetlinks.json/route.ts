export async function GET() {
  const assetlinks = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "app.vercel.vivienda_ya.twa",
        sha256_cert_fingerprints: [
          "E5:4A:25:3A:0B:EA:46:10:3F:A3:41:63:FD:11:77:D8:2B:62:2F:A2:55:F8:BC:D9:52:33:11:24:F5:F8:18:6E"
        ]
      }
    }
  ];

  return new Response(JSON.stringify(assetlinks), {
    headers: { "Content-Type": "application/json" }
  });
}