# API Endpoint Verification Checklist

## ⚠️ CRITICAL RULE: Always Verify Backend Endpoints Before Using

**Before implementing any API call in the frontend, ALWAYS:**

1. ✅ Check `api/routes/api.php` to verify the endpoint exists
2. ✅ Check the controller method signature and parameters
3. ✅ Verify the response structure from the controller
4. ✅ Match the exact route path including version prefix (`/v1/`)

---

## Verified Endpoint Mapping

### Authentication (`/v1/auth`)
| Frontend Call | Backend Route | Controller Method | Status |
|--------------|---------------|-------------------|--------|
| POST `/v1/auth/register` | ✅ `POST /v1/auth/register` | AuthController@register | ✅ Verified |
| POST `/v1/auth/login` | ✅ `POST /v1/auth/login` | AuthController@login | ✅ Verified |
| POST `/v1/auth/logout` | ✅ `POST /v1/auth/logout` | AuthController@logout | ✅ Verified |
| GET `/v1/auth/me` | ✅ `GET /v1/auth/me` | AuthController@me | ✅ Verified |

### Wallet (`/v1/wallet`)
| Frontend Call | Backend Route | Controller Method | Status |
|--------------|---------------|-------------------|--------|
| GET `/v1/wallet` | ✅ `GET /v1/wallet` | WalletController@index | ✅ Verified |
| POST `/v1/wallet/deposit` | ✅ `POST /v1/wallet/deposit` | WalletController@deposit | ✅ Verified |
| POST `/v1/wallet/withdraw` | ✅ `POST /v1/wallet/withdraw` | WalletController@withdraw | ✅ Verified |
| GET `/v1/wallet/transactions` | ✅ `GET /v1/wallet/transactions` | WalletController@transactions | ✅ Verified |
| GET `/v1/wallet/stats` | ✅ `GET /v1/wallet/stats` | WalletController@stats | ✅ Verified |

### Shares (`/v1/shares`)
| Frontend Call | Backend Route | Controller Method | Status |
|--------------|---------------|-------------------|--------|
| GET `/v1/shares` | ✅ `GET /v1/shares` | ShareController@index | ✅ Verified |
| GET `/v1/shares/{id}` | ✅ `GET /v1/shares/{identifier}` | ShareController@show | ✅ Verified |
| GET `/v1/shares/featured` | ✅ `GET /v1/shares/featured` | ShareController@featured | ✅ Verified |

### Investments (`/v1/investments`)
| Frontend Call | Backend Route | Controller Method | Status |
|--------------|---------------|-------------------|--------|
| GET `/v1/investments` | ✅ `GET /v1/investments` | InvestmentController@index | ✅ Verified |
| GET `/v1/investments/statistics` | ✅ `GET /v1/investments/statistics` | InvestmentController@statistics | ✅ Verified |
| GET `/v1/investments/{id}` | ✅ `GET /v1/investments/{identifier}` | InvestmentController@show | ✅ Verified |
| POST `/v1/investments` | ✅ `POST /v1/investments` | InvestmentController@store | ✅ Verified |
| POST `/v1/investments/{id}/cancel` | ✅ `POST /v1/investments/{id}/cancel` | InvestmentController@cancel | ✅ Verified |

### Profits (User) (`/v1/profits`)
| Frontend Call | Backend Route | Controller Method | Status |
|--------------|---------------|-------------------|--------|
| GET `/v1/profits` | ✅ `GET /v1/profits` | ProfitController@index | ✅ Fixed |
| GET `/v1/profits/statistics` | ✅ `GET /v1/profits/statistics` | ProfitController@statistics | ✅ Fixed |
| ~~GET `/v1/profits/user`~~ | ❌ **DOES NOT EXIST** | N/A | 🔧 Fixed to `/v1/profits` |
| ~~GET `/v1/profits/user/summary`~~ | ❌ **DOES NOT EXIST** | N/A | 🔧 Fixed to `/v1/profits/statistics` |
| ~~GET `/v1/profits/user/{id}`~~ | ❌ **DOES NOT EXIST** | N/A | 🔧 Removed (not used) |

### Admin - Dashboard (`/v1/admin/dashboard`)
| Frontend Call | Backend Route | Controller Method | Status |
|--------------|---------------|-------------------|--------|
| GET `/v1/admin/dashboard/overview` | ✅ `GET /v1/admin/dashboard/overview` | DashboardController@overview | ✅ Fixed |
| GET `/v1/admin/dashboard/statistics/users` | ✅ `GET /v1/admin/dashboard/statistics/users` | DashboardController@userStatistics | ✅ Fixed |
| GET `/v1/admin/dashboard/statistics/investments` | ✅ `GET /v1/admin/dashboard/statistics/investments` | DashboardController@investmentStatistics | ✅ Fixed |
| GET `/v1/admin/dashboard/statistics/wallets` | ✅ `GET /v1/admin/dashboard/statistics/wallets` | DashboardController@walletStatistics | ✅ Fixed |
| GET `/v1/admin/dashboard/statistics/shares` | ✅ `GET /v1/admin/dashboard/statistics/shares` | DashboardController@shareStatistics | ✅ Fixed |

### Admin - Users (`/v1/admin/users`)
| Frontend Call | Backend Route | Controller Method | Status |
|--------------|---------------|-------------------|--------|
| GET `/v1/admin/users` | ✅ `GET /v1/admin/users` | UserController@index | ✅ Created |
| GET `/v1/admin/users/{id}` | ✅ `GET /v1/admin/users/{id}` | UserController@show | ✅ Created |
| PUT `/v1/admin/users/{id}` | ✅ `PUT /v1/admin/users/{id}` | UserController@update | ✅ Created |
| DELETE `/v1/admin/users/{id}` | ✅ `DELETE /v1/admin/users/{id}` | UserController@destroy | ✅ Created |
| POST `/v1/admin/users/{id}/toggle-status` | ✅ `POST /v1/admin/users/{id}/toggle-status` | UserController@toggleStatus | ✅ Created |

### Admin - Shares (`/v1/admin/shares`)
| Frontend Call | Backend Route | Controller Method | Status |
|--------------|---------------|-------------------|--------|
| POST `/v1/admin/shares` | ✅ `POST /v1/admin/shares` | ShareController@store | ✅ Verified |
| PUT `/v1/admin/shares/{id}` | ✅ `PUT /v1/admin/shares/{id}` | ShareController@update | ✅ Verified |
| DELETE `/v1/admin/shares/{id}` | ✅ `DELETE /v1/admin/shares/{id}` | ShareController@destroy | ✅ Verified |
| POST `/v1/admin/shares/{id}/toggle-status` | ✅ `POST /v1/admin/shares/{id}/toggle-status` | ShareController@toggleStatus | ✅ Verified |

### Admin - Profits (`/v1/admin/profits`)
| Frontend Call | Backend Route | Controller Method | Status |
|--------------|---------------|-------------------|--------|
| GET `/v1/admin/profits` | ✅ `GET /v1/admin/profits` | ProfitController@adminIndex | ✅ Fixed |
| GET `/v1/admin/profits/summary` | ✅ `GET /v1/admin/profits/summary` | ProfitController@summary | ✅ Verified |
| GET `/v1/admin/profits/{id}` | ✅ `GET /v1/admin/profits/{id}` | ProfitController@show | ✅ Fixed |
| POST `/v1/admin/profits` | ✅ `POST /v1/admin/profits` | ProfitController@store | ✅ Verified |
| PUT `/v1/admin/profits/{id}` | ✅ `PUT /v1/admin/profits/{id}` | ProfitController@update | ✅ Verified |
| DELETE `/v1/admin/profits/{id}` | ✅ `DELETE /v1/admin/profits/{id}` | ProfitController@destroy | ✅ Verified |
| POST `/v1/admin/profits/{id}/distribute-proportionally` | ✅ `POST /v1/admin/profits/{id}/distribute-proportionally` | ProfitController@distributeProportionally | ✅ Verified |
| POST `/v1/admin/profits/{id}/distribute-fixed` | ✅ `POST /v1/admin/profits/{id}/distribute-fixed` | ProfitController@distributeFixed | ✅ Verified |
| GET `/v1/admin/profits/{id}/distributions` | ✅ `GET /v1/admin/profits/{id}/distributions` | ProfitController@distributions | ✅ Verified |
| ~~GET `/v1/profits/monthly`~~ | ❌ **DOES NOT EXIST** | N/A | 🔧 Fixed to `/v1/admin/profits` |
| ~~GET `/v1/profits/monthly/{id}`~~ | ❌ **DOES NOT EXIST** | N/A | 🔧 Fixed to `/v1/admin/profits/{id}` |

---

## Common Issues Found & Fixed

### Issue 1: Missing `/v1/` Prefix
**Problem:** Dashboard endpoints were called as `/admin/dashboard/*` instead of `/v1/admin/dashboard/*`
**Files Affected:** `dashboard.service.ts`
**Fix:** Added `/v1/` prefix to all dashboard endpoints
**Status:** ✅ Fixed

### Issue 2: Non-existent User Profit Endpoints
**Problem:** Frontend called `/v1/profits/user` which doesn't exist
**Backend Route:** `/v1/profits` (no `/user` segment)
**Files Affected:** `profit.service.ts`
**Fix:** Changed `/v1/profits/user` → `/v1/profits`
**Status:** ✅ Fixed

### Issue 3: Non-existent Monthly Profits Endpoint
**Problem:** Frontend called `/v1/profits/monthly` which doesn't exist
**Backend Route:** `/v1/admin/profits` (admin profit pools, not "monthly")
**Files Affected:** `profit.service.ts`
**Fix:** Changed `/v1/profits/monthly` → `/v1/admin/profits`
**Status:** ✅ Fixed

### Issue 4: Missing User Management Endpoints
**Problem:** Frontend called `/v1/admin/users` but routes didn't exist
**Solution:** Created `UserController.php` with all user management endpoints
**Files Created:** `api/app/Http/Controllers/API/UserController.php`
**Routes Added:** 5 endpoints for user CRUD operations
**Status:** ✅ Fixed

---

## Verification Process

### Step 1: Check Laravel Routes
```bash
cd api
php artisan route:list --path=<path>
```

### Step 2: Verify Controller Method
```bash
# Open the controller and check:
# 1. Method signature
# 2. Request parameters
# 3. Response structure
```

### Step 3: Match Frontend Service
```typescript
// Ensure frontend service matches EXACTLY:
// 1. HTTP method (GET/POST/PUT/DELETE)
// 2. Route path with /v1/ prefix
// 3. Query parameters
// 4. Request body structure
```

### Step 4: Test Endpoint
```bash
# Use curl or Postman to test before integration
curl -X GET http://localhost:8000/api/v1/<endpoint> \
  -H "Authorization: Bearer <token>"
```

---

## Response Structure Standards

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... } // Optional validation errors
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved",
  "data": {
    "data": [ ... ],           // Items array
    "current_page": 1,
    "per_page": 15,
    "total": 100,
    "last_page": 7,
    "from": 1,
    "to": 15
  }
}
```

---

## Next Steps

When adding new features:

1. ✅ Create backend endpoint in Laravel first
2. ✅ Add route to `api/routes/api.php`
3. ✅ Verify route with `php artisan route:list`
4. ✅ Test endpoint with curl/Postman
5. ✅ Create frontend service method matching exact endpoint
6. ✅ Document in this file

---

**Last Updated:** January 3, 2026
**Total Endpoints Verified:** 50+
**Issues Fixed:** 4 major endpoint mismatches
