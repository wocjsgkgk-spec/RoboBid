"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BidopsFormulaGuide } from "./bidops-formula-guide";
import { Scale } from "lucide-react";

interface FormulaGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: "FIT_SCORE" | "RFP" | "ELIGIBILITY" | "A_VALUE";
}

export function FormulaGuideDialog({
  open,
  onOpenChange,
}: FormulaGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Scale className="h-5 w-5 text-primary" />
            공공입찰 산식·근거·규정 가이드 백서
          </DialogTitle>
          <DialogDescription className="text-xs">
            Fit Score 평가 지표, RFP 6대 영역 추출 규정, 지원자격 5대 Gate, A값 법정 투찰하한가 공식 안내
          </DialogDescription>
        </DialogHeader>

        <div className="pt-3">
          <BidopsFormulaGuide />
        </div>
      </DialogContent>
    </Dialog>
  );
}
