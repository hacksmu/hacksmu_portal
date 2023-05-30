export const buttonDatas = [
  { text: 'Hacker App', path: '/' },
  { text: 'Mentor App', path: '/' },
  { text: 'Sponsor App', path: '/' },
];

export const navItems = [
  { text: 'About', path: '/#about' },
  { text: 'FAQ', path: '/#faq' },
  { text: 'Resources', path: '/#resources' },
  { text: 'Schedule', path: '/schedule' },
  { text: 'Dashboard', path: '/dashboard' },
];

export const stats = [
  {
    data: 'Big',
    object: 'statistic 1',
  },
  {
    data: 'Shocking',
    object: 'statistic 2',
  },
  {
    data: 'Incredible',
    object: 'statistic 3',
  },
];

export const DEFAULT_EVENT_FORM_DATA: ScheduleEvent = {
  description: '',
  title: '',
  page: '',
  type: '',
  track: '',
  location: '',
  speakers: [],
  startDate: new Date(),
  endDate: new Date(),
  Event: -1,
};
