import { useEffect, useState } from "react";
import PageHeader from "../../Components/App/PageHeader";
import { ErrorState, LoadingState } from "../../Components/App/AsyncState";
import SectionCard from "../../Components/App/SectionCard";
import { apiRequest } from "../../lib/api";
import { getDashboardPrefix, getStoredRole, isSuperAdminRole } from "../../lib/auth";
import { useApi } from "../../hooks/useApi";

export default function Settings() {
  const prefix = getDashboardPrefix();
  const isSuperAdmin = isSuperAdminRole(getStoredRole());

  const settingsMenu = useApi(`/dashboard/${prefix}/settings`, {}, [prefix]);
  const superadminProfile = useApi(
    "/dashboard/superadmin/settings/profile",
    { enabled: isSuperAdmin },
    [isSuperAdmin],
  );
  const superadminCompany = useApi(
    "/dashboard/superadmin/settings/company",
    { enabled: isSuperAdmin },
    [isSuperAdmin],
  );
  const superadminScope = useApi(
    "/dashboard/superadmin/settings/scope",
    { enabled: isSuperAdmin },
    [isSuperAdmin],
  );
  const passwordMeta = useApi(
    "/dashboard/superadmin/settings/change-password",
    { enabled: isSuperAdmin },
    [isSuperAdmin],
  );
  const privacy = useApi(
    "/dashboard/superadmin/settings/privacy-policy",
    { enabled: isSuperAdmin },
    [isSuperAdmin],
  );
  const terms = useApi(
    "/dashboard/superadmin/settings/terms-and-conditions",
    { enabled: isSuperAdmin },
    [isSuperAdmin],
  );
  const about = useApi(
    "/dashboard/superadmin/settings/about-us",
    { enabled: isSuperAdmin },
    [isSuperAdmin],
  );

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    role: "",
    contact_number: "",
    employee_id: "",
    profile_image_url: "",
  });
  const [companyForm, setCompanyForm] = useState({
    company_name: "",
    company_address: "",
    company_logo_url: "",
  });
  const [scopeForm, setScopeForm] = useState({
    department: "",
    team: "",
    role: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [legalForms, setLegalForms] = useState({
    privacy: { title: "", content: "", image_url: "" },
    terms: { title: "", content: "", image_url: "" },
    about: { title: "", content: "", image_url: "" },
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const source = isSuperAdmin
      ? superadminProfile.data
      : settingsMenu.data?.profile_information?.fields;
    setProfileForm({
      name: source?.name || "",
      email: source?.email || "",
      role: source?.role || "",
      contact_number: source?.contact_number || "",
      employee_id: source?.employee_id || "",
      profile_image_url: source?.profile_image_url || "",
    });
  }, [isSuperAdmin, settingsMenu.data, superadminProfile.data]);

  useEffect(() => {
    const source = isSuperAdmin
      ? superadminCompany.data
      : settingsMenu.data?.company_information?.fields;
    setCompanyForm({
      company_name: source?.company_name || "",
      company_address: source?.company_address || "",
      company_logo_url: source?.company_logo_url || "",
    });
  }, [isSuperAdmin, settingsMenu.data, superadminCompany.data]);

  useEffect(() => {
    const source = isSuperAdmin
      ? superadminScope.data
      : settingsMenu.data?.scope_configuration?.selected;
    setScopeForm({
      department: source?.department || "",
      team: source?.team || "",
      role: source?.role || "",
    });
  }, [isSuperAdmin, settingsMenu.data, superadminScope.data]);

  useEffect(() => {
    setLegalForms({
      privacy: {
        title: privacy.data?.title || "",
        content: privacy.data?.content || "",
        image_url: privacy.data?.image_url || "",
      },
      terms: {
        title: terms.data?.title || "",
        content: terms.data?.content || "",
        image_url: terms.data?.image_url || "",
      },
      about: {
        title: about.data?.title || "",
        content: about.data?.content || "",
        image_url: about.data?.image_url || "",
      },
    });
  }, [privacy.data, terms.data, about.data]);

  async function submitPatch(path, body, refetch) {
    setMessage("");
    try {
      const payload = await apiRequest(path, { method: "PATCH", body });
      setMessage(payload?.message || "Saved.");
      await refetch?.();
      await settingsMenu.refetch();
    } catch (err) {
      setMessage(err.message || "Save failed.");
    }
  }

  async function submitPassword(event) {
    event.preventDefault();
    setMessage("");
    try {
      const payload = await apiRequest("/users/me/change-password", {
        method: "POST",
        body: passwordForm,
      });
      setMessage(payload?.message || "Password updated.");
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setMessage(err.message || "Password update failed.");
    }
  }

  const loading =
    settingsMenu.loading ||
    (isSuperAdmin && passwordMeta.loading) ||
    (isSuperAdmin &&
      (superadminProfile.loading ||
        superadminCompany.loading ||
        superadminScope.loading ||
        privacy.loading ||
        terms.loading ||
        about.loading));
  const error =
    settingsMenu.error ||
    (isSuperAdmin && passwordMeta.error) ||
    (isSuperAdmin &&
      (superadminProfile.error ||
        superadminCompany.error ||
        superadminScope.error ||
        privacy.error ||
        terms.error ||
        about.error));
  const passwordSubtitle =
    passwordMeta.data?.subtitle ||
    settingsMenu.data?.password_settings?.subtitle ||
    "Update your password.";

  return (
    <div className="mt-20 space-y-6 p-6">
      <PageHeader title="Settings" subtitle="Live settings and profile management." />

      {loading ? <LoadingState label="Loading settings..." /> : null}
      {error ? (
        <ErrorState
          message={error}
          onRetry={() => {
            settingsMenu.refetch();
            if (isSuperAdmin) {
              passwordMeta.refetch();
            }
            if (isSuperAdmin) {
              superadminProfile.refetch();
              superadminCompany.refetch();
              superadminScope.refetch();
              privacy.refetch();
              terms.refetch();
              about.refetch();
            }
          }}
        />
      ) : null}
      {message ? (
        <p className="rounded-xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          {message}
        </p>
      ) : null}

      <SectionCard title="Profile Information">
        <form className="grid gap-4 md:grid-cols-2">
          {Object.keys(profileForm).map((field) => (
            <label key={field} className="text-sm">
              <span className="mb-1 block font-medium capitalize text-slate-700">
                {field.replaceAll("_", " ")}
              </span>
              <input
                value={profileForm[field]}
                onChange={(event) =>
                  setProfileForm({ ...profileForm, [field]: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />
            </label>
          ))}
          <button
            type="button"
            onClick={() =>
              submitPatch(`/dashboard/${prefix}/settings/profile`, profileForm, isSuperAdmin ? superadminProfile.refetch : settingsMenu.refetch)
            }
            className="w-fit rounded-xl bg-slate-900 px-4 py-3 text-white md:col-span-2"
          >
            Save profile
          </button>
        </form>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Company Information">
          <form className="grid gap-4">
            {Object.keys(companyForm).map((field) => (
              <label key={field} className="text-sm">
                <span className="mb-1 block font-medium capitalize text-slate-700">
                  {field.replaceAll("_", " ")}
                </span>
                <input
                  value={companyForm[field]}
                  onChange={(event) =>
                    setCompanyForm({ ...companyForm, [field]: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>
            ))}
            <button
              type="button"
              onClick={() =>
                submitPatch(`/dashboard/${prefix}/settings/company`, companyForm, isSuperAdmin ? superadminCompany.refetch : settingsMenu.refetch)
              }
              className="w-fit rounded-xl bg-slate-900 px-4 py-3 text-white"
            >
              Save company
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Scope Configuration">
          <form className="grid gap-4">
            {Object.keys(scopeForm).map((field) => (
              <label key={field} className="text-sm">
                <span className="mb-1 block font-medium capitalize text-slate-700">
                  {field.replaceAll("_", " ")}
                </span>
                <input
                  value={scopeForm[field]}
                  onChange={(event) =>
                    setScopeForm({ ...scopeForm, [field]: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>
            ))}
            <button
              type="button"
              onClick={() =>
                submitPatch(`/dashboard/${prefix}/settings/scope`, scopeForm, isSuperAdmin ? superadminScope.refetch : settingsMenu.refetch)
              }
              className="w-fit rounded-xl bg-slate-900 px-4 py-3 text-white"
            >
              Save scope
            </button>
          </form>
        </SectionCard>
      </div>

      <SectionCard title="Password Settings" subtitle={passwordSubtitle}>
        <form className="grid gap-4 md:grid-cols-3" onSubmit={submitPassword}>
          {Object.keys(passwordForm).map((field) => (
            <label key={field} className="text-sm">
              <span className="mb-1 block font-medium capitalize text-slate-700">
                {field.replaceAll("_", " ")}
              </span>
              <input
                type="password"
                value={passwordForm[field]}
                onChange={(event) =>
                  setPasswordForm({ ...passwordForm, [field]: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />
            </label>
          ))}
          <button className="w-fit rounded-xl bg-slate-900 px-4 py-3 text-white md:col-span-3">
            Update password
          </button>
        </form>
      </SectionCard>

      {isSuperAdmin ? (
        <>
          {[
            ["privacy", "Privacy Policy", "/dashboard/superadmin/settings/privacy-policy", privacy.refetch],
            ["terms", "Terms & Conditions", "/dashboard/superadmin/settings/terms-and-conditions", terms.refetch],
            ["about", "About Us", "/dashboard/superadmin/settings/about-us", about.refetch],
          ].map(([key, title, path, refetch]) => (
            <SectionCard key={key} title={title}>
              <div className="grid gap-4">
                {["title", "content", "image_url"].map((field) => (
                  <label key={field} className="text-sm">
                    <span className="mb-1 block font-medium capitalize text-slate-700">
                      {field.replaceAll("_", " ")}
                    </span>
                    {field === "content" ? (
                      <textarea
                        value={legalForms[key][field]}
                        onChange={(event) =>
                          setLegalForms({
                            ...legalForms,
                            [key]: { ...legalForms[key], [field]: event.target.value },
                          })
                        }
                        className="min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3"
                      />
                    ) : (
                      <input
                        value={legalForms[key][field]}
                        onChange={(event) =>
                          setLegalForms({
                            ...legalForms,
                            [key]: { ...legalForms[key], [field]: event.target.value },
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3"
                      />
                    )}
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => submitPatch(path, legalForms[key], refetch)}
                  className="w-fit rounded-xl bg-slate-900 px-4 py-3 text-white"
                >
                  Save {title}
                </button>
              </div>
            </SectionCard>
          ))}
        </>
      ) : null}
    </div>
  );
}
