import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteUser, fetchUserDetails, fetchUserList } from "../../api/usersApi";
import { ApiError } from "../../api/httpClient";
import { useAdminAuth } from "../../auth/adminAuth";
import { ActionMenu } from "../../components/ActionMenu";
import { Button } from "../../components/Button";
import { Logo } from "../../components/Logo";
import { Modal } from "../../components/Modal";
import { AddUserForm } from "./AddUserForm";
import { EditUserForm } from "./EditUserForm";
import type { AppUser } from "../../types/user";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { token, logout } = useAdminAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AppUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [detailsUser, setDetailsUser] = useState<AppUser | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await fetchUserList(token);
      setUsers(list);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No pudimos obtener la lista de usuarios.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadUsers();
  }, [loadUsers]);

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  async function handleRowClick(user: AppUser) {
    if (!token) return;
    setDetailsUser(user);
    setDetailsError(null);
    setIsDetailsLoading(true);
    try {
      const details = await fetchUserDetails(user._id, token);
      setDetailsUser(details);
    } catch (err) {
      setDetailsError(err instanceof ApiError ? err.message : "No pudimos obtener el detalle del usuario.");
    } finally {
      setIsDetailsLoading(false);
    }
  }

  async function handleConfirmDelete() {
    if (!token || !deletingUser) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteUser(deletingUser._id, token);
      setDeletingUser(null);
      await loadUsers();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "No pudimos eliminar el usuario. Intenta de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between bg-forest px-8 py-4 text-cream">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <p className="text-sm font-semibold">Panel de administración</p>
        </div>
        <button type="button" onClick={handleLogout} className="text-sm text-cream/70 hover:text-amber">
          Cerrar sesión
        </button>
      </header>

      <main className="px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-forest">Usuarios</h2>
          <Button onClick={() => setIsAddOpen(true)}>Agregar usuario</Button>
        </div>

        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-forest/8">
          <table className="w-full text-left text-sm">
            <thead className="bg-forest/5 text-ink-3">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Apellido</th>
                <th className="px-4 py-3 font-medium">Correo</th>
                <th className="px-4 py-3 font-medium">Teléfono</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-ink-4">
                    Cargando…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-ink-4">
                    Todavía no hay usuarios.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    onClick={() => handleRowClick(user)}
                    className="cursor-pointer border-t border-forest/8 hover:bg-forest/5"
                  >
                    <td className="px-4 py-3 text-forest">{user.firstName || "—"}</td>
                    <td className="px-4 py-3 text-forest">{user.lastName || "—"}</td>
                    <td className="px-4 py-3 text-ink-3">{user.emailAddress}</td>
                    <td className="px-4 py-3 text-ink-3">{user.phoneNumber || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.status === "ACTIVE" ? "bg-forest/10 text-forest" : "bg-ink-4/10 text-ink-4"
                        }`}
                      >
                        {user.status === "ACTIVE" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ActionMenu
                        items={[
                          { label: "Editar", onSelect: () => setEditingUser(user) },
                          {
                            label: "Eliminar",
                            variant: "danger",
                            onSelect: () => {
                              setDeleteError(null);
                              setDeletingUser(user);
                            },
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} title="Agregar usuario">
        <AddUserForm
          onSuccess={() => {
            setIsAddOpen(false);
            loadUsers();
          }}
        />
      </Modal>

      <Modal open={editingUser !== null} onClose={() => setEditingUser(null)} title="Editar usuario">
        {editingUser ? (
          <EditUserForm
            user={editingUser}
            onSuccess={() => {
              setEditingUser(null);
              loadUsers();
            }}
          />
        ) : null}
      </Modal>

      <Modal
        open={deletingUser !== null}
        onClose={() => {
          if (isDeleting) return;
          setDeletingUser(null);
        }}
        title="Eliminar usuario"
      >
        {deletingUser ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-ink-3">
              ¿Seguro que quieres eliminar a <span className="font-medium text-forest">{deletingUser.emailAddress}</span>?
              Esta acción no se puede deshacer.
            </p>
            {deleteError ? <p className="text-sm text-red-600">{deleteError}</p> : null}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeletingUser(null)} disabled={isDeleting}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? "Eliminando…" : "Eliminar"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={detailsUser !== null} onClose={() => setDetailsUser(null)} title="Detalle del usuario">
        {isDetailsLoading ? (
          <p className="text-sm text-ink-4">Cargando…</p>
        ) : detailsError ? (
          <p className="text-sm text-red-600">{detailsError}</p>
        ) : detailsUser ? (
          <dl className="flex flex-col gap-3">
            <div>
              <dt className="text-xs font-medium uppercase text-ink-4">Nombre</dt>
              <dd className="text-forest">{detailsUser.firstName || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-ink-4">Apellido</dt>
              <dd className="text-forest">{detailsUser.lastName || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-ink-4">Correo</dt>
              <dd className="text-forest">{detailsUser.emailAddress}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-ink-4">Teléfono</dt>
              <dd className="text-forest">{detailsUser.phoneNumber || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-ink-4">Estado</dt>
              <dd className="text-forest">{detailsUser.status === "ACTIVE" ? "Activo" : "Inactivo"}</dd>
            </div>
          </dl>
        ) : null}
      </Modal>
    </div>
  );
}
