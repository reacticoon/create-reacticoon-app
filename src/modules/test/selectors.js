import { createSelector, getStateForModule } from 'reacticoon/selector';

// create the `getState` function, that will receive the state for the
// given module.
const getState = getStateForModule();

export const getFetchMeData = createSelector([getState], state =>
  state.get('').toJS()
);