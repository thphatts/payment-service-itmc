"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Copy,
  Check,
  ArrowLeft,
  CheckCircle2,
  Wallet,
  QrCode,
  AlertTriangle,
} from "lucide-react";

// Types
interface PaymentInfo {
  qrUrl: string;
  amount: number;
  transferContent: string;
  bankName: string;
  accountNo: string;
}

type AppState = "input" | "payment" | "success";

// Mock API
const fetchPaymentInfo = async (studentId: string): Promise<PaymentInfo> => {
  try {
    const formattedId = studentId.toUpperCase();
    const response = await fetch(`http://localhost:8080/api/campaigns/CAMP01/qr?studentId=${formattedId}`);
    
    if (!response.ok) {
      throw new Error("Không tìm thấy thông tin chiến dịch hoặc mã sinh viên");
    }

    const data = await response.json();

    return {
      qrUrl: data.qrUrl,
      amount: data.amount,
      transferContent: data.content,
      bankName: data.bankId,
      accountNo: data.accountNo,
    };
  } catch (error) {
    console.error("Lỗi khi lấy thông tin thanh toán:", error);
    throw error;
  }
};

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

const popIn = {
  initial: { opacity: 0, scale: 0 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

// Copy Button Component
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 active:scale-95"
      aria-label={`Copy ${label}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span className="text-success">Đã copy!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

// Input State Component
function InputState({
  onSubmit,
  isLoading,
}: {
  onSubmit: (studentId: string) => void;
  isLoading: boolean;
}) {
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setError("Vui lòng nhập mã sinh viên");
      return;
    }
    if (studentId.trim().length < 5) {
      setError("Mã sinh viên không hợp lệ");
      return;
    }
    setError("");
    onSubmit(studentId.trim());
  };

  return (
    <motion.div
      key="input"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-card rounded-3xl shadow-xl p-8 border border-border/50">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Đóng Quỹ Câu Lạc Bộ
          </h1>
          <p className="text-muted-foreground text-sm">
            Nhập mã sinh viên để lấy mã QR thanh toán
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="studentId"
              className="block text-sm font-medium text-foreground"
            >
              Mã sinh viên
            </label>
            <input
              id="studentId"
              type="text"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                if (error) setError("");
              }}
              placeholder="VD: B23DCCN123"
              className="w-full px-4 py-4 text-lg bg-secondary/50 border-2 border-transparent rounded-2xl focus:border-primary focus:bg-card outline-none transition-all duration-200 placeholder:text-muted-foreground/60"
              disabled={isLoading}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive flex items-center gap-1.5 mt-2"
              >
                <AlertTriangle className="w-4 h-4" />
                {error}
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <QrCode className="w-5 h-5" />
                Lấy Mã Thanh Toán
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

// Payment State Component
function PaymentState({
  paymentInfo,
  onBack,
  onSuccess,
}: {
  paymentInfo: PaymentInfo;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  return (
    <motion.div
      key="payment"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-accent p-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-primary-foreground/20 rounded-xl transition-colors"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h2 className="text-lg font-semibold text-primary-foreground">
            Thông tin thanh toán
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* QR Code */}
          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            className="flex justify-center"
          >
            <div className="bg-card p-3 rounded-2xl shadow-inner border border-border">
              <img
                src={paymentInfo.qrUrl}
                alt="QR Code thanh toán"
                className="w-52 h-52 rounded-xl"
                crossOrigin="anonymous"
              />
            </div>
          </motion.div>

          {/* Payment Details */}
          <div className="space-y-4">
            {/* Amount */}
            <div className="bg-secondary/50 rounded-2xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Số tiền</p>
              <p className="text-3xl font-bold text-primary">
                {formatAmount(paymentInfo.amount)}
              </p>
            </div>

            {/* Bank Info */}
            <div className="bg-secondary/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Ngân hàng</p>
                  <p className="font-medium text-foreground">
                    {paymentInfo.bankName}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Số tài khoản</p>
                  <p className="font-mono font-medium text-foreground">
                    {paymentInfo.accountNo}
                  </p>
                </div>
                <CopyButton text={paymentInfo.accountNo} label="số tài khoản" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    Nội dung chuyển khoản
                  </p>
                  <p className="font-mono font-medium text-foreground text-sm">
                    {paymentInfo.transferContent}
                  </p>
                </div>
                <CopyButton
                  text={paymentInfo.transferContent}
                  label="nội dung"
                />
              </div>
            </div>

            {/* Warning */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-warning/10 border border-warning/30 rounded-2xl p-4 flex gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/80">
                <span className="font-semibold">Lưu ý:</span> Vui lòng giữ
                nguyên nội dung chuyển khoản để hệ thống tự động xác nhận.
              </p>
            </motion.div>
          </div>

          {/* Hidden Test Button */}
          <button
            onClick={onSuccess}
            className="w-full py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl transition-colors"
          >
            Test Success State
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Success State Component
function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      key="success"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-card rounded-3xl shadow-xl p-8 border border-border/50 text-center">
        {/* Success Icon */}
        <motion.div
          variants={popIn}
          initial="initial"
          animate="animate"
          className="w-24 h-24 bg-gradient-to-br from-success to-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
        >
          <CheckCircle2 className="w-14 h-14 text-primary-foreground" />
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Ting ting! 🎉
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            Bạn đã nộp quỹ thành công
          </p>
        </motion.div>

        {/* Confetti decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-2 mb-8"
        >
          {["🎊", "✨", "🎉", "✨", "🎊"].map((emoji, i) => (
            <motion.span
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="text-2xl"
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="w-full py-4 px-6 bg-secondary text-secondary-foreground font-medium rounded-2xl hover:bg-secondary/80 transition-colors"
        >
          Quay về trang chủ
        </button>
      </div>
    </motion.div>
  );
}

// Main App Component
export default function FundPaymentApp() {
  const [appState, setAppState] = useState<AppState>("input");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  const handleSubmit = async (studentId: string) => {
    setIsLoading(true);
    try {
      const info = await fetchPaymentInfo(studentId);
      setPaymentInfo(info);
      setAppState("payment");
    } catch (error) {
      console.error("Error fetching payment info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setAppState("input");
    setPaymentInfo(null);
  };

  const handleSuccess = () => {
    setAppState("success");
  };

  const handleReset = () => {
    setAppState("input");
    setPaymentInfo(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {appState === "input" && (
            <InputState onSubmit={handleSubmit} isLoading={isLoading} />
          )}
          {appState === "payment" && paymentInfo && (
            <PaymentState
              paymentInfo={paymentInfo}
              onBack={handleBack}
              onSuccess={handleSuccess}
            />
          )}
          {appState === "success" && <SuccessState onReset={handleReset} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
