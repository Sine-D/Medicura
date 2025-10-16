import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendOutOfStockEmail(item) {
    try {
      const templatePath = path.join(__dirname, "../templates/outOfStockEmail.html");
      const htmlTemplate = await fs.readFile(templatePath, "utf8");

      const emailHtml = htmlTemplate
        .replace("{{itemName}}", item.itemName)
        .replace("{{itemCode}}", item.itemCode)
        .replace("{{currentQuantity}}", item.inStockQuantity)
        .replace("{{supplierEmail}}", item.supplierEmail);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: item.supplierEmail,
        subject: `⚠️ Low Stock Alert: ${item.itemName} (Code: ${item.itemCode})`,
        html: emailHtml,
      };

      await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
      return { success: true };
    } catch (error) {
      console.error("Email send error:", error);
      return {
        success: false,
        error: error.message || "Failed to send out-of-stock email",
      };
    }
  }
}

export default new EmailService();
