import { createReducer } from 'reacticoon/reducer';

import { fetchMe } from './actions';

const INITIAL_STATE = {
};

const handleFetchMeAction = (state, action) => state;

const TestModuleReducer = createReducer(INITIAL_STATE, {
  [fetchMe]: handleFetchMeAction,
});

export default TestModuleReducer;