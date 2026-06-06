export interface FriendlyError {
  category: "db_connection" | "validation" | "network" | "unknown";
  message: string;
  showRetryButton: boolean;
  showReloadButton: boolean;
}

export function parseError(error: any): FriendlyError {
  const msg = error?.message || error?.toString() || "";
  const code = error?.code;
  
  // DB connection error (Neon cold start)
  if (code === "P1001" || msg.includes("Can't reach database") || msg.includes("Connection terminated") || msg.includes("connect ECONNREFUSED")) {
    return {
      category: "db_connection",
      message: "Hệ thống đang khởi động lại, vui lòng đợi vài giây rồi gửi lại. Nếu vẫn không gửi được, hãy tải lại trang.",
      showRetryButton: true,
      showReloadButton: true,
    };
  }
  
  // Network error
  if (msg.includes("fetch") || msg.includes("NetworkError") || msg.includes("ECONNREFUSED") || msg.includes("Failed to fetch")) {
    return {
      category: "network",
      message: "Mất kết nối mạng. Kiểm tra internet và thử lại.",
      showRetryButton: true,
      showReloadButton: false,
    };
  }
  
  // Validation error (short messages from zod or server validation)
  if (msg.length < 200 && (msg.includes("không") || msg.includes("phải") || msg.includes("invalid") || msg.includes("quá ngắn"))) {
    return {
      category: "validation",
      message: msg,
      showRetryButton: false,
      showReloadButton: false,
    };
  }
  
  // Unknown error
  return {
    category: "unknown",
    message: "Có sự cố không xác định. Vui lòng thử lại hoặc liên hệ Cốc Nối qua hotline.",
    showRetryButton: true,
    showReloadButton: true,
  };
}
