import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes"

export default [
  layout("routes/layout.tsx", [
    index("routes/dashboard/_index.tsx"),
    route("domain-manager/domains", "routes/manager/domains/_index.tsx"),
    route("domain-manager/domains/:id", "routes/manager/domains/$id.tsx", [
      index("routes/manager/domains/$id.overview.tsx"),
      route("dns", "routes/manager/domains/$id.dns.tsx"),
      route("ssl", "routes/manager/domains/$id.ssl.tsx"),
      route("ns", "routes/manager/domains/$id.ns.tsx"),
    ]),
    route("market/listings", "routes/market/listings.tsx"),

    route("settings", "routes/settings/_layout.tsx", [
      route("api", "routes/settings/api.tsx"), 
      route("notifications", "routes/settings/notifications.tsx"),
      route("account", "routes/settings/account.tsx"),
    ]),
  ]),
  layout("routes/auth/layout.tsx", [
    route("auth/login", "routes/auth/login.tsx"),
  ]),
  route("/action/set-theme", "routes/action.set-theme.ts"),
] satisfies RouteConfig
