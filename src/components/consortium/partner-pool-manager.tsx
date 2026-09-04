"use client";

import React, { useState } from "react";
import { ConsortiumPartner } from "@/types/p1";
import { p1Store } from "@/lib/p1/p1-store";
import {
  Users,
  Building2,
  MapPin,
  Star,
  Phone,
  Mail,
  ShieldCheck,
  Search,
  Plus,
  ArrowRight,
  Handshake,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PartnerPoolManagerProps {
  onSelectPartnerForConsortium?: (partner: ConsortiumPartner) => void;
}

export function PartnerPoolManager({ onSelectPartnerForConsortium }: PartnerPoolManagerProps) {
  const [partners, setPartners] = useState<ConsortiumPartner[]>(p1Store.getPartners());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");

  const filtered = partners.filter((p) => {
    if (selectedRegion !== "ALL" && !p.region.includes(selectedRegion)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.companyName.toLowerCase().includes(q) ||
        p.specialtyDomain.toLowerCase().includes(q) ||
        p.coreCapabilities.some((c) => c.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40 p-3.5 rounded-xl border">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-muted-foreground ml-1" />
          <input
            type="text"
            placeholder="협력사명, 전문분야(기구설계, 인증대행, 지역수급체 등), 핵심기술 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {["ALL", "경기", "서울", "대구"].map((reg) => (
            <Button
              key={reg}
              variant={selectedRegion === reg ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedRegion(reg)}
              className="h-7 text-xs px-2.5"
            >
              {reg === "ALL" ? "전국" : `${reg}권`}
            </Button>
          ))}
        </div>
      </div>

      {/* Partner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((partner) => (
          <Card key={partner.id} className="border shadow-sm bg-card hover:border-primary/40 transition-all flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="text-[10px] gap-1">
                  <MapPin className="w-3 h-3 text-primary" />
                  {partner.region}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold font-mono">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  {partner.ratingScore.toFixed(1)}
                </div>
              </div>

              <CardTitle className="text-base font-bold mt-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary" />
                {partner.companyName}
              </CardTitle>
              <CardDescription className="text-xs mt-1 text-primary/80 font-medium">
                {partner.specialtyDomain}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0 space-y-3">
              {/* Core Capabilities */}
              <div className="space-y-1 text-xs">
                <div className="text-[10px] text-muted-foreground font-semibold uppercase">
                  핵심 역량 및 인증:
                </div>
                <div className="flex flex-wrap gap-1">
                  {partner.coreCapabilities.map((cap) => (
                    <span
                      key={cap}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                      {cap}
                    </span>
                  ))}
                  {partner.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {/* Past Collaboration & Contact */}
              <div className="p-2.5 rounded-lg bg-muted/40 border text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>누적 협업 실적:</span>
                  <strong className="text-foreground">{partner.pastCollaborationCount}회 성공</strong>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>담당자:</span>
                  <span className="text-foreground">{partner.contactPerson} ({partner.contactPhone})</span>
                </div>
              </div>

              {onSelectPartnerForConsortium && (
                <Button
                  size="sm"
                  onClick={() => onSelectPartnerForConsortium(partner)}
                  className="w-full text-xs gap-1.5 font-semibold"
                >
                  <Handshake className="w-3.5 h-3.5" />
                  <span>컨소시엄 참여 요청</span>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
