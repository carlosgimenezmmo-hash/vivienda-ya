"use client"

import { useRouter } from "next/navigation"
import { BuscarUsuarios } from "@/components/buscar-usuarios"

export default function BuscarUsuariosPage() {
  const router = useRouter()
  return <BuscarUsuarios onClose={() => router.back()} />
}