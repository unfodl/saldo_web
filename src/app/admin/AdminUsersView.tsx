"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AddUserForm } from "./AddUserForm";

export type UserRow = {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
};

export function AdminUsersView({ operators }: { operators: UserRow[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-forest">Usuarios</h2>
        <Button onClick={() => setOpen(true)}>Agregar usuario</Button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-forest/8">
        <table className="w-full text-left text-sm">
          <thead className="bg-forest/5 text-ink-3">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Apellido</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {operators.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-4">
                  Todavía no hay usuarios.
                </td>
              </tr>
            ) : (
              operators.map((op) => (
                <tr key={op.emailAddress} className="border-t border-forest/8">
                  <td className="px-4 py-3 text-forest">{op.firstName || "—"}</td>
                  <td className="px-4 py-3 text-forest">{op.lastName || "—"}</td>
                  <td className="px-4 py-3 text-ink-3">{op.emailAddress}</td>
                  <td className="px-4 py-3 text-ink-3">{op.phoneNumber || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Agregar usuario">
        <AddUserForm
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </>
  );
}
