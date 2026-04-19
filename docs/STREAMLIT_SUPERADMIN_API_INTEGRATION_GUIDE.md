# Streamlit Superadmin API Integration Guide

## Scope

This guide is the source of truth for wiring the Streamlit superadmin client to the FastAPI backend in this repo.

It is based on these live project files:

- `streamlit_superadmin.py`
- `streamlit_app.py`
- `app/api/v1/routes/auth.py`
- `app/api/v1/routes/dashboard.py`
- `app/api/v1/routes/users.py`
- `app/schemas/auth.py`
- `app/schemas/dashboard.py`
- `app/core/dependencies.py`
- `wellness-superadmin-main/src/utils/api.js`

## 1. Runtime Setup

### Backend

Run the API:

```powershell
uvicorn app.main:app --reload
```

Default backend root:

- App root: `http://127.0.0.1:8000`
- API root: `http://127.0.0.1:8000/api/v1`

### Streamlit

Run the dedicated superadmin client:

```powershell
streamlit run streamlit_superadmin.py
```

The Streamlit client defaults to:

- `http://127.0.0.1:8000/api/v1`

## 2. Auth and Access Rules

### Required header

All protected superadmin endpoints require:

```http
Authorization: Bearer <access_token>
```

### Who can access superadmin routes

`app/core/dependencies.py` allows superadmin access when `user.role` contains one of:

- `super admin`
- `superadmin`
- `platform admin`
- `system admin`

If the logged-in account does not match one of those role patterns, protected superadmin routes return `403`.

### Login endpoint

There is no separate `superadmin-login` route.

Use:

```http
POST /api/v1/auth/login
```

Body:

```json
{
  "email": "superadmin@example.com",
  "password": "your-password"
}
```

Success payload:

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "access_token": "jwt",
    "refresh_token": "jwt",
    "token_type": "bearer",
    "user": {
      "...": "..."
    }
  }
}
```

### Refresh token

```http
POST /api/v1/auth/refresh
```

Body:

```json
{
  "refresh_token": "your-refresh-token"
}
```

### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

### Change password while logged in

```http
POST /api/v1/users/me/change-password
Authorization: Bearer <access_token>
```

Body:

```json
{
  "current_password": "old-password",
  "new_password": "new-password-123",
  "confirm_password": "new-password-123"
}
```

### Forgot password flow for superadmin

Step 1:

```http
POST /api/v1/auth/superadmin-forgot-password
```

Body:

```json
{
  "email": "superadmin@example.com"
}
```

Step 2:

```http
POST /api/v1/auth/superadmin-verify-reset-code
```

Body:

```json
{
  "email": "superadmin@example.com",
  "code": "1234"
}
```

Optional resend:

```http
POST /api/v1/auth/superadmin-resend-reset-code
```

Body:

```json
{
  "email": "superadmin@example.com"
}
```

Step 3:

```http
POST /api/v1/auth/superadmin-reset-password
```

Body:

```json
{
  "email": "superadmin@example.com",
  "code": "1234",
  "new_password": "new-password-123",
  "confirm_password": "new-password-123"
}
```

## 3. Standard API Response Contract

Successful responses use:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {}
}
```

Error responses use:

```json
{
  "success": false,
  "message": "Error message",
  "errors": {}
}
```

Frontend rule:

- read business payload from `response.data.data`
- read UI-safe status text from `response.data.message`
- do not assume raw arrays at the top level

## 4. Streamlit Integration Pattern

The repo already contains the correct base integration pattern in `streamlit_app.py`.

### Session state keys

- `api_base_url`
- `access_token`
- `refresh_token`
- `current_user`
- `chat_history`

### Core request helper

```python
def api_request(method, path, json_data=None, require_auth=False):
    headers = {}
    if require_auth and st.session_state.access_token:
        headers["Authorization"] = f"Bearer {st.session_state.access_token}"

    url = f"{st.session_state.api_base_url.rstrip('/')}/{path.lstrip('/')}"
    with httpx.Client(timeout=45.0) as client:
        response = client.request(method, url, json=json_data, headers=headers)
    return response.is_success, response.json()
```

### Auth persistence

After login:

- store `data.access_token`
- store `data.refresh_token`
- store `data.user`

### Query builder

`streamlit_app.py` already uses `build_query_path(path, params)` to avoid sending empty filters.

That should remain the default pattern for all GET calls.

## 5. Superadmin Workbench Tab-to-API Map

The Streamlit superadmin client is rendered by `render_superadmin_workbench()` in `streamlit_app.py`.

### Dashboard tab

Endpoint:

```http
GET /api/v1/dashboard/superadmin
```

Query params:

- `company`
- `department`
- `team`
- `range`
- `start_date`
- `end_date`

Auth:

- required

Used for:

- top-level superadmin dashboard overview
- scoped organization, department, and team analytics

### Organizations tab

List endpoint:

```http
GET /api/v1/dashboard/superadmin/organizations
```

Query params:

- `query`
- `risk_filter`
- `sort_by`
- `page`
- `page_size`

Detail endpoint:

```http
GET /api/v1/dashboard/superadmin/organizations/{company_name}
```

Query params:

- `query`
- `risk_filter`
- `sort_by`
- `page`
- `page_size`

Member detail endpoint:

```http
GET /api/v1/dashboard/superadmin/organizations/{company_name}/members/{member_user_id}
```

Query params:

- `range`

Auth:

- required for all three

### Users tab

List endpoint:

```http
GET /api/v1/dashboard/superadmin/users
```

Query params:

- `query`
- `status_filter`
- `sort_by`
- `page`
- `page_size`

Detail endpoint:

```http
GET /api/v1/dashboard/superadmin/users/{user_id}
```

Update endpoint:

```http
PATCH /api/v1/dashboard/superadmin/users/{user_id}
```

Body:

```json
{
  "name": "Optional",
  "role": "Optional",
  "organization_name": "Optional"
}
```

Deactivate endpoint:

```http
DELETE /api/v1/dashboard/superadmin/users/{user_id}
```

Auth:

- required

### Insights tab

Primary endpoint:

```http
GET /api/v1/dashboard/superadmin/insights
```

Alias endpoint:

```http
GET /api/v1/dashboard/superadmin/ai-insights
```

Query params:

- `company`
- `department`
- `team`
- `range`
- `start_date`
- `end_date`

Auth:

- required

### Report tab

Primary endpoint:

```http
GET /api/v1/dashboard/superadmin/report
```

Alias endpoint:

```http
GET /api/v1/dashboard/superadmin/reports
```

Query params:

- `company`
- `department`
- `team`
- `range`
- `start_date`
- `end_date`
- `page`
- `page_size`

Auth:

- required

### Alerts tab

Risk alerts:

```http
GET /api/v1/dashboard/superadmin/alerts
```

Alias:

```http
GET /api/v1/dashboard/superadmin/risk-alerts
```

Burnout recommendations:

```http
GET /api/v1/dashboard/superadmin/burnout-recommendations
```

Burnout details:

```http
GET /api/v1/dashboard/superadmin/burnout-details
```

OPS trend:

```http
GET /api/v1/dashboard/superadmin/ops-trend
```

Shared query params:

- `company`
- `department`
- `team`
- `range`

OPS trend also accepts:

- `start_date`
- `end_date`

Auth:

- required

### Audit Logs tab

List endpoint:

```http
GET /api/v1/dashboard/superadmin/audit-logs
```

Query params:

- `company`
- `query`
- `time_filter`
- `user_filter`
- `status_filter`
- `page`
- `page_size`

Detail endpoint:

```http
GET /api/v1/dashboard/superadmin/audit-logs/{action_log_id}
```

Query params:

- `company`

Auth:

- required

### Settings tab

Menu endpoint:

```http
GET /api/v1/dashboard/superadmin/settings
```

Profile page endpoint:

```http
GET /api/v1/dashboard/superadmin/settings/profile
```

Profile update endpoint:

```http
PATCH /api/v1/dashboard/superadmin/settings/profile
```

Body:

```json
{
  "name": "Optional",
  "email": "Optional",
  "role": "Optional",
  "contact_number": "Optional",
  "employee_id": "Optional",
  "profile_image_url": "Optional"
}
```

Change password page metadata:

```http
GET /api/v1/dashboard/superadmin/settings/change-password
```

Change password submit:

```http
POST /api/v1/users/me/change-password
```

Forgot password page metadata:

```http
GET /api/v1/dashboard/superadmin/settings/forgot-password
```

Verify code page metadata:

```http
GET /api/v1/dashboard/superadmin/settings/verify-reset-code
```

Privacy policy page:

```http
GET /api/v1/dashboard/superadmin/settings/privacy-policy
PATCH /api/v1/dashboard/superadmin/settings/privacy-policy
```

Terms page:

```http
GET /api/v1/dashboard/superadmin/settings/terms-and-conditions
PATCH /api/v1/dashboard/superadmin/settings/terms-and-conditions
```

About us page:

```http
GET /api/v1/dashboard/superadmin/settings/about-us
PATCH /api/v1/dashboard/superadmin/settings/about-us
```

Legal content update body:

```json
{
  "title": "Page title",
  "content": "Rich text or plain text body",
  "image_url": "Optional"
}
```

Company settings update:

```http
PATCH /api/v1/dashboard/superadmin/settings/company
```

Body:

```json
{
  "company_name": "Optional",
  "company_address": "Optional",
  "company_logo_url": "Optional"
}
```

Scope settings update:

```http
PATCH /api/v1/dashboard/superadmin/settings/scope
```

Body:

```json
{
  "department": "Optional",
  "team": "Optional",
  "role": "Optional"
}
```

Auth:

- required for all settings GET and PATCH routes except the forgot-password and verify-reset-code metadata GETs

## 6. Important Current Mismatches

These are implementation details that will break integration if ignored.

### Mismatch 1: React expects settings GET routes that do not exist

`wellness-superadmin-main/src/Pages/settings/Settings.jsx` calls:

- `GET /api/v1/dashboard/superadmin/settings/company`
- `GET /api/v1/dashboard/superadmin/settings/scope`

Those GET routes are not present in `app/api/v1/routes/dashboard.py`.

Current backend only exposes:

- `PATCH /api/v1/dashboard/superadmin/settings/company`
- `PATCH /api/v1/dashboard/superadmin/settings/scope`

Action:

- either add the missing GET endpoints in backend
- or update frontend to hydrate company and scope from `GET /api/v1/dashboard/superadmin/settings` or `GET /api/v1/dashboard/superadmin/settings/profile` if the service payload already contains them

### Mismatch 2: React field names do not fully match schema

`Settings.jsx` currently sends fields like:

- `contact`
- `id`
- `name`
- `address`

But backend patch schemas expect:

- `contact_number`
- `employee_id`
- `company_name`
- `company_address`

Action:

- rename outgoing form keys before `PATCH`

### Mismatch 3: React role detection is too loose

`wellness-superadmin-main/src/Pages/Dashboard/Dashboard.jsx` uses:

- `localStorage.getItem("role") || "admin"`

Backend superadmin authorization does not check for `admin`.
It checks for `super admin`, `superadmin`, `platform admin`, or `system admin`.

Action:

- store the actual backend `user.role`
- map UI role logic from real backend role strings

## 7. Recommended Streamlit Request Map

Use this exact sequence for a clean superadmin session:

1. `POST /auth/login`
2. store `access_token`, `refresh_token`, `user`
3. `GET /dashboard/superadmin`
4. `GET /dashboard/superadmin/organizations`
5. `GET /dashboard/superadmin/users`
6. `GET /dashboard/superadmin/insights`
7. `GET /dashboard/superadmin/report`
8. `GET /dashboard/superadmin/alerts`
9. `GET /dashboard/superadmin/audit-logs`
10. `GET /dashboard/superadmin/settings`
11. call detail pages only after user selection

## 8. Minimal Streamlit Superadmin Login Example

```python
ok, payload = api_request(
    "POST",
    "auth/login",
    {"email": email, "password": password},
)
if ok:
    data = payload.get("data", {})
    st.session_state.access_token = data.get("access_token", "")
    st.session_state.refresh_token = data.get("refresh_token", "")
    st.session_state.current_user = data.get("user")
```

## 9. Minimal Protected GET Example

```python
ok, payload = api_request(
    "GET",
    "dashboard/superadmin",
    require_auth=True,
)
if ok:
    dashboard_data = payload["data"]
```

## 10. Minimal Protected PATCH Example

```python
ok, payload = api_request(
    "PATCH",
    "dashboard/superadmin/settings/profile",
    {
        "name": "Dominion Platform Admin",
        "email": "superadmin@example.com",
        "role": "Super Admin",
        "contact_number": "+1 555 0100",
        "employee_id": "SA-001",
        "profile_image_url": None,
    },
    require_auth=True,
)
```

## 11. Manual Test Checklist

Verify all of these in Streamlit before calling the integration done.

- login with a real superadmin role account
- dashboard loads without `401` or `403`
- company, department, team, and range filters apply cleanly
- organization list opens company detail
- user list opens user detail
- profile update works
- change password works
- forgot password send, verify, resend, and reset flows work
- privacy policy update works
- terms update works
- about us update works
- audit log detail opens from list selection
- error payloads render `message`
- expired token path is handled with refresh or forced relogin

## 12. Best-Practice Notes

- Always send bearer token only on protected routes.
- Always read from `payload["data"]`, not from top-level JSON.
- Do not hardcode `admin` as a backend-equivalent superadmin role.
- Do not send empty strings for optional filters if the helper can omit them.
- Keep Streamlit request helpers centralized in one function.
- If frontend must support refresh, add a retry wrapper around `401`.

## 13. Recommended Next Fixes in This Repo

- Add `GET /dashboard/superadmin/settings/company`
- Add `GET /dashboard/superadmin/settings/scope`
- Normalize React settings form keys to backend schema names
- Normalize stored role values between login response and UI routing
- Add refresh-token retry logic in `wellness-superadmin-main/src/utils/api.js`
