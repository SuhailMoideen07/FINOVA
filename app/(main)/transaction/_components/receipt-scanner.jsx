"use client";

import React, { useRef, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { scanReceipt } from "@/actions/transaction";
import useFetch from "@/hooks/use-fetch";

const ReceiptScanner = ({ onScanComplete }) => {
  const fileInputRef = useRef(null);
  const hasProcessed = useRef(false);

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    hasProcessed.current = false; // reset for new scan
    await scanReceiptFn(file);
  };

  useEffect(() => {
    if (scannedData && !hasProcessed.current) {
      hasProcessed.current = true;
      onScanComplete(scannedData);
    }
  }, [scannedData]); // <-- no onScanComplete here

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />

      <Button
        type="button"
        className="group w-full h-10 bg-slate-900 text-white rounded-md"
        onClick={() => fileInputRef.current?.click()}
        disabled={scanReceiptLoading}
      >
        {scanReceiptLoading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            <span>Scanning Receipt...</span>
          </>
        ) : (
          <>
            <Camera className="mr-2 text-teal-500" />
            <span>Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default ReceiptScanner;
