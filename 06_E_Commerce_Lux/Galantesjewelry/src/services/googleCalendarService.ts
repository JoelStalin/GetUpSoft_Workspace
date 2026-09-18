import { google } from 'googleapis';
import { ledgerService } from './ledgerService';

export interface CalendarEvent {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees?: { email: string }[];
}

export class GoogleCalendarService {
  private calendar: any;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async createEvent(event: CalendarEvent): Promise<string> {
    try {
      console.log(`[GoogleCalendar] Creating event: ${event.summary}`);
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      const eventId = response.data.id;
      await ledgerService.logExecution(`Google Calendar event created: ${event.summary}. ID: ${eventId}`);
      return eventId;
    } catch (error: any) {
      console.error('[GoogleCalendar] Error creating event:', error);
      await ledgerService.logExecution(`Google Calendar event creation failed: ${error.message}`);
      throw error;
    }
  }

  async listEvents(timeMin: string = new Date().toISOString()): Promise<any[]> {
    const response = await this.calendar.events.list({
      calendarId: 'primary',
      timeMin,
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return response.data.items || [];
  }
}

export const googleCalendarService = new GoogleCalendarService();
