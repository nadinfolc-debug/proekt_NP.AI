import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import {
  ADMIN_LOGIN,
  ADMIN_PASSWORD,
  deleteApplication,
  deleteProduct,
  getApplications,
  getProducts,
  isAdminAuthed,
  loginAdmin,
  logoutAdmin,
  saveProduct,
  subscribeStore,
  updateApplication,
  type Application,
  type Product,
} from "../lib/store";

type Tab = "apps" | "products";

const emptyProduct = {
  title: "",
  price: "по запросу",
  description: "",
  visible: true,
};

export function AdminPage() {
  const [authed, setAuthed] = useState(isAdminAuthed());
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("apps");
  const [apps, setApps] = useState<Application[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyProduct);

  useEffect(() => {
    const sync = () => {
      setApps(getApplications());
      setProducts(getProducts());
    };
    sync();
    return subscribeStore(sync);
  }, []);

  const editing = useMemo(
    () => products.find((item) => item.id === editingId) ?? null,
    [editingId, products],
  );

  useEffect(() => {
    if (!editing) return;
    setDraft({
      title: editing.title,
      price: editing.price,
      description: editing.description,
      visible: editing.visible,
    });
  }, [editing]);

  const onLogin = (event: FormEvent) => {
    event.preventDefault();
    if (!loginAdmin(login, password)) {
      setError("Неверный логин или пароль");
      return;
    }
    setError("");
    setLogin("");
    setPassword("");
    setAuthed(true);
  };

  const onLogout = () => {
    logoutAdmin();
    setAuthed(false);
  };

  const onSaveProduct = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.description.trim()) return;
    saveProduct({
      id: editingId ?? undefined,
      title: draft.title.trim(),
      price: draft.price.trim() || "по запросу",
      description: draft.description.trim(),
      visible: draft.visible,
    });
    setEditingId(null);
    setDraft(emptyProduct);
  };

  if (!authed) {
    return (
      <div className="page admin-page">
        <Seo title="Админка — NP.AI Prikolota" description="Вход в админ-панель." />
        <div className="container narrow">
          <h1>Админка</h1>
          <p className="lead">Вход только для владельца сайта.</p>
          <form className="admin-login" onSubmit={onLogin}>
            <label className="cta-field">
              <span className="cta-field-label">Логин</span>
              <input
                type="email"
                value={login}
                onChange={(event) => setLogin(event.target.value)}
                required
                autoComplete="username"
                placeholder="nadin@admin.com"
              />
            </label>
            <label className="cta-field">
              <span className="cta-field-label">Пароль</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            {error ? <p className="admin-error">{error}</p> : null}
            <button className="button button-accent" type="submit">
              Войти
            </button>
          </form>
          <p className="admin-hint">
            Логин: <code>{ADMIN_LOGIN}</code>
            <br />
            Пароль по умолчанию: <code>{ADMIN_PASSWORD}</code>
            <br />
            Сменить можно через <code>VITE_ADMIN_LOGIN</code> и{" "}
            <code>VITE_ADMIN_PASSWORD</code> в <code>.env</code>.
          </p>
          <p className="legal-back">
            <Link to="/">На сайт</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page admin-page">
      <Seo title="Админка — NP.AI Prikolota" description="Заявки и товары." />
      <div className="container">
        <div className="admin-top">
          <div>
            <p className="eyebrow">Кабинет</p>
            <h1>Админка</h1>
          </div>
          <div className="admin-top-actions">
            <Link className="cta-secondary" to="/">
              На сайт
            </Link>
            <button className="button" type="button" onClick={onLogout}>
              Выйти
            </button>
          </div>
        </div>

        <div className="admin-tabs" role="tablist" aria-label="Разделы админки">
          <button
            type="button"
            className={tab === "apps" ? "is-active" : ""}
            onClick={() => setTab("apps")}
          >
            Заявки ({apps.filter((item) => item.status === "new").length})
          </button>
          <button
            type="button"
            className={tab === "products" ? "is-active" : ""}
            onClick={() => setTab("products")}
          >
            Товары ({products.length})
          </button>
        </div>

        {tab === "apps" ? (
          <section className="admin-panel" aria-label="Заявки">
            {apps.length === 0 ? (
              <p className="lead">Пока нет заявок. Они появятся после отправки формы на сайте.</p>
            ) : (
              <ul className="admin-list">
                {apps.map((app) => (
                  <li key={app.id} className="admin-card">
                    <div className="admin-card-head">
                      <strong>{app.name}</strong>
                      <span className={app.status === "new" ? "admin-badge is-new" : "admin-badge"}>
                        {app.status === "new" ? "Новая" : "Готово"}
                      </span>
                    </div>
                    <p>
                      <span className="admin-label">Связь:</span> {app.contact}
                    </p>
                    <p>
                      <span className="admin-label">Задача:</span> {app.task}
                    </p>
                    <p className="admin-meta">{new Date(app.createdAt).toLocaleString("ru-RU")}</p>
                    <div className="admin-card-actions">
                      <button
                        type="button"
                        className="button"
                        onClick={() =>
                          updateApplication(app.id, {
                            status: app.status === "new" ? "done" : "new",
                          })
                        }
                      >
                        {app.status === "new" ? "Отметить готовой" : "Вернуть в новые"}
                      </button>
                      <button type="button" className="button" onClick={() => deleteApplication(app.id)}>
                        Удалить
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <section className="admin-panel" aria-label="Товары">
            <form className="admin-product-form" onSubmit={onSaveProduct}>
              <h2>{editingId ? "Редактировать товар" : "Добавить товар"}</h2>
              <label className="cta-field">
                <span className="cta-field-label">Название</span>
                <input
                  value={draft.title}
                  onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />
              </label>
              <label className="cta-field">
                <span className="cta-field-label">Цена</span>
                <input
                  value={draft.price}
                  onChange={(event) => setDraft((prev) => ({ ...prev, price: event.target.value }))}
                />
              </label>
              <label className="cta-field">
                <span className="cta-field-label">Описание</span>
                <textarea
                  rows={4}
                  value={draft.description}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, description: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={draft.visible}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, visible: event.target.checked }))
                  }
                />
                Показывать на сайте
              </label>
              <div className="admin-card-actions">
                <button className="button button-accent" type="submit">
                  {editingId ? "Сохранить" : "Добавить"}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    className="button"
                    onClick={() => {
                      setEditingId(null);
                      setDraft(emptyProduct);
                    }}
                  >
                    Отмена
                  </button>
                ) : null}
              </div>
            </form>

            <ul className="admin-list">
              {products.map((product) => (
                <li key={product.id} className="admin-card">
                  <div className="admin-card-head">
                    <strong>{product.title}</strong>
                    <span className="admin-badge">{product.visible ? "На сайте" : "Скрыт"}</span>
                  </div>
                  <p className="product-price">{product.price}</p>
                  <p>{product.description}</p>
                  <div className="admin-card-actions">
                    <button type="button" className="button" onClick={() => setEditingId(product.id)}>
                      Редактировать
                    </button>
                    <button type="button" className="button" onClick={() => deleteProduct(product.id)}>
                      Удалить
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
