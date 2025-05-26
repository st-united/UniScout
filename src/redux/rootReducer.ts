import { combineReducers } from 'redux';

import authReducer from './features/auth/authSlice';
import triggerReducer from './features/triggle/triggleSlice';

const rootReducer = combineReducers({
  trigger: triggerReducer,
  auth: authReducer,
});

export default rootReducer;
