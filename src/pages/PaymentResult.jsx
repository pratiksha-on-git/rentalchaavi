import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  User,
  XCircle,
} from "lucide-react";
import { paymentApi } from "../services/api";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PROPERTY_PAYMENT_STATUS_KEY = "propertyPaymentStatuses";

const normalizeStatus = (value) =>
  String(value || "").trim().toUpperCase().replace(/[\s-]+/g, "_");

const writeStoredPropertyPaymentStatus = (propertyId, status) => {
  if (!propertyId) return;
  let paymentStatuses = {};
  try {
    paymentStatuses = JSON.parse(localStorage.getItem(PROPERTY_PAYMENT_STATUS_KEY) || "{}");
  } catch {
    paymentStatuses = {};
  }
  paymentStatuses[String(propertyId)] = status;
  localStorage.setItem(PROPERTY_PAYMENT_STATUS_KEY, JSON.stringify(paymentStatuses));
};

const getStoredPaymentContext = (key = "lastPaymentContext") => {
  try {
    const context = JSON.parse(localStorage.getItem(key) || "{}");
    if (context?.timestamp && Date.now() - Number(context.timestamp) < 60 * 60 * 1000) {
      return context;
    }
  } catch {
    // ignore bad local storage
  }
  return {};
};

const hasContext = (context) =>
  !!(context?.type || context?.orderId || context?.propertyId || context?.userId);

const getLatestContext = (contexts) =>
  contexts
    .filter(hasContext)
    .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0))[0] || {};

const getOwnerPaymentStartContext = () => {
  try {
    const startedPayment = JSON.parse(sessionStorage.getItem("ownerPaymentStart") || "{}");
    if (
      startedPayment?.propertyId &&
      startedPayment?.timestamp &&
      Date.now() - Number(startedPayment.timestamp) < 60 * 60 * 1000
    ) {
      return {
        type: "property",
        propertyId: startedPayment.propertyId,
        timestamp: startedPayment.timestamp,
      };
    }
  } catch {
    // ignore bad session storage
  }
  return {};
};

const resolvePaymentContext = ({ searchParams, orderId }) => {
  const explicitType = searchParams.get("type");
  const explicitPropertyId = searchParams.get("propertyId");
  const explicitUserId = searchParams.get("userId");
  const genericContext = getStoredPaymentContext("lastPaymentContext");
  const propertyContext = getStoredPaymentContext("lastPropertyPaymentContext");
  const userContext = getStoredPaymentContext("lastUserPaymentContext");
  const ownerPaymentStartContext = getOwnerPaymentStartContext();
  const contexts = [propertyContext, ownerPaymentStartContext, userContext, genericContext];
  const matchingContext = orderId
    ? contexts.find((item) => hasContext(item) && item.orderId === orderId)
    : null;

  if (explicitType) {
    return {
      ...(explicitType === "property" ? propertyContext : userContext),
      ...genericContext,
      ...(matchingContext || {}),
      type: explicitType,
      propertyId: explicitPropertyId || matchingContext?.propertyId || propertyContext.propertyId || genericContext.propertyId || "",
      userId: explicitUserId || matchingContext?.userId || userContext.userId || genericContext.userId || "",
    };
  }

  if (matchingContext) return matchingContext;
  if (explicitPropertyId) return { ...propertyContext, type: "property", propertyId: explicitPropertyId };
  if (explicitUserId) return { ...userContext, type: "user", userId: explicitUserId };

  const latestContext = getLatestContext(contexts);
  if (localStorage.getItem("ownerToken") && hasContext(propertyContext)) {
    return Number(propertyContext.timestamp || 0) >= Number(userContext.timestamp || 0)
      ? propertyContext
      : latestContext;
  }
  if (localStorage.getItem("ownerToken") && hasContext(ownerPaymentStartContext)) {
    return {
      ...ownerPaymentStartContext,
      orderId: orderId || genericContext.orderId || "",
    };
  }
  return latestContext;
};

const getOrderIdFromParams = (searchParams) =>
  searchParams.get("orderId") ||
  searchParams.get("merchantTransactionId") ||
  searchParams.get("transactionId") ||
  searchParams.get("merchantOrderId") ||
  "";

const isVerifiedSuccess = (status) =>
  status === "PAYMENT_SUCCESS" || status.includes("SUCCESS");

const isVerifiedFailure = (status) =>
  status.includes("FAILED") ||
  status.includes("FAILURE") ||
  status.includes("CANCELLED") ||
  status.includes("CANCELED") ||
  status.includes("EXPIRED") ||
  status.includes("DECLINED") ||
  status.includes("REFUNDED") ||
  status.includes("ERROR");

const getPropertyStatusFallback = async (propertyId) => {
  if (!propertyId) return null;
  const statusRes = await paymentApi.getPropertyPremiumStatus(propertyId);
  return statusRes?.data?.data || statusRes?.data || {};
};

const PaymentResult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking");
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState({
    type: "user",
    id: "",
    orderId: "N/A",
    title: "",
    statusText: "",
  });

  const context = useMemo(() => {
    const orderId = getOrderIdFromParams(searchParams);
    return resolvePaymentContext({ searchParams, orderId });
  }, [searchParams]);

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const orderId = getOrderIdFromParams(searchParams) || context.orderId || "";
      const type = context.type || (localStorage.getItem("ownerToken") ? "property" : "user");
      const propertyId = searchParams.get("propertyId") || context.propertyId || "";
      const userId = searchParams.get("userId") || context.userId || "";
      const id = type === "property" ? propertyId : userId;

      console.log("Payment result full URL:", window.location.href);
      console.log("Payment result params:", Object.fromEntries(params.entries()));
      console.log("Resolved payment context:", context);
      console.log("Resolved orderId:", orderId);

      setPaymentDetails((prev) => ({
        ...prev,
        type,
        id,
        orderId: orderId || "N/A",
      }));

      if (!orderId) {
        setStatus("pending");
        setPaymentDetails((prev) => ({
          ...prev,
          statusText: "Payment verification pending. Order id was not returned by the gateway.",
        }));
        setLoading(false);
        return;
      }

      try {
        const verifyRes = await paymentApi.verifyPayment(
          orderId,
          type === "property" ? ["ownerToken", "token"] : ["userToken", "token"]
        );
        const data = verifyRes?.data?.data || verifyRes?.data || {};
        const verifiedStatus = normalizeStatus(
          data.paymentStatus || data.status || data.code || data.transactionStatus
        );

        if (isVerifiedSuccess(verifiedStatus)) {
          if (type === "property" && propertyId) {
            writeStoredPropertyPaymentStatus(propertyId, "SUCCESS");
            try {
              const propertyData = await getPropertyStatusFallback(propertyId);
              setPaymentDetails((prev) => ({
                ...prev,
                title: propertyData.propertyName || prev.title,
              }));
            } catch {
              // verification succeeded; property status refresh can lag safely
            }
          } else if (type === "user" && userId) {
            try {
              await paymentApi.getUserPremiumStatus(userId);
            } catch {
              // verification succeeded; user status refresh can lag safely
            }
          }

          setStatus("success");
          setPaymentDetails((prev) => ({
            ...prev,
            statusText: type === "property"
              ? "Payment successful. Waiting for admin approval."
              : "Payment successful. Premium status is being updated.",
          }));
          setLoading(false);
          return;
        }

        if (isVerifiedFailure(verifiedStatus)) {
          if (type === "property" && propertyId) {
            writeStoredPropertyPaymentStatus(propertyId, "FAILED");
          }
          setStatus("failed");
          setPaymentDetails((prev) => ({
            ...prev,
            statusText: "Payment failed or was cancelled. Please retry from your dashboard.",
          }));
          setLoading(false);
          return;
        }

        setStatus("pending");
        setPaymentDetails((prev) => ({
          ...prev,
          statusText: "We could not verify the payment yet. Please refresh or check again after some time.",
        }));
      } catch (error) {
        console.error("Payment verification failed", error);
        if (type === "property" && propertyId) {
          try {
            const propertyData = await getPropertyStatusFallback(propertyId);
            const fallbackPaymentStatus = normalizeStatus(propertyData.paymentStatus);
            const fallbackPremiumStatus = normalizeStatus(propertyData.premiumStatus);

            setPaymentDetails((prev) => ({
              ...prev,
              title: propertyData.propertyName || prev.title,
            }));

            if (
              isVerifiedSuccess(fallbackPaymentStatus) ||
              fallbackPremiumStatus === "PENDING_APPROVAL" ||
              fallbackPaymentStatus === "APPROVED" ||
              fallbackPremiumStatus === "ACTIVE"
            ) {
              writeStoredPropertyPaymentStatus(propertyId, "SUCCESS");
              setStatus("success");
              setPaymentDetails((prev) => ({
                ...prev,
                statusText: "Payment successful. Waiting for admin approval.",
              }));
              setLoading(false);
              return;
            }

            if (
              fallbackPaymentStatus === "PENDING" ||
              fallbackPaymentStatus === "PAYMENT_PENDING" ||
              fallbackPremiumStatus === "PAYMENT_PENDING"
            ) {
              writeStoredPropertyPaymentStatus(propertyId, "PENDING");
              setStatus("pending");
              setPaymentDetails((prev) => ({
                ...prev,
                statusText: "Payment is already initiated. Please wait while it is verified. Do not pay again for this property.",
              }));
              setLoading(false);
              return;
            }
          } catch (statusError) {
            console.error("Property status fallback failed", statusError);
          }
        }
        setStatus("pending");
        setPaymentDetails((prev) => ({
          ...prev,
          statusText: type === "property"
            ? "Payment verification is pending. Please wait and do not pay again for this property."
            : "We could not verify the payment yet. Please refresh or check again after some time.",
        }));
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [context, searchParams]);

  const goToDashboard = () => {
    if (paymentDetails.type === "property" || context.type === "property" || localStorage.getItem("ownerToken")) {
      navigate("/owner");
      return;
    }
    navigate("/user");
  };

  const retryPayment = () => {
    if (paymentDetails.type === "property" || context.type === "property") {
      navigate("/owner");
      return;
    }
    navigate("/buy-premium");
  };

  const statusIcon =
    status === "success" ? (
      <CheckCircle2 className="h-16 w-16 text-emerald-500" />
    ) : status === "failed" ? (
      <XCircle className="h-16 w-16 text-red-500" />
    ) : (
      <ShieldAlert className="h-16 w-16 text-amber-500" />
    );

  const title =
    status === "success"
      ? paymentDetails.type === "property"
        ? "Payment Successful - Waiting for Admin Approval"
        : "Payment Successful"
      : status === "failed"
        ? "Payment Failed or Cancelled"
        : "Payment Verification Pending";

  return (
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center px-4 py-12 text-white">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      >
        <div className="mb-6 flex justify-center">
          <div className="rounded-full border border-white/10 bg-white/5 p-4 shadow-inner">
            {loading ? <RefreshCw className="h-16 w-16 animate-spin text-amber-500" /> : statusIcon}
          </div>
        </div>

        <h2
          className={`text-2xl font-black leading-snug ${
            status === "success"
              ? "bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
              : status === "failed"
                ? "bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent"
          }`}
        >
          {loading ? "Verifying Transaction" : title}
        </h2>

        <p className="mt-3 px-2 text-sm leading-relaxed text-gray-300">
          {loading
            ? "Please wait while we verify your payment with the backend."
            : paymentDetails.statusText}
        </p>

        <div className="relative mt-8 rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-left text-sm">
          <div className="flex justify-between border-b border-white/5 py-2">
            <span className="text-gray-400">Order/Txn ID</span>
            <span className="max-w-[180px] break-all text-right font-mono text-xs text-gray-200">
              {paymentDetails.orderId}
            </span>
          </div>
          <div className="flex justify-between border-b border-white/5 py-2">
            <span className="text-gray-400">Payment Type</span>
            <span className="font-medium capitalize text-gray-200">
              {paymentDetails.type === "property" ? (
                <span className="flex items-center justify-end gap-1.5">
                  <Building className="h-3.5 w-3.5 text-amber-500" /> Property Premium
                </span>
              ) : (
                <span className="flex items-center justify-end gap-1.5">
                  <User className="h-3.5 w-3.5 text-amber-500" /> User Premium
                </span>
              )}
            </span>
          </div>
          {paymentDetails.title && (
            <div className="flex justify-between border-b border-white/5 py-2">
              <span className="text-gray-400">Property</span>
              <span className="max-w-[180px] truncate font-medium text-gray-200">
                {paymentDetails.title}
              </span>
            </div>
          )}
          <div className="flex justify-between py-2">
            <span className="text-gray-400">Payment Status</span>
            <span
              className={`font-semibold ${
                status === "success"
                  ? "text-emerald-400"
                  : status === "failed"
                    ? "text-red-400"
                    : "text-amber-400"
              }`}
            >
              {status === "success"
                ? paymentDetails.type === "property"
                  ? "WAITING ADMIN APPROVAL"
                  : "SUCCESS"
                : status === "failed"
                  ? "FAILED / CANCELLED"
                  : "VERIFYING"}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {status !== "success" && !loading && paymentDetails.type !== "property" && (
            <button
              onClick={retryPayment}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 font-bold text-white transition hover:bg-white/10"
            >
              Retry Payment
            </button>
          )}
          <button
            onClick={goToDashboard}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 font-black text-black shadow-[0_4px_20px_rgba(249,115,22,0.35)] transition hover:from-amber-600 hover:to-orange-700"
          >
            {paymentDetails.type === "property" || localStorage.getItem("ownerToken")
              ? "Go to Owner Dashboard"
              : "Go to Dashboard"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentResult;
