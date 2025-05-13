import { handleActions } from "redux-actions";
import types from "./types";
import dayjs from "dayjs";

// Assignment tipi, sadece id, shiftStart ve shiftEnd içerir
interface Assignment {
  id: string;
  shiftStart: string;
  shiftEnd: string;
}

export interface ScheduleState {
  assignments: Assignment[];
}

// Başlangıç durumu
const initialState: ScheduleState = {
  assignments: [],
};

// Reducer işlemi
const scheduleReducer = handleActions<
  ScheduleState,
  { id: string; newDate: string }
>(
  {
    [types.FETCH_SCHEDULE_SUCCESS]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    // Tarih güncelleme işlemi
    [types.UPDATE_ASSIGNMENT_DATE]: (state, action) => {
      const { id, newDate } = action.payload;
      return {
        ...state,
        assignments: state.assignments.map((assignment) =>
          assignment.id === id
            ? {
                ...assignment,
                shiftStart: dayjs(newDate).hour(9).toISOString(),
                shiftEnd: dayjs(newDate).hour(17).toISOString(),
              }
            : assignment
        ),
      };
    },
  },
  initialState
);

export default scheduleReducer;
