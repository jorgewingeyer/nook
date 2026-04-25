"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ReportPeriod } from "./reports.action";

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "year", label: "Este año" },
];

export function PeriodSelector({ current }: { current: ReportPeriod }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function select(period: ReportPeriod) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    router.push(`/admin/reports?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {PERIODS.map((p) => (
        <Button
          key={p.value}
          size="sm"
          variant={current === p.value ? "default" : "outline"}
          onClick={() => select(p.value)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
