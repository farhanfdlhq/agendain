"use client"

import { createContext, useContext } from "react"
import type { PermissionSubject } from "@/lib/permissions"

// Diisi layout dari /api/admin/me; halaman dan modal memakai izin yang sama.
// Penegakan akses tetap dilakukan oleh requirePermission di API.
export const AdminAccessContext = createContext<PermissionSubject | null>(null)
export const useAdminAccess = () => useContext(AdminAccessContext)
