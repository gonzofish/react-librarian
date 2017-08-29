import from 'react';
import { shallow } from 'enzyme';

import { {{ componentName }} } from '../{{ componentName }}';

describe('Component: {{ componentName }}', () => {
    test('should render without error', () => {
        expect(shallow(<{{ componentName }} />).contains('<div>{{ componentName }}</div>')).toBe(true);
    });
});
