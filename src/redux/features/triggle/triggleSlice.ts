import { createSlice } from '@reduxjs/toolkit';

import { RootState } from '@app/redux/store';

export interface TriggerState {
  collapsed: boolean;
}

const initialState: TriggerState = {
  collapsed: false,
};

const triggleSlice = createSlice({
  name: 'trigger',
  initialState,
  reducers: {
    openSidebar(state) {
      state.collapsed = !state.collapsed;
    },
  },
});

export const { openSidebar } = triggleSlice.actions;

export const selectTrigger = (state: RootState) => state.trigger;

export default triggleSlice.reducer;
