import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: string; // YYYY-MM-DD
  type: 'meeting' | 'call' | 'task' | 'demo';
  description?: string;
}

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dateString: string; // YYYY-MM-DD
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRippleModule,
    MatTooltipModule,
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  private fb = inject(FormBuilder);

  currentDate = signal<Date>(new Date());
  events = signal<CalendarEvent[]>([]);
  days = signal<CalendarDay[]>([]);
  selectedDay = signal<CalendarDay | null>(null);
  showAddForm = signal(false);
  eventForm!: FormGroup;
  successMessage = signal<string | null>(null);

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  ngOnInit(): void {
    this.loadEvents();
    this.generateCalendar();
    this.initForm();
  }

  loadEvents(): void {
    const cached = localStorage.getItem('flowcrm_events');
    if (cached) {
      this.events.set(JSON.parse(cached));
    } else {
      // Add default mock events
      const today = new Date();
      const format = (offsetDays: number) => {
        const d = new Date(today);
        d.setDate(today.getDate() + offsetDays);
        return d.toISOString().split('T')[0];
      };

      const defaultEvents: CalendarEvent[] = [
        {
          id: 'evt_1',
          title: 'Introductory Discovery Call',
          time: '10:00 AM',
          date: format(0), // today
          type: 'call',
          description: 'Introduce CRM services and learn customer paint points.',
        },
        {
          id: 'evt_2',
          title: 'Product Demo & Architecture Q&A',
          time: '2:30 PM',
          date: format(2), // 2 days from now
          type: 'demo',
          description: 'Highlight role-based controls and data sovereignty features.',
        },
        {
          id: 'evt_3',
          title: 'Contract Negotiation Meeting',
          time: '11:00 AM',
          date: format(-1), // yesterday
          type: 'meeting',
          description: 'Finalize enterprise subscription details with executive team.',
        },
      ];
      localStorage.setItem('flowcrm_events', JSON.stringify(defaultEvents));
      this.events.set(defaultEvents);
    }
  }

  initForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      time: ['10:00 AM', [Validators.required]],
      type: ['meeting', [Validators.required]],
      description: ['', [Validators.maxLength(500)]],
    });
  }

  generateCalendar(): void {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const list: CalendarDay[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month empty buffer days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthTotalDays - i);
      const str = prevDate.toISOString().split('T')[0];
      list.push({
        date: prevDate,
        dayNumber: prevMonthTotalDays - i,
        isCurrentMonth: false,
        isToday: str === todayStr,
        dateString: str,
        events: this.getEventsForDate(str),
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const currDate = new Date(year, month, i);
      const str = currDate.toISOString().split('T')[0];
      list.push({
        date: currDate,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: str === todayStr,
        dateString: str,
        events: this.getEventsForDate(str),
      });
    }

    // Next month buffer days to complete 6 rows (42 days)
    const remainingDays = 42 - list.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      const str = nextDate.toISOString().split('T')[0];
      list.push({
        date: nextDate,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: str === todayStr,
        dateString: str,
        events: this.getEventsForDate(str),
      });
    }

    this.days.set(list);

    // Maintain selection or select today
    const currentSelection = this.selectedDay();
    if (currentSelection) {
      const updatedSelection = list.find((d) => d.dateString === currentSelection.dateString);
      this.selectedDay.set(updatedSelection || list.find((d) => d.isToday) || list[firstDayIndex]);
    } else {
      this.selectedDay.set(list.find((d) => d.isToday) || list[firstDayIndex]);
    }
  }

  getEventsForDate(dateStr: string): CalendarEvent[] {
    return this.events().filter((e) => e.date === dateStr);
  }

  selectDay(day: CalendarDay): void {
    this.selectedDay.set(day);
    this.showAddForm.set(false);
  }

  prevMonth(): void {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() - 1);
    this.currentDate.set(d);
    this.generateCalendar();
  }

  nextMonth(): void {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() + 1);
    this.currentDate.set(d);
    this.generateCalendar();
  }

  toggleAddForm(): void {
    this.showAddForm.update((val) => !val);
    if (!this.showAddForm()) {
      this.initForm();
    }
  }

  onSubmit(): void {
    if (this.eventForm.invalid || !this.selectedDay()) return;

    const newEvent: CalendarEvent = {
      id: 'evt_' + Math.random().toString(36).substr(2, 9),
      ...this.eventForm.value,
      date: this.selectedDay()!.dateString,
    };

    const updated = [...this.events(), newEvent];
    localStorage.setItem('flowcrm_events', JSON.stringify(updated));
    this.events.set(updated);
    
    this.generateCalendar(); // regenerate to pull in new event
    this.toggleAddForm();
    this.showToast('Activity scheduled successfully.');
  }

  deleteEvent(eventId: string): void {
    const updated = this.events().filter((e) => e.id !== eventId);
    localStorage.setItem('flowcrm_events', JSON.stringify(updated));
    this.events.set(updated);
    this.generateCalendar();
    this.showToast('Event removed.');
  }

  getEventClass(type: string): string {
    return `event-${type}`;
  }

  private showToast(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3000);
  }
}
