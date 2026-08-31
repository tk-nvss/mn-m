import { connectDB } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { sendPromoMail } from "@/lib/sendPromoMail";
import PromoLog from "@/models/PromoLog";
import User from "@/models/User";

export async function POST(req) {
    try {
        await connectDB();

        /* ================= AUTH ================= */
        const auth = req.headers.get("authorization");
        if (!auth?.startsWith("Bearer "))
            return Response.json({ message: "Unauthorized" }, { status: 401 });

        const token = auth.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.userType !== "owner")
            return Response.json({ message: "Forbidden" }, { status: 403 });

        /* ================= PAYLOAD ================= */
        const { emails, subject, content, imageUrl } = await req.json();

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return Response.json({ success: false, message: "No recipients selected." }, { status: 400 });
        }

        if (!subject || !content) {
            return Response.json({ success: false, message: "Missing subject or content." }, { status: 400 });
        }

        /* ================= SENDING ================= */
        const report = await sendPromoMail({ emails, subject, content, imageUrl });

        /* ================= TRACK USERS ================= */
        const sentEmails = (report.successEmails && report.successEmails.length > 0)
            ? report.successEmails
            : (report.success > 0 ? emails : []);

        if (sentEmails.length > 0) {
            try {
                const regexEmails = sentEmails.map(e => new RegExp(`^${e.toLowerCase().trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i'));
                const updateResult = await User.updateMany(
                    { email: { $in: regexEmails } },
                    {
                        $set: { lastPromoSentAt: new Date() },
                        $inc: { promoSentCount: 1 }
                    },
                    { strict: false }
                );
                console.log(`[Promo Mail] Updated ${updateResult.modifiedCount || 0} user records with lastPromoSentAt.`);
            } catch (userUpdateErr) {
                console.error("Failed to update user promo stats:", userUpdateErr);
            }
        }

        /* ================= LOGGING ================= */
        try {
            await PromoLog.create({
                subject,
                promoTitle,
                content,
                imageUrl,
                count: emails.length,
                successCount: report.success,
                failedCount: report.failed,
                recipients: emails,
                sentBy: decoded.email || decoded.userId || "Unknown Owner"
            });
        } catch (logErr) {
            console.error("Failed to save promo log:", logErr);
            // Don't fail the response just because of logging fail
        }

        return Response.json({
            success: true,
            message: `Promotional emails sent successfully!`,
            report
        });

    } catch (err) {
        console.error("Promotional Mail Error:", err);
        return Response.json(
            { success: false, message: err.message || "Server Error" },
            { status: 500 }
        );
    }
}
