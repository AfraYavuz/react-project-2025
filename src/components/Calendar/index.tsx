/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import type { ScheduleInstance } from "../../models/schedule";
import type { UserInstance } from "../../models/user";

import FullCalendar from "@fullcalendar/react";

import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";

import type { EventInput } from "@fullcalendar/core/index.js";

import "../profileCalendar.scss";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import ReactModal from "react-modal";
import { updateAssignmentDate } from "../../store/schedule/actions";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

type CalendarContainerProps = {
  schedule: ScheduleInstance;
  auth: UserInstance;
};

const classes = [
  "bg-one",
  "bg-two",
  "bg-three",
  "bg-four",
  "bg-five",
  "bg-six",
  "bg-seven",
  "bg-eight",
  "bg-nine",
  "bg-ten",
  "bg-eleven",
  "bg-twelve",
  "bg-thirteen",
  "bg-fourteen",
  "bg-fifteen",
  "bg-sixteen",
  "bg-seventeen",
  "bg-eighteen",
  "bg-nineteen",
  "bg-twenty",
  "bg-twenty-one",
  "bg-twenty-two",
  "bg-twenty-three",
  "bg-twenty-four",
  "bg-twenty-five",
  "bg-twenty-six",
  "bg-twenty-seven",
  "bg-twenty-eight",
  "bg-twenty-nine",
  "bg-thirty",
  "bg-thirty-one",
  "bg-thirty-two",
  "bg-thirty-three",
  "bg-thirty-four",
  "bg-thirty-five",
  "bg-thirty-six",
  "bg-thirty-seven",
  "bg-thirty-eight",
  "bg-thirty-nine",
  "bg-forty",
];

const modalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    padding: "32px",
    borderRadius: "12px",
    minWidth: "320px",
    maxWidth: "90vw",
    boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 9999,
  },
};

const CalendarContainer = ({ schedule, auth }: CalendarContainerProps) => {
  const calendarRef = useRef<FullCalendar>(null);
  const dispatch = useDispatch();

  const [events, setEvents] = useState<EventInput[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [initialDate] = useState<Date>(() => {
    const firstAssignment = schedule?.assignments?.sort(
      (a, b) =>
        new Date(a.shiftStart).getTime() - new Date(b.shiftStart).getTime()
    )[0];
    return firstAssignment
      ? dayjs(firstAssignment.shiftStart).toDate()
      : dayjs(schedule?.scheduleStartDate).toDate();
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const getPlugins = () => {
    const plugins = [dayGridPlugin];

    plugins.push(interactionPlugin);
    return plugins;
  };

  const getShiftById = (id: string) => {
    return schedule?.shifts?.find((shift: { id: string }) => id === shift.id);
  };

  const getAssigmentById = (id: string) => {
    return schedule?.assignments?.find((assign) => id === assign.id);
  };

  const getStaffById = (id: string) => {
    return schedule?.staffs?.find((staff) => id === staff.id);
  };

  const validDates = () => {
    const dates = [];
    let currentDate = dayjs(schedule.scheduleStartDate);
    while (
      currentDate.isBefore(schedule.scheduleEndDate) ||
      currentDate.isSame(schedule.scheduleEndDate)
    ) {
      dates.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }

    return dates;
  };

  const getDatesBetween = (startDate: string, endDate: string) => {
    const dates = [];
    const start = dayjs(startDate, "DD.MM.YYYY").toDate();
    const end = dayjs(endDate, "DD.MM.YYYY").toDate();
    const current = new Date(start);

    while (current <= end) {
      dates.push(dayjs(current).format("DD-MM-YYYY"));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const generateStaffBasedCalendar = () => {
    const works: EventInput[] = [];

    for (let i = 0; i < schedule?.assignments?.length; i++) {
      if (schedule?.assignments?.[i]?.staffId !== selectedStaffId) continue;
      const className = schedule?.shifts?.findIndex(
        (shift) => shift.id === schedule?.assignments?.[i]?.shiftId
      );
      const assignmentDate = dayjs
        .utc(schedule?.assignments?.[i]?.shiftStart)
        .format("YYYY-MM-DD");
      const isValidDate = validDates().includes(assignmentDate);
      const work = {
        id: schedule?.assignments?.[i]?.id,
        title: getShiftById(schedule?.assignments?.[i]?.shiftId)?.name,
        duration: "01:00",
        date: assignmentDate,
        staffId: schedule?.assignments?.[i]?.staffId,
        shiftId: schedule?.assignments?.[i]?.shiftId,
        className: `event ${classes[className]} ${
          getAssigmentById(schedule?.assignments?.[i]?.id)?.isUpdated
            ? "highlight"
            : ""
        } ${!isValidDate ? "invalid-date" : ""}`,
      };
      works.push(work);
    }

    const offDays = schedule?.staffs?.find(
      (staff) => staff.id === selectedStaffId
    )?.offDays;
    const dates = getDatesBetween(
      dayjs(schedule.scheduleStartDate).format("DD.MM.YYYY"),
      dayjs(schedule.scheduleEndDate).format("DD.MM.YYYY")
    );
    let highlightedDates: string[] = [];

    dates.forEach((date) => {
      const transformedDate = dayjs(date, "DD-MM-YYYY").format("DD.MM.YYYY");
      if (offDays?.includes(transformedDate)) highlightedDates.push(date);
    });

    setHighlightedDates(highlightedDates);
    setEvents(works);
  };

  useEffect(() => {
    setSelectedStaffId(schedule?.staffs?.[0]?.id);
    // İlk etkinliğin tarihine takvimi götür
    const firstAssignment = schedule?.assignments?.sort(
      (a, b) =>
        new Date(a.shiftStart).getTime() - new Date(b.shiftStart).getTime()
    )[0];
    if (firstAssignment && calendarRef.current) {
      calendarRef.current
        .getApi()
        .gotoDate(dayjs(firstAssignment.shiftStart).toDate());
    }
    generateStaffBasedCalendar();
  }, [schedule]);

  useEffect(() => {
    generateStaffBasedCalendar();
  }, [selectedStaffId, schedule.assignments]);

  const RenderEventContent = ({ eventInfo }: any) => {
    return (
      <div className="event-content">
        <p>{eventInfo.event.title}</p>
      </div>
    );
  };

  return (
    <div className="calendar-section">
      <div className="calendar-wrapper">
        <div className="staff-list">
          {schedule?.staffs?.map((staff: any) => (
            <div
              key={staff.id}
              onClick={() => setSelectedStaffId(staff.id)}
              className={`staff ${
                staff.id === selectedStaffId ? "active" : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
              >
                <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17-62.5t47-43.5q60-30 124.5-46T480-440q67 0 131.5 16T736-378q30 15 47 43.5t17 62.5v112H160Zm320-400q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm160 228v92h80v-32q0-11-5-20t-15-14q-14-8-29.5-14.5T640-332Zm-240-21v53h160v-53q-20-4-40-5.5t-40-1.5q-20 0-40 1.5t-40 5.5ZM240-240h80v-92q-15 5-30.5 11.5T260-306q-10 5-15 14t-5 20v32Zm400 0H320h320ZM480-640Z" />
              </svg>
              <span>{staff.name}</span>
            </div>
          ))}
        </div>
        <FullCalendar
          ref={calendarRef}
          locale={auth.language}
          plugins={getPlugins()}
          contentHeight={400}
          handleWindowResize={true}
          selectable={true}
          editable={true}
          eventOverlap={true}
          eventStartEditable={true}
          eventDurationEditable={false}
          initialView="dayGridMonth"
          initialDate={initialDate}
          events={events}
          firstDay={1}
          dayMaxEventRows={4}
          fixedWeekCount={true}
          showNonCurrentDates={true}
          eventContent={(eventInfo: any) => (
            <RenderEventContent eventInfo={eventInfo} />
          )}
          eventClick={(info: any) => {
            setSelectedEvent(info.event);
            setModalIsOpen(true);
          }}
          eventDrop={(info: any) => {
            const eventId = info.event.id;
            const newDate = dayjs(info.event.start).format("YYYY-MM-DD");

            const currentAssignment = getAssigmentById(eventId);
            const originalDate = dayjs(currentAssignment?.shiftStart).format(
              "YYYY-MM-DD"
            );

            if (newDate !== originalDate) {
              dispatch(
                updateAssignmentDate({
                  id: eventId,
                  newDate,
                })
              );
            }
          }}
          datesSet={(info: any) => {
            //Aşağı kısımı silersek Takvim yine ilk etkinlik ayından başlayacak, kullanıcı istediği gibi ileri/geri gidebilecek.Silmediğimiz zaman etkinlik zamanından sonraki aya geçiş yapılamıyor
            const prevButton = document.querySelector(
              ".fc-prev-button"
            ) as HTMLButtonElement;
            const nextButton = document.querySelector(
              ".fc-next-button"
            ) as HTMLButtonElement;

            const startDiff = dayjs(info.start)
              .utc()
              .diff(
                dayjs(schedule.scheduleStartDate).subtract(1, "day").utc(),
                "days"
              );
            const endDiff = dayjs(dayjs(schedule.scheduleEndDate)).diff(
              info.end,
              "days"
            );
            if (startDiff < 0 && startDiff > -35) prevButton.disabled = true;
            else prevButton.disabled = false;

            if (endDiff < 0 && endDiff > -32) nextButton.disabled = true;
            else nextButton.disabled = false;
          }}
          dayCellContent={({ date }) => {
            const found = validDates().includes(
              dayjs(date).format("YYYY-MM-DD")
            );
            const isHighlighted = highlightedDates.includes(
              dayjs(date).format("DD-MM-YYYY")
            );

            // Pair günlerini bul (pairList formatı DD.MM.YYYY)
            let isPairDay = false;
            const selectedStaff = schedule?.staffs?.find(
              (staff) => staff.id === selectedStaffId
            );
            if (selectedStaff?.pairList?.length) {
              for (const pair of selectedStaff.pairList) {
                // pair.startDate ve pair.endDate formatı 'DD.MM.YYYY'
                const current = dayjs(date).format("DD.MM.YYYY");
                if (
                  dayjs(current, "DD.MM.YYYY").isSameOrAfter(
                    dayjs(pair.startDate, "DD.MM.YYYY")
                  ) &&
                  dayjs(current, "DD.MM.YYYY").isSameOrBefore(
                    dayjs(pair.endDate, "DD.MM.YYYY")
                  )
                ) {
                  isPairDay = true;
                  break;
                }
              }
            }

            return (
              <div
                className={`${found ? "" : "date-range-disabled"} ${
                  isHighlighted ? "highlighted-date-orange" : ""
                } ${isPairDay ? "highlightedPair" : ""}`}
              >
                {dayjs(date).date()}
              </div>
            );
          }}
        />
        <ReactModal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          contentLabel="Event Detail"
          ariaHideApp={false}
          style={modalStyles}
          shouldCloseOnOverlayClick={true}
        >
          {selectedEvent && (
            <div>
              <h2>Event Detail</h2>
              <p>
                <b>Staff:</b>{" "}
                {getStaffById(selectedEvent.extendedProps.staffId)?.name}
              </p>
              <p>
                <b>Shift:</b>{" "}
                {getShiftById(selectedEvent.extendedProps.shiftId)?.name}
              </p>
              <p>
                <b>Date:</b> {dayjs(selectedEvent.start).format("DD.MM.YYYY")}
              </p>
              <p>
                <b>Start Time:</b>{" "}
                {dayjs(getAssigmentById(selectedEvent.id)?.shiftStart).format(
                  "HH:mm"
                )}
              </p>
              <p>
                <b>End Time:</b>{" "}
                {dayjs(getAssigmentById(selectedEvent.id)?.shiftEnd).format(
                  "HH:mm"
                )}
              </p>
              <button
                onClick={() => setModalIsOpen(false)}
                style={{
                  marginTop: "20px",
                  padding: "10px 20px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "background-color 0.3s ease",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#0056b3")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#007bff")
                }
              >
                Close
              </button>
            </div>
          )}
        </ReactModal>
      </div>
    </div>
  );
};

export default CalendarContainer;
