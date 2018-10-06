import { createModule } from 'reacticoon/module';

import * as actions from './actions';
import * as selectors from './selectors';
import reducer from './reducer';

const TestModule = createModule('App::TestModule', {
  actions,
  reducer,
  selectors,
});

export default TestModule;