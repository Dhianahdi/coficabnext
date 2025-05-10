import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";
import { alphabet, generateRandomString } from "oslo/crypto";
 
export const ResendOTPPasswordReset = Resend({
  id: "resend-otp",
  apiKey: "re_6dYK9pQa_NKx51Y6kDArQgNg8E6ckY1tR",
  async generateVerificationToken() {
    return generateRandomString(8, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: "My App <onboarding@resend.dev>",
      to: [email],
      subject: `Reset your password in My App`,
      text: "Your password reset code is " + token,
    });
 
    if (error) {
      throw new Error("Could not send");
    }
  },
});