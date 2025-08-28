import { addMonths, format, getDay, parse, startOfWeek, subMonths } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { Button } from '@/components/ui/button';
import type { Task } from '@/features/tasks/types';
import type { Member } from '@/features/members/types';
import type { Project } from '@/features/projects/types';

import './data-calendar.css';
import { EventCard } from './event-card';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface DataCalendarProps {
  data: Task[];
}

interface CustomToolbarProps {
  date: Date;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
}

const CustomToolbar = ({ date, onNavigate }: CustomToolbarProps) => {
  return (
    <div className="mb-4 flex w-full items-center justify-center gap-x-2 lg:w-auto lg:justify-start">
      <Button title="Previous Month" onClick={() => onNavigate('PREV')} variant="secondary" size="icon">
        <ChevronLeft className="size-4" />
      </Button>

      <div className="flex h-8 w-full items-center justify-center rounded-md border border-input px-3 py-2 lg:w-auto">
        <CalendarIcon className="mr-2 size-4" />
        <p className="text-sm">{format(date, 'MMMM yyyy')}</p>
      </div>

      <Button title="Next Month" onClick={() => onNavigate('NEXT')} variant="secondary" size="icon">
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
};

export const DataCalendar = ({ data }: DataCalendarProps) => {
  const [value, setValue] = useState(data.length > 0 ? new Date(data[0].dueDate) : new Date());

  // 🔑 FIX: use task.assignee (Member object) and task.project (Project object),
  // not just their IDs.
  const events = data.map((task) => ({
    start: new Date(task.dueDate),
    end: new Date(task.dueDate),
    title: task.name,
    project: task.project as Project,     // ✅ full object
    assignee: task.assignee as Member,   // ✅ full object
    status: task.status,
    id: task.$id,
  }));

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    if (action === 'PREV') setValue(subMonths(value, 1));
    else if (action === 'NEXT') setValue(addMonths(value, 1));
    else if (action === 'TODAY') setValue(new Date());
  };

  return (
    <Calendar
      localizer={localizer}
      date={value}
      events={events}
      views={['month']}
      defaultView="month"
      toolbar
      showAllEvents
      className="h-full"
      max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
      formats={{
        weekdayFormat: (date, culture, localizer) => localizer?.format(date, 'EEE', culture) ?? '',
      }}
      components={{
        eventWrapper: ({ event }) => (
          <EventCard
            id={event.id}
            title={event.title}
            assignee={event.assignee} // ✅ now Member object
            project={event.project}   // ✅ now Project object
            status={event.status}
          />
        ),
        toolbar: () => <CustomToolbar date={value} onNavigate={handleNavigate} />,
      }}
    />
  );
};
