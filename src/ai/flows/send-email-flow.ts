
'use server';
/**
 * @fileOverview A flow for sending promotional emails to all customers.
 *
 * - sendPromotionalEmail - A function that triggers the email sending process.
 * - PromotionalEmailInput - The input type for the flow.
 */
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import sgMail from '@sendgrid/mail';

export const PromotionalEmailInputSchema = z.object({
    subject: z.string().describe('The subject line of the email.'),
    body: z.string().describe('The HTML body content of the email.'),
    manualEmails: z.string().optional().describe('A string of comma or newline-separated emails to send to manually.'),
});
export type PromotionalEmailInput = z.infer<typeof PromotionalEmailInputSchema>;

async function getAllCustomerEmails(): Promise<string[]> {
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    const customerEmails = new Map<string, string>(); // Use phone number as key to get unique customers

    ordersSnapshot.forEach(doc => {
        const order = doc.data();
        const customer = order.customer;
        // Check if customer and email exist, and if phone is present to identify uniqueness
        if (customer && customer.email && customer.phone) {
            customerEmails.set(customer.phone, customer.email);
        }
    });

    return Array.from(customerEmails.values());
}


export async function sendPromotionalEmail(input: PromotionalEmailInput): Promise<void> {
  return sendPromotionalEmailFlow(input);
}


const sendPromotionalEmailFlow = ai.defineFlow(
  {
    name: 'sendPromotionalEmailFlow',
    inputSchema: PromotionalEmailInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    
    // 1. Try to get API key from Firestore
    let apiKey = '';
    try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'sendgrid'));
        if (settingsDoc.exists() && settingsDoc.data().apiKey) {
          apiKey = settingsDoc.data().apiKey;
        }
    } catch (error) {
        console.log("Could not fetch API key from Firestore, falling back to environment variable.", error);
    }

    // 2. Fallback to environment variable if not found in Firestore
    if (!apiKey) {
      apiKey = process.env.SENDGRID_API_KEY;
    }
    
    if (!apiKey) {
      throw new Error('SendGrid API Key not found. Please set it in Marketing > Settings or in the SENDGRID_API_KEY environment variable.');
    }
    sgMail.setApiKey(apiKey);

    const customerEmails = await getAllCustomerEmails();
    
    let manualEmails: string[] = [];
    if (input.manualEmails) {
        manualEmails = input.manualEmails
            .split(/[\n,]+/) // Split by newline or comma
            .map(email => email.trim())
            .filter(email => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)); // Basic email validation
    }
    
    // Combine and deduplicate emails
    const allEmails = Array.from(new Set([...customerEmails, ...manualEmails]));

    if (allEmails.length === 0) {
        console.log("No customer emails found to send to.");
        return;
    }

    const msg = {
      to: allEmails,
      from: 'food.biryanicorner@gmail.com', // This must be a verified sender in your SendGrid account
      subject: input.subject,
      html: input.body,
    };

    try {
      await sgMail.send(msg);
      console.log(`Email sent to ${allEmails.length} recipients.`);
    } catch (error) {
      console.error('Error sending email with SendGrid', error);
       if (error.response) {
        console.error(error.response.body)
      }
      throw new Error('Failed to send promotional email campaign.');
    }
  }
);
