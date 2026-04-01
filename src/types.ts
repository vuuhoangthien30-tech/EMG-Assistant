export interface Task {
  id: string;
  title: string;
  course: 'Science & Math' | 'English';
  category: 'Math' | 'Science' | 'English';
  dueDate?: string;
  completed: boolean;
  content?: {
    summary: string;
    quiz: {
      question: string;
      options: string[];
      answer: number;
    }[];
  };
}

export interface ScheduleItem {
  day: string;
  subject: string;
  icon: string;
}

export const WEEKLY_SCHEDULE: ScheduleItem[] = [
  { day: 'Mon', subject: 'Maths', icon: 'Calculator' },
  { day: 'Tue', subject: 'English', icon: 'Languages' },
  { day: 'Wed', subject: 'Off', icon: 'Coffee' },
  { day: 'Thu', subject: 'Science', icon: 'Beaker' },
  { day: 'Fri', subject: 'Off', icon: 'Coffee' },
  { day: 'Sat', subject: 'Off', icon: 'Coffee' },
  { day: 'Sun', subject: 'Off', icon: 'Coffee' },
];

export const COURSE_LINKS = {
  scienceMath: 'https://lms.emg.edu.vn/course/view.php?id=15&categoryid=10',
  english: 'https://lms.emg.edu.vn/course/view.php?id=14&categoryid=10',
};
