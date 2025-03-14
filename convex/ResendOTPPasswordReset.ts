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
      from: "Mon Application <onboarding@resend.dev>",
      to: [email],
      subject: `Réinitialisez votre mot de passe sur Mon Application`,
      text: "Votre code de réinitialisation de mot de passe est " + token,
    });

    if (error) {
      throw new Error("Impossible d'envoyer l'e-mail");
    }
  },
});
