import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { applicationStatus, applicationStatuses, type ApplicationStatus } from "../data/applicationStatuses";
import {
  checkAdminSession,
  fetchApplications,
  isApiConfigured,
  loginAdmin,
  logoutAdmin,
  patchApplication,
  removeApplication,
  type Application,
} from "../lib/api";
import {
  deleteProduct,
  getProducts,
  saveProduct,
  subscribeStore,
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
  const [authed, setAuthed] = useState(false);
  const [booting, setBooting] = useState(true);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("apps");
  const [apps, setApps] = useState<Application[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyProduct);
  const [appsError, setAppsError] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const visibleApps = apps.filter((app) => statusFilter === "all" || app.status === statusFilter);

  const refreshApps = useCallback(async () => {
    try {
      const items = await fetchApplications();
      setApps(items);
      setAppsError("");
    } catch {
      setAppsError("Не удалось загрузить заявки с сервера.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isApiConfigured()) {
        if (!cancelled) {
          setBooting(false);
          setAuthed(false);
        }
        return;
      }
      const ok = await checkAdminSession();
      if (!cancelled) {
        setAuthed(ok);
        setBooting(false);
        if (ok) await refreshApps();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshApps]);

  useEffect(() => {
    const sync = () => setProducts(getProducts());
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

  const onLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (!isApiConfigured()) {
      setError("Сервер заявок не настроен (VITE_API_URL).");
      return;
    }
    const ok = await loginAdmin(login.trim(), password);
    if (!ok) {
      setError("Не удалось войти. Проверьте логин и пароль. После частых попыток подождите 15 минут.");
      return;
    }
    setError("");
    setLogin("");
    setPassword("");
    setAuthed(true);
    await refreshApps();
  };

  const onLogout = async () => {
    await logoutAdmin();
    setAuthed(false);
    setApps([]);
    setActionError("");
  };

  const changeStatus = async (app: Application, status: ApplicationStatus) => {
    setBusyId(app.id);
    setActionError("");
    try {
      const result = await patchApplication(app.id, status);
      if (!result.ok) {
        setActionError("Не удалось сохранить этап заявки. Проверьте соединение и попробуйте ещё раз.");
        return;
      }
      await refreshApps();
    } finally {
      setBusyId(null);
    }
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

  if (booting) {
    return (
      <div className="page admin-page">
        <Seo title="Кабинет — NP.AI Prikolota" description="Личный кабинет." />
        <div className="container narrow">
          <p className="lead">Проверка сессии…</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="page admin-page">
        <Seo title="Кабинет — NP.AI Prikolota" description="Вход в личный кабинет." />
        <div className="container narrow">
          <h1>Личный кабинет</h1>
          <p className="lead">Вход только для владельца сайта. Заявки хранятся на сервере в РФ.</p>
          <form className="admin-login" onSubmit={onLogin}>
            <label className="cta-field">
              <span className="cta-field-label">Логин</span>
              <input
                type="text"
                value={login}
                onChange={(event) => setLogin(event.target.value)}
                required
                autoComplete="username"
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
            Логин и пароль задаются в `server/.env` на вашем сервере. В код сайта они не попадают.
          </p>
          <p className="legal-back admin-legal">
            <Link to="/">На сайт</Link>
            <span aria-hidden="true"> · </span>
            <Link to="/privacy">Политика обработки ПДн</Link>
            <span aria-hidden="true"> · </span>
            <Link to="/consent">Согласие на обработку ПДн</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page admin-page">
      <Seo title="Кабинет — NP.AI Prikolota" description="Заявки и услуги." />
      <div className="container">
        <div className="admin-top">
          <div>
            <p className="eyebrow">Кабинет</p>
            <h1>{tab === "apps" ? "Заявки" : "Услуги"}</h1>
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
        <p className="legal-back admin-legal">
          <Link to="/privacy">Политика обработки ПДн</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/consent">Согласие на обработку ПДн</Link>
        </p>

        <div className="admin-tabs" role="tablist" aria-label="Разделы кабинета">
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
            Услуги ({products.length})
          </button>
        </div>

        {tab === "apps" ? (
          <section className="admin-panel" aria-label="Заявки">
            <div className="admin-workflow" aria-label="Этапы работы с заявками">
              {applicationStatuses.map((status, index) => (
                <button
                  type="button"
                  key={status.value}
                  className="admin-stage"
                  data-status={status.value}
                  aria-pressed={statusFilter === status.value}
                  onClick={() => setStatusFilter(status.value)}
                >
                  <span className="admin-stage-top"><span>{index + 1}</span><strong>{apps.filter((app) => app.status === status.value).length}</strong></span>
                  <span className="admin-stage-title">{status.title}</span>
                  <span className="admin-stage-description">{status.description}</span>
                </button>
              ))}
            </div>
            <div className="admin-app-toolbar">
              <button type="button" className="button" aria-pressed={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
                Все заявки ({apps.length})
              </button>
              <p aria-live="polite">{statusFilter === "all" ? "Все этапы" : applicationStatus(statusFilter).title} · {visibleApps.length}</p>
              <button type="button" className="button" onClick={refreshApps}>Обновить заявки</button>
            </div>
            {actionError ? <p className="admin-error" role="alert">{actionError}</p> : null}
            {appsError ? (
              <div role="alert">
                <p className="admin-error">{appsError}</p>
                <button className="button" type="button" onClick={refreshApps}>Повторить загрузку</button>
              </div>
            ) : null}
            {visibleApps.length === 0 && !appsError ? (
              <p className="lead">{apps.length === 0 ? "Пока нет заявок. Они появятся после отправки формы на сайте." : "На этом этапе пока нет заявок. Выберите другой этап или откройте все заявки."}</p>
            ) : (
              <ul className="admin-list">
                {visibleApps.map((app) => (
                  <li key={app.id} className="admin-card admin-application" data-status={app.status}>
                    <div className="admin-card-head">
                      <strong>
                        №{app.number} · {app.name}
                      </strong>
                      <span className="admin-badge admin-status-badge" data-status={app.status}>
                        {applicationStatus(app.status).title}
                      </span>
                    </div>
                    {app.service ? (
                      <p>
                        <span className="admin-label">Услуга:</span> {app.service}
                      </p>
                    ) : null}
                    <p>
                      <span className="admin-label">Связь:</span>{" "}
                      {app.contactMethod && app.contactHandle
                        ? `${app.contactMethod}: ${app.contactHandle}`
                        : app.contact}
                    </p>
                    <p>
                      <span className="admin-label">Задача:</span> {app.task}
                    </p>
                    <p className="admin-meta">{new Date(app.createdAt).toLocaleString("ru-RU")}</p>
                    <label className="admin-status-field">
                      <span>Этап работы</span>
                      <select value={app.status} disabled={busyId !== null} onChange={(event) => changeStatus(app, event.target.value as ApplicationStatus)}>
                        {applicationStatuses.map((status) => <option key={status.value} value={status.value}>{status.title}</option>)}
                      </select>
                      <small aria-live="polite">{busyId === app.id ? "Сохраняю…" : applicationStatus(app.status).description}</small>
                    </label>
                    <div className="admin-card-actions">
                      <button
                        type="button"
                        className="button"
                        disabled={busyId !== null}
                        onClick={async () => {
                          if (!window.confirm("Удалить эту заявку и её персональные данные с сервера? Отменить удаление нельзя. Копии в резервных архивах удаляются отдельно.")) return;
                          setBusyId(app.id);
                          setActionError("");
                          try {
                            const result = await removeApplication(app.id);
                            if (result.ok) await refreshApps();
                            else setActionError("Не удалось удалить заявку. Попробуйте ещё раз.");
                          } finally {
                            setBusyId(null);
                          }
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <section className="admin-panel" aria-label="Услуги">
            <form className="admin-product-form" onSubmit={onSaveProduct}>
              <h2>{editingId ? "Редактировать услугу" : "Добавить услугу"}</h2>
              <label className="cta-field">
                <span className="cta-field-label">Название услуги</span>
                <input
                  value={draft.title}
                  onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />
              </label>
              <label className="cta-field">
                <span className="cta-field-label">Стоимость</span>
                <input
                  value={draft.price}
                  onChange={(event) => setDraft((prev) => ({ ...prev, price: event.target.value }))}
                />
              </label>
              <label className="cta-field">
                <span className="cta-field-label">Описание услуги</span>
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
                    <span className="admin-badge">{product.visible ? "На сайте" : "Скрыта"}</span>
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

