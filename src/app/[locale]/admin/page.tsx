"use client";

import { Card } from "@/components/ui/card";
import { CardStats } from "@/components/shared/admin/card-stats";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";
import { Users, Clock, Calendar } from "lucide-react";

const mockData = [
  { name: "Jan", users: 4 },
  { name: "Feb", users: 7 },
  { name: "Mar", users: 12 },
  { name: "Apr", users: 15 },
  { name: "May", users: 18 },
  { name: "Jun", users: 24 },
];

export default function AdminPage() {
  const t = useTranslations("admin.dashboard");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t("welcome")}
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <CardStats
          title={t("stats.totalUsers")}
          value="24"
          change={{ value: 12, timeframe: "last month" }}
          icon={Users}
          className="sm:col-span-1"
        />

        <CardStats
          title={t("stats.activeSessions")}
          value="12"
          change={{ value: -3, timeframe: "yesterday" }}
          icon={Clock}
          className="sm:col-span-1"
        />

        <CardStats
          title={t("stats.totalEvents")}
          value="8"
          change={{ value: 25, timeframe: "last week" }}
          icon={Calendar}
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="p-4 sm:p-6 transition-all duration-200 hover:shadow-md">
          <h3 className="font-semibold mb-4 text-sm sm:text-base">
            {t("userGrowth")}
          </h3>
          <div className="h-[200px] sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 transition-all duration-200 hover:shadow-md">
          <h3 className="font-semibold mb-4 text-sm sm:text-base">
            {t("recentActivity")}
          </h3>
          <div className="space-y-3">
            {[
              { action: "User Login", time: "2 minutes ago", user: "John Doe" },
              {
                action: "Profile Update",
                time: "1 hour ago",
                user: "Jane Smith",
              },
              {
                action: "New Event Created",
                time: "3 hours ago",
                user: "Admin",
              },
            ].map((activity, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
              >
                <div>
                  <p className="font-medium text-sm sm:text-base">
                    {activity.action}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {activity.user}
                  </p>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-0">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
