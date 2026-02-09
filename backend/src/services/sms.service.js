// =========================
// 📩 MOCK SMS SERVICE
// =========================

exports.sendSMS = async ({
  phone,
  message,
  officeId,
  userId,
  issueNo,
}) => {
  try {
    // 🛑 STOP CRASHING: Removed the missing "require" and "logActivity" call.
    
    // ✅ Just Log to Console (Mock)
    console.log("========================================");
    console.log("📨 SMS SENT (MOCK)");
    console.log(`👉 To: ${phone}`);
    console.log(`👉 Msg: ${message}`);
    console.log("========================================");

    return true;
  } catch (err) {
    console.error("Mock SMS error:", err.message);
  }
};