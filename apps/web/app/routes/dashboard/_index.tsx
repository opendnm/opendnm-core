"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Globe,
  ShieldCheck,
  AlertTriangle,
  DollarSign,
  Mail,
  ShoppingCart,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { cn } from "../../lib/utils"

// ─── Mock Data ────────────────────────────────────────────────────────────────

const trafficData = [
  { date: "05/01", visits: 4200 },
  { date: "05/02", visits: 3800 },
  { date: "05/03", visits: 5100 },
  { date: "05/04", visits: 4700 },
  { date: "05/05", visits: 5300 },
  { date: "05/06", visits: 6100 },
  { date: "05/07", visits: 5800 },
  { date: "05/08", visits: 7200 },
  { date: "05/09", visits: 6900 },
  { date: "05/10", visits: 8100 },
  { date: "05/11", visits: 7500 },
  { date: "05/12", visits: 8800 },
  { date: "05/13", visits: 9200 },
  { date: "05/14", visits: 8600 },
]

const regionData = [
  { region: "US", visits: 38400 },
  { region: "CN", visits: 27100 },
  { region: "DE", visits: 14200 },
  { region: "GB", visits: 11800 },
  { region: "JP", visits: 9300 },
  { region: "AU", visits: 7600 },
  { region: "CA", visits: 6100 },
  { region: "FR", visits: 5400 },
]

const orders = [
  {
    id: "ORD-2401",
    domain: "techstartup.io",
    buyer: "Alex Johnson",
    amount: "$4,200",
    status: "pending",
    time: "2h ago",
  },
  {
    id: "ORD-2402",
    domain: "cloudbase.dev",
    buyer: "Maria Chen",
    amount: "$1,800",
    status: "processing",
    time: "4h ago",
  },
  {
    id: "ORD-2403",
    domain: "nexusapp.com",
    buyer: "Sam Wilson",
    amount: "$8,500",
    status: "pending",
    time: "6h ago",
  },
  {
    id: "ORD-2404",
    domain: "aitools.xyz",
    buyer: "Priya Patel",
    amount: "$650",
    status: "pending",
    time: "8h ago",
  },
]

const quotes = [
  {
    id: "QT-891",
    domain: "enterprise.ai",
    from: "ventures@blackrock.com",
    offer: "$24,000",
    time: "1h ago",
  },
  {
    id: "QT-892",
    domain: "metaverse.io",
    from: "acquisitions@a16z.com",
    offer: "$68,000",
    time: "3h ago",
  },
  {
    id: "QT-893",
    domain: "defi-labs.com",
    from: "deals@paradigm.xyz",
    offer: "$12,500",
    time: "5h ago",
  },
]

const contacts = [
  {
    id: "MSG-441",
    name: "Jordan Lee",
    email: "jordan@example.com",
    subject: "Bulk domain inquiry",
    time: "30m ago",
  },
  {
    id: "MSG-442",
    name: "Sophie Turner",
    email: "sophie@agency.co",
    subject: "Partnership proposal",
    time: "2h ago",
  },
  {
    id: "MSG-443",
    name: "Raj Kumar",
    email: "raj@techco.in",
    subject: "DNS migration help",
    time: "3h ago",
  },
  {
    id: "MSG-444",
    name: "Emma Davis",
    email: "emma@startup.io",
    subject: "Pricing for premium domains",
    time: "5h ago",
  },
]

// ─── Stat Card ────────────────────────────────────────────────────────────────

type StatCardProps = {
  title: string
  value: string
  change: string
  positive: boolean
  icon: React.ElementType
  iconClass: string
  description?: string
}

function StatCard({
  title,
  value,
  change,
  positive,
  icon: Icon,
  iconClass,
  description,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-sm font-medium">{title}</CardDescription>
        <div className={cn("rounded-md p-2", iconClass)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <span
            className={cn(
              "flex items-center gap-0.5 font-medium",
              positive ? "text-emerald-500" : "text-rose-500"
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {change}
          </span>
          {description && <span>{description}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: {
      label: "Pending",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
    processing: {
      label: "Processing",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    active: {
      label: "Active",
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
  }
  const s = map[status] ?? map.pending
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", s.className)}>
      {s.label}
    </Badge>
  )
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your domain portfolio and activity
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Domains"
          value="1,284"
          change="+12"
          positive
          icon={Globe}
          iconClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          description="added this month"
        />
        <StatCard
          title="CF Active Zones"
          value="943"
          change="+5"
          positive
          icon={ShieldCheck}
          iconClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
          description="since last week"
        />
        <StatCard
          title="Expiring Soon"
          value="27"
          change="+4"
          positive={false}
          icon={AlertTriangle}
          iconClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          description="within 30 days"
        />
        <StatCard
          title="Total Sales"
          value="$128,400"
          change="+18.2%"
          positive
          icon={DollarSign}
          iconClass="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
          description="vs last month"
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Daily traffic – spans 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Daily Traffic</CardTitle>
            <CardDescription>Domain visits over the last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={trafficData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--chart-3)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-3)"
                      stopOpacity={0.2}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-muted-foreground"
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                    color: "hsl(var(--popover-foreground))",
                  }}
                  cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#trafficGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Region chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Visitors by Region</CardTitle>
            <CardDescription>Top 8 countries</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={regionData}
                layout="vertical"
                margin={{ top: 0, right: 4, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  className="stroke-muted"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-muted-foreground"
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="region"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-muted-foreground"
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                    color: "hsl(var(--popover-foreground))",
                  }}
                  cursor={{ fill: "var(--chart-1)" }}
                />
                <Bar
                  dataKey="visits"
                  fill="var(--chart-2)"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Pending Items ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Pending Items</CardTitle>
            <CardDescription>
              {orders.filter((o) => o.status === "pending").length} orders ·{" "}
              {quotes.length} quotes · {contacts.length} messages require attention
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View all
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="orders">
            <div className="border-b px-6">
              <TabsList className="h-10 rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="orders"
                  className="relative h-10 rounded-none border-b-2 border-transparent px-4 pb-0 font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <ShoppingCart className="mr-2 h-3.5 w-3.5" />
                  Orders
                  <Badge className="ml-2 h-5 px-1.5 text-[10px]">
                    {orders.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="quotes"
                  className="relative h-10 rounded-none border-b-2 border-transparent px-4 pb-0 font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <Mail className="mr-2 h-3.5 w-3.5" />
                  Quotes
                  <Badge className="ml-2 h-5 px-1.5 text-[10px]">
                    {quotes.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="contacts"
                  className="relative h-10 rounded-none border-b-2 border-transparent px-4 pb-0 font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <MessageSquare className="mr-2 h-3.5 w-3.5" />
                  Contacts
                  <Badge className="ml-2 h-5 px-1.5 text-[10px]">
                    {contacts.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Orders */}
            <TabsContent value="orders" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Order</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6 text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer">
                      <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                        {order.id}
                      </TableCell>
                      <TableCell className="font-medium">{order.domain}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.buyer}
                      </TableCell>
                      <TableCell className="font-semibold">{order.amount}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {order.time}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Quotes */}
            <TabsContent value="quotes" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">ID</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Offer</TableHead>
                    <TableHead className="pr-6 text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((q) => (
                    <TableRow key={q.id} className="cursor-pointer">
                      <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                        {q.id}
                      </TableCell>
                      <TableCell className="font-medium">{q.domain}</TableCell>
                      <TableCell className="text-muted-foreground">{q.from}</TableCell>
                      <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {q.offer}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {q.time}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Contacts */}
            <TabsContent value="contacts" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="pr-6 text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((c) => (
                    <TableRow key={c.id} className="cursor-pointer">
                      <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                        {c.id}
                      </TableCell>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.email}</TableCell>
                      <TableCell>{c.subject}</TableCell>
                      <TableCell className="pr-6 text-right">
                        <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {c.time}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}