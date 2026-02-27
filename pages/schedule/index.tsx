import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  AppointmentModel,
  GroupingState,
  IntegratedGrouping,
  ViewState,
} from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  DayView,
  Appointments,
  Toolbar,
  DateNavigator,
  TodayButton,
  Resources,
  GroupingPanel,
} from '@devexpress/dx-react-scheduler-material-ui';
import { withStyles, Theme, createStyles } from '@material-ui/core';
import { grey, indigo, blue, teal, purple, red, orange } from '@material-ui/core/colors';
import Paper from '@material-ui/core/Paper';
import { alpha } from '@material-ui/core/styles/colorManipulator';
import { WithStyles } from '@material-ui/styles';
import classNames from 'clsx';
import { GetServerSideProps } from 'next';
import { RequestHelper } from '../../lib/request-helper';
import CalendarIcon from '@material-ui/icons/CalendarToday';
import PinDrop from '@material-ui/icons/PinDrop';
import ClockIcon from '@material-ui/icons/AccessTime';
import Backpack from '@material-ui/icons/LocalMall';
import Description from '@material-ui/icons/BorderColor';
import firebase from 'firebase';

const styles = ({ palette }: Theme) =>
  createStyles({
    appointment: {
      borderRadius: 0,
      borderBottom: 0,
    },

    EventTypeAppointment: {
      border: `2px solid ${red[500]}`,
      backgroundColor: `${grey[900]}`,
      borderRadius: 8,
      boxShadow: ` 0 0 16px 1px ${red[400]} `,
    },
    SponsorTypeAppointment: {
      border: `2px solid ${orange[500]}`,
      backgroundColor: `${grey[900]}`,
      borderRadius: 8,
      boxShadow: ` 0 0 16px 4px ${orange[500]} `,
    },
    TechTalkTypeAppointment: {
      border: `2px solid ${indigo[500]}`,
      backgroundColor: `${grey[900]}`,
      borderRadius: 8,
      boxShadow: ` 0 0 16px 4px ${indigo[500]} `,
    },
    WorkshopTypeAppointment: {
      border: `2px solid ${purple[500]}`,
      backgroundColor: `${grey[900]}`,
      borderRadius: 8,
      boxShadow: ` 0 0 16px 4px ${purple[500]} `,
    },
    SocialTypeAppointment: {
      border: `2px solid ${blue[500]}`,
      backgroundColor: `${grey[900]}`,
      borderRadius: 8,
      boxShadow: ` 0 0 16px 4px ${blue[500]} `,
    },
    weekEndCell: {
      backgroundColor: alpha(palette.action.disabledBackground, 0.04),
      '&:hover': {
        backgroundColor: alpha(palette.action.disabledBackground, 0.04),
      },
      '&:focus': {
        backgroundColor: alpha(palette.action.disabledBackground, 0.04),
      },
    },
    weekEndDayScaleCell: {
      backgroundColor: alpha(palette.action.disabledBackground, 0.06),
    },
    text: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    content: {
      opacity: 0.7,
    },
    container: {
      width: '100%',
      lineHeight: 1.2,
      height: '100%',
    },
  });

type AppointmentProps = Appointments.AppointmentProps & WithStyles<typeof styles>;
type AppointmentContentProps = Appointments.AppointmentContentProps & WithStyles<typeof styles>;

const isWeekEnd = (date: Date): boolean => date.getDay() === 0 || date.getDay() === 6;
const defaultCurrentDate = new Date(2026, 4, 11, 8, 0);
{
  /* !!!change */
}

const AppointmentContent = withStyles(styles, { name: 'AppointmentContent' })(
  ({ classes, data, ...restProps }: AppointmentContentProps) => {
    let Event = 'Event';
    if (data.type) Event = data.type.charAt(0).toUpperCase() + data.type.slice(1);

    return (
      <Appointments.AppointmentContent {...restProps} data={data}>
        <div className={classes.container}>
          <div className={classes.text}>{data.title}</div>
          <div className={classNames(classes.text, classes.content)}>{`Type: ${Event}`}</div>
          <div className={classNames(classes.text, classes.content)}>
            {`Location: ${data.location}`}
          </div>
        </div>
      </Appointments.AppointmentContent>
    );
  },
);

export default function Calendar(props: { scheduleCard: ScheduleEvent[] }) {
  // Hooks
  const [eventData, setEventData] = useState({
    title: '',
    speakers: '',
    date: '',
    time: '',
    page: '',
    description: '',
    location: '',
    track: '',
  });
  const [eventDescription, setEventDescription] = useState(null);

  // Scheduler configuration
  const Appointment = withStyles(styles)(
    ({ onClick, classes, data, ...restProps }: AppointmentProps) => (
      <Appointments.Appointment
        {...restProps}
        className={classNames({
          [classes.EventTypeAppointment]: data.type === "general",
          [classes.SponsorTypeAppointment]: data.type === "sponsor",
          [classes.TechTalkTypeAppointment]: data.type === "speaker",
          [classes.WorkshopTypeAppointment]: data.type === "workshop",
          [classes.SocialTypeAppointment]: data.type === "social",
          [classes.appointment]: true,
        })}
        data={data}
        onClick={() => changeEventData(data)}
      />
    ),
  );

  const changeEventData = (data: AppointmentModel) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // format date of event
    const dateFormatter = new Intl.DateTimeFormat('default', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const dayString = dateFormatter.format(startDate);

    const speakersData = data.speakers?.filter((speaker: string[]) => speaker.length !== 0);

    // format list of speakers of event, leaving blank if no speakers
    const speakerFormatter = new Intl.ListFormat('default', { style: 'long', type: 'conjunction' });
    const speakerString =
      speakersData?.length > 0 ? `Hosted by ${speakerFormatter.format(speakersData)}` : '';
    // format time range of event
    const timeFormatter = new Intl.DateTimeFormat('default', {
      hour: 'numeric',
      minute: 'numeric',
    });
    const timeString = timeFormatter.formatRange(startDate, endDate);

    //setting new event data based on event clicked
    setEventData({
      title: data.title,
      speakers: speakerString,
      date: dayString,
      time: timeString,
      page: data.page,
      description: data.description,
      location: data.location,
      track: data.track,
    });
  };

  useEffect(() => {
    // Split event description by newlines
    const descSplit = eventData.description.split('\n');
    setEventDescription(
      descSplit.map((d, i) => (
        <p key={i} className="mb-2">
          {d}
        </p>
      )),
    );
  }, [eventData]);

  const grouping = [
    {
      resourceName: 'track',
    },
  ];

  const trackColor = (track: string) => {
    if (track === 'General') return teal;
    if (track === 'Technical') return red;
    if (track === 'Social') return indigo;
    if (track === 'Sponsor') return orange;
    if (track === 'Workshop') return blue;
    else return teal;
  };

  const scheduleEvents = props.scheduleCard;
  const tracks = scheduleEvents.map((event) => event.track);
  const uniqueTracks = new Set(tracks);

  const resources = [
    {
      fieldName: 'track',
      title: 'track',
      instances: Array.from(
        new Set(
          Array.from(uniqueTracks).map((track) => ({
            id: track,
            text: track,
            color: trackColor(track),
          })),
        ),
      ),
    },
  ];

  const glassPanel: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(100,160,255,0.09) 100%)',
    backdropFilter: 'blur(18px) saturate(180%)',
    WebkitBackdropFilter: 'blur(18px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.26)',
    borderRadius: 16,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.30), 0 8px 32px rgba(0,20,60,0.28)',
  };

  const infoRow = (icon: React.ReactNode, label: string, value: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(200,232,255,0.60)', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
        {icon}{label}
      </div>
      <div style={{ color: '#e8f4ff', fontSize: 14, fontWeight: 500 }}>{value || '—'}</div>
    </div>
  );

  return (
    <>
      {/* Page title */}
      <div style={{
        fontFamily: "'Orbitron', 'Roboto', sans-serif",
        fontSize: 30,
        fontWeight: 900,
        color: '#fff',
        textShadow: '0 0 20px rgba(0,200,255,0.55)',
        letterSpacing: '0.05em',
        padding: '20px 24px 16px',
      }}>
        Schedule
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '0 24px 48px', alignItems: 'flex-start' }}>
        {/* Calendar — keep all existing logic intact */}
        <div style={{
          ...glassPanel,
          flex: '1 1 580px',
          minWidth: 0,
          height: '75vh',
          overflow: 'hidden',
        }}>
          <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', borderRadius: 16 }}>
            <Paper>
              <div className="flex flex-row">
                <Scheduler data={props.scheduleCard}>
                  <ViewState defaultCurrentDate={defaultCurrentDate} />
                  <DayView startDayHour={8} endDayHour={24} intervalCount={1} />
                  <Appointments
                    appointmentComponent={Appointment}
                    appointmentContentComponent={AppointmentContent}
                  />
                  <Resources data={resources} mainResourceName={'track'} />
                  <Toolbar />
                  <DateNavigator />
                  <TodayButton />
                  <GroupingState grouping={grouping} groupByDate={() => true} />
                  {uniqueTracks.size > 0 ? <IntegratedGrouping /> : null}
                  {uniqueTracks.size > 0 ? <GroupingPanel /> : null}
                </Scheduler>
              </div>
            </Paper>
          </div>
        </div>

        {/* Event info card */}
        <div style={{
          ...glassPanel,
          flex: '0 0 320px',
          height: '75vh',
          overflowY: 'auto',
          padding: '22px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {eventData.title === '' ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 12,
            }}>
              <div style={{ fontSize: 36, opacity: 0.5 }}>📅</div>
              <div style={{ color: 'rgba(200,232,255,0.50)', fontSize: 14 }}>
                Click on an event for more info
              </div>
            </div>
          ) : (
            <>
              {/* Event title */}
              <div>
                <div style={{
                  fontFamily: "'Orbitron', 'Roboto', sans-serif",
                  fontSize: 18,
                  fontWeight: 800,
                  color: '#fff',
                  textShadow: '0 0 12px rgba(0,180,255,0.40)',
                  marginBottom: 6,
                  lineHeight: 1.3,
                }}>
                  {eventData.title}
                </div>
                {eventData.speakers && (
                  <div style={{ color: 'rgba(200,232,255,0.65)', fontSize: 13 }}>
                    {eventData.speakers}
                  </div>
                )}
              </div>

              {/* Info grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px 12px',
                padding: '16px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}>
                {infoRow(<CalendarIcon style={{ fontSize: 12 }} />, 'Date', eventData.date)}
                {infoRow(<PinDrop style={{ fontSize: 12 }} />, 'Location', eventData.location)}
                {infoRow(<ClockIcon style={{ fontSize: 12 }} />, 'Time', eventData.time)}
                {infoRow(<Backpack style={{ fontSize: 12 }} />, 'Page', eventData.page)}
              </div>

              {/* Description */}
              {eventData.description && (
                <div style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  flex: 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(200,232,255,0.60)', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
                    <Description style={{ fontSize: 12 }} /> Description
                  </div>
                  <div style={{ color: 'rgba(220,240,255,0.82)', fontSize: 13, lineHeight: 1.6 }}>
                    {eventDescription}
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ color: 'rgba(200,232,255,0.38)', fontSize: 11, textAlign: 'right', marginTop: 'auto' }}>
            *All times in CST
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const protocol = context.req.headers.referer?.split('://')[0] || 'http';
  const { data: scheduleData } = await RequestHelper.get<ScheduleEvent[]>(
    `${protocol}://${context.req.headers.host}/api/schedule`,
    {},
  );
  return {
    props: {
      scheduleCard: scheduleData,
    },
  };
};
