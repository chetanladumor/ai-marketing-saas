import { BookingConfirmation, WhatsAppMessage } from './types.js';
import { v4 as uuidv4 } from 'uuid';

export interface ChatSession {
  sessionId: string;
  patientPhone: string;
  patientName?: string;
  selectedService?: string;
  selectedDate?: string;
  selectedTime?: string;
  state: 'GREETING' | 'SERVICE_SELECTED' | 'TIME_PROPOSED' | 'CONFIRMED';
  messages: WhatsAppMessage[];
}

export class WhatsAppBookingAgent {
  private sessions: Map<string, ChatSession> = new Map();

  /**
   * Processes an incoming WhatsApp message and returns conversational AI response + optional booking action
   */
  async handleIncomingMessage(
    patientPhone: string,
    text: string
  ): Promise<{ reply: string; bookingConfirmed?: BookingConfirmation }> {
    let session = this.sessions.get(patientPhone);
    if (!session) {
      session = {
        sessionId: uuidv4(),
        patientPhone,
        state: 'GREETING',
        messages: [],
      };
      this.sessions.set(patientPhone, session);
    }

    session.messages.push({
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    });

    const lower = text.toLowerCase();

    // 1. Initial Greeting / Inquiry
    if (session.state === 'GREETING') {
      if (lower.includes('implant') || lower.includes('tooth') || lower.includes('missing')) {
        session.selectedService = 'Titanium Dental Implants';
        session.state = 'SERVICE_SELECTED';
        const reply = `Hello! 👋 Thank you for contacting SmileCraft Dental Studio. We specialize in permanent Titanium Dental Implants ($2,200 all-inclusive with 10-Year Clinical Warranty).\n\nWould you like to schedule your complimentary 5-minute 3D digital smile scan this week? We have appointments available on Thursday and Friday.`;
        this.addAssistantMessage(session, reply);
        return { reply };
      }

      if (lower.includes('aligner') || lower.includes('braces') || lower.includes('straight')) {
        session.selectedService = 'Clear Aligners';
        session.state = 'SERVICE_SELECTED';
        const reply = `Hello! 👋 We offer custom 3D clear aligners ($3,500 all-inclusive package with retainers). Would you prefer a morning or afternoon consultation slot this Thursday?`;
        this.addAssistantMessage(session, reply);
        return { reply };
      }

      const reply = `Hello! 👋 Welcome to SmileCraft Dental Studio. How can we help you today? We specialize in:\n1️⃣ Permanent Dental Implants\n2️⃣ Invisible Clear Aligners\n3️⃣ 1-Hour Laser Whitening\n\nReply with what you're looking for to check available consultation slots!`;
      this.addAssistantMessage(session, reply);
      return { reply };
    }

    // 2. Service Selected ➔ Propose Time
    if (session.state === 'SERVICE_SELECTED') {
      if (lower.includes('thursday') || lower.includes('morning') || lower.includes('friday') || lower.includes('yes') || lower.includes('tomorrow')) {
        session.selectedDate = 'Thursday, Oct 1';
        session.state = 'TIME_PROPOSED';
        const reply = `Great! For ${session.selectedService} with Lead Implantologist Dr. Vance on Thursday, we have two priority slots open:\n\n🅰️ 10:00 AM\n🅱️ 11:30 AM\n\nWhich slot suits you best? (Reply 10:00 or 11:30)`;
        this.addAssistantMessage(session, reply);
        return { reply };
      }
    }

    // 3. Time Proposed ➔ Confirm Appointment
    if (session.state === 'TIME_PROPOSED') {
      const chosenTime = lower.includes('11') ? '11:30 AM' : '10:00 AM';
      session.selectedTime = chosenTime;
      session.state = 'CONFIRMED';
      session.patientName = session.patientName || 'Valued Patient';

      const booking: BookingConfirmation = {
        patientName: session.patientName,
        phone: session.patientPhone,
        service: session.selectedService || 'Dental Consultation',
        preferredDate: session.selectedDate || 'Thursday, Oct 1',
        preferredTime: chosenTime,
        status: 'CONFIRMED',
        calendarEventId: `cal_${uuidv4().slice(0, 8)}`,
      };

      const reply = `🎉 Your appointment is CONFIRMED!\n\n📅 Date: ${booking.preferredDate}\n⏰ Time: ${booking.preferredTime}\n👨‍⚕️ Specialist: Dr. Elena Vance\n📍 Location: SmileCraft Dental Studio, Manhattan, NY\n\n✨ Your 5-minute 3D digital scan is 100% complimentary. If you need to reschedule or have any questions, just reply here on WhatsApp anytime!`;
      this.addAssistantMessage(session, reply);

      return { reply, bookingConfirmed: booking };
    }

    // Fallback friendly reply
    const reply = `Thank you for your message! Our clinical coordinator is reviewing your details and will text you right here in just a few minutes.`;
    this.addAssistantMessage(session, reply);
    return { reply };
  }

  private addAssistantMessage(session: ChatSession, reply: string): void {
    session.messages.push({
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString(),
    });
  }

  getSession(phone: string): ChatSession | undefined {
    return this.sessions.get(phone);
  }
}
