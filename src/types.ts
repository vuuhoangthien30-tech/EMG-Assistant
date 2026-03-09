export interface Task {
  id: string;
  title: string;
  course: 'Science & Math' | 'English';
  dueDate?: string;
  completed: boolean;
}

export interface ScheduleItem {
  day: string;
  subject: string;
  icon: string;
}

export const WEEKLY_SCHEDULE: ScheduleItem[] = [
  { day: 'Thứ 2', subject: 'Toán', icon: 'Calculator' },
  { day: 'Thứ 3', subject: 'Tiếng Anh', icon: 'Languages' },
  { day: 'Thứ 4', subject: 'Nghỉ', icon: 'Coffee' },
  { day: 'Thứ 5', subject: 'Khoa học', icon: 'Beaker' },
  { day: 'Thứ 6', subject: 'Nghỉ', icon: 'Coffee' },
  { day: 'Thứ 7', subject: 'Nghỉ', icon: 'Coffee' },
  { day: 'Chủ Nhật', subject: 'Nghỉ', icon: 'Sun' },
];

export const COURSE_LINKS = {
  scienceMath: 'https://lms.emg.edu.vn/course/view.php?id=15&categoryid=10',
  english: 'https://lms.emg.edu.vn/course/view.php?id=14&categoryid=10',
};
