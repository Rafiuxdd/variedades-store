import { useMemo, useState } from "react";

const PANEL_PERMISSIONS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "orders", label: "Pedidos" },
  { key: "users", label: "Usuarios" },
  { key: "products", label: "Productos" },
  { key: "deliveryPoints", label: "Puntos de entrega" }
];

const EMPTY_PERMISSIONS = {
  dashboard: true,
  orders: false,
  users: false,
  products: true,
  deliveryPoints: false
};

const ADMIN_PERMISSIONS = {
  dashboard: true,
  orders: true,
  users: true,
  products: true,
  deliveryPoints: true
};

function AdminUsers({ users = [], addUser, updateUser, deleteUser, currentUser }) {
  const emptyForm = {
    id: null,
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    isActive: true,
    permissions: EMPTY_PERMISSIONS
  };

  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const canUsers = currentUser?.permissions?.users;

  const filteredUsers = useMemo(() => {
    const text = search.toLowerCase().trim();

    return users.filter((user) => {
      return (
        user.name?.toLowerCase().includes(text) ||
        user.email?.toLowerCase().includes(text) ||
        user.role?.toLowerCase().includes(text)
      );
    });
  }, [users, search]);

  if (!canUsers) {
    return (
      <div className="page admin-soft-page">
        <div className="admin-soft-card dark-card compact-dashboard-card">
          <h3>No tienes acceso</h3>
          <p>No cuentas con permisos para gestionar usuarios.</p>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setFormError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => {
      const nextForm = {
        ...prev,
        [name]: type === "checkbox" ? checked : value
      };

      if (name === "role" && value === "ADMIN") {
        nextForm.permissions = ADMIN_PERMISSIONS;
      }

      if (name === "role" && value === "EMPLOYEE") {
        nextForm.permissions = {
          ...prev.permissions,
          users: false
        };
      }

      return nextForm;
    });
  };

  const handlePermissionChange = (permissionKey) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionKey]: !prev.permissions?.[permissionKey]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanName = form.name.trim();
    const cleanEmail = form.email.trim().toLowerCase();
    const cleanPassword = form.password.trim();

    if (cleanName.length < 3) {
      setFormError("El nombre debe tener al menos 3 caracteres.");
      return;
    }

    if (!cleanEmail.includes("@")) {
      setFormError("Debes escribir un correo válido.");
      return;
    }

    if (!isEditing && cleanPassword.length < 4) {
      setFormError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    if (isEditing && cleanPassword && cleanPassword.length < 4) {
      setFormError("La nueva contraseña debe tener al menos 4 caracteres.");
      return;
    }

    const duplicateUser = users.find(
      (user) => user.email?.toLowerCase() === cleanEmail && user.id !== form.id
    );

    if (duplicateUser) {
      setFormError("Ese correo ya existe.");
      return;
    }

    const selectedPermissions = {
      dashboard: Boolean(form.permissions.dashboard),
      orders: Boolean(form.permissions.orders),
      users: Boolean(form.permissions.users),
      products: Boolean(form.permissions.products),
      deliveryPoints: Boolean(form.permissions.deliveryPoints)
    };

    if (form.role === "ADMIN") {
      Object.assign(selectedPermissions, ADMIN_PERMISSIONS);
    }

    const payload = {
      id: form.id,
      name: cleanName,
      email: cleanEmail,
      role: form.role,
      isActive: form.isActive,
      permissions: selectedPermissions
    };

    if (cleanPassword) {
      payload.password = cleanPassword;
    }

    try {
      setIsSaving(true);
      setFormError("");

      if (isEditing) {
        await updateUser(payload);
      } else {
        await addUser(payload);
      }

      resetForm();
    } catch (error) {
      setFormError(error.message || "No se pudo guardar el usuario.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (user) => {
    const role = user.role || "EMPLOYEE";

    setForm({
      id: user.id,
      name: user.name || user.username || "",
      email: user.email || "",
      password: "",
      role,
      isActive: user.isActive !== false,
      permissions: {
        ...(role === "ADMIN" ? ADMIN_PERMISSIONS : EMPTY_PERMISSIONS),
        ...(user.permissions || {})
      }
    });

    setIsEditing(true);
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatPermissions = (permissions = {}) => {
    const names = PANEL_PERMISSIONS.filter((item) => permissions[item.key]).map(
      (item) => item.label
    );

    return names.length > 0 ? names.join(", ") : "Sin permisos";
  };

  return (
    <div className="page admin-soft-page">
      <section className="admin-soft-header">
        <div>
          <span className="admin-soft-overline">Usuarios</span>
          <h2>Gestión de usuarios</h2>
          <p>Crea usuarios y decide a qué secciones del panel pueden entrar.</p>
        </div>

        <div className="admin-soft-user-pill">Total: {users.length}</div>
      </section>

      <div className="admin-soft-admin-layout">
        <section className="admin-soft-card light-card admin-soft-form-card">
          <div className="admin-soft-card-top">
            <span className="admin-soft-index">01</span>
            <span className="admin-soft-plus">{isEditing ? "✎" : "+"}</span>
          </div>

          <h3>{isEditing ? "Editar usuario" : "Nuevo usuario"}</h3>

          <form className="admin-soft-form" onSubmit={handleSubmit}>
            <label>Nombre</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ej: Empleado de productos"
            />

            <label>Correo</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Ej: empleado@tienda.com"
            />

            <label>
              Contraseña {isEditing ? "(dejar vacío si no la cambiarás)" : ""}
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={isEditing ? "Nueva contraseña opcional" : "Ej: empleado123"}
            />

            <label>Rol</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="ADMIN">Administrador</option>
              <option value="EMPLOYEE">Empleado</option>
            </select>

            <div className="admin-soft-permissions-box">
              <label>Permisos del panel</label>

              <div className="admin-soft-permissions-grid">
                {PANEL_PERMISSIONS.map((permission) => (
                  <label key={permission.key} className="admin-soft-check">
                    <input
                      type="checkbox"
                      checked={Boolean(form.permissions?.[permission.key])}
                      onChange={() => handlePermissionChange(permission.key)}
                      disabled={form.role === "ADMIN"}
                    />
                    {permission.label}
                  </label>
                ))}
              </div>

              {form.role === "ADMIN" ? (
                <small>El administrador siempre tiene acceso a todo el panel.</small>
              ) : null}
            </div>

            <label className="admin-soft-check">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />
              Usuario activo
            </label>

            {formError ? <p className="error-text">{formError}</p> : null}

            <div className="admin-soft-form-actions">
              <button type="submit" disabled={isSaving}>
                {isSaving
                  ? "Guardando..."
                  : isEditing
                  ? "Guardar cambios"
                  : "Crear usuario"}
              </button>

              {isEditing ? (
                <button type="button" className="secondary-btn" onClick={resetForm}>
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="admin-soft-card dark-card admin-soft-list-card">
          <div className="admin-soft-card-top">
            <span className="admin-soft-index">02</span>
            <span className="admin-soft-plus">⌕</span>
          </div>

          <h3>Usuarios creados</h3>

          <div className="admin-soft-search">
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-soft-list">
            {filteredUsers.map((user) => (
              <article key={user.id} className="admin-soft-list-item">
                <div className="admin-soft-list-info">
                  <h4>{user.name || user.username}</h4>
                  <p>{user.email}</p>
                  <small>
                    Rol: {user.role === "ADMIN" ? "Administrador" : "Empleado"}
                    {" · "}
                    Estado: {user.isActive ? "Activo" : "Inactivo"}
                  </small>
                  <small>Permisos: {formatPermissions(user.permissions)}</small>

                  {currentUser?.id === user.id ? (
                    <span className="self-badge">Tu cuenta</span>
                  ) : null}
                </div>

                <div className="admin-soft-list-actions">
                  <button type="button" onClick={() => handleEdit(user)}>
                    Editar
                  </button>

                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => deleteUser(user.id)}
                    disabled={currentUser?.id === user.id}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}

            {filteredUsers.length === 0 ? (
              <div className="admin-soft-empty-state">
                <p>No se encontraron usuarios.</p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminUsers;
