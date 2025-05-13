import { createAction } from "@reduxjs/toolkit";
import types from "./types";

// Action'lar
export const fetchSchedule = createAction(types.FETCH_SCHEDULE);
export const fetchScheduleSuccess = createAction(types.FETCH_SCHEDULE_SUCCESS);
export const fetchScheduleFailed = createAction(types.FETCH_SCHEDULE_FAILED);

// UPDATE_ASSIGNMENT_DATE action'ı id ve newDate parametrelerini alır
export const updateAssignmentDate = createAction<{
  id: string;
  newDate: string;
}>(types.UPDATE_ASSIGNMENT_DATE);
