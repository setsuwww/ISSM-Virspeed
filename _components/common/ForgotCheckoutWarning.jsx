// app/components/attendance/ForgotCheckoutWarning.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Clock, LogOut } from "lucide-react";

import { Button } from "@/_components/ui/Button";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/_components/ui/Alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/_components/ui/Dialog";

import { checkForgotCheckoutStatus, autoCheckoutUser, getForgotCheckoutWarning } from "@/_functions/helpers/attendanceHelpers";

export function ForgotCheckoutWarning({ onCheckout }) {
    const router = useRouter();
    const [showWarning, setShowWarning] = useState(false);
    const [showAutoCheckoutDialog, setShowAutoCheckoutDialog] = useState(false);
    const [warningMessage, setWarningMessage] = useState(null);
    const [attendanceId, setAttendanceId] = useState(null);
    const [lateMinutes, setLateMinutes] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Cek status forget checkout setiap 30 detik
    useEffect(() => {
        const checkStatus = async () => {
            const result = await checkForgotCheckoutStatus();

            if (result.hasForgotCheckout) {
                setAttendanceId(result.attendanceId);
                setLateMinutes(result.lateMinutes);

                const warning = getForgotCheckoutWarning(result.lateMinutes, result.isShiftEnded);
                setWarningMessage(warning);
                setShowWarning(true);

                // Jika sudah melebihi 2 jam, tampilkan dialog auto checkout
                if (result.lateMinutes >= 120) {
                    setShowAutoCheckoutDialog(true);
                }
            } else {
                setShowWarning(false);
                setWarningMessage(null);
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Cek setiap 30 detik

        return () => clearInterval(interval);
    }, []);

    // Countdown untuk auto checkout
    useEffect(() => {
        if (lateMinutes >= 120) {
            setShowAutoCheckoutDialog(true);
            return;
        }

        if (lateMinutes >= 60 && lateMinutes < 120) {
            const remainingSeconds = (120 - lateMinutes) * 60;
            setCountdown(remainingSeconds);

            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setShowAutoCheckoutDialog(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [lateMinutes]);

    const handleAutoCheckout = async () => {
        if (!attendanceId) return;

        setIsProcessing(true);
        try {
            const result = await autoCheckoutUser(attendanceId);
            if (result.success) {
                toast.success(result.message || "Auto checkout berhasil");
                setShowAutoCheckoutDialog(false);
                setShowWarning(false);
                router.refresh();
                if (onCheckout) onCheckout();
            } else {
                toast.error(result.message || "Gagal melakukan auto checkout");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan saat auto checkout");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleManualCheckout = () => {
        setShowAutoCheckoutDialog(false);
        if (onCheckout) onCheckout();
    };

    const formatCountdown = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    if (!showWarning || !warningMessage) return null;

    return (
        <>
            {/* Warning Banner */}
            <Alert variant="warning" className="fixed bottom-4 right-4 z-50 max-w-md shadow-lg animate-in slide-in-from-right">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Peringatan Checkout
                </AlertTitle>
                <AlertDescription className="mt-2">
                    <p>{warningMessage}</p>
                    {countdown > 0 && (
                        <p className="mt-2 text-sm font-mono">
                            Auto checkout dalam: {formatCountdown(countdown)}
                        </p>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => router.push("/employee/attendance/main")}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Segera Checkout
                    </Button>
                </AlertDescription>
            </Alert>

            {/* Auto Checkout Confirmation Dialog */}
            <Dialog open={showAutoCheckoutDialog} onOpenChange={setShowAutoCheckoutDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            Auto Checkout
                        </DialogTitle>
                        <DialogDescription>
                            Anda telah melebihi 2 jam dari waktu akhir shift tanpa melakukan checkout.
                            Sistem akan melakukan auto checkout secara otomatis.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="text-sm text-gray-600">
                            Waktu checkout akan dihitung berdasarkan akhir shift + 2 jam.
                            Anda masih bisa melakukan manual checkout jika ingin menentukan waktu yang lebih akurat.
                        </p>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={handleManualCheckout}
                            disabled={isProcessing}
                        >
                            Checkout Manual
                        </Button>
                        <Button
                            onClick={handleAutoCheckout}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Memproses..." : "Ya, Auto Checkout"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
